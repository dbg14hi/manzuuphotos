import { createClient } from '@/lib/supabase/server'

// Check if current user is admin by comparing email with ADMIN_EMAIL env var
export async function getAdminUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // Handle refresh token errors gracefully - these occur when no session exists
    if (error) {
      // Refresh token not found is expected when user is not logged in
      if (error.message?.includes('refresh_token_not_found') || 
          error.message?.includes('Refresh Token Not Found')) {
        return null
      }
      // For other errors, log but don't throw
      console.error('Auth error:', error.message)
      return null
    }

    if (!user) {
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
  } catch (error) {
    // Catch any unexpected errors and return null instead of throwing
    // This prevents errors from breaking pages when users aren't logged in
    if (error instanceof Error) {
      // Only log non-refresh-token errors
      if (!error.message.includes('refresh_token') && !error.message.includes('Refresh Token')) {
        console.error('Unexpected auth error:', error.message)
      }
    }
    return null
  }
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

