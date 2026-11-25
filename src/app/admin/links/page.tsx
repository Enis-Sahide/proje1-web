'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Link2,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Globe,
  Smartphone,
  Compass,
  MessageSquare,
  Radio,
  BookOpen,
  Mail,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface BioLinkItem {
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  iconKey: string;
  badgeText: string | null;
  isHighlighted: boolean;
  isActive: boolean;
  sortOrder: number;
}

const ICON_OPTIONS = [
  { key: 'globe', label: '🌐 Web Sitesi / Küre' },
  { key: 'playstore', label: '▶️ Google Play Store' },
  { key: 'apple', label: '🍎 iPhone / iOS' },
  { key: 'compass', label: '🧭 Pusula / Analiz' },
  { key: 'chat', label: '🏛️ Sohbet / Meclis' },
  { key: 'radio', label: '⚡ Frekans / Schumann' },
  { key: 'book', label: '📖 Kitap / Dersler' },
  { key: 'mail', label: '✉️ İletişim / E-Posta' },
  { key: 'sparkles', label: '✨ Özel / Kampanya' },
];

export default function AdminBioLinksPage() {
  const [links, setLinks] = useState<BioLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [url, setUrl] = useState('');
  const [iconKey, setIconKey] = useState('globe');
  const [badgeText, setBadgeText] = useState('');
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(100);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bio-links', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.links)) {
        setLinks(data.links);
      }
    } catch {
      setError('Bağlantılar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLinks();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setUrl('');
    setIconKey('globe');
    setBadgeText('');
    setIsHighlighted(false);
    setIsActive(true);
    const maxSort = links.reduce((acc, item) => Math.max(acc, item.sortOrder), 0);
    setSortOrder(maxSort + 10);
  };

  const handleEditClick = (item: BioLinkItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSubtitle(item.subtitle || '');
    setUrl(item.url);
    setIconKey(item.iconKey || 'globe');
    setBadgeText(item.badgeText || '');
    setIsHighlighted(item.isHighlighted);
    setIsActive(item.isActive);
    setSortOrder(item.sortOrder);
    setError('');
    setSuccessMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title.trim() || !url.trim()) {
      setError('Lütfen Link Başlığı ve Hedef URL alanlarını doldurun.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/bio-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId || `link_${Date.now()}`,
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          url: url.trim(),
          iconKey,
          badgeText: badgeText.trim() || null,
          isHighlighted,
          isActive,
          sortOrder: Number(sortOrder) || 100,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLinks(data.links || []);
        setSuccessMsg(editingId ? 'Link güncellendi!' : 'Yeni link başarıyla eklendi!');
        resetForm();
      } else {
        setError(data.error || 'Kaydedilemedi.');
      }
    } catch {
      setError('Bağlantı hatası oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: BioLinkItem) => {
    try {
      const res = await fetch('/api/admin/bio-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          isActive: !item.isActive,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLinks(data.links || []);
      }
    } catch {
      // ignore
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const current = links[index];
    const neighbor = links[targetIndex];
    const currentOrder = current.sortOrder;
    const neighborOrder = neighbor.sortOrder === currentOrder ? currentOrder + (direction === 'up' ? -5 : 5) : neighbor.sortOrder;

    try {
      await fetch('/api/admin/bio-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...current, sortOrder: neighborOrder }),
      });
      const res = await fetch('/api/admin/bio-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...neighbor, sortOrder: currentOrder }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLinks(data.links || []);
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!window.confirm(`"${itemTitle}" bağlantısını silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/bio-links?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLinks(data.links || []);
        if (editingId === id) resetForm();
      }
    } catch {
      setError('Silme işlemi başarısız.');
    }
  };

  return (
    <div className="text-white space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-1">
            <Link2 size={14} />
            <span>Instagram &amp; Sosyal Medya Biyografi Merkezi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Biyografi Linkleri (Linktree Yönetimi)
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            <code className="text-[#FDE68A]">7layers.tr/links</code> ve <code className="text-[#FDE68A]">7layers.tr/indir</code> sayfasında görünen butonları buradan ekleyebilir, sıralayabilir veya düzenleyebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/links"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs hover:bg-[#FDE68A] transition-colors shadow-lg"
          >
            <ExternalLink size={14} />
            <span>Canlı Sayfayı Gör (/links)</span>
          </Link>
        </div>
      </div>

      {/* Add / Edit Link Form Card */}
      <div className="bg-white/[0.03] border border-[#D4AF37]/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-[#FDE68A] flex items-center gap-2">
            {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
            <span>{editingId ? 'Seçili Linki Düzenle' : 'Yeni Link / Web Sitesi Ekle'}</span>
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-white/60 hover:text-white flex items-center gap-1"
            >
              <X size={14} /> Yeni Eklemeye Dön
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/35 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check size={15} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-white/75 mb-1.5">
              LİNK BAŞLIĞI *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Spori.tr Web Sitesi veya Google Play'den İndir"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/75 mb-1.5">
              HEDEF URL (LİNK ADRESİ) *
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Örn: https://www.spori.tr veya /analysis"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/75 mb-1.5">
              ALT AÇIKLAMA (OPSİYONEL)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Örn: Kişisel spor ve yaşam platformu"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/75 mb-1.5">
              ÜST ETİKET / ROZET (OPSİYONEL)
            </label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="Örn: YENİ PLATFORM veya ANDROID UYGULAMA"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/75 mb-1.5">
              İKON SEÇİMİ
            </label>
            <select
              value={iconKey}
              onChange={(e) => setIconKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-white/15 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/75 mb-1.5">
              SIRALAMA NUMARASI (KÜÇÜK OLAN ÜSTTE ÇIKAR)
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-6">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-white/85 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHighlighted}
                  onChange={(e) => setIsHighlighted(e.target.checked)}
                  className="rounded border-white/20 accent-[#D4AF37] w-4 h-4"
                />
                <span>✨ Altın Vurgulu Ana Buton Olarak Göster</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-bold text-white/85 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-white/20 accent-[#D4AF37] w-4 h-4"
                />
                <span>Yayında (Aktif)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-extrabold text-xs sm:text-sm hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              <span>{editingId ? 'Değişiklikleri Kaydet' : '+ Listeye Link Ekle'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Links List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white/80">
            Mevcut Biyografi Bağlantıları ({links.length})
          </h3>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 size={28} className="animate-spin text-[#D4AF37]" />
          </div>
        ) : links.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-sm text-white/50">
            Henüz kayıtlı bağlantı yok.
          </div>
        ) : (
          <div className="space-y-2.5">
            {links.map((item, idx) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  !item.isActive
                    ? 'bg-white/[0.01] border-white/5 opacity-55'
                    : item.isHighlighted
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37]/45'
                    : 'bg-white/[0.03] border-white/10'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#FDE68A]">
                      #{item.sortOrder}
                    </span>
                    {item.badgeText && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#FDE68A]">
                        {item.badgeText}
                      </span>
                    )}
                    {item.isHighlighted && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500 text-black">
                        ★ Altın Buton
                      </span>
                    )}
                    {!item.isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                        Gizli (Pasif)
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white mt-1 truncate">
                    {item.title}
                  </h4>
                  {item.subtitle && (
                    <p className="text-xs text-white/65 truncate">{item.subtitle}</p>
                  )}
                  <p className="text-[11px] text-[#D4AF37] font-mono truncate mt-0.5">
                    {item.url}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30"
                    title="Yukarı Taşı"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(idx, 'down')}
                    disabled={idx === links.length - 1}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30"
                    title="Aşağı Taşı"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
                    title={item.isActive ? 'Gizle (Pasif Yap)' : 'Yayına Al (Aktif Yap)'}
                  >
                    {item.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditClick(item)}
                    className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-[#FDE68A] text-xs font-bold flex items-center gap-1"
                  >
                    <Edit3 size={13} />
                    <span>Düzenle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300"
                    title="Sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
