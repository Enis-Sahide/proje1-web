import { z } from 'zod';
export * from './schemas';

/**
 * Zod doğrulaması başarısız olduğunda ilk ve en açıklayıcı hata mesajını döner.
 */
export function formatZodError(error: z.ZodError): string {
  if (!error.issues || error.issues.length === 0) return 'Girdiğiniz bilgiler geçersiz.';
  return error.issues[0].message;
}

/**
 * Zod doğrulama hatalarını alan bazlı key-value sözlüğü olarak döner.
 */
export function formatZodFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }
  return fieldErrors;
}
