import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'

// Create a direct admin client for this route using service role
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function POST(request: Request) {
    try {
        // 0. Verify Session and Admin Role
        const supabase = await createServerClient()
        const { data: { user: requester } } = await supabase.auth.getUser()

        if (!requester) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: requesterProfile } = await supabase
            .from('users')
            .select('role')
            .eq('id', requester.id)
            .single()

        const profile = requesterProfile as { role: string } | null

        if (profile?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
        }

        const body = await request.json()
        const { id, password, name, email, mobile, role } = body

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        // 1. Update User in Supabase Auth if password/email provided
        const authUpdates: any = {}
        if (password) authUpdates.password = password
        if (email) authUpdates.email = email

        if (Object.keys(authUpdates).length > 0) {
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
                id,
                authUpdates
            )
            if (authError) throw authError
        }

        // 2. Update User in public.users table
        const publicUpdates: any = {}
        if (name !== undefined) publicUpdates.name = name
        if (email !== undefined) publicUpdates.email = email
        if (role !== undefined) publicUpdates.role = role
        if (mobile !== undefined) publicUpdates.mobile = mobile
        publicUpdates.updated_at = new Date().toISOString()

        const { error: publicError } = await supabaseAdmin
            .from('users')
            .update(publicUpdates)
            .eq('id', id)

        if (publicError) throw publicError

        return NextResponse.json({ success: true, message: 'User updated successfully' })
    } catch (error: any) {
        console.error('Update password error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
