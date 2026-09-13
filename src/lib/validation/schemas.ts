import { z } from 'zod';
import { isValidTCKN, isValidVKN } from '../billing/validate';

// ── 1. Doğum & Konum Verisi Şeması ─────────────────────────────────────────

export const cityLocationSchema = z.object({
  name: z.string().trim().min(2, 'Lütfen bir şehir seçin (en az 2 karakter)'),
  lat: z.number().min(-90, 'Enlem -90 ile +90 arasında olmalıdır').max(90, 'Enlem -90 ile +90 arasında olmalıdır'),
  lon: z.number().min(-180, 'Boylam -180 ile +180 arasında olmalıdır').max(180, 'Boylam -180 ile +180 arasında olmalıdır'),
  tz: z.string().default('Europe/Istanbul'),
  country: z.string().optional().default('Türkiye'),
});

export type CityLocation = z.infer<typeof cityLocationSchema>;

export const birthDataSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Doğum tarihi YYYY-AA-GG formatında olmalıdır')
    .refine((val) => {
      const d = new Date(val);
      if (isNaN(d.getTime())) return false;
      const [y, m, day] = val.split('-').map(Number);
      if (d.getUTCFullYear() !== y || d.getUTCMonth() + 1 !== m || d.getUTCDate() !== day) return false;
      if (y < 1900) return false;
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return d <= today;
    }, { message: 'Geçerli bir doğum tarihi giriniz (1900 yılından günümüze kadar, gelecek tarih olamaz).' }),

  time: z.string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Doğum saati SS:DD formatında geçerli bir saat olmalıdır (00:00 - 23:59)'),

  city: cityLocationSchema,
});

export type BirthData = z.infer<typeof birthDataSchema>;

// ── 2. Misafir Satın Alma (Guest Checkout) Şeması ─────────────────────────

export const guestCheckoutSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .email('Lütfen geçerli bir e-posta adresi girin'),

  date: birthDataSchema.shape.date,
  time: birthDataSchema.shape.time,
  city: cityLocationSchema,

  analysisType: z.string().min(2, 'Geçersiz analiz türü'),

  selectedProfileId: z.string().min(1, 'Lütfen bir fatura profili seçin veya oluşturun'),

  agreedTerms: z.literal(true, {
    message: 'Devam etmek için Mesafeli Satış Sözleşmesi ve İptal/İade Koşullarını kabul etmelisiniz',
  }),

});

export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>;

// ── 3. Fatura Profili Şeması ──────────────────────────────────────────────

export const billingProfileSchema = z.object({
  label: z.string()
    .trim()
    .min(2, 'Profil adı en az 2 karakter olmalıdır (ör. "Şahsi", "Şirketim")')
    .max(40, 'Profil adı en fazla 40 karakter olabilir'),

  type: z.enum(['individual', 'company']),

  title: z.string()
    .trim()
    .min(2, 'Ad Soyad / Firma Ünvanı en az 2 karakter olmalıdır')
    .max(100, 'En fazla 100 karakter olabilir'),

  taxNumber: z.string().optional().nullable(),
  taxOffice: z.string().optional().nullable(),

  address: z.string()
    .trim()
    .min(5, 'Fatura adresi en az 5 karakter olmalıdır')
    .max(250, 'Fatura adresi en fazla 250 karakter olabilir'),

  city: z.string()
    .trim()
    .min(2, 'Lütfen geçerli bir şehir girin')
    .max(50),

  district: z.string()
    .trim()
    .min(2, 'Lütfen geçerli bir ilçe girin')
    .max(50),

  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  isDefault: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
  const cleanTax = (data.taxNumber || '').replace(/\s/g, '');
  const cleanOffice = (data.taxOffice || '').trim();

  if (data.type === 'company') {
    if (!cleanTax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['taxNumber'],
        message: 'Kurumsal faturalar için Vergi Kimlik Numarası (VKN) zorunludur',
      });
    } else if (!isValidVKN(cleanTax)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['taxNumber'],
        message: 'Geçersiz Vergi Kimlik Numarası (10 haneli ve algoritmaya uygun olmalıdır)',
      });
    }

    if (!cleanOffice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['taxOffice'],
        message: 'Kurumsal faturalar için Vergi Dairesi zorunludur',
      });
    }
  } else {
    // Bireysel
    if (data.title.split(/\s+/).length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['title'],
        message: 'Lütfen ad ve soyadınızı eksiksiz girin (en az 2 kelime)',
      });
    }

    if (cleanTax && !isValidTCKN(cleanTax)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['taxNumber'],
        message: 'Geçersiz T.C. Kimlik Numarası (11 haneli ve algoritmaya uygun olmalıdır)',
      });
    }
  }

  // Fatura e-postası girilmişse format kontrolü
  if (data.email && data.email.trim()) {
    const emailTest = z.string().email().safeParse(data.email.trim());
    if (!emailTest.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'Geçerli bir fatura e-postası girin',
      });
    }
  }
});

export type BillingProfileInput = z.infer<typeof billingProfileSchema>;

// ── 4. Kimlik Doğrulama / Auth Şemaları ────────────────────────────────────

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .email('Lütfen geçerli bir e-posta adresi girin'),

  password: z.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Ad Soyad en az 2 karakter olmalıdır').max(50, 'En fazla 50 karakter olabilir').optional().nullable(),

  email: z.string()
    .trim()
    .toLowerCase()
    .email('Lütfen geçerli bir e-posta adresi girin'),

  password: z.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır'),

  website: z.string().optional(), // Honeypot (bot tuzağı)
});

export const verifyEmailSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .email('Geçerli bir e-posta adresi girin'),

  code: z.string()
    .trim()
    .regex(/^\d{6}$/, 'Doğrulama kodu tam 6 haneli rakamlardan oluşmalıdır'),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .email('Lütfen geçerli bir e-posta adresi girin'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Geçersiz veya eksik sıfırlama anahtarı'),
  password: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır'),
});

// ── 5. Numeroloji Giriş Şeması ─────────────────────────────────────────────

export const numerologyInputSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, 'Ad soyad en az 2 karakter olmalıdır')
    .regex(/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/, 'Ad ve soyad yalnızca harflerden oluşmalıdır (rakam veya özel karakter içeremez)'),

  birthDate: birthDataSchema.shape.date,
});

export type NumerologyInput = z.infer<typeof numerologyInputSchema>;
