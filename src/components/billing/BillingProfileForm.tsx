"use client";

import React, { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { billingProfileSchema, formatZodError } from '@/lib/validation';

export type BillingProfile = {
  id: string;
  label: string;
  type: 'individual' | 'company';
  title: string;
  taxNumber: string | null;
  taxOffice: string | null;
  address: string;
  city: string;
  district: string;
  phone: string | null;
  email: string | null;
  isDefault: boolean;
};

const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors';
const labelCls = 'block text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5';

type FormState = {
  label: string;
  type: 'individual' | 'company';
  title: string;
  taxNumber: string;
  taxOffice: string;
  address: string;
  city: string;
  district: string;
  phone: string;
  email: string;
  isDefault: boolean;
};

function toForm(p?: BillingProfile | null): FormState {
  return {
    label: p?.label ?? '',
    type: p?.type ?? 'individual',
    title: p?.title ?? '',
    taxNumber: p?.taxNumber ?? '',
    taxOffice: p?.taxOffice ?? '',
    address: p?.address ?? '',
    city: p?.city ?? '',
    district: p?.district ?? '',
    phone: p?.phone ?? '',
    email: p?.email ?? '',
    isDefault: p?.isDefault ?? false,
  };
}

/** Kısa özet — dropdown ve kart görünümü için. */
export function profileSummary(p: BillingProfile): string {
  const id = p.taxNumber ? ` · ${p.taxNumber}` : '';
  return `${p.title}${id} · ${p.district}/${p.city}`;
}

interface Props {
  /** Düzenleme modunda mevcut profil; yoksa yeni oluşturur. */
  initial?: BillingProfile | null;
  /** İlk profil oluşturuluyorsa kullanıcıya bunu söyler. */
  isFirst?: boolean;
  onSaved: (profile: BillingProfile) => void;
  onCancel?: () => void;
}

export default function BillingProfileForm({ initial, isFirst, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(() => toForm(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const isCompany = form.type === 'company';

  const submit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setError('');

    // Zod ile eksiksiz fatura profili doğrulaması (TCKN, VKN, Vergi dairesi, Adres, İl, İlçe vb.)
    const parsed = billingProfileSchema.safeParse(form);
    if (!parsed.success) {
      setError(formatZodError(parsed.error));
      return;
    }

    setSaving(true);
    try {
      const res = initial
        ? await apiFetch(`/api/billing/profiles/${initial.id}`, { method: 'PATCH', body: JSON.stringify(form) })
        : await apiFetch('/api/billing/profiles', { method: 'POST', body: JSON.stringify(form) });
      onSaved(res.data as BillingProfile);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Profil kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          e.preventDefault();
          submit();
        }
      }}
      className="space-y-3.5"
    >
      {isFirst && (

        <p className="text-xs text-white/60 leading-relaxed">
          Fatura kesebilmemiz için bir fatura profili oluşturmanız gerekir. Daha sonra profil
          sayfanızdan birden fazla profil (şahsi, şirket) ekleyebilirsiniz.
        </p>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Profil Adı</label>
          <input
            className={inputCls}
            value={form.label}
            onChange={(e) => set('label', e.target.value)}
            placeholder={isCompany ? 'Şirketim' : 'Şahsi'}
            maxLength={40}
            required
          />
        </div>
        <div>
          <label className={labelCls}>Tür</label>
          <div className="flex rounded-xl border border-white/10 overflow-hidden text-xs">
            {(['individual', 'company'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`flex-1 py-2.5 transition-colors ${
                  form.type === t ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-semibold' : 'text-white/50 hover:text-white'
                }`}
              >
                {t === 'individual' ? 'Bireysel' : 'Kurumsal'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>{isCompany ? 'Firma Ünvanı' : 'Ad Soyad'}</label>
        <input
          className={inputCls}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder={isCompany ? 'Örnek Bilişim A.Ş.' : 'Adınız Soyadınız'}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{isCompany ? 'Vergi No' : 'TC Kimlik No'}</label>
          <input
            className={inputCls}
            inputMode="numeric"
            maxLength={isCompany ? 10 : 11}
            value={form.taxNumber}
            onChange={(e) => set('taxNumber', e.target.value.replace(/\D/g, ''))}
            placeholder={isCompany ? '10 hane' : 'İsteğe bağlı'}
            required={isCompany}
          />
        </div>
        {isCompany ? (
          <div>
            <label className={labelCls}>Vergi Dairesi</label>
            <input
              className={inputCls}
              value={form.taxOffice}
              onChange={(e) => set('taxOffice', e.target.value)}
              required
            />
          </div>
        ) : (
          <div>
            <label className={labelCls}>Telefon</label>
            <input
              className={inputCls}
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="İsteğe bağlı"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>İl</label>
          <input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>İlçe</label>
          <input
            className={inputCls}
            value={form.district}
            onChange={(e) => set('district', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Adres</label>
        <input
          className={inputCls}
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          placeholder="Mahalle, sokak, no"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Fatura E-postası</label>
          <input
            className={inputCls}
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="Boşsa hesap e-postası"
          />
        </div>
        {isCompany && (
          <div>
            <label className={labelCls}>Telefon</label>
            <input
              className={inputCls}
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="İsteğe bağlı"
            />
          </div>
        )}
      </div>

      {!isFirst && (
        <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => set('isDefault', e.target.checked)}
            className="accent-[#D4AF37]"
          />
          Varsayılan fatura profili olsun
        </label>
      )}

      <div className="flex gap-2 justify-end pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs text-white/60 hover:text-white border border-white/10"
          >
            Vazgeç
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="flex items-center gap-1.5 bg-[#D4AF37] text-black text-xs font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {initial ? 'Güncelle' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
}

