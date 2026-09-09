import { redirect } from 'next/navigation';

/** /admin → panelin giriş sayfasına yönlendirir. */
export default function AdminIndexPage() {
  redirect('/admin/dashboard');
}
