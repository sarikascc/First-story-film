"use client"

import { useState, useEffect, use } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { 
    ClipboardList, 
    Building2, 
    User, 
    Calendar, 
    ArrowLeft, 
    DollarSign, 
    ExternalLink, 
    Clock, 
    CheckCircle2, 
    Zap, 
    MapPin, 
    FileText, 
    Edit2,
    Briefcase,
    Shield,
    AlertCircle
} from "lucide-react"
import Spinner from "@/components/Spinner"

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [job, setJob] = useState<any>(null)

    const fetchJob = async () => {
        try {
            const { data, error } = await (supabase
                .from('jobs') as any)
                .select(`
                    *,
                    service:services(name),
                    vendor:vendors(studio_name, contact_person, mobile, email),
                    staff:users(name, email, mobile)
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            setJob(data)
        } catch (error) {
            console.error("Error fetching job details:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchJob()
    }, [id])

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            const updates: any = { 
                status: newStatus,
                updated_at: new Date().toISOString()
            }
            if (newStatus === 'IN_PROGRESS' && !job.started_at) {
                updates.started_at = new Date().toISOString()
            }
            if (newStatus === 'COMPLETED') {
                updates.completed_at = new Date().toISOString()
            }

            const { error } = await (supabase
                .from('jobs') as any)
                .update(updates)
                .eq('id', id)

            if (error) throw error
            fetchJob()
        } catch (error) {
            console.error("Error updating status:", error)
        }
    }

    if (loading) return <Spinner />
    if (!job) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9] lg:ml-72">
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Job assignment not found</p>
            <button onClick={() => router.back()} className="mt-4 text-indigo-600 font-bold flex items-center text-[10px] uppercase">
                <ArrowLeft size={16} className="mr-2" /> Go Back
            </button>
        </div>
    )

    const formatCurrency = (amt: any) => 
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amt || 0))

    return (
        <div className="min-h-screen bg-[#f1f5f9] text-slate-800 lg:ml-72">
            <div className="w-full px-4 py-10 lg:px-12">
                {/* Header Section */}
                <div className="mb-10 space-y-6">
                    <button 
                        onClick={() => router.back()}
                        className="group flex items-center space-x-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all shadow-sm">
                            <ArrowLeft size={14} />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest">Back to Dashboard</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-start space-x-6">
                            <div className="w-20 h-20 bg-white border border-slate-200 rounded-[2rem] flex items-center justify-center shadow-xl shadow-slate-200/50">
                                <ClipboardList size={36} className="text-indigo-600" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-4 mb-2">
                                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">
                                        {job.service?.name}
                                    </h1>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                        job.status === 'COMPLETED' ? 'bg-emerald-500 text-white border-emerald-600' :
                                        job.status === 'PENDING' ? 'bg-amber-400 text-white border-amber-500' :
                                        'bg-indigo-600 text-white border-indigo-700'
                                    }`}>
                                        {job.status}
                                    </span>
                                </div>
                                <div className="flex items-center text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                    <Building2 size={12} className="mr-2 text-indigo-400" />
                                    {job.vendor?.studio_name}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => router.push(`/dashboard/admin/jobs/edit/${job.id}`)}
                                className="px-8 h-12 bg-white border border-slate-200 hover:border-indigo-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center space-x-2 shadow-sm"
                            >
                                <Edit2 size={14} />
                                <span>Edit Job</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Master Job Detail Card */}
                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
                    {/* Masthead Status */}
                    <div className="p-12 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div>
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Status</h2>
                            <div className="bg-white p-2 rounded-[1.8rem] flex items-center shadow-inner border border-slate-200 max-w-xl">
                                <button 
                                    onClick={() => handleStatusUpdate('PENDING')}
                                    className={`flex-1 py-4 px-6 flex items-center justify-center rounded-[1.4rem] transition-all space-x-2 ${job.status === 'PENDING' ? 'bg-amber-400 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-400 font-bold'}`}
                                >
                                    <Clock size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Pending</span>
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('IN_PROGRESS')}
                                    className={`flex-1 py-4 px-6 flex items-center justify-center rounded-[1.4rem] transition-all space-x-2 ${job.status === 'IN_PROGRESS' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-400 font-bold'}`}
                                >
                                    <Zap size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">In-Progress</span>
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('COMPLETED')}
                                    className={`flex-1 py-4 px-6 flex items-center justify-center rounded-[1.4rem] transition-all space-x-2 ${job.status === 'COMPLETED' ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-400 font-bold'}`}
                                >
                                    <CheckCircle2 size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Complete</span>
                                </button>
                            </div>
                        </div>

                        <div className="md:text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deadline Expectation</p>
                            <p className="text-2xl font-black text-rose-600 font-mono">
                                {new Date(job.job_due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        {/* Left Wing: Narrative & Data */}
                        <div className="lg:col-span-8 p-12 space-y-16 border-b lg:border-b-0 lg:border-r border-slate-100">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center">
                                    <FileText size={18} className="mr-3 text-indigo-500" />
                                    Project Briefing
                                </h3>
                                <div className="p-10 bg-slate-50/80 rounded-[2.5rem] border border-slate-100/50">
                                    <p className="text-xl font-bold text-slate-800 leading-relaxed italic">
                                        "{job.description || "No description provided."}"
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-indigo-500 pl-5">General Details</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned User</p>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                                    <User size={14} />
                                                </div>
                                                <p className="text-base font-bold text-slate-700">{job.staff?.name}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Studio Contact</p>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                                    <Building2 size={14} />
                                                </div>
                                                <p className="text-base font-bold text-slate-700">{job.vendor?.contact_person}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-emerald-500 pl-5">Location</h3>
                                    <div className="space-y-5">
                                        <div className="flex items-center space-x-4 p-5 bg-slate-50/80 rounded-[1.8rem] group transition-all hover:bg-slate-100 border border-slate-100/50">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                                                <MapPin size={20} />
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Source Location</span>
                                                <span className="text-base font-bold text-slate-900 truncate">{job.data_location || "Check Internal"}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 p-5 bg-indigo-50/30 rounded-[1.8rem] border border-indigo-100/20 group transition-all hover:bg-indigo-50">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                                <ExternalLink size={20} />
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Delivery Goal</span>
                                                <span className="text-base font-bold text-indigo-900 truncate">{job.final_location || "Pending"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Wing: Financial Audit */}
                        <div className="lg:col-span-4 p-12 bg-slate-50/50 flex flex-col justify-between">
                            <div className="space-y-12">
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Financial Audit</h3>
                                    <div className="space-y-10">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Job Amount</p>
                                            <p className="text-6xl font-black text-slate-900 tracking-tighter">{formatCurrency(job.amount)}</p>
                                        </div>

                                        <div className="p-10 bg-emerald-500 rounded-[2.5rem] shadow-2xl shadow-emerald-200/50">
                                            <p className="text-[10px] font-black text-emerald-50 uppercase tracking-widest mb-4 opacity-90">Commission</p>
                                            <div className="flex items-baseline space-x-2">
                                                <p className="text-4xl font-black text-white tracking-tight">{formatCurrency(job.commission_amount)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-5 pt-12 border-t border-slate-200/60">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Financial Summary</p>
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-xs font-bold text-slate-500">Operating Profit</span>
                                        <span className="text-base font-black text-slate-900">{formatCurrency(Number(job.amount || 0) - Number(job.commission_amount || 0))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

