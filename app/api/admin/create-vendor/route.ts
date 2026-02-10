import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        
        // Initialize Supabase Admin with Service Role Key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Check if the requester is actually an Admin or Manager
        const authHeader = request.headers.get('Authorization')
        const token = authHeader?.split(' ')[1]
        
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid Session' }, { status: 401 })
        }

        // Check internal role
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || !['ADMIN', 'MANAGER'].includes(profile.role)) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
        }

        // 2. Perform the Insert with Admin bypass
        const { data, error } = await supabaseAdmin
            .from('vendors')
            .insert([body])
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Admin Vendor API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
