import { createClient } from '@/lib/supabase/server'

// Check if current user is admin by comparing email with ADMIN_EMAIL env var
export async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Verify user email matches admin email from environment
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    console.error('ADMIN_EMAIL environment variable is not set')
    return null
  }

  if (user.email !== adminEmail) {
    return null
  }

  return user
}

// Custom error class for authentication failures
export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

// Require admin access - throws UnauthorizedError if user is not admin
export async function requireAdmin() {
  const user = await getAdminUser()
  if (!user) {
    throw new UnauthorizedError('Unauthorized')
  }
  return user
}

