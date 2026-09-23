"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Send, 
  Sparkles, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ChevronDown, 
  ArrowRight,
  Loader2
} from 'lucide-react';

function InstagramIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YouTubeIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

const CATEGORIES = [
  { id: 'report_support', label: 'Analiz Raporu & Sipariş Desteği' },
  { id: 'birth_correction', label: 'Doğum Saati / Bilgi Düzeltme' },
  { id: 'tech_account', label: 'Üyelik & Teknik Destek' },
  { id: 'collaboration', label: 'İş Birliği & Kurumsal' },
  { id: 'feedback', label: 'Öneri & Geri Bildirim' },
  { id: 'other', label: 'Diğer Konular' },
];

const FAQS = [
  {
    q: 'Satın aldığım analiz raporu e-postama ne zaman ulaşır?',
    a: 'Ödemeniz onaylandığı anda yapay zekâ ve ezoterik hesaplama motorumuz raporunuzu hazırlar. Raporunuz genellikle 1-3 dakika içerisinde hem ekranda indirilebilir hale gelir hem de e-posta adresinize PDF olarak gönderilir.'
  },
  {
    q: 'Doğum saatimi veya bilgilerimi yanlış girdim, ne yapmalıyım?',
    a: 'Sipariş numaranız ve doğru doğum bilgilerinizle birlikte iletişim formundan veya info@7layers.tr adresinden bize ulaştığınızda, teknik ekibimiz raporunuzu ücretsiz olarak güncelleyip e-postanıza yeniden iletir.'
  },
  {
    q: 'Misafir olarak ödeme yaptım, raporuma daha sonra nasıl ulaşabilirim?',
    a: 'Siparişiniz sırasında girdiğiniz e-posta adresine tek kullanımlık güvenli indirme bağlantısı iletilir. Ayrıca aynı e-posta ile sitemize ücretsiz hesap açtığınızda geçmiş tüm raporlarınız otomatik olarak profilinize bağlanır.'
  },
  {
    q: 'Raporumu e-posta kutumda göremiyorum, ne yapmalıyım?',
    a: 'Lütfen öncelikle Spam / İstenmeyen veya Tanıtımlar klasörlerinizi kontrol ediniz. Yine de bulamadıysanız aşağıdaki formdan bize sipariş e-postanızı iletmeniz yeterlidir; ekibimiz hemen manuel gönderim sağlar.'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subjectCategory: CATEGORIES[0].label,
    orderCode: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const copyEmail = () => {
    navigator.clipboard.writeText('info@7layers.tr');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Lütfen zorunlu alanları (İsim, E-posta, Mesaj) doldurunuz.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          subjectCategory: CATEGORIES[0].label,
          orderCode: '',
          message: ''
        });
      } else {
        setError(data.error || 'Mesaj gönderilemedi. Lütfen doğrudan e-posta ile deneyiniz.');
      }
    } catch {
      setError('Bağlantı hatası oluştu. Lütfen doğrudan info@7layers.tr adresine yazınız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 relative overflow-x-hidden text-white bg-mystic-dark">
      {/* Arka Plan Işık Efektleri */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto">
        {/* Üst Başlık */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium mb-4 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <Sparkles size={14} />
            <span>Kozmik Rehberlik & Müşteri Destek Kapısı</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-white to-[#D4AF37] mb-4">
            Bizimle İletişime Geçin
          </h1>
          <p className="text-sm sm:text-base text-mystic-text-muted max-w-2xl mx-auto leading-relaxed">
            Kadim ilimler yolculuğunuz, analiz raporlarınız, siparişleriniz veya aklınıza takılan her türlü soru için destek ekibimiz yanınızda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Sol Kolon: Doğrudan İletişim Kanalları ve SSS */}
          <div className="lg:col-span-5 space-y-6">
            {/* E-Posta Destek Kartı */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-[#D4AF37]/40 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] shrink-0">
                  <Mail size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs uppercase tracking-wider text-white/50 block mb-1">Resmi Destek E-Postası</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a 
                      href="mailto:info@7layers.tr" 
                      className="text-base sm:text-lg font-semibold text-white hover:text-[#D4AF37] transition-colors"
                    >
                      info@7layers.tr
                    </a>
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all text-xs flex items-center gap-1"
                      title="Adresi Kopyala"
                    >
                      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                      <span className="text-[11px]">{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-mystic-text-muted mt-2">
                    Analiz siparişleri, teknik konular ve kurumsal talepler için 7/24 yazabilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            {/* Yanıt Garantisi & Güvenlik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Hızlı Yanıt</h4>
                  <p className="text-[11px] text-white/50">En geç 24 saat içinde dönüş</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Gizlilik Garantisi</h4>
                  <p className="text-[11px] text-white/50">Verileriniz güvende ve gizli</p>
                </div>
              </div>
            </div>

            {/* Sosyal Medya, YouTube & WhatsApp Kanalları */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles size={15} className="text-[#D4AF37]" />
                    <span>Resmi Kanallarımız & Topluluk</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#D4AF37]">@7layers.tr</span>
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Kozmik gökyüzü transitleri, rehberlik videoları ve analiz duyurularımızı resmi hesaplarımızdan takip edebilir, sorularınız için iletişim formumuz veya e-posta üzerinden bize 7/24 ulaşabilirsiniz.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/7layers.tr?stkn=MXRnbnl0Nnp0dmxoNQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4AF37]/50 text-xs font-medium text-white transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                      <InstagramIcon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Instagram</div>
                      <div className="text-[10px] text-white/50">@7layers.tr</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@enissahidekesik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4AF37]/50 text-xs font-medium text-white transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                      <YouTubeIcon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">YouTube Kanalı</div>
                      <div className="text-[10px] text-white/50">Enis Şahide KESİK | 7Layers</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                </a>

                {/* Resmi E-Posta Masası */}
                <a
                  href="mailto:destek@7layers.com"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4AF37]/50 text-xs font-medium text-white transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Mail size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Resmi E-Posta Masası</div>
                      <div className="text-[10px] text-white/50">destek@7layers.com</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Mini Sıkça Sorulan Sorular (Hızlı Çözümler) */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-[#D4AF37] mb-3 flex items-center gap-2">
                <HelpCircle size={16} />
                <span>Hızlı Çözüm & Sıkça Sorulanlar</span>
              </h3>
              <div className="space-y-2">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="border border-white/5 rounded-xl overflow-hidden bg-black/20">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-3 text-left text-xs font-medium text-white/90 hover:text-[#D4AF37] transition-colors flex items-center justify-between gap-2"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={14}
                        className={`text-white/40 shrink-0 transition-transform duration-200 ${
                          openFaq === idx ? 'rotate-180 text-[#D4AF37]' : ''
                        }`}
                      />
                    </button>
                    {openFaq === idx && (
                      <div className="px-3 pb-3 text-xs text-white/60 leading-relaxed border-t border-white/5 pt-2">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Mistik İletişim Formu */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl relative">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Bize Mesaj Gönderin</h2>
                  <p className="text-xs text-white/50">Formu doldurarak sorunuzu veya destek talebinizi anında iletin.</p>
                </div>
              </div>

              {success ? (
                <div className="p-8 text-center rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/30 my-4 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Mesajınız Bize Ulaştı!</h3>
                  <p className="text-sm text-mystic-text-muted max-w-md mx-auto leading-relaxed">
                    İletişim talebiniz destek ekibimize iletilmiştir. Belirttiğiniz e-posta adresi üzerinden en geç 24 saat içinde sizinle irtibata geçeceğiz.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all border border-white/10"
                  >
                    Yeni Bir Mesaj Gönder
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Adınız Soyadınız <span className="text-[#D4AF37]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Örn: Ayşe Yılmaz"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        E-Posta Adresiniz <span className="text-[#D4AF37]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="adiniz@eposta.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Konu / Departman <span className="text-[#D4AF37]">*</span>
                      </label>
                      <select
                        value={formData.subjectCategory}
                        onChange={(e) => setFormData({ ...formData, subjectCategory: e.target.value })}
                        className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.label} className="bg-[#131926] text-white">
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Sipariş / Referans Kodu <span className="text-white/40">(Varsa)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.orderCode}
                        onChange={(e) => setFormData({ ...formData, orderCode: e.target.value })}
                        placeholder="Örn: ORD-12345"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Mesajınız <span className="text-[#D4AF37]">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Sorunuzu, analiz sipariş detayınızı veya destek talebinizi buraya detaylı olarak yazabilirsiniz..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors resize-y min-h-[120px]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-black" />
                        <span>İletiliyor...</span>
                      </>
                    ) : (
                      <>
                        <span>Mesajı Gönder</span>
                        <Send size={16} className="text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-white/40 pt-2">
                    Formu doldurarak verilerinizin <Link href="/privacy" className="text-[#D4AF37] hover:underline">Gizlilik ve KVKK Politikası</Link> çerçevesinde işlenmesini kabul etmiş olursunuz.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
