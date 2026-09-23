import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İletişim & Destek | 7Layers Kadim Bilgiler Okulu',
  description: '7Layers analiz raporu siparişleri, teknik destek, doğum saati düzeltme ve kurumsal iş birlikleri için destek ekibimizle iletişime geçin.',
  keywords: ['7layers iletişim', 'astroloji analiz destek', 'kadim ilimler iletişim', '7layers müşteri hizmetleri', 'doğum haritası destek'],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
