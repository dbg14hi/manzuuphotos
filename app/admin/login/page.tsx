import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { AdminLogin } from '@/components/AdminLogin'

export default async function AdminLoginPage() {
  // If already logged in as admin, redirect to dashboard
  const user = await getAdminUser()
  if (user) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-800 to-black flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Admin Login
        </h1>
        <AdminLogin />
      </div>
    </div>
  )
}

