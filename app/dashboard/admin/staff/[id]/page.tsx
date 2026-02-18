"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Smartphone,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Percent,
  ExternalLink,
  X,
  Eye,
  AlertCircle,
  Zap,
  ClipboardList,
  Clock,
  MapPin,
  FileText,
  Edit2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { User, Service } from "@/types/database";
import Badge from "@/components/Badge";
import Tooltip from "@/components/Tooltip";
import StaffForm from "@/components/StaffForm";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "USER" as "ADMIN" | "MANAGER" | "USER",
  });
  const [editCommissions, setEditCommissions] = useState<
    { serviceId: string; percentage: number }[]
  >([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    totalEarnt: 0,
  });
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStatusUpdate = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await (supabase.from("jobs") as any)
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          completed_at:
            newStatus === "COMPLETED" ? new Date().toISOString() : undefined,
          started_at:
            newStatus === "IN_PROGRESS" ? new Date().toISOString() : undefined,
        })
        .eq("id", jobId);

      if (error) throw error;

      const statusLabels: { [key: string]: string } = {
        PENDING: "Pending",
        IN_PROGRESS: "In Progress",
        COMPLETED: "Complete",
      };
      showNotification(statusLabels[newStatus] || newStatus);

      // Update local state
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)),
      );
      if (selectedJob?.id === jobId) {
        setSelectedJob((prev: any) =>
          prev ? { ...prev, status: newStatus } : null,
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showNotification("Failed to update status", "error");
    }
  };

  const fetchData = async () => {
    try {
      // Fetch User
      const { data: userData, error: userError } = await (
        supabase.from("users") as any
      )
        .select("*")
        .eq("id", id)
        .single();

      if (userError) throw userError;
      setUser(userData);

      // Fetch Commissions
      const { data: commData, error: commError } = await (
        supabase.from("staff_service_configs") as any
      )
        .select("*, services(name)")
        .eq("staff_id", id);

      if (commError) throw commError;
      setCommissions(commData || []);

      // Fetch Jobs
      const { data: jobsData, error: jobsError } = await (
        supabase.from("jobs") as any
      )
        .select(
          "*, services(name), vendors(id, studio_name, contact_person, mobile, email)",
        )
        .eq("staff_id", id)
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

      // Calculate Stats
      const completed = (jobsData || []).filter(
        (j: any) => j.status === "COMPLETED",
      );
      const totalComm = completed.reduce(
        (sum: number, j: any) => sum + Number(j.commission_amount || 0),
        0,
      );

      setStats({
        totalJobs: (jobsData || []).length,
        completedJobs: completed.length,
        totalEarnt: totalComm,
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("name");
        if (!error && data) setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] lg:ml-[var(--sidebar-offset)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  if (!user)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9] lg:ml-[var(--sidebar-offset)]">
        <p className="text-gray-500 font-medium text-sm">User not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-indigo-600 font-medium flex items-center text-sm hover:text-indigo-700"
        >
          <ArrowLeft size={16} className="mr-2" /> Go Back
        </button>
      </div>
    );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "rose";
      case "MANAGER":
        return "amber";
      case "USER":
      default:
        return "indigo";
    }
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const getStatusColor = (status: string) => {
    if (status === "COMPLETED") return "emerald";
    if (status === "PENDING") return "amber";
    return "indigo";
  };

  const getStatusLabel = (status: string) => {
    if (status === "IN_PROGRESS") return "In Progress";
    if (status === "COMPLETED") return "Complete";
    return "Pending";
  };

  const handleOpenEditModal = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      password: "",
      role: (user.role || "USER") as "ADMIN" | "MANAGER" | "USER",
    });
    setEditCommissions(
      (commissions || []).map((comm) => ({
        serviceId: comm.service_id,
        percentage: Number(comm.commission_percent ?? comm.percentage ?? 0),
      })),
    );
    setShowPasswordField(false);
    setShowEditModal(true);
  };

  const handleAddCommission = () => {
    setEditCommissions([...editCommissions, { serviceId: "", percentage: 0 }]);
  };

  const handleRemoveCommission = (index: number) => {
    const next = [...editCommissions];
    next.splice(index, 1);
    setEditCommissions(next);
  };

  const updateCommission = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const next = [...editCommissions];
    if (field === "serviceId") next[index].serviceId = value as string;
    if (field === "percentage") next[index].percentage = Number(value);
    setEditCommissions(next);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updateResponse = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          role: formData.role,
          password: formData.password || undefined,
        }),
      });

      if (!updateResponse.ok) {
        const result = await updateResponse.json();
        throw new Error(result.error || "Failed to update user");
      }

      await supabase.from("staff_service_configs").delete().eq("staff_id", id);

      if (formData.role === "USER" && editCommissions.length > 0) {
        const validCommissions = editCommissions
          .filter((c) => c.serviceId !== "")
          .map((c) => ({
            staff_id: id,
            service_id: c.serviceId,
            percentage: c.percentage,
          }));

        if (validCommissions.length > 0) {
          const { error: commError } = await (
            supabase.from("staff_service_configs") as any
          ).insert(validCommissions);
          if (commError) throw commError;
        }
      }

      setShowEditModal(false);
      showNotification("User updated successfully");
      fetchData();
    } catch (error: any) {
      console.error("Error updating user:", error);
      showNotification(
        error.message || "Error occurred while updating user.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 lg:ml-[var(--sidebar-offset)]">
      <div className="w-full px-4 py-6 lg:px-6">
        {/* Header Section */}
        <div className="mb-2 space-y-2">
          <button
            onClick={() => router.back()}
            className="group flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
              <ArrowLeft size={14} />
            </div>
            <span className="text-sm font-medium">Back to Staff</span>
          </button>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2 flex-1">
                <div className="w-8 h-8 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-center">
                  <UserIcon size={18} className="text-indigo-600" />
                </div>
                <div className="flex-1 justify-center">
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user.name}
                    </h1>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail size={14} className="mr-2 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Smartphone size={14} className="mr-2 text-gray-400" />
                      <span>{user.mobile || "Not provided"}</span>
                    </div>
                    <div className="flex items-center">
                      <Badge color={getRoleColor(user.role) as any}>
                        {formatRole(user.role)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <Tooltip text="Edit Staff">
                <button
                  onClick={handleOpenEditModal}
                  className="ml-4 w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shrink-0"
                  title="Edit Staff"
                >
                  <Edit2 size={16} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Combined Information Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Commission Settings Section */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <Percent size={14} className="mr-2 text-gray-500" />
              Commission Settings
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Service</th>
                    <th className="px-4 py-3 w-32 font-semibold">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {commissions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-8 text-center text-gray-500 italic"
                      >
                        No commission settings configured.
                      </td>
                    </tr>
                  ) : (
                    commissions.map((comm) => (
                      <tr
                        key={comm.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {comm.services?.name}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                            {comm.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Job History Section */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">
              Job History
            </h2>
            <div className="bg-indigo-600 px-3 py-1 rounded-md text-white text-xs font-medium">
              {jobs.length} Jobs
            </div>
          </div>

          <div className="flex-1">
            {jobs.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <ClipboardList size={20} />
                </div>
                <p className="text-sm text-gray-500">
                  No jobs assigned to this staff member yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto custom-scrollbar">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => {
                      setSelectedJob({ ...job, staff: user });
                      setShowViewModal(true);
                    }}
                    className="px-4 py-3 hover:bg-gray-50 transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-md flex items-center justify-center border transition-all ${
                          job.status === "COMPLETED"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                            : job.status === "PENDING"
                              ? "bg-amber-50 border-amber-200 text-amber-600"
                              : "bg-indigo-50 border-indigo-200 text-indigo-600"
                        }`}
                      >
                        {job.status === "COMPLETED" ? (
                          <CheckCircle2 size={16} />
                        ) : job.status === "PENDING" ? (
                          <Clock size={16} />
                        ) : (
                          <Zap size={16} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {job.services?.name}
                          </p>
                          <Badge color={getStatusColor(job.status) as any}>
                            {getStatusLabel(job.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {new Date(job.job_due_date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                          <span className="text-gray-300">•</span>
                          <div
                            className="flex items-center hover:text-indigo-600 transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (job.vendor_id)
                                router.push(
                                  `/dashboard/admin/vendors/view/${job.vendor_id}`,
                                );
                            }}
                          >
                            <Building2 size={12} className="mr-1" />
                            {job.vendors?.studio_name || "Unknown Studio"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right mr-3 hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(job.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Comm: {formatCurrency(job.commission_amount)}
                        </p>
                      </div>
                      <Tooltip text="View Details" position="left">
                        <button
                          className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedJob && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setShowViewModal(false)}
          />
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                  <ClipboardList size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 leading-none mb-1">
                    {selectedJob.services?.name}
                  </h2>
                  <div className="flex items-center text-xs text-gray-500">
                    <Building2 size={12} className="mr-1.5 text-gray-400" />
                    {selectedJob.vendors?.studio_name}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 rounded-md transition-all"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Side */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        General Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                          <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                            <UserIcon size={16} />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-medium text-gray-600">
                              Assigned To
                            </span>
                            <span className="text-sm font-normal text-gray-900 truncate">
                              {selectedJob.staff?.name || "Unassigned"}
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
                                {selectedJob.vendors?.contact_person || "N/A"}
                              </span>
                              {selectedJob.vendors?.email && (
                                <span className="text-xs text-gray-600 leading-none mt-0.5">
                                  {selectedJob.vendors?.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <FileText size={14} className="mr-2 text-indigo-500" />
                        Work Description
                      </h3>
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-sm font-normal text-gray-900 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                          {selectedJob.description ||
                            "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        Location
                      </h3>
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
                              {selectedJob.data_location || "Pending"}
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
                              {selectedJob.final_location || "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side (Financials & Date) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-gray-50 rounded-md border border-gray-200 p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Production Status
                      </h3>
                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            handleStatusUpdate(selectedJob.id, "PENDING")
                          }
                          className={`w-full py-2 px-4 flex items-center justify-center rounded-md transition-all space-x-2 border ${selectedJob.status === "PENDING" ? "bg-amber-400 text-white border-amber-500" : "bg-white text-gray-600 border-gray-300"}`}
                        >
                          <Clock size={12} />
                          <span className="text-xs font-medium">Pending</span>
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(selectedJob.id, "IN_PROGRESS")
                          }
                          className={`w-full py-2 px-4 flex items-center justify-center rounded-md transition-all space-x-2 border ${selectedJob.status === "IN_PROGRESS" ? "bg-indigo-600 text-white border-indigo-700" : "bg-white text-gray-600 border-gray-300"}`}
                        >
                          <Zap size={12} />
                          <span className="text-xs font-medium">
                            In-Progress
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(selectedJob.id, "COMPLETED")
                          }
                          className={`w-full py-2 px-4 flex items-center justify-center rounded-md transition-all space-x-2 border ${selectedJob.status === "COMPLETED" ? "bg-emerald-500 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-300"}`}
                        >
                          <CheckCircle2 size={12} />
                          <span className="text-xs font-medium">Complete</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Production Deadline
                      </p>
                      <div className="flex items-center space-x-2">
                        <Calendar className="text-rose-500" size={14} />
                        <p className="text-base font-medium text-rose-600">
                          {new Date(
                            selectedJob.job_due_date,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200 space-y-2">
                      <h3 className="text-xs font-medium text-gray-600 mb-2">
                        Financial Summary
                      </h3>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xl font-medium text-gray-900">
                            {formatCurrency(selectedJob.amount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-600 mb-0.5">
                            Commission
                          </p>
                          <div className="inline-flex items-center px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md border border-rose-100 text-xs font-medium">
                            +{formatCurrency(selectedJob.commission_amount)}
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">
                          Total Invoice
                        </span>
                        <span className="text-base font-semibold text-gray-900">
                          {formatCurrency(Number(selectedJob.amount || 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <StaffForm
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateUser}
        modalMode="edit"
        showPasswordField={showPasswordField}
        onShowPasswordField={() => setShowPasswordField(true)}
        formData={formData}
        setFormData={setFormData}
        services={services}
        commissions={editCommissions}
        onAddCommission={handleAddCommission}
        onRemoveCommission={handleRemoveCommission}
        onUpdateCommission={updateCommission}
        submitting={submitting}
      />

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed bottom-8 right-8 z-[100] flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-500 animate-in slide-in-from-bottom-10 ${notification.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}
    </div>
  );
}
