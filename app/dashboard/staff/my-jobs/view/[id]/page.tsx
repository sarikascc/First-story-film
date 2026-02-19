"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Building2,
  User,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Zap,
  MapPin,
  FileText,
  ExternalLink,
} from "lucide-react";
import Spinner from "@/components/Spinner";

export default function StaffJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);

  const fetchJob = async () => {
    try {
      const { data, error } = await (supabase.from("jobs") as any)
        .select(
          `
                    *,
                    service:services(name),
                    vendor:vendors(studio_name, contact_person, mobile),
                    staff:users!staff_id(name)
                `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === "IN_PROGRESS" && !job.started_at) {
        updates.started_at = new Date().toISOString();
      }
      if (newStatus === "COMPLETED") {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await (supabase.from("jobs") as any)
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      fetchJob();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) return <Spinner className="py-24" />;
  if (!job)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9] lg:ml-[var(--sidebar-offset)]">
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">
          Job assignment not found
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-indigo-600 font-bold flex items-center text-[10px] uppercase"
        >
          <ArrowLeft size={16} className="mr-2" /> Go Back
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 lg:ml-[var(--sidebar-offset)]">
      <div className="w-full px-4 py-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 space-y-4">
          <button
            onClick={() => router.back()}
            className="group flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all shadow-sm">
              <ArrowLeft size={12} />
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest">
              Back to my jobs
            </span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50">
                <ClipboardList size={28} className="text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center space-x-4 mb-1">
                  <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">
                    {job.service?.name}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                      job.status === "COMPLETED"
                        ? "bg-emerald-500 text-white border-emerald-600"
                        : job.status === "PENDING"
                          ? "bg-amber-400 text-white border-amber-500"
                          : "bg-indigo-600 text-white border-indigo-700"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                  <Building2 size={12} className="mr-2 text-indigo-400" />
                  {job.vendor?.studio_name}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Master Job Detail Card */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          {/* Masthead Status */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
                Production Status
              </h2>
              <div className="bg-white p-1 rounded-2xl flex items-center shadow-inner border border-slate-200 w-fit">
                <button
                  onClick={() => handleStatusUpdate("PENDING")}
                  className={`py-2 px-6 flex items-center justify-center rounded-xl transition-all space-x-2 ${job.status === "PENDING" ? "bg-amber-400 text-white shadow-lg" : "hover:bg-slate-50 text-slate-500 font-bold"}`}
                >
                  <Clock size={14} />
                  <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                    Pending
                  </span>
                </button>
                <button
                  onClick={() => handleStatusUpdate("IN_PROGRESS")}
                  className={`py-2 px-6 flex items-center justify-center rounded-xl transition-all space-x-2 ${job.status === "IN_PROGRESS" ? "bg-indigo-600 text-white shadow-lg" : "hover:bg-slate-50 text-slate-500 font-bold"}`}
                >
                  <Zap size={14} />
                  <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                    In-Progress
                  </span>
                </button>
                <button
                  onClick={() => handleStatusUpdate("COMPLETED")}
                  className={`py-2 px-6 flex items-center justify-center rounded-xl transition-all space-x-2 ${job.status === "COMPLETED" ? "bg-emerald-500 text-white shadow-lg" : "hover:bg-slate-50 text-slate-500 font-bold"}`}
                >
                  <CheckCircle2 size={14} />
                  <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                    Complete
                  </span>
                </button>
              </div>
            </div>

            <div className="md:text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                Production Deadline
              </p>
              <p className="text-xl font-black text-rose-600 font-mono tracking-tight">
                {new Date(job.job_due_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                <FileText size={16} className="mr-2 text-indigo-500" />
                Work Description
              </h3>
              <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-100/50">
                <p className="text-lg font-bold text-slate-800 leading-relaxed italic whitespace-pre-wrap break-words overflow-wrap-anywhere">
                  {job.description || "No description provided."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-indigo-500 pl-4">
                  General Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Assigned To
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                        <User size={12} />
                      </div>
                      <p className="text-sm font-bold text-slate-700">
                        {job.staff?.name}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Studio Contact
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                        <Building2 size={12} />
                      </div>
                      <p className="text-sm font-bold text-slate-700">
                        {job.vendor?.contact_person}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-emerald-500 pl-4">
                  Location
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-4 p-4 bg-slate-50/80 rounded-2xl group transition-all hover:bg-slate-100 border border-slate-100/50">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors shadow-sm shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div className="flex flex-col overflow-hidden min-w-0">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        Source location
                      </span>
                      <span className="text-sm font-bold text-slate-900 break-words whitespace-pre-wrap overflow-wrap-anywhere">
                        {job.data_location || "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/20 group transition-all hover:bg-indigo-50">
                    <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                      <ExternalLink size={18} />
                    </div>
                    <div className="flex flex-col overflow-hidden min-w-0">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                        Output location
                      </span>
                      <span className="text-sm font-bold text-indigo-900 break-words whitespace-pre-wrap overflow-wrap-anywhere">
                        {job.final_location || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
