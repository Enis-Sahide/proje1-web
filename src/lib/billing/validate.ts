/**
 * TCKN / VKN doğrulama yardımcıları (server-only değil; istemcide de kullanılabilir).
 */

/** TC Kimlik No algoritmik doğrulama (11 hane, ilk hane 0 olamaz, checksum). */
export function isValidTCKN(value: string): boolean {
  if (!/^[1-9]\d{10}$/.test(value)) return false;
  const d = value.split('').map(Number);
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  const c10 = (odd * 7 - even) % 10;
  const c11 = (d.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;
  return c10 === d[9] && c11 === d[10];
}

/** Vergi Kimlik No algoritmik doğrulama (10 hane, checksum). */
export function isValidVKN(value: string): boolean {
  if (!/^\d{10}$/.test(value)) return false;
  const d = value.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const tmp = (d[i] + (9 - i)) % 10;
    const p = tmp === 0 ? 0 : (tmp * Math.pow(2, 9 - i)) % 9 || 9;
    sum += p;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === d[9];
}
