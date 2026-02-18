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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9] lg:ml-[var(--sidebar-offset)]">
            <p className="text-slate-400 font-black uppercase tracking-widest">Job not found in your roster</p>
            <button onClick={() => router.back()} className="mt-4 text-indigo-600 font-bold flex items-center">
                <ArrowLeft size={16} className="mr-2" /> Go Back
            </button>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#f1f5f9] text-slate-800 lg:ml-[var(--sidebar-offset)]">
            <div className="w-full px-4 py-8 lg:px-8 max-w-6xl mx-auto">
                {/* Header / Back */}
                <div className="mb-6 flex items-center justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="group flex items-center space-x-3 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all shadow-sm">
                            <ArrowLeft size={14} />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest">Back</span>
                    </button>

                    <div className="flex items-center space-x-3">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Status:</span>
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                            job.status === "COMPLETED" ? "bg-emerald-500 text-white border-emerald-600" :
                            job.status === "PENDING" ? "bg-amber-400 text-white border-amber-500" :
                            "bg-indigo-600 text-white border-indigo-700"
                        }`}>
                            {job.status}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden text-left">
                    {/* Masthead */}
                    <div className="p-8 md:p-10 border-b border-slate-50 bg-slate-50/30">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">
                                    {job.service?.name}
                                </h1>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center">
                                    <Building2 size={12} className="mr-2" />
                                    {job.vendor?.studio_name}
                                </p>
                            </div>
                            <div className="bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 flex items-center max-w-sm w-full">
                                <button 
                                    onClick={() => handleStatusUpdate("PENDING")}
                                    className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 whitespace-nowrap ${job.status === "PENDING" ? "bg-amber-400 text-white shadow-md shadow-amber-200" : "text-slate-400 hover:bg-white"}`}
                                >
                                    PENDING
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate("IN_PROGRESS")}
                                    className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 whitespace-nowrap ${job.status === "IN_PROGRESS" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-400 hover:bg-white"}`}
                                >
                                    IN-PROGRESS
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate("COMPLETED")}
                                    className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 whitespace-nowrap ${job.status === "COMPLETED" ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" : "text-slate-400 hover:bg-white"}`}
                                >
                                    COMPLETE
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-10 space-y-10">
                        {/* Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Project Brief */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-l-3 border-indigo-500 pl-4">Job Description</h3>
                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-start">
                                    <FileText size={16} className="text-indigo-400 mr-4 mt-1 shrink-0" />
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                                        "{job.description || "No specific instructions provided."}"
                                    </p>
                                </div>
                            </div>

                            {/* Logistics */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-l-3 border-emerald-500 pl-4">Technical Details</h3>
                                <div className="space-y-3">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-4 group transition-all hover:bg-slate-100">
                                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 transition-colors group-hover:text-indigo-600 shadow-sm">
                                            <MapPin size={18} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Source location</span>
                                            <span className="text-xs font-bold text-slate-900 truncate">{job.data_location || "Not specified"}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100/20 flex items-center space-x-4 group transition-all hover:bg-indigo-50">
                                        <div className="w-10 h-10 rounded-lg bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                            <ExternalLink size={18} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Output location</span>
                                            <span className="text-xs font-bold text-indigo-900 truncate">{job.final_location || "Pending upload..."}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Meta Data */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                             <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Deadline</p>
                                    <p className="text-xs font-black text-rose-600">
                                        {new Date(job.job_due_date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Assignment Time</p>
                                    <p className="text-xs font-bold text-slate-700">
                                        {new Date(job.created_at).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6">
                            <button 
                                onClick={() => router.back()}
                                className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 shadow-lg"
                            >
                                <ArrowLeft size={16} />
                                <span>Complete & Return</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
