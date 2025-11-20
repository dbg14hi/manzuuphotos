import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { AdminDashboard } from '@/components/AdminDashboard'
import { LogoutButton } from '@/components/LogoutButton'

export default async function AdminPage() {
  const user = await getAdminUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-800 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <LogoutButton />
        </div>
        <AdminDashboard />
      </div>
    </div>
  )
}

