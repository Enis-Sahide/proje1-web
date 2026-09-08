import 'server-only';

/**
 * Treps sanal POS API istemcisi.
 *
 * Kimlik bilgileri veritabanındaki `pos_settings` satırından gelir
 * (bkz. `@/lib/payment/settings`), bu sınıf yalnızca HTTP katmanını
 * ve token önbelleğini yönetir.
 */

export interface TrepsCredentials {
  apiBaseUrl: string;
  apiUsername: string;
  apiPassword: string;
  merchantId: number;
  commissionPlanCode?: string;
  maxInstallment?: number;
  secure3dKey?: string;
}

interface TrepsAuthResponse {
  status: boolean;
  data: { access_token: string; expire_in: number; scheme: string };
  errors: string | null;
}

export interface TrepsHPPCreateParams {
  externalOrderId: string;
  amount: number;
  currency?: string;
  minInstallment?: number;
  maxInstallment?: number;
  expireDate?: string;
  returnUrl: string;
  commissionPlanCode?: string;
  buyer: {
    customerId: string;
    name: string;
    surname: string;
    email: string;
    phoneNumber: string;
    country?: string;
    city?: string;
    address?: string;
    zipCode?: string;
  };
  products: Array<{
    productId: string;
    category: string;
    name: string;
    price: number;
    quantity: number;
    description?: string;
  }>;
}

export interface TrepsHPPCreateResponse {
  status: boolean;
  data: {
    url: string; // HPP sayfası (ör. https://pohp.treps.tr/hp/HST-2-xxx)
    token: string; // HPP token (ör. HST-2-xxx)
    expire_date: string;
  } | null;
  errors: string | null;
}

export interface TrepsHPPStatusResponse {
  status: boolean;
  data: {
    token: string;
    external_order_id: string;
    oid: string | null;
    status: number; // 1=aktif, 2=expired, 3=cancelled
    amount: number;
    currency: string;
    expire_date: string;
    order: {
      oid: string;
      external_order_id: string;
      order_date: string;
      order_amount: number;
      order_success_amount: number;
      order_completed: boolean;
      payments: Array<{
        payment_id: string;
        payment_status: number; // 10 = başarılı
        payment_status_code: string;
        payment_date: string;
        card_bin: string;
        card_last_four: string;
        amount: number;
        installment: number;
        bank_vpos_code: string;
        bank_auth_code: string;
        transaction_type: number;
      }>;
    } | null; // null = henüz ödeme denenmemiş
  };
  errors: string | null;
}

interface TrepsOrderDetailResponse {
  status: boolean;
  data: {
    oid: string;
    external_order_id: string;
    order_amount: number;
    payments: Array<{
      payment_id: string;
      payment_status: number;
      transactions: Array<{
        transaction_id: string;
        transaction_type: number;
        amount: number;
        result_code: string;
      }>;
    }>;
  } | null;
  errors: string | null;
}

// ─── Token önbelleği (merchant başına) ───────────────────────

interface CachedToken {
  token: string;
  expiresAt: number;
}

const tokenCache = new Map<string, CachedToken>();

/**
 * Treps'in metin sütunları varchar(50); sığmayan değer
 * `22001: value too long for type character varying(50)` hatasına yol açar.
 * Bu yüzden gönderdiğimiz her serbest metni kırpıyoruz.
 */
const TREPS_TEXT_MAX = 50;

function cap(value: string | undefined | null, max = TREPS_TEXT_MAX): string {
  const v = (value ?? '').trim();
  return v.length > max ? v.slice(0, max) : v;
}

export class TrepsClient {
  private credentials: TrepsCredentials;
  private cacheKey: string;

  constructor(credentials: TrepsCredentials) {
    this.credentials = credentials;
    this.cacheKey = `${credentials.apiBaseUrl}:${credentials.merchantId}:${credentials.apiUsername}`;
  }

