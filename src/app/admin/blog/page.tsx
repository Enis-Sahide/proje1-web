"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, Edit, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const CATEGORIES = [
  'Astroloji',
  'Nefes',
  'Ritüeller',
  'Kişisel Gelişim',
  'Ruhsal Gelişim',
  'Çakra Dengeleme',
  'Ezoterik',
];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  imageUrl?: string | null;
  published: boolean;
  views?: number | null;
  createdAt: string;
}

const EMPTY_FORM = {
  title: '',
  slug: '',
  content: '',
  category: 'Astroloji',
  imageUrl: '',
  published: true,
};

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBlogs = useCallback(() => {
    return apiFetch<BlogPost[]>('/api/admin/blog')
      .then((data) => {
        setBlogs(data || []);
        setError(null);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Yazılar yüklenirken hata oluştu.'),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
      } else {
        alert(data.error || 'Görsel yüklenemedi.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Görsel yüklenirken bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (blog: BlogPost) => {
    setEditing(blog);
    setForm({
      title: blog.title || '',
      slug: blog.slug || '',
      content: blog.content || '',
      category: blog.category || 'Astroloji',
      imageUrl: blog.imageUrl || '',
      published: blog.published !== undefined ? blog.published : true,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await apiFetch<BlogPost>(`/api/admin/blog/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        setBlogs((prev) => prev.map((b) => (b.id === editing.id ? updated : b)));
      } else {
        const created = await apiFetch<BlogPost>('/api/admin/blog', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setBlogs((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      alert('Yazı kaydedilirken hata oluştu: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`"${title}" isimli blog yazısını silmek istediğinize emin misiniz?`)) return;
    try {
      await apiFetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err: unknown) {
      alert('Yazı silinirken hata oluştu: ' + (err instanceof Error ? err.message : ''));
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Blog Yönetimi"
        description={`Yazı ekleme, düzenleme ve yayınlama — ${blogs.length} yazı`}
        icon={BookOpen}
        refreshing={loading}
        onRefresh={() => {
          setLoading(true);
          fetchBlogs();
        }}
        actions={
          <button
            onClick={openCreate}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-mystic-primary px-5 py-2 text-sm font-bold text-black shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all hover:brightness-110"
          >
            <Plus size={16} /> Yeni Yazı
          </button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/40 shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-mystic-text-muted">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-mystic-primary/10" />
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-r-mystic-accent border-t-mystic-primary" />
            </div>
            <p className="text-xs">Blog yazıları yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-400">{error}</div>
        ) : blogs.length === 0 ? (
          <div className="py-20 text-center text-sm text-mystic-text-muted">
            Henüz eklenmiş bir blog yazısı bulunmamaktadır.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-white/5 bg-white/5 text-xs uppercase tracking-wider text-mystic-text-muted">
                <tr>
                  <th className="p-4 font-semibold">Görsel / Başlık</th>
                  <th className="p-4 font-semibold">Kategori</th>
                  <th className="p-4 font-semibold">Slug (URL)</th>
                  <th className="p-4 font-semibold">Durum</th>
                  <th className="p-4 font-semibold">Erişim</th>
                  <th className="p-4 text-right font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-white">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="transition-colors hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        {blog.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={blog.imageUrl}
                            alt=""
                            className="h-10 w-14 rounded-lg border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[10px] text-mystic-text-muted">
                            Görsel Yok
                          </div>
                        )}
                        <div>
                          <span className="line-clamp-1 block max-w-[250px] text-sm font-bold">
                            {blog.title}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-mystic-text-muted">
                            Oluşturulma: {new Date(blog.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white">
                        {blog.category}
                      </span>
                    </td>
                    <td className="max-w-[120px] truncate p-4 font-mono text-xs text-mystic-text-muted">
                      {blog.slug}
                    </td>
                    <td className="p-4">
                      {blog.published ? (
                        <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-400">
                          Yayınlandı
                        </span>
                      ) : (
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-500">
                          Taslak
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-semibold text-mystic-primary">
                      {blog.views || 0} Görüntülenme
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(blog)}
                          className="cursor-pointer rounded-lg border border-blue-500/20 bg-white/5 p-2 text-blue-400 transition-colors hover:bg-blue-400/10"
                          title="Düzenle"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id, blog.title)}
                          className="cursor-pointer rounded-lg border border-red-500/20 bg-white/5 p-2 text-red-400 transition-colors hover:bg-red-400/10"
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Oluştur / Düzenle penceresi */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md duration-300 fade-in">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-mystic-primary/30 bg-mystic-surface p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <h3 className="mb-6 flex items-center gap-2 border-b border-white/5 pb-4 text-xl font-bold text-white">
              <BookOpen size={20} className="text-mystic-primary" />
              {editing ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı Ekle'}
            </h3>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-mystic-text">
                  Yazı Başlığı <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title
                      .toLowerCase()
                      .replace(/[^a-z0-9\s-]/g, '')
                      .replace(/\s+/g, '-');
                    setForm({ ...form, title, slug });
                  }}
                  placeholder="Örn: Diyafram Nefesinin Mucizevi Faydaları"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-colors focus:border-mystic-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-mystic-text">
                    URL Yolu (Slug) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="diyafram-nefesi-faydalari"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white transition-colors focus:border-mystic-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-mystic-text">
                    Kategori <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-colors focus:border-mystic-primary focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-mystic-surface">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-mystic-text">
                  Destekleyici Görsel URL&apos;si veya Yükleme
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://example.com/gorsel.jpg veya /gorsel.jpg"
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-colors focus:border-mystic-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-xs font-bold text-mystic-text transition-all hover:border-[#D4AF37] hover:bg-white/10 disabled:opacity-50"
                  >
                    {uploading ? 'Yükleniyor...' : 'Görsel Seç'}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-mystic-text">
                  İçerik <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Blog içeriğini buraya girin (yeni paragraf için iki kez enter)..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm leading-relaxed text-white transition-colors focus:border-mystic-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published_checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="h-4 w-4 rounded border-white/10 bg-black/40 accent-[#D4AF37]"
                />
                <label
                  htmlFor="published_checkbox"
                  className="cursor-pointer select-none text-sm font-semibold text-white"
                >
                  Bu yazıyı hemen yayınla (ziyaretçilere göster)
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="cursor-pointer rounded-xl bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer rounded-xl bg-mystic-primary px-5 py-2.5 text-sm font-bold text-black shadow-[0_0_10px_rgba(212,175,55,0.2)] transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? 'Kaydediliyor...' : 'Yazıyı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
