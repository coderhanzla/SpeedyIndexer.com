import { NextResponse } from 'next/server'
import { workerSupabase } from '../../../lib/workersupabase.js'

export const runtime = 'nodejs'

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    const email = String(body.email || '').trim().toLowerCase()
    const { password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Service key not configured on server' }, { status: 500 })
    }

    const { data, error } = await workerSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      return NextResponse.json({ error: error.message || error }, { status: 400 })
    }

    return NextResponse.json({ user: data?.user || null })
  } catch (err) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
