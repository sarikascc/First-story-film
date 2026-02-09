"use client"

import { useState, useEffect, use } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { 
    ClipboardList, 
    Building2, 
    Calendar, 
    ArrowLeft, 
    Clock, 
    CheckCircle2, 
    Zap, 
    MapPin, 
    FileText, 
    ExternalLink,
    Shield
} from "lucide-react"
import Spinner from "@/components/Spinner"

export default function StaffJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [job, setJob] = useState<any>(null)

    const fetchJob = async () => {
        try {
            const { data, error } = await (supabase
                .from("jobs") as any)
                .select(`
                    *,
                    service:services(name),
                    vendor:vendors(studio_name, contact_person, mobile),
                    staff:users!staff_id(name)
                `)
                .eq("id", id)
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
            
            if (newStatus === "IN_PROGRESS" && !job.started_at) {
                updates.started_at = new Date().toISOString()
            }
            if (newStatus === "COMPLETED") {
                updates.completed_at = new Date().toISOString()
            }

            const { error } = await (supabase
                .from("jobs") as any)
                .update(updates)
                .eq("id", id)

            if (error) throw error
            fetchJob()
        } catch (error) {
            console.error("Error updating status:", error)
        }
    }

    if (loading) return <Spinner />
    if (!job) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] lg:ml-72">
            <p className="text-slate-400 font-black uppercase tracking-widest">Job not found in your roster</p>
            <button onClick={() => router.back()} className="mt-4 text-indigo-600 font-bold flex items-center">
                <ArrowLeft size={16} className="mr-2" /> Go Back
            </button>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 lg:ml-72">
            <div className="w-full px-4 py-8 lg:px-12 max-w-6xl mx-auto">
                {/* Header / Back */}
                <div className="mb-10 flex items-center justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="group flex items-center space-x-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all shadow-sm">
                            <ArrowLeft size={14} />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-left">Return to Queue</span>
                    </button>

                    <div className="flex items-center space-x-3 text-left">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest text-left">Current Status:</span>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                            job.status === "COMPLETED" ? "bg-emerald-500 text-white border-emerald-600" :
                            job.status === "PENDING" ? "bg-amber-400 text-white border-amber-500" :
                            "bg-indigo-600 text-white border-indigo-700"
                        }`}>
                            {job.status}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden p-8 md:p-12 text-left">
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-10 text-left">GENERAL DETAILS</h1>

                    <div className="space-y-10 text-left">
                        {/* First Row: Vendor & Service */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center text-left">
                                    PRODUCTION STUDIO (VENDOR) <span className="text-rose-500 ml-1">*</span>
                                </label>
                                <div className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 flex items-center text-left">
                                    <Building2 size={16} className="mr-3 text-slate-400" />
                                    {job.vendor?.studio_name}
                                </div>
                            </div>

                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center text-left">
                                    SERVICE / JOB TYPE <span className="text-rose-500 ml-1">*</span>
                                </label>
                                <div className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 flex items-center text-left">
                                    <ClipboardList size={16} className="mr-3 text-slate-400" />
                                    {job.service?.name}
                                </div>
                            </div>
                        </div>

                        {/* Second Row: Assignee, Date, Status */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center text-left">
                                    ASSIGN USER <span className="text-rose-500 ml-1">*</span>
                                </label>
                                <div className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-700 flex items-center text-left">
                                    <Shield size={16} className="mr-3 text-slate-400" />
                                    {job.staff?.name?.toUpperCase() || "YOU (STAFF ACCOUNT)"}
                                </div>
                            </div>

                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center text-left">
                                    JOB DUE DATE <span className="text-rose-500 ml-1">*</span>
                                </label>
                                <div className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 flex items-center text-left">
                                    <Calendar size={16} className="mr-3 text-rose-500" />
                                    {new Date(job.job_due_date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(/am|pm/g, (m) => m.toLowerCase())}
                                </div>
                            </div>

                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center text-left">
                                    JOB STATUS <span className="text-rose-500 ml-1">*</span>
                                </label>
                                <div className="w-full p-1.5 bg-[#f8fafc] border border-slate-100/50 rounded-2xl flex items-center transition-all">
                                    <button 
                                        onClick={() => handleStatusUpdate("PENDING")}
                                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${job.status === "PENDING" ? "bg-[#ffb400] text-white shadow-lg shadow-amber-200" : "text-slate-400 hover:bg-white"}`}
                                    >
                                        PENDING
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate("IN_PROGRESS")}
                                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${job.status === "IN_PROGRESS" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-400 hover:bg-white"}`}
                                    >
                                        IN PROGRESS
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate("COMPLETED")}
                                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${job.status === "COMPLETED" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "text-slate-400 hover:bg-white"}`}
                                    >
                                        COMPLETED
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Third Row: Work Description */}
                        <div className="space-y-3 pt-6 text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center text-left">
                                WORK DESCRIPTION <span className="text-rose-500 ml-1">*</span>
                            </label>
                            <div className="w-full px-8 py-10 bg-slate-50 border border-slate-100 rounded-[2rem] text-lg font-bold text-slate-700 leading-relaxed italic text-left">
                                "{job.description || "No specific instructions provided."}"
                            </div>
                        </div>

                        {/* Fourth Row: Locations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 text-left">
                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center text-left">
                                    DATA LOCATION (SOURCE)
                                </label>
                                <div className="w-full px-6 py-5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 flex items-center shadow-sm text-left">
                                    <MapPin size={18} className="mr-3 text-indigo-500" />
                                    {job.data_location || "Source folder path..."}
                                </div>
                            </div>

                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center text-left">
                                    FINAL LOCATION (DESTINATION)
                                </label>
                                <div className="w-full px-6 py-5 bg-white border border-indigo-100 rounded-2xl text-sm font-bold text-indigo-900 flex items-center shadow-sm text-left">
                                    <ExternalLink size={18} className="mr-3 text-indigo-600" />
                                    {job.final_location || "Final destination path..."}
                                </div>
                            </div>
                        </div>

                        {/* Final Row: Return Button styled like Official Post Job button */}
                        <div className="pt-12 text-left">
                            <button 
                                onClick={() => router.back()}
                                className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 shadow-xl shadow-indigo-100 text-left"
                            >
                                <ArrowLeft size={18} />
                                <span>Return to Jobs Menu</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Secure Audit Info */}
                <div className="mt-8 px-4 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-50 text-left">
                    <div className="flex items-center space-x-3 text-slate-400 text-left">
                        <Shield size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-left">Staff Detail Insight Mode</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Job Ref: #{job.id.slice(0, 12)}</span>
                </div>
            </div>
        </div>
    )
}
