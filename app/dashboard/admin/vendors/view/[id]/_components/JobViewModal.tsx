"use client";

import {
  X,
  ClipboardList,
  Building2,
  User,
  FileText,
  MapPin,
  ExternalLink,
  Calendar,
  Zap,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface JobViewModalProps {
  isOpen: boolean;
  job: any;
  onClose: () => void;
  handleStatusUpdate: (jobId: string, status: string) => void;
}

export default function JobViewModal({
  isOpen,
  job,
  onClose,
  handleStatusUpdate,
}: JobViewModalProps) {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
              <ClipboardList size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 leading-none mb-1">
                {job.service?.name}
              </h2>
              <div className="flex items-center text-xs text-gray-500">
                <Building2 size={12} className="mr-1.5 text-gray-400" />
                {job.vendor?.studio_name}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 rounded-md transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left column */}
            <div className="lg:col-span-8 space-y-4">
              {/* General Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">
                  General Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                      <User size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-medium text-gray-600">
                        Assigned To
                      </span>
                      <span className="text-sm font-normal text-gray-900 truncate">
                        {job.staff?.name || "Unassigned"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                      <Building2 size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-medium text-gray-600">
                        Studio Contact
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-normal text-gray-900 truncate">
                          {job.vendor?.contact_person || "N/A"}
                        </span>
                        {job.vendor?.email && (
                          <span className="text-xs text-gray-600 leading-none mt-0.5">
                            {job.vendor?.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <FileText size={14} className="mr-2 text-indigo-500" />
                  Work Description
                </h3>
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-sm font-normal text-gray-900 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                    {job.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div className="flex flex-col min-w-0 pt-0.5">
                      <span className="text-xs font-medium text-gray-600 mb-1">
                        Job Data Location
                      </span>
                      <span className="text-sm font-normal text-gray-900 whitespace-pre-wrap leading-tight break-words overflow-wrap-anywhere">
                        {job.data_location || "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-md border border-indigo-200">
                    <div className="w-8 h-8 rounded-md bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                      <ExternalLink size={16} />
                    </div>
                    <div className="flex flex-col min-w-0 pt-0.5">
                      <span className="text-xs font-medium text-indigo-600 mb-1">
                        Job Final Location
                      </span>
                      <span className="text-sm font-normal text-indigo-900 whitespace-pre-wrap leading-tight break-words overflow-wrap-anywhere">
                        {job.final_location || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-gray-50 rounded-md border border-gray-200 p-4 space-y-3">
                {/* Status Buttons */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Production Status
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleStatusUpdate(job.id, "PENDING")}
                      className={`w-full py-2 px-4 flex items-center justify-center rounded-md transition-all space-x-2 border ${
                        job.status === "PENDING"
                          ? "bg-amber-400 text-white border-amber-500"
                          : "bg-white text-gray-600 border-gray-300"
                      }`}
                    >
                      <Clock size={12} />
                      <span className="text-xs font-medium">Pending</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(job.id, "IN_PROGRESS")}
                      className={`w-full py-2 px-4 flex items-center justify-center rounded-md transition-all space-x-2 border ${
                        job.status === "IN_PROGRESS"
                          ? "bg-indigo-600 text-white border-indigo-700"
                          : "bg-white text-gray-600 border-gray-300"
                      }`}
                    >
                      <Zap size={12} />
                      <span className="text-xs font-medium">In-Progress</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(job.id, "COMPLETED")}
                      className={`w-full py-2 px-4 flex items-center justify-center rounded-md transition-all space-x-2 border ${
                        job.status === "COMPLETED"
                          ? "bg-emerald-500 text-white border-emerald-600"
                          : "bg-white text-gray-600 border-gray-300"
                      }`}
                    >
                      <CheckCircle2 size={12} />
                      <span className="text-xs font-medium">Complete</span>
                    </button>
                  </div>
                </div>

                {/* Due Date */}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Production Deadline
                  </p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-rose-500" size={14} />
                    <p className="text-base font-medium text-rose-600">
                      {new Date(job.job_due_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <h3 className="text-xs font-medium text-gray-600 mb-2">
                    Financial Summary
                  </h3>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xl font-medium text-gray-900">
                        {formatCurrency(job.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-600 mb-0.5">
                        Commission
                      </p>
                      <div className="inline-flex items-center px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md border border-rose-100 text-xs font-medium">
                        -{formatCurrency(job.commission_amount)}
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">
                      Net Profit
                    </span>
                    <span className="text-base font-medium text-indigo-600">
                      {formatCurrency(
                        Number(job.amount || 0) -
                          Number(job.commission_amount || 0),
                      )}
                    </span>
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
