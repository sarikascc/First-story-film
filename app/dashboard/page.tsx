'use client'


import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Building2,
    ClipboardList,
    LogOut,
    Menu,
    X,
    TrendingUp,
    Clock,
    CheckCircle2,
    Sparkles
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/Spinner'

export default function DashboardPage() {
    const [session, setSession] = useState<any>(null)
    const [userRole, setUserRole] = useState<string>('USER')
    const [userName, setUserName] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalJobs: 0,
        inProgress: 0,
        completed: 0,
        totalUsers: 0
    })

    useEffect(() => {
        let mounted = true
        let renderCount = 0
        renderCount++

        console.log('[PAGE] 🚀 useEffect triggered', {
            renderCount,
            loading,
            hasSession: !!session,
            userRole,
            timestamp: new Date().toISOString()
        })

        const timeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn('[PAGE] ⏰ Loading timeout', {
                    renderCount,
                    timestamp: new Date().toISOString()
                })
                setLoading(false)
            }
        }, 5000)

        const init = async () => {
            try {
                console.log('[PAGE] 🔄 Init started', {
                    renderCount,
                    timestamp: new Date().toISOString()
                })

                // CRITICAL FIX: Session is already validated by layout
                // We just need it for user ID, no need to fetch profile again
                // The layout already has the role, but we need it here for stats
                const { data: { session: currentSession } } = await supabase.auth.getSession()
                
                console.log('[PAGE] 📊 Session check', {
                    hasSession: !!currentSession,
                    userId: currentSession?.user?.id,
                    timestamp: new Date().toISOString()
                })

                if (!mounted) return
                setSession(currentSession)

                if (currentSession?.user?.id) {
                    // CRITICAL FIX: Don't fetch profile again - layout already has it
                    // Instead, we'll get role from props or context, but for now
                    // we'll fetch it once more but only if we don't have it
                    // Actually, let's fetch it but log that layout should have it
                    console.log('[PAGE] 🔍 Fetching profile from users table for stats', {
                        userId: currentSession.user.id,
                        timestamp: new Date().toISOString()
                    })

                    // CRITICAL: Role MUST come from users table, NOT from auth
                    // Fetch from users table to get role for determining stats queries
                    const { data: profile, error: profileError } = await supabase
                        .from('users')
                        .select('role, name')
                        .eq('id', currentSession.user.id)
                        .single() // Use single() for better type safety

                    console.log('[PAGE] 📊 Profile fetch response from users table', {
                        hasData: !!profile,
                        role: profile?.role, // From users.role column
                        name: profile?.name,
                        error: profileError?.message,
                        timestamp: new Date().toISOString()
                    })

                    let profileData = null
                    if (profile && !profileError) {
                        // CRITICAL: Role comes from users.role, validate it
                        const validRole = (profile.role && ['ADMIN', 'MANAGER', 'USER'].includes(profile.role))
                            ? profile.role
                            : 'USER'
                        
                        profileData = { role: validRole, name: profile.name || '' }
                        
                        // Only update if we don't already have it (to avoid flicker)
                        if (!userRole || userRole === 'USER') {
                            setUserRole(validRole) // From users table, not auth
                        }
                        if (!userName) {
                            setUserName(profile.name || '')
                        }
                        console.log('[PAGE] ✅ Profile loaded from users table', {
                            role: validRole, // Confirmed: from users.role
                            name: profile.name,
                            timestamp: new Date().toISOString()
                        })
                    } else {
                        if (!userName) {
                            setUserName(currentSession.user.email?.split('@')[0] || 'Member')
                        }
                        console.log('[PAGE] ⚠️ No profile found in users table, using email', {
                            error: profileError?.message,
                            timestamp: new Date().toISOString()
                        })
                        // Default to USER role if profile not found
                        if (!userRole || userRole === 'USER') {
                            profileData = { role: 'USER', name: '' }
                        }
                    }

                    // 2. Prepare queries based on role
                    let jobsQuery = (supabase as any).from('jobs').select('status', { count: 'exact' })

                    const isSystemAdmin = profileData && profileData.role === 'ADMIN'
                    let usersQuery = isSystemAdmin
                        ? (supabase as any).from('users').select('id', { count: 'exact', head: true })
                        : null

                    // If not admin/manager, filter jobs by staff_id
                    const isSystemStaff = profileData && profileData.role === 'USER'
                    if (isSystemStaff) {
                        jobsQuery = jobsQuery.eq('staff_id', currentSession.user.id)
                    } else if (!profileData) {
                        jobsQuery = jobsQuery.eq('staff_id', currentSession.user.id)
                    }

                    console.log('[PAGE] 📊 Fetching stats', {
                        isSystemAdmin,
                        isSystemStaff,
                        timestamp: new Date().toISOString()
                    })

                    // 3. Fetch stats in parallel
                    const [jobsResponse, usersResponse] = await Promise.all([
                        jobsQuery,
                        usersQuery || Promise.resolve({ count: 0 })
                    ])

                    const { data: jobs, count: totalJobs } = jobsResponse
                    const { count: totalUsers } = usersResponse

                    const safeJobs = (jobs || []) as { status: string }[]

                    console.log('[PAGE] 📊 Stats loaded', {
                        totalJobs: totalJobs || 0,
                        inProgress: safeJobs.filter(j => j.status === 'IN_PROGRESS').length,
                        completed: safeJobs.filter(j => j.status === 'COMPLETED').length,
                        totalUsers: totalUsers || 0,
                        timestamp: new Date().toISOString()
                    })

                    if (mounted) {
                        setStats({
                            totalJobs: totalJobs || 0,
                            inProgress: safeJobs.filter(j => j.status === 'IN_PROGRESS').length,
                            completed: safeJobs.filter(j => j.status === 'COMPLETED').length,
                            totalUsers: totalUsers || 0
                        })
                    }
                } else {
                    console.log('[PAGE] ⚠️ No session found', {
                        timestamp: new Date().toISOString()
                    })
                    // CRITICAL FIX: Set loading to false even if no session
                    // This prevents infinite loader
                    if (mounted) {
                        setLoading(false)
                    }
                }
            } catch (err) {
                console.error('[PAGE] ❌ Unexpected error in init:', err)
                // CRITICAL FIX: Set loading to false on error
                if (mounted) {
                    setLoading(false)
                }
            } finally {
                if (mounted) {
                    console.log('[PAGE] 🏁 Init finally - setting loading to false', {
                        renderCount,
                        timestamp: new Date().toISOString()
                    })
                    setLoading(false)
                    clearTimeout(timeout)
                }
            }
        }
        init()
        return () => {
            console.log('[PAGE] 🧹 Cleanup', {
                timestamp: new Date().toISOString()
            })
            mounted = false
            clearTimeout(timeout)
        }
    }, [])

    // CRITICAL FIX: Show loader if we're loading OR if we have session but role is still default
    // This prevents flicker when role is being fetched
    // Note: userRole starts as 'USER', so we check if we're still in initial loading state
    const isLoading = loading || (session && loading) // Keep it simple - if loading is true, show loader
    
    console.log('[PAGE] 🎨 Render check', {
        loading,
        hasSession: !!session,
        userRole,
        userName,
        isLoading,
        timestamp: new Date().toISOString()
    })

    if (!session && !loading) {
        console.log('[PAGE] ⚠️ No session and not loading - returning null')
        return null
    }

    const isAdmin = userRole === 'ADMIN'

    return (
        <main className="lg:ml-72 min-h-screen p-6 lg:p-10 relative">
            {isLoading && (
                <div className="absolute inset-0 bg-[#f1f5f9] z-50 flex items-center justify-center py-20">
                    <Spinner />
                </div>
            )}
            <div className="max-w-6xl mx-auto">
                {/* Welcome Header */}
                <div className="mb-8">
                    <div className="h-1 w-16 bg-indigo-600 rounded-full mb-4" />
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 font-heading tracking-tight mb-2 leading-tight">
                        Welcome back, <span className="text-indigo-600">{userName || 'Studio Member'}!</span>
                    </h2>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card-aesthetic p-6 overflow-hidden group hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Jobs</p>
                                <p className="text-3xl font-bold font-heading text-slate-900">{stats.totalJobs}</p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                <ClipboardList size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="card-aesthetic p-6 group hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">In-Progress</p>
                                <p className="text-3xl font-bold font-heading text-slate-900">{stats.inProgress}</p>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                <Clock size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="card-aesthetic p-6 group hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Completed</p>
                                <p className="text-3xl font-bold font-heading text-slate-900">{stats.completed}</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                <CheckCircle2 size={22} />
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="card-aesthetic p-6 group hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Users</p>
                                    <p className="text-3xl font-bold font-heading text-slate-900">{stats.totalUsers}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <Users size={22} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions Center */}
                <div className="card-aesthetic p-10">
                    <div className="flex items-center space-x-3 mb-8">
                        <TrendingUp className="text-indigo-600" size={24} />
                        <h3 className="text-2xl font-bold font-heading text-slate-900 uppercase tracking-tight">
                            Quick Actions
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {isAdmin ? (
                            <>
                                <Link href="/dashboard/admin/jobs/new" className="btn-aesthetic text-center">
                                    Create New Job
                                </Link>
                                <Link href="/dashboard/admin/staff/new" className="btn-aesthetic text-center">
                                    Add New User
                                </Link>
                                <Link href="/dashboard/admin/services" className="btn-aesthetic text-center">
                                    Manage Services
                                </Link>
                            </>
                        ) : (
                            <Link href="/dashboard/staff/my-jobs" className="btn-aesthetic text-center">
                                View My Jobs
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
