/**
 * Utility functions for blog posts
 */

export const getCleanExcerpt = (content: string, maxLength = 180): string => {
  if (!content) return '';
  const clean = content
    .replace(/```[\s\S]*?```/g, '') // kod bloklarını temizle
    .replace(/^#{1,6}\s+.*$/gm, '') // satır başı markdown başlıklarını temizle
    .replace(/#{1,6}\s+/g, '') // satır içi kalan # sembollerini temizle
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // linkleri metne çevir: [metin](url) -> metin
    .replace(/^>\s+/gm, '') // alıntı işaretlerini temizle
    .replace(/^[-*+]\s+/gm, '') // madde işaretlerini temizle
    .replace(/^[0-9]+\.\s+/gm, '') // numaralı liste işaretlerini temizle
    .replace(/[-*_~]{2,}/g, '') // yatay çizgileri temizle
    .replace(/[*_`~]/g, '') // kalın, italik, kod işaretlerini temizle
    .replace(/\s+/g, ' ') // fazla boşlukları teke indir
    .trim();
  return clean.length > maxLength ? clean.slice(0, maxLength) + '...' : clean;
};
