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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] lg:ml-72">
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Job assignment not found</p>
            <button onClick={() => router.back()} className="mt-4 text-indigo-600 font-bold flex items-center text-[10px] uppercase">
                <ArrowLeft size={16} className="mr-2" /> Go Back
            </button>
        </div>
    )

    const formatCurrency = (amt: any) => 
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amt || 0))

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 lg:ml-72">
            <div className="w-full px-4 py-8 lg:px-8">
                {/* Header Section */}
                <div className="mb-8 space-y-4">
                    <button 
                        onClick={() => router.back()}
                        className="group flex items-center space-x-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all shadow-sm">
                            <ArrowLeft size={14} />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest">Back to Dashboard</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-start space-x-5 text-left">
                            <div className="w-16 h-16 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-slate-200/50">
                                <ClipboardList size={32} className="text-indigo-600" />
                            </div>
                            <div className="text-left">
                                <div className="flex items-center space-x-3 mb-1 text-left">
                                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none text-left">
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
                                <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] text-left">
                                    <Building2 size={12} className="mr-2 text-indigo-400" />
                                    {job.vendor?.studio_name}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={() => router.push(`/dashboard/admin/jobs/edit/${job.id}`)}
                                className="px-6 h-11 bg-white border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center space-x-2 shadow-sm"
                            >
                                <Edit2 size={14} />
                                <span>Refine Details</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Master Job Detail Card */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden text-left">
                    {/* Mission Status Header */}
                    <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 text-left">
                        <div className="text-left">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 text-left">Production Mission Control</h2>
                            <div className="bg-white p-1.5 rounded-[1.5rem] flex items-center shadow-sm border border-slate-100 max-w-lg">
                                <button 
                                    onClick={() => handleStatusUpdate('PENDING')}
                                    className={`flex-1 py-3.5 flex items-center justify-center rounded-[1.2rem] transition-all space-x-2 ${job.status === 'PENDING' ? 'bg-amber-400 text-white shadow-md' : 'hover:bg-slate-50 text-slate-400'}`}
                                >
                                    <Clock size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Queue</span>
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('IN_PROGRESS')}
                                    className={`flex-1 py-3.5 flex items-center justify-center rounded-[1.2rem] transition-all space-x-2 ${job.status === 'IN_PROGRESS' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-400'}`}
                                >
                                    <Zap size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('COMPLETED')}
                                    className={`flex-1 py-3.5 flex items-center justify-center rounded-[1.2rem] transition-all space-x-2 ${job.status === 'COMPLETED' ? 'bg-emerald-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-400'}`}
                                >
                                    <CheckCircle2 size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Finished</span>
                                </button>
                            </div>
                        </div>

                        <div className="text-left md:text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left md:text-right">Deadline Expectation</p>
                            <p className="text-xl font-black text-rose-600 font-mono text-left md:text-right">
                                {new Date(job.job_due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 text-left">
                        {/* Left Wing: Narrative & Data */}
                        <div className="lg:col-span-8 p-10 space-y-12 border-b lg:border-b-0 lg:border-r border-slate-50 text-left">
                            <div className="text-left">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center text-left">
                                    <FileText size={16} className="mr-3 text-indigo-500" />
                                    Project Briefing
                                </h3>
                                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-50 text-left">
                                    <p className="text-lg font-bold text-slate-800 leading-relaxed italic text-left">
                                        "{job.description || "No description provided."}"
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                                <div className="space-y-6 text-left">
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-2 border-indigo-500 pl-4 text-left">General Details</h3>
                                    <div className="space-y-4 text-left">
                                        <div className="text-left">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">Technician Assigned</p>
                                            <div className="flex items-center space-x-2 text-left">
                                                <User size={14} className="text-slate-400" />
                                                <p className="text-sm font-bold text-slate-700 text-left">{job.staff?.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">Studio Contact</p>
                                            <p className="text-sm font-bold text-slate-700 text-left">{job.vendor?.contact_person}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 text-left">
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-2 border-emerald-500 pl-4 text-left">Asset Logistics</h3>
                                    <div className="space-y-4 text-left">
                                        <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl group transition-all hover:bg-slate-100 text-left">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                                                <MapPin size={18} />
                                            </div>
                                            <div className="flex flex-col text-left overflow-hidden">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Source Location</span>
                                                <span className="text-sm font-bold text-slate-900 truncate text-left">{job.data_location || "Check Internal"}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/30 group transition-all hover:bg-indigo-50 text-left">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                                <ExternalLink size={18} />
                                            </div>
                                            <div className="flex flex-col text-left overflow-hidden">
                                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest text-left">Delivery Goal</span>
                                                <span className="text-sm font-bold text-indigo-900 truncate text-left">{job.final_location || "Pending"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Wing: Financial Audit */}
                        <div className="lg:col-span-4 p-10 bg-slate-50/30 flex flex-col justify-between text-left">
                            <div className="space-y-10 text-left">
                                <div className="text-left">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 text-left">Financial Audit</h3>
                                    <div className="space-y-8 text-left">
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-left">Gross Revenue</p>
                                            <p className="text-5xl font-black text-slate-900 tracking-tighter text-left">{formatCurrency(job.amount)}</p>
                                        </div>

                                        <div className="p-8 bg-emerald-500 rounded-3xl shadow-xl shadow-emerald-200/50 text-left">
                                            <p className="text-[10px] font-black text-emerald-50 uppercase tracking-widest mb-3 opacity-80 text-left text-left">Technician Commission</p>
                                            <div className="flex items-baseline space-x-2 text-left">
                                                <p className="text-3xl font-black text-white tracking-tight text-left">{formatCurrency(job.commission_amount)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-10 border-t border-slate-100 text-left">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Profit Profile</p>
                                    <div className="flex justify-between items-center text-left">
                                        <span className="text-xs font-bold text-slate-500 text-left font-left">Operating Profit</span>
                                        <span className="text-sm font-black text-slate-900 text-left font-left">{formatCurrency(Number(job.amount || 0) - Number(job.commission_amount || 0))}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 text-left">
                                <div className="flex items-center space-x-3 mb-4 text-slate-400 text-left">
                                    <Shield size={14} className="text-indigo-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-left">Admin Security Audit</span>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-100 text-left">
                                    <div className="flex justify-between items-center text-left">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">System Ref</span>
                                        <span className="text-[10px] font-bold text-slate-900 select-all font-left text-left">#{job.id.slice(0, 8)}</span>
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

