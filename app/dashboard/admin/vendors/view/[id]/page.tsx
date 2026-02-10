"use client"

import { useState, useEffect, use } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { 
    Building2, 
    User, 
    Smartphone, 
    Mail, 
    MapPin, 
    ArrowLeft, 
    Edit2, 
    FileText, 
    ClipboardList,
    Clock,
    CheckCircle2,
    Calendar,
    ChevronRight,
    Zap,
    Eye,
    X,
    ExternalLink,
    Briefcase,
    TrendingUp,
    DollarSign,
    Settings,
    Percent
} from "lucide-react"
import Spinner from "@/components/Spinner"

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [vendor, setVendor] = useState<any>(null)
    const [recentJobs, setRecentJobs] = useState<any[]>([])
    const [selectedJob, setSelectedJob] = useState<any>(null)
    const [showViewModal, setShowViewModal] = useState(false)

    const fetchData = async () => {
        try {
            setLoading(true)
            
            // Fetch vendor details
            const { data: vendorData, error: vendorError } = await (supabase
                .from('vendors') as any)
                .select('*')
                .eq('id', id)
                .single()

            if (vendorError) throw vendorError
            setVendor(vendorData)

            // Fetch recent jobs for this vendor with staff details
            const { data: jobsData, error: jobsError } = await (supabase
                .from('jobs') as any)
                .select(`
                    *,
                    service:services(name),
                    staff:users!staff_id(id, name)
                `)
                .eq('vendor_id', id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (jobsError) throw jobsError
            setRecentJobs(jobsData || [])

        } catch (error) {
            console.error("Error fetching vendor details:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchData()
    }, [id])

    if (loading) return <Spinner className="py-24" />
    if (!vendor) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9] lg:ml-72">
            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Vendor not found</p>
            <button onClick={() => router.back()} className="mt-4 text-indigo-600 font-bold flex items-center text-[10px] uppercase">
                <ArrowLeft size={16} className="mr-2" /> Go Back
            </button>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#f1f5f9] text-slate-800 lg:ml-72">
            <div className="w-full px-4 py-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8 space-y-4">
                    <button 
                        onClick={() => router.back()}
                        className="group flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all shadow-sm">
                            <ArrowLeft size={12} />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest">Back to Vendors</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center space-x-6">
                            <div className="w-20 h-20 bg-white border border-slate-200 rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200/50">
                                <Building2 size={36} className="text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">
                                    {vendor.studio_name}
                                </h1>
                                <div className="flex items-center text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                    <User size={13} className="mr-2 text-indigo-400" />
                                    {vendor.contact_person}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => router.push(`/dashboard/admin/vendors`)} // Assuming modal edit on main page for now
                                className="px-6 h-12 bg-white border border-slate-200 hover:border-indigo-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center space-x-2 shadow-sm"
                            >
                                <Edit2 size={14} />
                                <span>Edit Profile</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Wing: Vendor Details */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-8 space-y-8">
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Contact Information</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                <Smartphone size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile</p>
                                                <p className="text-sm font-bold text-slate-700">{vendor.mobile}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                                <p className="text-sm font-bold text-slate-700">{vendor.email || "Not provided"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                                <p className="text-sm font-bold text-slate-700">{vendor.location || "Not specified"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center">
                                        <FileText size={14} className="mr-2" />
                                        Studio Notes
                                    </h3>
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                            {vendor.notes || "No additional notes for this vendor."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Wing: Recent Activity / Jobs */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Recent Activity</h3>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Project History</h2>
                                </div>
                                <div className="bg-indigo-600 px-4 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-widest">
                                    {recentJobs.length} Projects Total
                                </div>
                            </div>

                            <div className="flex-1">
                                {recentJobs.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <ClipboardList size={24} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No projects associated with this studio yet.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {recentJobs.map((job) => (
                                            <div 
                                                key={job.id}
                                                onClick={() => {
                                                    setSelectedJob(job);
                                                    setShowViewModal(true);
                                                }}
                                                className="p-6 hover:bg-slate-50 transition-all cursor-pointer group flex items-center justify-between"
                                            >
                                                <div className="flex items-center space-x-6">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${
                                                        job.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                                                        job.status === 'PENDING' ? 'bg-amber-50 border-amber-100 text-amber-500' :
                                                        'bg-indigo-50 border-indigo-100 text-indigo-500'
                                                    }`}>
                                                        {job.status === 'COMPLETED' ? <CheckCircle2 size={24} /> : 
                                                         job.status === 'PENDING' ? <Clock size={24} /> : 
                                                         <Zap size={24} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-3 mb-1">
                                                            <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                                                                {job.service?.name}
                                                            </p>
                                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                                                job.status === 'COMPLETED' ? 'bg-emerald-500 text-white border-emerald-600' :
                                                                job.status === 'PENDING' ? 'bg-amber-400 text-white border-amber-500' :
                                                                'bg-indigo-600 text-white border-indigo-700'
                                                            }`}>
                                                                {job.status === 'IN_PROGRESS' ? 'IN-PROGRESS' : 
                                                                 job.status === 'COMPLETED' ? 'COMPLETE' : 
                                                                 job.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            <div className="flex items-center">
                                                                <Calendar size={12} className="mr-1.5" />
                                                                {new Date(job.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </div>
                                                            <span className="text-slate-200">|</span>
                                                            <div className="flex items-center">
                                                                <User size={12} className="mr-1.5" />
                                                                {job.staff?.name || 'Unassigned'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-right mr-4 hidden sm:block">
                                                        <p className="text-[14px] font-black text-slate-900">₹{Number(job.amount).toLocaleString('en-IN')}</p>
                                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Comm: ₹{Number(job.commission_amount).toLocaleString('en-IN')}</p>
                                                    </div>
                                                    <button 
                                                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-all shadow-sm"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {recentJobs.length > 0 && (
                                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                                    <button 
                                        onClick={() => router.push('/dashboard/admin/jobs')}
                                        className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                                    >
                                        View Full Project Ledger
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {showViewModal && selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
                    <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                            <div className="flex items-center space-x-5">
                                <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                                    <ClipboardList size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Production Details</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Project ID: {selectedJob.id.slice(0, 8)}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowViewModal(false)}
                                className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl flex items-center justify-center transition-all border border-slate-100 hover:border-rose-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-10 bg-[#fafbfc] custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                {/* Left Side: Core Info */}
                                <div className="lg:col-span-8 space-y-12">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3" />
                                                Assignment Info
                                            </h3>
                                            <div className="grid gap-4">
                                                <div className="flex items-center space-x-5 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:border-indigo-100 transition-all">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
                                                        <Briefcase size={22} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Category</p>
                                                        <p className="text-base font-black text-slate-900 tracking-tight">{selectedJob.service?.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-5 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:border-indigo-100 transition-all">
                                                    <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 transition-transform group-hover:scale-110">
                                                        <User size={22} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Assigned To</p>
                                                        <p className="text-base font-black text-slate-900 tracking-tight">{selectedJob.staff?.name || 'Unassigned'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-3" />
                                                Deadlines
                                            </h3>
                                            <div className="p-5 bg-rose-50/30 rounded-3xl border border-rose-100/50 flex items-center space-x-5">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
                                                    <Calendar size={22} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-0.5">Submission Target</p>
                                                    <p className="text-base font-black text-rose-600 tracking-tight">
                                                        {new Date(selectedJob.job_due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3" />
                                            Data Logistics
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-all">
                                                <div className="flex items-center space-x-4 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Directory</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 break-all">
                                                    {selectedJob.data_location || 'Awaiting Upload...'}
                                                </p>
                                            </div>
                                            <div className="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100 shadow-sm hover:border-indigo-200 transition-all">
                                                <div className="flex items-center space-x-4 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm">
                                                        <ExternalLink size={18} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Output Link</span>
                                                </div>
                                                <p className="text-sm font-bold text-indigo-900 bg-white p-3 rounded-xl border border-indigo-100/50 break-all">
                                                    {selectedJob.final_location || 'Pending Finish...'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <section className="space-y-6 pb-10">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3" />
                                                Creative Brief
                                            </h3>
                                        </div>
                                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden">
                                            <FileText className="absolute -bottom-10 -right-10 text-slate-50 opacity-10" size={200} />
                                            <div className="relative z-10">
                                                <p className="text-slate-600 font-medium leading-relaxed italic text-xl border-l-4 border-indigo-100 pl-8 py-2">
                                                    &quot;{selectedJob.description || 'No specific creative instructions provided for this production.'}&quot;
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Right Side: Status & Financials */}
                                <div className="lg:col-span-4 space-y-6">
                                    {/* Financial Card - Updated to remove black */}
                                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                        <div className="relative z-10 space-y-8">
                                            <div className="flex items-center justify-between">
                                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                                    <DollarSign size={24} className="text-white" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100 opacity-80">Billing Summary</p>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Verified Revenue</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-[11px] font-black text-indigo-100 uppercase tracking-widest mb-1 opacity-70">Total Invoice Amount</p>
                                                <div className="flex items-baseline space-x-1">
                                                    <span className="text-4xl font-black tracking-tighter">₹{Number(selectedJob.amount).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-white/10 space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5">
                                                    <div>
                                                        <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Staff Commission</p>
                                                        <p className="text-2xl font-black text-white">₹{Number(selectedJob.commission_amount).toLocaleString('en-IN')}</p>
                                                    </div>
                                                    <div className="w-10 h-10 bg-emerald-400/20 border border-emerald-400/30 rounded-xl flex items-center justify-center">
                                                        <Percent size={18} className="text-emerald-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current Status Card - Softened Colors */}
                                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
                                        <div>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Production Status</h3>
                                            <div className={`p-5 rounded-2xl border flex items-center space-x-4 ${
                                                selectedJob.status === 'COMPLETED' ? 'bg-emerald-50/50 border-emerald-100/50 text-emerald-700' :
                                                selectedJob.status === 'PENDING' ? 'bg-amber-50/50 border-amber-100/50 text-amber-700' :
                                                'bg-indigo-50/50 border-indigo-100/50 text-indigo-700'
                                            }`}>
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                                                    selectedJob.status === 'COMPLETED' ? 'bg-emerald-500 text-white' :
                                                    selectedJob.status === 'PENDING' ? 'bg-amber-400 text-white' :
                                                    'bg-indigo-600 text-white'
                                                }`}>
                                                    {selectedJob.status === 'COMPLETED' ? <CheckCircle2 size={24} /> : 
                                                     selectedJob.status === 'PENDING' ? <Clock size={24} /> : 
                                                     <Zap size={24} />}
                                                </div>
                                                <div>
                                                    <span className="font-black text-[13px] uppercase tracking-[0.1em] block">
                                                        {selectedJob.status === 'IN_PROGRESS' ? 'IN-PROGRESS' : 
                                                         selectedJob.status === 'COMPLETED' ? 'COMPLETE' : 
                                                         selectedJob.status}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Live Status Update</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-50 space-y-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline Tracking</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-tight">Opened On</span>
                                                    <span className="text-[11px] text-slate-900 font-bold">{new Date(selectedJob.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-tight">Active Since</span>
                                                    <span className="text-[11px] text-slate-900 font-bold">{new Date(selectedJob.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => setShowViewModal(false)}
                                className="px-10 h-12 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
