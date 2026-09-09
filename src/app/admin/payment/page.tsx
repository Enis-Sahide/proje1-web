"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Package,
  Plug,
  Receipt,
  RefreshCw,
  Save,
} from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

/** Hata nesnesinden okunabilir mesaj çıkarır. */
function errText(e: unknown): string {
  return e instanceof Error ? e.message : 'Bilinmeyen hata';
}

/** Form alanlarını güvenle string'e çevirir (state Record<string, unknown>). */
function s(v: unknown): string {
  return v === null || v === undefined ? '' : String(v);
}

type Tab = 'pos' | 'invoice' | 'products' | 'transactions';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'pos', label: 'Sanal POS (Treps)', icon: CreditCard },
  { id: 'invoice', label: 'Faturalama', icon: Receipt },
  { id: 'products', label: 'Ürün & Fiyat', icon: Package },
  { id: 'transactions', label: 'İşlemler', icon: FileText },
];

const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#D4AF37] transition-colors';
const labelCls =
  'block text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <p className="text-[10px] text-white/30 mt-1 leading-relaxed">{hint}</p>}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-white/80 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-white/20 accent-[#D4AF37] w-4 h-4"
      />
      {label}
    </label>
  );
}

function Notice({ kind, text }: { kind: 'ok' | 'err'; text: string }) {
  const ok = kind === 'ok';
  return (
    <div
      className={`flex items-start gap-2 text-xs rounded-xl px-3.5 py-2.5 border ${
        ok
          ? 'bg-green-500/5 border-green-500/20 text-green-300'
          : 'bg-red-500/5 border-red-500/20 text-red-300'
      }`}
    >
      {ok ? (
        <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
      ) : (
        <AlertCircle size={14} className="shrink-0 mt-0.5" />
      )}
      <span className="leading-relaxed">{text}</span>
    </div>
  );
}

// ─── Sanal POS sekmesi ───────────────────────────────────────

