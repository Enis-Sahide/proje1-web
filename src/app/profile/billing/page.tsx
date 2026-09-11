"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Download, FileText, Loader2, Plus, Receipt, Star, Trash2, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import BillingProfileForm, { type BillingProfile } from '@/components/billing/BillingProfileForm';

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  buyerName: string;
  buyerTaxNumber: string | null;
  subtotal: string;
  taxAmount: string;
  total: string;
  currency: string;
  status: string; // draft | sent | error | cancelled
  documentType: string;
  providerDocumentNo: string | null;
  pdfUrl: string | null;
};

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  sent: { text: 'Kesildi', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
  draft: { text: 'Hazırlanıyor', cls: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' },
  error: { text: 'Hazırlanıyor', cls: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' },
  cancelled: { text: 'İptal', cls: 'bg-white/5 text-white/40 border-white/10' },
};

function errText(e: unknown) {
  return e instanceof Error ? e.message : 'Bilinmeyen hata';
}

export default function BillingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [profiles, setProfiles] = useState<BillingProfile[] | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[] | null>(null);
  const [editing, setEditing] = useState<BillingProfile | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(() => {
    apiFetch('/api/billing/profiles')
      .then((res) => setProfiles(res?.data ?? []))
      .catch((e) => setMsg({ kind: 'err', text: errText(e) }));
    apiFetch('/api/billing/invoices')
      .then((res) => setInvoices(res?.data ?? []))
      .catch((e) => setMsg({ kind: 'err', text: errText(e) }));
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (!user) return null; // RouteGuard yönlendirir

  const onSaved = () => {
    setEditing(null);
    setCreating(false);
    setMsg({ kind: 'ok', text: 'Fatura profili kaydedildi.' });
    load();
  };

  const makeDefault = async (id: string) => {
    setBusyId(id);
    try {
      await apiFetch(`/api/billing/profiles/${id}`, { method: 'PATCH', body: JSON.stringify({ isDefault: true }) });
      load();
    } catch (e) {
      setMsg({ kind: 'err', text: errText(e) });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p: BillingProfile) => {
    if (!window.confirm(`"${p.label}" profili silinsin mi? Kesilmiş faturalar etkilenmez.`)) return;
    setBusyId(p.id);
    try {
      await apiFetch(`/api/billing/profiles/${p.id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setMsg({ kind: 'err', text: errText(e) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 bg-transparent flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-6">
        {/* Başlık */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/profile')}
            className="text-mystic-text-muted hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Fatura Bilgileri</h1>
            <p className="text-xs text-mystic-text-muted">Fatura profilleriniz ve kesilen faturalarınız</p>
          </div>
        </div>

        {msg && (
          <div
            className={`p-3 rounded-xl text-xs border ${
              msg.kind === 'ok'
                ? 'bg-green-500/10 border-green-500/30 text-green-200'
                : 'bg-red-500/10 border-red-500/30 text-red-200'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Profiller */}
        <section className="bg-mystic-surface/60 backdrop-blur-md border border-mystic-primary/20 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt size={16} className="text-mystic-primary" /> Fatura Profilleri
            </h2>
            {!creating && !editing && (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:underline"
              >
                <Plus size={13} /> Yeni profil
              </button>
            )}
          </div>

          {(creating || editing) && (
            <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 p-4">
              <BillingProfileForm
                initial={editing}
                isFirst={!editing && (profiles?.length ?? 0) === 0}
                onSaved={onSaved}
                onCancel={() => {
                  setEditing(null);
                  setCreating(false);
                }}
              />
            </div>
          )}

          {profiles === null ? (
            <Loader2 className="animate-spin text-[#D4AF37]" size={18} />
          ) : profiles.length === 0 && !creating ? (
            <p className="text-xs text-white/50">
              Henüz fatura profiliniz yok. Satın alma sırasında veya buradan oluşturabilirsiniz.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-4 text-xs space-y-1.5 ${
                    p.isDefault ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      {p.type === 'company' ? (
                        <Building2 size={13} className="text-[#D4AF37]" />
                      ) : (
                        <User size={13} className="text-[#D4AF37]" />
                      )}
                      {p.label}
                      {p.isDefault && (
                        <span className="ml-1 text-[9px] uppercase tracking-wider text-[#D4AF37] border border-[#D4AF37]/40 rounded px-1.5 py-0.5">
                          Varsayılan
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-white/90">{p.title}</p>
                  {p.taxNumber && (
                    <p className="text-white/50 font-mono text-[11px]">
                      {p.taxNumber}
                      {p.taxOffice ? ` · ${p.taxOffice}` : ''}
                    </p>
                  )}
                  <p className="text-white/50">
                    {p.address}, {p.district}/{p.city}
                  </p>
                  {p.email && <p className="text-white/40">{p.email}</p>}
                  <div className="flex items-center gap-3 pt-1.5 text-[11px]">
                    <button onClick={() => { setCreating(false); setEditing(p); }} className="text-[#D4AF37] hover:underline">
                      Düzenle
                    </button>
                    {!p.isDefault && (
                      <button
                        onClick={() => makeDefault(p.id)}
                        disabled={busyId === p.id}
                        className="flex items-center gap-1 text-white/60 hover:text-white disabled:opacity-40"
                      >
                        <Star size={11} /> Varsayılan yap
                      </button>
                    )}
                    <button
                      onClick={() => remove(p)}
                      disabled={busyId === p.id}
                      className="ml-auto flex items-center gap-1 text-red-400/80 hover:text-red-300 disabled:opacity-40"
                    >
                      <Trash2 size={11} /> Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Faturalar */}
        <section className="bg-mystic-surface/60 backdrop-blur-md border border-mystic-primary/20 rounded-3xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText size={16} className="text-mystic-primary" /> Faturalarım
          </h2>

          {invoices === null ? (
            <Loader2 className="animate-spin text-[#D4AF37]" size={18} />
          ) : invoices.length === 0 ? (
            <p className="text-xs text-white/50">Henüz kesilmiş faturanız yok.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-xs">
                <thead className="bg-white/5 text-white/50">
                  <tr>
                    <th className="text-left font-medium px-3 py-2.5">Tarih</th>
                    <th className="text-left font-medium px-3 py-2.5">Fatura No</th>
                    <th className="text-left font-medium px-3 py-2.5">Alıcı</th>
                    <th className="text-right font-medium px-3 py-2.5">Tutar</th>
                    <th className="text-left font-medium px-3 py-2.5">Durum</th>
                    <th className="text-right font-medium px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((r) => {
                    const st = STATUS_LABEL[r.status] ?? STATUS_LABEL.draft;
                    return (
                      <tr key={r.id} className="border-t border-white/5 text-white/80">
                        <td className="px-3 py-2.5 whitespace-nowrap text-white/50">
                          {new Date(r.invoiceDate).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[10px]">
                          {r.providerDocumentNo || r.invoiceNumber}
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="text-white">{r.buyerName}</p>
                          {r.buyerTaxNumber && (
                            <p className="font-mono text-[10px] text-white/40">{r.buyerTaxNumber}</p>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <p className="font-medium">
                            {Number(r.total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {r.currency}
                          </p>
                          <p className="text-[10px] text-white/40">
                            KDV {Number(r.taxAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-medium ${st.cls}`}>
                            {st.text}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {r.status === 'sent' && r.pdfUrl ? (
                            <a
                              href={r.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[#D4AF37] hover:underline"
                            >
                              <Download size={12} /> PDF
                            </a>
                          ) : (
                            <span className="text-white/30">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
