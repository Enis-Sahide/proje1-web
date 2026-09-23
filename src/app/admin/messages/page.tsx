"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  User, 
  FileText, 
  Sparkles,
  Inbox,
  Check,
  Copy,
  Loader2
} from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subjectCategory: string;
  orderCode: string | null;
  message: string;
  status: 'unread' | 'read' | 'replied';
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  unread: number;
  read: number;
  replied: number;
}

const TEMPLATES = [
  {
    title: 'Rapor Güncellendi',
    text: 'Merhaba, talebiniz doğrultusunda analiz raporunuz güncellenmiş olup güncel PDF raporunuz e-posta adresinize tekrar iletilmiştir. Kozmik yolculuğunuzda şifa ve farkındalık getirmesini dileriz.',
  },
  {
    title: 'Doğum Saati Düzeltildi',
    text: 'Merhaba, ilettiğiniz doğum saati ve bilgileri sistemimize başarıyla işlenmiş ve ezoterik haritanız yeni parametrelere göre yeniden hesaplanmıştır. Güncel raporunuza profilinizden de erişebilirsiniz.',
  },
  {
    title: 'İnceleniyor / Beklemede',
    text: 'Merhaba, ilettiğiniz konu ve destek talebiniz uzman ekibimiz tarafından incelenmektedir. İnceleme tamamlandığında tarafınıza detaylı bilgi verilecektir.',
  },
  {
    title: 'Ödeme / Sipariş Onayı',
    text: 'Merhaba, siparişiniz ve ödeme kaydınız sistemimizde teyit edilmiştir. Rapor indirme bağlantınız e-posta adresinize yönlendirilmiştir.',
  },
];

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, unread: 0, read: 0, replied: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filtreler
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Yanıt formu durumu
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Mesajları çek
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setActionMsg(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await apiFetch(`/api/admin/messages?${params.toString()}`);
      if (res && res.success) {
        setMessages(res.data || []);
        if (res.stats) setStats(res.stats);
        
        // Eğer seçili mesaj artık listede yoksa ilk mesajı seç
        if (res.data && res.data.length > 0) {
          if (!selectedId || !res.data.some((m: ContactMessage) => m.id === selectedId)) {
            setSelectedId(res.data[0].id);
          }
        } else {
          setSelectedId(null);
        }
      }
    } catch (err: unknown) {
      console.error('Mesajlar yüklenemedi:', err);
      setActionMsg({ kind: 'err', text: 'Mesajlar listelenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchQuery, selectedId]);

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, categoryFilter]);

  const selectedMessage = messages.find((m) => m.id === selectedId) || null;

  // Seçilen mesaj okunduğunda otomatik olarak 'read' durumuna çek
  const handleSelectMessage = async (msg: ContactMessage) => {
    setSelectedId(msg.id);
    setActionMsg(null);
    setReplyText('');

    if (msg.status === 'unread') {
      try {
        await apiFetch(`/api/admin/messages/${msg.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'read' }),
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: 'read' } : m))
        );
        setStats((prev) => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          read: prev.read + 1,
        }));
      } catch (err) {
        console.error('Durum güncellenemedi:', err);
      }
    }
  };

  // Durum manuel değiştirme (Okundu/Okunmadı)
  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'unread' ? 'read' : 'unread';
    try {
      await apiFetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: nextStatus as any } : m))
      );
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  // Mesaj silme
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu destek mesajını kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try {
      await apiFetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      setActionMsg({ kind: 'ok', text: 'Mesaj silindi.' });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedId === id) setSelectedId(null);
      fetchMessages();
    } catch (err) {
      console.error(err);
      setActionMsg({ kind: 'err', text: 'Mesaj silinirken hata oluştu.' });
    }
  };

  // Yanıt gönderme (E-posta ile)
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;

    setSendingReply(true);
    setActionMsg(null);

    try {
      const res = await apiFetch(`/api/admin/messages/${selectedMessage.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ replyText: replyText.trim() }),
      });

      if (res && res.success) {
        setActionMsg({ kind: 'ok', text: res.message || 'Yanıt e-postası başarıyla gönderildi.' });
        const updatedRepliedAt = new Date().toISOString();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === selectedMessage.id
              ? { ...m, status: 'replied', adminReply: replyText.trim(), repliedAt: updatedRepliedAt }
              : m
          )
        );
        setStats((prev) => ({
          ...prev,
          replied: prev.replied + 1,
        }));
        setReplyText('');
      } else {
        setActionMsg({ kind: 'err', text: res?.error || 'Yanıt gönderilemedi.' });
      }
    } catch (err: unknown) {
      console.error(err);
      setActionMsg({ kind: 'err', text: 'E-posta gönderilirken bir hata oluştu.' });
    } finally {
      setSendingReply(false);
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve Üst Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold mb-2">
            <MessageSquare size={13} />
            <span>Müşteri İletişim & Destek Masası</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Gelen Mesajlar & Destek Talepleri
          </h1>
          <p className="text-xs sm:text-sm text-mystic-text-muted mt-1">
            İletişim formundan gelen tüm talepleri inceleyin ve doğrudan kurumsal e-posta ile yanıtlayın.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#D4AF37]' : ''} />
          <span>Yenile</span>
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="text-xs text-white/50 mb-1 flex items-center justify-between">
            <span>Toplam Mesaj</span>
            <Inbox size={14} className="text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <div className="text-xs text-amber-300/80 mb-1 flex items-center justify-between">
            <span>Bekleyen / Okunmamış</span>
            <AlertCircle size={14} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.unread}</div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <div className="text-xs text-blue-300/80 mb-1 flex items-center justify-between">
            <span>Okunmuş</span>
            <Eye size={14} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.read}</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-xs text-emerald-300/80 mb-1 flex items-center justify-between">
            <span>Yanıtlananlar</span>
            <CheckCircle2 size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.replied}</div>
        </div>
      </div>

      {/* Bildirim Mesajı */}
      {actionMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
            actionMsg.kind === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {actionMsg.kind === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Arama ve Filtreleme Barı */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Arama Girişi */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchMessages()}
            placeholder="İsim, e-posta, mesaj veya sipariş kodu ara..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        {/* Durum Sekmeleri */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto shrink-0">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'unread', label: 'Okunmamış' },
            { id: 'read', label: 'Okunmuş' },
            { id: 'replied', label: 'Yanıtlanan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-[#D4AF37] text-black font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* İki Kolonlu Liste & Detay Arayüzü */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Sol Kolon: Mesaj Listesi */}
        <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-2xl p-3 space-y-2.5 overflow-y-auto max-h-[750px]">
          {loading && messages.length === 0 ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin text-[#D4AF37] mx-auto mb-3" size={24} />
              <p className="text-xs text-white/50">Mesajlar yükleniyor...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-20 text-center text-white/40 space-y-2">
              <Inbox size={32} className="mx-auto opacity-40 mb-2" />
              <p className="text-xs font-medium">Kriterlere uygun mesaj bulunamadı.</p>
              <p className="text-[11px] text-white/30">İletişim formundan yeni bir mesaj geldiğinde burada görünecektir.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isSelected = selectedId === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-white/[0.08] border-[#D4AF37]/60 shadow-lg'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-xs text-white truncate">{msg.name}</span>
                      {msg.status === 'unread' && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10px] text-white/40 shrink-0">
                      {new Date(msg.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-[11px] font-medium text-[#D4AF37] mb-1 truncate">
                    {msg.subjectCategory}
                  </div>

                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed mb-2.5">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                    <span className="text-[10px] text-white/40 truncate">{msg.email}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {msg.orderCode && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#D4AF37] font-mono">
                          {msg.orderCode}
                        </span>
                      )}
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                          msg.status === 'replied'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : msg.status === 'read'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {msg.status === 'replied' ? 'Yanıtlandı' : msg.status === 'read' ? 'Okundu' : 'Yeni'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sağ Kolon: Mesaj Detayı & Yanıtlama Paneli */}
        <div className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          {selectedMessage ? (
            <div className="space-y-6">
              {/* Üst Bilgi Barı */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white">{selectedMessage.name}</h2>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                        selectedMessage.status === 'replied'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : selectedMessage.status === 'read'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {selectedMessage.status === 'replied' ? 'Yanıtlandı' : selectedMessage.status === 'read' ? 'Okundu' : 'Bekliyor'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-white/50 mt-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} className="text-[#D4AF37]" />
                      <a href={`mailto:${selectedMessage.email}`} className="hover:text-white transition-colors">
                        {selectedMessage.email}
                      </a>
                      <button
                        onClick={() => handleCopyEmail(selectedMessage.email)}
                        className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white"
                        title="E-posta Kopyala"
                      >
                        {copiedEmail ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                      </button>
                    </div>

                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{new Date(selectedMessage.createdAt).toLocaleString('tr-TR')}</span>
                    </div>

                    {selectedMessage.orderCode && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[#D4AF37] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          Sipariş: {selectedMessage.orderCode}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleStatus(selectedMessage.id, selectedMessage.status)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs flex items-center gap-1.5 transition-all"
                    title={selectedMessage.status === 'unread' ? 'Okundu Olarak İşaretle' : 'Okunmadı Yap'}
                  >
                    {selectedMessage.status === 'unread' ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span className="hidden sm:inline">
                      {selectedMessage.status === 'unread' ? 'Okundu Yap' : 'Okunmadı'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-xs transition-all"
                    title="Mesajı Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Kategori ve Mesaj Metni */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37] block mb-2">
                  Konu: {selectedMessage.subjectCategory}
                </span>
                <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-sm text-white/90 leading-relaxed whitespace-pre-wrap select-text">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Eğer daha önce yanıt verilmişse göster */}
              {selectedMessage.adminReply && (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      <span>Gönderilen Yanıt</span>
                    </span>
                    {selectedMessage.repliedAt && (
                      <span className="text-[10px] text-white/40">
                        {new Date(selectedMessage.repliedAt).toLocaleString('tr-TR')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.adminReply}
                  </p>
                </div>
              )}

              {/* Kullanıcıya E-Posta ile Yanıtlama Alanı */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Send size={13} className="text-[#D4AF37]" />
                    <span>E-Posta ile Müşteriye Yanıt Ver</span>
                  </label>
                  <span className="text-[11px] text-white/40">
                    Alıcı: <strong className="text-white/70">{selectedMessage.email}</strong>
                  </span>
                </div>

                {/* Hızlı Taslak Butonları */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-white/40 flex items-center gap-1">
                    <Sparkles size={11} className="text-[#D4AF37]" />
                    <span>Hızlı Şablonlar:</span>
                  </span>
                  {TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyText(tmpl.text)}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/40 text-[10px] text-white/70 hover:text-white transition-all"
                    >
                      {tmpl.title}
                    </button>
                  ))}
                </div>

                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Kullanıcıya iletilecek yanıt metnini yazın veya yukarıdaki şablonlardan birini seçin..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors resize-y min-h-[90px]"
                />

                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] text-white/40">
                    Yanıt info@7layers.tr kurumsal şablonuyla kullanıcının adresine iletilir.
                  </p>
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black font-bold text-xs shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                  >
                    {sendingReply ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-black" />
                        <span>İletiliyor...</span>
                      </>
                    ) : (
                      <>
                        <span>Yanıtı Gönder</span>
                        <Send size={13} className="text-black" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="py-32 text-center text-white/40 space-y-2 m-auto">
              <MessageSquare size={36} className="mx-auto opacity-30 mb-2" />
              <p className="text-sm font-semibold">Detaylarını görmek için soldan bir mesaj seçin.</p>
              <p className="text-xs text-white/30">Buradan mesajı okuyabilir ve anında e-posta yanıtı gönderebilirsiniz.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
