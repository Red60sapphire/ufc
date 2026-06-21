import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  let user: { id: number; username: string; is_admin: number } | null = null;

  if (sessionCookie?.value) {
    try {
      user = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
    } catch {}
  }

  if (!user?.is_admin) {
    redirect('/');
  }

  return <AdminDashboard user={user} />;
}
