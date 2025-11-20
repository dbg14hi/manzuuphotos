import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Return a response that will trigger a redirect on the client
  return NextResponse.json({ success: true, redirect: '/admin/login' })
}

