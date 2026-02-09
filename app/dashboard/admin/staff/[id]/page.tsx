"use client"

import { useState, useEffect, use } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { 
    User as UserIcon, 
    Mail, 
    Smartphone, 
    Calendar, 
    ArrowLeft, 
    Briefcase, 
    TrendingUp, 
    ClipboardList,
    DollarSign,
    Settings,
    Clock,
    CheckCircle2,
    Building2,
    Percent,
    ExternalLink
} from "lucide-react"
import Spinner from "@/components/Spinner"
import { User, Service, StaffServiceConfig, Job, Vendor } from "@/types/database"

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)
    const [commissions, setCommissions] = useState<any[]>([])
    const [jobs, setJobs] = useState<any[]>([])
    const [stats, setStats] = useState({
        totalJobs: 0,
        completedJobs: 0,
        totalEarnt: 0
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User
                const { data: userData, error: userError } = await (supabase
                    .from('users') as any)
                    .select('*')
                    .eq('id', id)
                    .single()

                if (userError) throw userError
                setUser(userData)

                // Fetch Commissions
                const { data: commData, error: commError } = await (supabase
                    .from('staff_service_configs') as any)
                    .select('*, services(name)')
                    .eq('staff_id', id)
                
                if (commError) throw commError
                setCommissions(commData || [])

                // Fetch Jobs
                const { data: jobsData, error: jobsError } = await (supabase
                    .from('jobs') as any)
                    .select('*, services(name), vendors(studio_name)')
                    .eq('staff_id', id)
                    .order('created_at', { ascending: false })

                if (jobsError) throw jobsError
                setJobs(jobsData || [])

                // Calculate Stats
                const completed = (jobsData || []).filter((j: any) => j.status === 'COMPLETED')
                const totalComm = completed.reduce((sum: number, j: any) => sum + Number(j.commission_amount || 0), 0)
                
                setStats({
                    totalJobs: (jobsData || []).length,
                    completedJobs: completed.length,
                    totalEarnt: totalComm
                })

            } catch (error) {
                console.error("Error fetching user details:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    if (loading) return <Spinner />
    if (!user) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] lg:ml-72">
            <p className="text-slate-400 font-black uppercase tracking-widest">User not found</p>
            <button onClick={() => router.back()} className="mt-4 text-indigo-600 font-bold flex items-center">
                <ArrowLeft size={16} className="mr-2" /> Go Back
            </button>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 lg:ml-72">
            <div className="w-full px-4 py-8 lg:px-8">
                {/* Back Button & Header */}
                <div className="mb-8 flex items-center justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="group flex items-center space-x-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                            <ArrowLeft size={14} />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest">Back to Staff</span>
                    </button>
                    
                    <div className="flex items-center space-x-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            user.role === 'MANAGER' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                            {user.role}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile & Commissions */}
                    <div className="space-y-8">
                        {/* Profile Info */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden p-8">
                            <div className="flex items-center space-x-4 mb-8">
                                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                    <UserIcon size={32} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{user.name}</h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Team Member</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center space-x-4 p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-colors group">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-colors group">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                                        <Smartphone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</p>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5">{user.mobile || 'Not Set'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-colors group">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Joined On</p>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                                            {new Date(user.created_at || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Commission Settings */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Percent size={14} />
                                    </div>
                                    <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Service Commissions</h2>
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                {commissions.length === 0 ? (
                                    <p className="text-center py-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest">No commissions configured</p>
                                ) : (
                                    commissions.map((comm) => (
                                        <div key={comm.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{comm.services?.name}</span>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-base font-black text-indigo-600">{comm.percentage}%</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats & Job History */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                                    <Briefcase size={18} />
                                </div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Projects</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalJobs}</p>
                            </div>
                            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                    <CheckCircle2 size={18} />
                                </div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{stats.completedJobs}</p>
                            </div>
                            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                                    <TrendingUp size={18} />
                                </div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Earnings (Est.)</p>
                                <p className="text-2xl font-black text-emerald-600 mt-1">₹{stats.totalEarnt.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Job History Table */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <ClipboardList size={14} />
                                    </div>
                                    <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Live Assignment History</h2>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/30">
                                            <th className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Project / Studio</th>
                                            <th className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Due Date</th>
                                            <th className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                            <th className="px-8 py-3 text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Earning</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {jobs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-20 text-center">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No history records found</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            jobs.map((job) => (
                                                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group/row">
                                                    <td className="px-8 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-bold text-slate-900 leading-none">{job.services?.name}</span>
                                                            <div className="flex items-center text-[11px] text-slate-400 font-bold mt-1.5 uppercase tracking-tight">
                                                                <Building2 size={12} className="mr-1 text-slate-300" />
                                                                {job.vendors?.studio_name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-3">
                                                        <div className="flex items-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                            <Clock size={14} className="mr-2 text-indigo-300" />
                                                            {new Date(job.job_due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-3">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                            job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            job.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                        }`}>
                                                            {job.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-3 text-right">
                                                        <div className="text-base font-black text-slate-900 leading-tight">₹{Number(job.commission_amount).toLocaleString()}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Base: ₹{Number(job.amount).toLocaleString()}</div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