function PosTab() {
  const [form, setForm] = useState<Record<string, unknown>>({
    isActive: false,
    apiBaseUrl: 'https://poapi.treps.tr',
    apiUsername: '',
    apiPassword: '',
    merchantId: '',
    commissionPlanCode: '',
    maxInstallment: 1,
    minAmount: '1',
    secure3dKey: '',
    webhookSecret: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [lastTest, setLastTest] = useState<{ at: string | null; ok: boolean | null }>({
    at: null,
    ok: null,
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    apiFetch('/api/admin/pos-settings')
      .then((res) => {
        if (res?.data) {
          setForm((f) => ({ ...f, ...res.data, merchantId: res.data.merchantId ?? '' }));
          setLastTest({ at: res.data.lastTestedAt, ok: res.data.lastTestResult });
        }
      })
      .catch((e) => setMsg({ kind: 'err', text: errText(e) }))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await apiFetch('/api/admin/pos-settings', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (res?.data) setForm((f) => ({ ...f, ...res.data, merchantId: res.data.merchantId ?? '' }));
      setMsg({ kind: 'ok', text: 'POS ayarları kaydedildi.' });
    } catch (e: unknown) {
      setMsg({ kind: 'err', text: errText(e) });
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true);
    setMsg(null);
    try {
      const res = await apiFetch('/api/admin/pos-settings/test', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMsg({ kind: res.success ? 'ok' : 'err', text: res.message });
      setLastTest({ at: new Date().toISOString(), ok: res.success });
    } catch (e: unknown) {
      setMsg({ kind: 'err', text: errText(e) });
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <Loader2 className="animate-spin text-[#D4AF37]" />;

  const webhookUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/api/payment/treps/webhook` : '';

  return (
    <div className="space-y-5">
      {msg && <Notice kind={msg.kind} text={msg.text} />}

      <Toggle
        checked={Boolean(form.isActive)}
        onChange={(v) => set('isActive', v)}
        label="Sanal POS aktif (kapalıyken ödeme alınamaz)"
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="API Adresi">
          <input
            className={inputCls}
            value={s(form.apiBaseUrl)}
            onChange={(e) => set('apiBaseUrl', e.target.value)}
            placeholder="https://poapi.treps.tr"
          />
        </Field>
        <Field label="Merchant ID">
          <input
            className={inputCls}
            value={s(form.merchantId)}
            onChange={(e) => set('merchantId', e.target.value)}
            placeholder="Örn. 2"
          />
        </Field>
        <Field label="API Kullanıcı Adı">
          <input
            className={inputCls}
            value={s(form.apiUsername)}
            onChange={(e) => set('apiUsername', e.target.value)}
          />
        </Field>
        <Field label="API Şifresi" hint="Kayıtlı şifre maskeli gösterilir; boş bırakırsanız değişmez.">
          <input
            type="password"
            className={inputCls}
            value={s(form.apiPassword)}
            onChange={(e) => set('apiPassword', e.target.value)}
          />
        </Field>
        <Field label="3D Secure Anahtarı" hint="Treps panelinden alınan güvenlik anahtarı.">
          <input
            type="password"
            className={inputCls}
            value={s(form.secure3dKey)}
            onChange={(e) => set('secure3dKey', e.target.value)}
          />
        </Field>
        <Field
          label="Webhook Gizli Anahtarı"
          hint="Treps'e tanımladığınız anahtarla aynı olmalı; boşsa bildirimler doğrulanamaz."
        >
          <input
            type="password"
            className={inputCls}
            value={s(form.webhookSecret)}
            onChange={(e) => set('webhookSecret', e.target.value)}
          />
        </Field>
        <Field label="Komisyon Plan Kodu" hint="Taksit sorgusu için gerekli (opsiyonel).">
          <input
            className={inputCls}
            value={s(form.commissionPlanCode)}
            onChange={(e) => set('commissionPlanCode', e.target.value)}
          />
        </Field>
        <Field label="Azami Taksit">
          <input
            type="number"
            min={1}
            max={12}
            className={inputCls}
            value={s(form.maxInstallment) || '1'}
            onChange={(e) => set('maxInstallment', e.target.value)}
          />
        </Field>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1.5">
        <p className="text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider">
          Treps paneline tanımlanacak bildirim adresi
        </p>
        <code className="text-xs text-white/70 break-all">{webhookUrl}</code>
      </div>

      {lastTest.at && (
        <p className="text-[11px] text-white/40">
          Son bağlantı testi: {new Date(lastTest.at).toLocaleString('tr-TR')} —{' '}
          <span className={lastTest.ok ? 'text-green-400' : 'text-red-400'}>
            {lastTest.ok ? 'başarılı' : 'başarısız'}
          </span>
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-sm px-6 py-2.5 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Kaydet
        </button>
        <button
          onClick={test}
          disabled={testing}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {testing ? <Loader2 size={16} className="animate-spin" /> : <Plug size={16} />}
          Bağlantıyı Test Et
        </button>
      </div>
    </div>
  );
}

// ─── Faturalama sekmesi ──────────────────────────────────────

function InvoiceTab() {
  const [form, setForm] = useState<Record<string, unknown>>({
    isActive: false,
    testMode: true,
    autoIssue: true,
    apiKey: '',
    secretKey: '',
    integrationKey: '',
    sellerTitle: '',
    sellerTaxNumber: '',
    sellerTaxOffice: '',
    sellerAddress: '',
    sellerDistrict: '',
    sellerCity: '',
    sellerEmail: '',
    sellerPhone: '',
    invoiceSeries: 'EAR',
    defaultTaxRate: '20',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    apiFetch('/api/admin/invoice-settings')
      .then((res) => {
        if (res?.data) setForm((f) => ({ ...f, ...res.data }));
      })
      .catch((e) => setMsg({ kind: 'err', text: errText(e) }))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await apiFetch('/api/admin/invoice-settings', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (res?.data) setForm((f) => ({ ...f, ...res.data }));
      setMsg({ kind: 'ok', text: 'Faturalama ayarları kaydedildi.' });
    } catch (e: unknown) {
      setMsg({ kind: 'err', text: errText(e) });
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true);
    setMsg(null);
    try {
      const res = await apiFetch('/api/admin/invoice-settings/test', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMsg({ kind: res.success ? 'ok' : 'err', text: res.message });
    } catch (e: unknown) {
      setMsg({ kind: 'err', text: errText(e) });
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <Loader2 className="animate-spin text-[#D4AF37]" />;

  return (
    <div className="space-y-5">
      {msg && <Notice kind={msg.kind} text={msg.text} />}

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Toggle
          checked={Boolean(form.isActive)}
          onChange={(v) => set('isActive', v)}
          label="Entegratör aktif"
        />
        <Toggle
          checked={Boolean(form.testMode)}
          onChange={(v) => set('testMode', v)}
          label="Test ortamı"
        />
        <Toggle
          checked={Boolean(form.autoIssue)}
          onChange={(v) => set('autoIssue', v)}
          label="Ödeme sonrası otomatik fatura kes"
        />
      </div>

      <p className="text-[11px] text-white/40 leading-relaxed">
        Entegratör anahtarları girilmediğinde faturalar yalnızca sistem içinde taslak olarak
        tutulur; anahtarlar girildikten sonra İşlemler sekmesinden yeniden gönderilebilir.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <Field label="API Key">
          <input
            type="password"
            className={inputCls}
            value={s(form.apiKey)}
            onChange={(e) => set('apiKey', e.target.value)}
          />
        </Field>
        <Field label="Secret Key">
          <input
            type="password"
            className={inputCls}
            value={s(form.secretKey)}
            onChange={(e) => set('secretKey', e.target.value)}
          />
        </Field>
        <Field label="Integration Key">
          <input
            type="password"
            className={inputCls}
            value={s(form.integrationKey)}
            onChange={(e) => set('integrationKey', e.target.value)}
          />
        </Field>
      </div>

      <div className="pt-2 border-t border-white/10">
        <p className="text-xs font-bold text-white/70 mb-3 mt-3">Satıcı Künyesi (faturada görünür)</p>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Ünvan">
            <input
              className={inputCls}
              value={s(form.sellerTitle)}
              onChange={(e) => set('sellerTitle', e.target.value)}
            />
          </Field>
          <Field label="VKN / TCKN">
            <input
              className={inputCls}
              value={s(form.sellerTaxNumber)}
              onChange={(e) => set('sellerTaxNumber', e.target.value)}
            />
          </Field>
          <Field label="Vergi Dairesi">
            <input
              className={inputCls}
              value={s(form.sellerTaxOffice)}
              onChange={(e) => set('sellerTaxOffice', e.target.value)}
            />
          </Field>
          <Field label="Adres">
            <input
              className={inputCls}
              value={s(form.sellerAddress)}
              onChange={(e) => set('sellerAddress', e.target.value)}
            />
          </Field>
          <Field label="İlçe">
            <input
              className={inputCls}
              value={s(form.sellerDistrict)}
              onChange={(e) => set('sellerDistrict', e.target.value)}
            />
          </Field>
          <Field label="İl">
            <input
              className={inputCls}
              value={s(form.sellerCity)}
              onChange={(e) => set('sellerCity', e.target.value)}
            />
          </Field>
          <Field label="E-Posta">
            <input
              className={inputCls}
              value={s(form.sellerEmail)}
              onChange={(e) => set('sellerEmail', e.target.value)}
            />
          </Field>
          <Field label="Telefon">
            <input
              className={inputCls}
              value={s(form.sellerPhone)}
              onChange={(e) => set('sellerPhone', e.target.value)}
            />
          </Field>
          <Field label="Fatura Serisi">
            <input
              className={inputCls}
              value={s(form.invoiceSeries) || 'EAR'}
              onChange={(e) => set('invoiceSeries', e.target.value)}
            />
          </Field>
          <Field label="Varsayılan KDV (%)">
            <input
              type="number"
              className={inputCls}
              value={s(form.defaultTaxRate) || '20'}
              onChange={(e) => set('defaultTaxRate', e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-sm px-6 py-2.5 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Kaydet
        </button>
        <button
          onClick={test}
          disabled={testing}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {testing ? <Loader2 size={16} className="animate-spin" /> : <Plug size={16} />}
          Bağlantıyı Test Et
        </button>
      </div>
    </div>
  );
}

// ─── Ürün & fiyat sekmesi ────────────────────────────────────

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  price: string;
  taxRate: string;
  isActive: boolean;
  sort: number;
}

function ProductsTab() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Not: setLoading burada çağrılmaz — effect gövdesinde senkron setState
  // cascading render'a yol açar. Yenile butonu spinner'ı kendisi açar.
  const load = useCallback(() => {
    apiFetch('/api/admin/report-products')
      .then((res) => setRows(res?.data ?? []))
      .catch((e) => setMsg({ kind: 'err', text: errText(e) }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const update = (id: string, patch: Partial<ProductRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const save = async (row: ProductRow) => {
    setSavingId(row.id);
    setMsg(null);
    try {
      await apiFetch('/api/admin/report-products', {
        method: 'POST',
        body: JSON.stringify(row),
      });
      setMsg({ kind: 'ok', text: `${row.name} kaydedildi.` });
    } catch (e: unknown) {
      setMsg({ kind: 'err', text: errText(e) });
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <Loader2 className="animate-spin text-[#D4AF37]" />;

  return (
    <div className="space-y-4">
      {msg && <Notice kind={msg.kind} text={msg.text} />}
      {rows.length === 0 && (
        <p className="text-sm text-white/40">
          Henüz ürün tanımlı değil. Migration ile birlikte üç rapor türü otomatik eklenir.
        </p>
      )}
      {rows.map((row) => (
        <div key={row.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white">{row.name}</p>
              <code className="text-[10px] text-white/30">{row.id}</code>
            </div>
            <Toggle
              checked={row.isActive}
              onChange={(v) => update(row.id, { isActive: v })}
              label="Satışta"
            />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="Görünen Ad">
              <input
                className={inputCls}
                value={row.name}
                onChange={(e) => update(row.id, { name: e.target.value })}
              />
            </Field>
            <Field label="Fiyat (KDV dahil, TL)">
              <input
                type="number"
                step="0.01"
                className={inputCls}
                value={row.price}
                onChange={(e) => update(row.id, { price: e.target.value })}
              />
            </Field>
            <Field label="KDV Oranı (%)">
              <input
                type="number"
                className={inputCls}
                value={row.taxRate}
                onChange={(e) => update(row.id, { taxRate: e.target.value })}
              />
            </Field>
          </div>
          <button
            onClick={() => save(row)}
            disabled={savingId === row.id}
            className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-xs px-5 py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {savingId === row.id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Kaydet
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── İşlemler sekmesi ────────────────────────────────────────

interface TxRow {
  id: string;
  externalOrderId: string;
  productType: string;
  amount: string;
  status: string;
  payerEmail: string | null;
  cardLastFour: string | null;
  errorMessage: string | null;
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  completed: 'text-green-400 bg-green-500/10 border-green-500/30',
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  failed: 'text-red-400 bg-red-500/10 border-red-500/30',
  expired: 'text-white/40 bg-white/5 border-white/10',
  refunded: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

function TransactionsTab() {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Not: setLoading burada çağrılmaz — effect gövdesinde senkron setState
  // cascading render'a yol açar. Yenile butonu spinner'ı kendisi açar.
  const load = useCallback(() => {
    apiFetch('/api/admin/transactions?limit=100')
      .then((res) => setRows(res?.data ?? []))
      .catch((e) => setMsg({ kind: 'err', text: errText(e) }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const act = async (id: string, action: 'verify' | 'refund') => {
    if (action === 'refund' && !window.confirm('Bu işlem iade edilsin mi? Geri alınamaz.')) return;
    setBusyId(id);
    setMsg(null);
    try {
      await apiFetch('/api/admin/transactions', {
        method: 'POST',
        body: JSON.stringify({ id, action }),
      });
      setMsg({ kind: 'ok', text: action === 'refund' ? 'İade yapıldı.' : 'Durum güncellendi.' });
      load();
    } catch (e: unknown) {
      setMsg({ kind: 'err', text: errText(e) });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader2 className="animate-spin text-[#D4AF37]" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40">{rows.length} işlem</p>
        <button
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:underline"
        >
          <RefreshCw size={13} /> Yenile
        </button>
      </div>

      {msg && <Notice kind={msg.kind} text={msg.text} />}

      {rows.length === 0 ? (
        <p className="text-sm text-white/40">Henüz işlem yok.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-xs">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="text-left font-medium px-3 py-2.5">Tarih</th>
                <th className="text-left font-medium px-3 py-2.5">Sipariş</th>
                <th className="text-left font-medium px-3 py-2.5">Ürün</th>
                <th className="text-left font-medium px-3 py-2.5">Müşteri</th>
                <th className="text-right font-medium px-3 py-2.5">Tutar</th>
                <th className="text-left font-medium px-3 py-2.5">Durum</th>
                <th className="text-right font-medium px-3 py-2.5">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5 text-white/80">
                  <td className="px-3 py-2.5 whitespace-nowrap text-white/50">
                    {new Date(r.createdAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-white/50">
                    {r.externalOrderId}
                  </td>
                  <td className="px-3 py-2.5">{r.productType}</td>
                  <td className="px-3 py-2.5">{r.payerEmail || '—'}</td>
                  <td className="px-3 py-2.5 text-right font-medium">
                    {Number(r.amount).toLocaleString('tr-TR')} TL
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-medium ${
                        STATUS_STYLE[r.status] || STATUS_STYLE.expired
                      }`}
                    >
                      {r.status}
                    </span>
                    {r.errorMessage && (
                      <p className="text-[10px] text-red-300/60 mt-1 max-w-[220px]">
                        {r.errorMessage}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => act(r.id, 'verify')}
                      disabled={busyId === r.id}
                      className="text-[#D4AF37] hover:underline disabled:opacity-40"
                    >
                      Sorgula
                    </button>
                    {r.status === 'completed' && (
                      <>
                        <span className="text-white/20 mx-2">|</span>
                        <button
                          onClick={() => act(r.id, 'refund')}
                          disabled={busyId === r.id}
                          className="text-red-400 hover:underline disabled:opacity-40"
                        >
                          İade
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Sayfa ───────────────────────────────────────────────────

export default function AdminPaymentPage() {
  const [tab, setTab] = useState<Tab>('pos');

  return (
    <>
      <AdminPageHeader
        title="Ödeme & Faturalama"
        description="Treps sanal POS ve e-belge entegratör anahtarlarını buradan yönetin"
        icon={CreditCard}
      />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
              tab === id
                ? 'border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37]'
                : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/50 p-6 md:p-8">
        {tab === 'pos' && <PosTab />}
        {tab === 'invoice' && <InvoiceTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'transactions' && <TransactionsTab />}
      </div>
    </>
  );
}
