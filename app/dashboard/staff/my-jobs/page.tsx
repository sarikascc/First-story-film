'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Square, Pause, ExternalLink, Calendar, MapPin, CheckCircle2, Search, Clock, Building2, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Job } from '@/types/database'
import { getStatusColor, getStatusLabel } from '@/lib/utils'
import Pagination from '@/components/Pagination'
import AestheticSelect from '@/components/AestheticSelect'

export default function MyJobsPage() {
    const router = useRouter()
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10
    const [currentUser, setCurrentUser] = useState<any>(null)

    // Action state
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [finalLocation, setFinalLocation] = useState('')
    const [completingJobId, setCompletingJobId] = useState<string | null>(null)
    const [debugCount, setDebugCount] = useState<number | null>(null)

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login')
                    return
                }
                setCurrentUser(user)
                await fetchMyJobs(user.id)
            } catch (err) {
                console.error('MyJobs: Error in checkUser:', err)
            } finally {
                setLoading(false)
            }
        }
        checkUser()
    }, [])

    const fetchMyJobs = async (userId: string) => {
        setLoading(true)
        console.log('MyJobs: Fetching jobs for user ID:', userId)

        try {
            // Fetch jobs
            const { data, error, count } = await (supabase.from('jobs') as any)
                .select(`
                  *,
                  service:services(name),
                  vendor:vendors(studio_name)
                `, { count: 'exact' })
                .eq('staff_id', userId)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('MyJobs: Supabase Error:', error.message, error.code)
                throw error
            }

            console.log('MyJobs: Query successful. Jobs found:', data?.length, 'Count:', count)
            if (data && data.length > 0) {
                console.log('MyJobs: First job sample:', data[0])
            }
            
            setJobs(data || [])
            setDebugCount(count || 0)
        } catch (error: any) {
            console.error('Error fetching jobs:', error.message || error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (jobId: string, newStatus: string, extraData: any = {}) => {
        setActionLoading(jobId)
        try {
            const updatePayload: any = {
                status: newStatus,
                ...extraData
            }

            if (newStatus === 'IN_PROGRESS') {
                updatePayload.started_at = new Date().toISOString()
            }

            if (newStatus === 'COMPLETED') {
                updatePayload.completed_at = new Date().toISOString()
            }

            const { error } = await (supabase.from('jobs') as any)
                .update(updatePayload)
                .eq('id', jobId)

            if (error) throw error

            setCompletingJobId(null)
            setFinalLocation('')
            await fetchMyJobs()
        } catch (error: any) {
            console.error('Error updating status:', error.message || error)
        } finally {
            setActionLoading(null)
        }
    }

    const filteredJobs = jobs.filter(job => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        const serviceName = job.service?.name?.toLowerCase() || '';
        const description = job.description?.toLowerCase() || '';
        return serviceName.includes(search) || description.includes(search);
    })

    const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE)
    const paginatedJobs = filteredJobs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    if (loading && jobs.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] lg:ml-72">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] lg:ml-72 p-8 lg:p-14">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 animate-slide-up">
                    <div className="h-1 w-20 bg-indigo-600 rounded-full mb-6" />
                    <h1 className="text-4xl font-bold text-slate-900 font-heading tracking-tight mb-2 uppercase flex items-center gap-4">
                        My Production Queue
                        {debugCount !== null && (
                            <span className="text-xs bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full font-black tracking-widest">
                                {debugCount} ASSIGNED
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 font-medium">Track your active tasks and manage delivery benchmarks.</p>
                </div>

                <div className="mb-10 group animate-slide-up [animation-delay:200ms]">
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by job name or instructions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-aesthetic pl-14 h-16 bg-white shadow-sm w-full"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10 animate-slide-up [animation-delay:400ms]">
                    {paginatedJobs.map((job) => (
                        <div key={job.id} className={`card-aesthetic group relative bg-white border-l-8 ${job.status === 'COMPLETED' ? 'border-l-emerald-500' :
                            job.status === 'IN_PROGRESS' ? 'border-l-indigo-600' : 'border-l-slate-200'
                            }`}>
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                                <div className="flex-1">
                                    <div className="mb-6">
                                        <div className="flex flex-wrap items-center gap-4 mb-2">
                                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight font-heading">{job.service?.name || 'Manual Project'}</h3>
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                job.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                }`}>
                                                {job.status}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-lg font-medium leading-relaxed max-w-2xl bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Mission Brief / Description</span>
                                            {job.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                <Building2 size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Studio</p>
                                                <p className="font-bold text-slate-700 text-sm">{job.vendor?.studio_name || 'Individual'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Due Date</p>
                                                <p className="font-bold text-slate-700 text-sm">{new Date(job.job_due_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-400">
                                                <ExternalLink size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Raw Files</p>
                                                {job.data_location ? (
                                                    <a href={job.data_location} target="_blank" className="text-indigo-600 font-bold text-sm hover:underline">View Intel</a>
                                                ) : (
                                                    <p className="text-slate-400 font-bold text-sm italic">Not provided</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 min-w-[240px]">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 ml-1">Update Status</p>
                                            <AestheticSelect
                                                options={[
                                                    { id: 'PENDING', name: 'PENDING' },
                                                    { id: 'IN_PROGRESS', name: 'IN PROGRESS' },
                                                    { id: 'COMPLETED', name: 'COMPLETED' }
                                                ]}
                                                value={job.status}
                                                disabled={actionLoading === job.id}
                                                onChange={(val) => handleUpdateStatus(job.id, val)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredJobs.length === 0 && (
                        <div className="text-center py-40 animate-pulse">
                            <CheckCircle2 size={72} className="mx-auto text-slate-100 mb-8" />
                            <h2 className="text-3xl font-black text-slate-200 uppercase tracking-[0.2em] font-heading">Clear Skies</h2>
                            <p className="text-slate-400 mt-4 text-sm font-bold uppercase tracking-widest">No assigned benchmarks in your production roster.</p>
                        </div>
                    )}

                    {paginatedJobs.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