  /** Erişim tokenı alır; süresi dolmadıysa önbellekten döner. */
  private async getToken(): Promise<string> {
    const cached = tokenCache.get(this.cacheKey);
    // 30sn güvenlik payı
    if (cached && cached.expiresAt - 30_000 > Date.now()) return cached.token;

    const res = await fetch(`${this.credentials.apiBaseUrl}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.credentials.apiUsername,
        password: this.credentials.apiPassword,
        merchantId: this.credentials.merchantId,
      }),
    });

    const data = (await res.json()) as TrepsAuthResponse;
    if (!data.status || !data.data?.access_token) {
      throw new Error(data.errors || 'Treps kimlik doğrulaması başarısız');
    }

    // expire_in saniye ya da epoch-ms olabilir.
    const expiresAt =
      data.data.expire_in > 1e12
        ? data.data.expire_in
        : Date.now() + data.data.expire_in * 1000;

    tokenCache.set(this.cacheKey, { token: data.data.access_token, expiresAt });
    return data.data.access_token;
  }

  private async authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getToken();
    return fetch(`${this.credentials.apiBaseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /** Girilen anahtarlarla Treps'e bağlanılabildiğini doğrular. */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.getToken();
      return { success: true, message: 'Treps bağlantısı başarılı' };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      return { success: false, message: msg };
    }
  }

  /**
   * 3D Secure destekli Hosted Payment Page (HPP) oturumu açar.
   * Kart bilgileri yalnızca Treps'in sayfasına girilir; bize hiç ulaşmaz.
   */
  async createHPP(params: TrepsHPPCreateParams): Promise<TrepsHPPCreateResponse> {
    const body: Record<string, unknown> = {
      external_order_id: params.externalOrderId,
      amount: params.amount,
      currency: params.currency || 'TRY',
      secure_flag: 1,
      transaction_type: 1,
      min_installment: params.minInstallment || 1,
      max_installment: params.maxInstallment || this.credentials.maxInstallment || 1,
      // Varsayılan 30 dakika geçerlilik
      expire_date: params.expireDate || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      return_url: params.returnUrl,
      return_button_url: params.returnUrl,
      return_button_text: 'Siteye Dön',
      redirect_timeout: 5,
      redirect_after_fail_payment: 1,
      save_card: 0,
      customer_commission_plan_code:
        params.commissionPlanCode || this.credentials.commissionPlanCode || '',
      retry_fail: true,
      iframe_flag: 0,
      lang: 'tr',
      buyer: {
        customer_id: cap(params.buyer.customerId),
        name: cap(params.buyer.name),
        surname: cap(params.buyer.surname),
        email: cap(params.buyer.email, 100),
        phone_number: cap(params.buyer.phoneNumber, 20),
        country: cap(params.buyer.country || 'TUR', 3),
        city: cap(params.buyer.city),
        address: cap(params.buyer.address, 100),
        zip_code: cap(params.buyer.zipCode, 10),
      },
      products: params.products.map((p) => ({
        product_id: cap(p.productId),
        category: cap(p.category),
        name: cap(p.name),
        price: p.price,
        quantity: p.quantity,
        description: cap(p.description),
      })),
    };

    if (this.credentials.secure3dKey) {
      body.secure_key = this.credentials.secure3dKey;
    }

    const res = await this.authFetch('/api/payment/hostedpage', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return (await res.json()) as TrepsHPPCreateResponse;
  }

  /** Bir HPP oturumunun (token) güncel ödeme durumunu sorgular. */
  async getHPPStatus(token: string): Promise<TrepsHPPStatusResponse> {
    const res = await this.authFetch(`/api/payment/hostedpage/${token}`, { method: 'GET' });
    return (await res.json()) as TrepsHPPStatusResponse;
  }

  /**
   * Sipariş detayını getirir. İade için gereken `transaction_id` yalnızca
   * bu uçtan alınabildiği için ödeme sonrası çağrılır.
   */
  async getOrderDetail(externalOrderId: string): Promise<TrepsOrderDetailResponse['data']> {
    try {
      const res = await this.authFetch('/api/report/order-detail', {
        method: 'POST',
        body: JSON.stringify({ external_order_id: externalOrderId }),
      });
      const data = (await res.json()) as TrepsOrderDetailResponse;
      return data.status ? data.data : null;
    } catch {
      return null;
    }
  }

  /** Tamamlanmış bir ödemeyi kısmen veya tamamen iade eder. */
  async refund(
    paymentId: string,
    transactionId: string,
    amount: number,
    reason?: string,
  ): Promise<{ status: boolean; data: unknown; errors: string | null }> {
    const res = await this.authFetch('/api/payment/refund', {
      method: 'POST',
      body: JSON.stringify({
        payment_id: paymentId,
        transaction_id: transactionId,
        external_transaction_id: `REF-${Date.now()}`,
        amount,
        clientIp: '127.0.0.1',
        reason: reason || 'İade talebi',
      }),
    });
    return (await res.json()) as { status: boolean; data: unknown; errors: string | null };
  }

  /** Gün sonu alınmamış işlemler için iptal (void). */
  async voidPayment(
    paymentId: string,
    transactionId: string,
  ): Promise<{ status: boolean; data: unknown; errors: string | null }> {
    const res = await this.authFetch('/api/payment/void', {
      method: 'POST',
      body: JSON.stringify({
        payment_id: paymentId,
        transaction_id: transactionId,
        external_transaction_id: `VOID-${Date.now()}`,
        clientIp: '127.0.0.1',
        reason: 'İptal',
      }),
    });
    return (await res.json()) as { status: boolean; data: unknown; errors: string | null };
  }

  /** Hash doğrulamasında kullanılan 3D gizli anahtarı. */
  getSecretKey(): string | undefined {
    return this.credentials.secure3dKey;
  }
}
