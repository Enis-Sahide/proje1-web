/**
 * Seed sırasında, mobile-only data dosyalarındaki RN tarzı görsel require'larını
 * (require('...webp') gibi) çözmeye çalışmak yerine yol string'ine çevirir.
 * Görseller Faz 6'da web/public'e taşınacağı için burada sadece referans saklanır.
 * seed.ts içinde DİĞER tüm import'lardan ÖNCE import edilmelidir.
 */
import Module from 'node:module';

const IMAGE_RE = /\.(webp|png|jpe?g|svg|gif|mp3|wav|m4a|mp4)$/i;
const m = Module as any;

const origResolve = m._resolveFilename;
m._resolveFilename = function (request: string, ...rest: any[]) {
  if (IMAGE_RE.test(request)) return request;
  return origResolve.call(this, request, ...rest);
};

const origLoad = m._load;
m._load = function (request: string, ...rest: any[]) {
  if (IMAGE_RE.test(request)) return request;
  return origLoad.call(this, request, ...rest);
};
