"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  Sparkles,
  Reply,
  Trash2,
  UserCheck,
  Edit3,
  X,
  Shield,
  Lock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ChatRoom {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  colorHex: string;
  sortOrder: number;
  messageCount: number;
}

interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  senderName: string;
  senderRole: string;
  senderRoleTitle: string;
  content: string;
  replyToId: string | null;
  replyPreviewName: string | null;
  replyPreviewText: string | null;
  createdAt: string;
  isOwn: boolean;
}

interface MyChatProfile {
  userId: string;
  nickname: string | null;
  maskedDefaultName: string;
  effectiveDisplayName: string;
  role: string;
  roleTitle: string;
  isAdmin: boolean;
}

const ROLE_BADGE_CLASSES: Record<string, string> = {
  free: 'bg-white/5 border-white/15 text-gray-300',
  apprentice: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
  journeyman: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
  master: 'bg-purple-500/20 border-purple-400/50 text-purple-200',
  admin: 'bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border-amber-400/60 text-amber-200 shadow-[0_0_10px_rgba(212,175,55,0.25)]',
};

export default function EsotericCouncilChatPage() {
  const { user, role } = useAuth();
  const isLoggedIn = !!user;
  const isAdmin = role === 'admin';

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>('genel-meydan');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [myProfile, setMyProfile] = useState<MyChatProfile | null>(null);

  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  const [inputText, setInputText] = useState<string>('');
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Nickname Modal state
  const [showNicknameModal, setShowNicknameModal] = useState<boolean>(false);
  const [nicknameInput, setNicknameInput] = useState<string>('');
  const [isSavingNickname, setIsSavingNickname] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef<number>(0);

  const scrollToBottom = (smooth = true) => {
    if (!chatContainerRef.current) return;
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/rooms', { credentials: 'include' });
      const data = await res.json();
      if (data?.success && Array.isArray(data.rooms)) {
        setRooms(data.rooms);
        if (data.myProfile) {
          setMyProfile(data.myProfile);
          setNicknameInput(data.myProfile.nickname || '');
        }
      }
    } catch (err) {
      console.error('Odalar yüklenemedi:', err);
    } finally {
      setIsLoadingRooms(false);
    }
  }, []);

  const fetchMessages = useCallback(
    async (roomId: string, silent = false) => {
      if (!silent) setIsLoadingMessages(true);
      try {
        const res = await fetch(`/api/chat/messages?roomId=${encodeURIComponent(roomId)}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data?.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
          if (!silent || data.messages.length > prevMsgCountRef.current) {
            setTimeout(() => scrollToBottom(silent), 60);
          }
          prevMsgCountRef.current = data.messages.length;
        }
      } catch (err) {
        console.error('Mesajlar yüklenemedi:', err);
      } finally {
        if (!silent) setIsLoadingMessages(false);
      }
    },
    []
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setActiveRoomId(roomParam);
      }
    }
    fetchRooms();
  }, [fetchRooms, isLoggedIn]);

  useEffect(() => {
    prevMsgCountRef.current = 0;
    setReplyTarget(null);
    fetchMessages(activeRoomId, false);

    if (isLoggedIn && activeRoomId) {
      fetch('/api/chat/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'mark_read', roomId: activeRoomId }),
      }).catch(() => {});
    }

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMessages(activeRoomId, true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeRoomId, fetchMessages, isLoggedIn]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isLoggedIn || isSending) return;

    const trimmed = inputText.trim();
    if (!trimmed) return;

    setFeedbackError(null);
    setIsSending(true);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          roomId: activeRoomId,
          content: trimmed,
          replyToId: replyTarget?.id || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setFeedbackError(data?.error || 'Mesaj gönderilemedi.');
        return;
      }

      setInputText('');
      setReplyTarget(null);
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        prevMsgCountRef.current += 1;
        setRooms((prev) =>
          prev.map((r) =>
            r.id === activeRoomId ? { ...r, messageCount: (r.messageCount || 0) + 1 } : r
          )
        );
        setTimeout(() => scrollToBottom(true), 50);
      }
    } catch {
      setFeedbackError('Bağlantı hatası oluştu.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?id=${encodeURIComponent(msgId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
        setRooms((prev) =>
          prev.map((r) =>
            r.id === activeRoomId ? { ...r, messageCount: Math.max(0, (r.messageCount || 1) - 1) } : r
          )
        );
      }
    } catch (err) {
      console.error('Mesaj silinemedi:', err);
    }
  };

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingNickname) return;
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setIsSavingNickname(true);

    try {
      const res = await fetch('/api/chat/nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nickname: nicknameInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setFeedbackError(data?.error || 'Rumuz kaydedilemedi.');
        return;
      }

      setMyProfile((prev) =>
        prev
          ? {
              ...prev,
              nickname: data.nickname,
              effectiveDisplayName: data.effectiveDisplayName,
            }
          : prev
      );
      setFeedbackSuccess(`Sohbet görünüm adınız "${data.effectiveDisplayName}" olarak güncellendi.`);
      setShowNicknameModal(false);
      fetchMessages(activeRoomId, true);
    } catch {
      setFeedbackError('Rumuz güncellenirken bağlantı hatası oluştu.');
    } finally {
      setIsSavingNickname(false);
    }
  };

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
      const timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      if (isToday) return timeStr;
      return `${d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })} ${timeStr}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col">
      {/* Page Title & Identity Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mystic-primary/10 border border-mystic-primary/30 text-mystic-primary text-xs font-bold tracking-wider uppercase mb-2">
            <Sparkles size={13} />
            <span>7Layers Kadim Meclis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ezoterik Sohbet Odaları
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Kadim ilimler, sembolizm, astroloji ve ruhsal uyanış yolculuğunda diğer üyelerle fikir alışverişinde bulunun.
          </p>
        </div>

        {/* User Chat Identity & Nickname Button */}
        {isLoggedIn && myProfile && (
          <div className="flex items-center gap-3 bg-black/50 border border-amber-500/30 rounded-2xl px-4 py-2.5 self-start md:self-auto">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <UserCheck size={18} />
            </div>
            <div className="text-left">
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <span>Meclis Kimliğiniz</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                    ROLE_BADGE_CLASSES[myProfile.role] || ROLE_BADGE_CLASSES.free
                  }`}
                >
                  {myProfile.roleTitle}
                </span>
              </div>
              <div className="text-sm font-bold text-white">{myProfile.effectiveDisplayName}</div>
            </div>
            <button
              onClick={() => {
                setNicknameInput(myProfile.nickname || '');
                setFeedbackError(null);
                setShowNicknameModal(true);
              }}
              className="ml-2 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Rumuz</span>
            </button>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedbackSuccess && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{feedbackSuccess}</span>
          </div>
          <button onClick={() => setFeedbackSuccess(null)} className="text-emerald-300 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Split Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-grow">
        {/* Left Sidebar: 8 Esoteric Rooms */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400/90 px-2 mb-1 flex items-center justify-between">
            <span>Meclis Odaları ({rooms.length})</span>
            <button
              onClick={() => {
                fetchRooms();
                fetchMessages(activeRoomId, false);
              }}
              className="text-gray-400 hover:text-amber-300 transition-colors cursor-pointer"
              title="Yenile"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          {/* Horizontal scroll on mobile, vertical stack on desktop */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {isLoadingRooms
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-16 min-w-[220px] lg:min-w-0 rounded-2xl bg-white/5 animate-pulse border border-white/10"
                  />
                ))
              : rooms.map((room) => {
                  const isActive = room.id === activeRoomId;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`min-w-[235px] lg:min-w-0 text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-amber-400/60 shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                          : 'bg-black/45 hover:bg-white/5 border-white/10'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                        style={{
                          backgroundColor: `${room.colorHex}18`,
                          borderColor: `${room.colorHex}55`,
                        }}
                      >
                        {room.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3
                            className={`text-sm font-bold truncate ${
                              isActive ? 'text-amber-300' : 'text-white'
                            }`}
                          >
                            {room.title}
                          </h3>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 shrink-0">
                            {room.messageCount || 0}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{room.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
          </div>
        </div>

        {/* Right Panel: Active Chat Room */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col bg-black/60 backdrop-blur-xl border border-amber-500/25 rounded-3xl overflow-hidden h-[680px] shadow-2xl">
          {/* Active Room Header */}
          {activeRoom && (
            <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-black/80 via-amber-950/20 to-black/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl border shrink-0"
                  style={{
                    backgroundColor: `${activeRoom.colorHex}20`,
                    borderColor: `${activeRoom.colorHex}60`,
                  }}
                >
                  {activeRoom.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
                      {activeRoom.title}
                    </h2>
                    <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                      ● Canlı Oda
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{activeRoom.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth"
          >
            {isLoadingMessages ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                <span className="text-xs">Meclis kayıtları yükleniyor...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto px-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl mb-3">
                  {activeRoom?.icon || '💬'}
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  {activeRoom?.title} Odasında İlk Sözü Siz Söyleyin
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {activeRoom?.description} Bu odada henüz mesaj paylaşılmamış; düşüncelerinizi veya sorunuzu yazarak sohbeti başlatabilirsiniz.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const badgeStyle = ROLE_BADGE_CLASSES[msg.senderRole] || ROLE_BADGE_CLASSES.free;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-4 py-3 border transition-all ${
                        msg.isOwn
                          ? 'bg-gradient-to-br from-amber-500/20 via-amber-900/20 to-black/80 border-amber-400/45 text-white rounded-br-xs'
                          : 'bg-white/[0.04] border-white/10 text-gray-100 rounded-bl-xs'
                      }`}
                    >
                      {/* Sender Header */}
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-extrabold ${
                              msg.senderRole === 'admin'
                                ? 'text-amber-300'
                                : msg.isOwn
                                ? 'text-amber-200'
                                : 'text-sky-300'
                            }`}
                          >
                            {msg.senderName}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${badgeStyle}`}
                          >
                            {msg.senderRole === 'admin' && (
                              <Shield size={9} className="inline mr-1 -mt-0.5" />
                            )}
                            {msg.senderRoleTitle}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 shrink-0">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>

                      {/* Reply Quote Block if present */}
                      {msg.replyPreviewText && (
                        <div className="mb-2 pl-2.5 py-1.5 pr-2 rounded-lg bg-black/40 border-l-2 border-amber-400/70 text-[11px] text-gray-300">
                          <div className="font-bold text-amber-300/90 text-[10px]">
                            @{msg.replyPreviewName || 'Yolcu'}
                          </div>
                          <div className="line-clamp-2 italic text-gray-400">
                            {msg.replyPreviewText}
                          </div>
                        </div>
                      )}

                      {/* Message Content */}
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>

                      {/* Action Footer (Reply / Delete) */}
                      <div className="flex items-center justify-end gap-3 mt-2 pt-1 border-t border-white/5">
                        {isLoggedIn && (
                          <button
                            onClick={() => setReplyTarget(msg)}
                            className="text-[10px] text-gray-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Reply size={11} />
                            <span>Yanıtla</span>
                          </button>
                        )}
                        {(msg.isOwn || isAdmin) && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-[10px] text-rose-400/80 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Mesajı Sil"
                          >
                            <Trash2 size={11} />
                            <span>Sil</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Area */}
          <div className="p-3.5 sm:p-4 border-t border-white/10 bg-black/80">
            {feedbackError && (
              <div className="mb-2.5 px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{feedbackError}</span>
                </div>
                <button onClick={() => setFeedbackError(null)} className="text-rose-300 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}

            {replyTarget && (
              <div className="mb-2.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <span className="font-bold text-amber-300">
                    @{replyTarget.senderName}
                  </span>{' '}
                  <span className="text-gray-400">mesajına yanıt veriliyor: </span>
                  <span className="text-gray-300 italic">{replyTarget.content.slice(0, 60)}</span>
                </div>
                <button
                  onClick={() => setReplyTarget(null)}
                  className="text-gray-400 hover:text-white shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {isLoggedIn ? (
              <form onSubmit={handleSendMessage} className="flex items-end gap-2.5">
                <div className="flex-1 relative">
                  <textarea
                    rows={2}
                    maxLength={500}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`${activeRoom?.title || 'Meclis'} odasına düşüncenizi yazın...`}
                    className="w-full rounded-2xl bg-white/[0.05] border border-white/15 focus:border-amber-400/60 focus:outline-none px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 resize-none"
                  />
                  <span className="absolute right-3 bottom-2 text-[10px] text-gray-500">
                    {inputText.length}/500
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="h-11 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-40 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                  <Send size={15} />
                  <span className="hidden sm:inline">{isSending ? 'Gönderiliyor...' : 'Gönder'}</span>
                </button>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-amber-500/25">
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  <Lock size={15} className="text-amber-400 shrink-0" />
                  <span>
                    Sohbet odalarını okuyabilirsiniz; mesaj yazmak ve tartışmalara katılmak için üye girişi yapın.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-all"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nickname (Rumuz) Modal */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0E17] border border-amber-500/40 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <Edit3 size={17} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Meclis Rumuzu Belirle</h3>
                  <p className="text-[11px] text-gray-400">
                    Gerçek isminiz yerine görünecek özel mahlasınız
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNicknameModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNickname} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Rumuz / Mahlas (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  maxLength={22}
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder={`Boş bırakırsanız: ${myProfile?.maskedDefaultName || 'Yolcu'}`}
                  className="w-full rounded-xl bg-white/5 border border-white/15 focus:border-amber-400 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                  • Gizliliğiniz için e-posta adresiniz ve tam soyadınız sohbette asla paylaşılmaz.
                  <br />• Rumuz girmezseniz adınız otomatik olarak{' '}
                  <strong className="text-amber-300">{myProfile?.maskedDefaultName}</strong> şeklinde görünür.
                </p>
              </div>

              {feedbackError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs">
                  {feedbackError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNicknameModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSavingNickname}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs cursor-pointer"
                >
                  {isSavingNickname ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

