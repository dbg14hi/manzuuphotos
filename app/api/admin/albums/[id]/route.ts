import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin, UnauthorizedError } from '@/lib/auth'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Check authentication - throws if not admin
    await requireAdmin()

    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'Album ID is required' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from('albums')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting album:', error)
      return NextResponse.json(
        { error: 'Failed to delete album' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Handle authentication errors separately
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const message = error instanceof Error ? error.message : 'Failed to delete album'
    console.error('Delete album error:', error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

