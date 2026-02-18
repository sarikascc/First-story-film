"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  User,
  Smartphone,
  Mail,
  MapPin,
  CheckCircle,
  Eye,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Vendor } from "@/types/database";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import Tooltip from "@/components/Tooltip";
import VendorForm from "@/components/VendorForm";
import ConfirmationDialog from "@/components/ConfirmationDialog";

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10;
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const [formData, setFormData] = useState({
    studio_name: "",
    contact_person: "",
    mobile: "",
    email: "",
    location: "",
    notes: "",
  });

  // Single initialization effect
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        if (!mounted) return;
        await fetchVendors();
      } catch (error) {
        console.error("VendorsPage: Error initializing:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // REMOVED: Tab visibility change handler
    // User doesn't want data to refresh when switching tabs

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // Re-fetch when pagination or search changes
  useEffect(() => {
    // Skip initial render (handled by init effect above)
    if (loading) return;

    setLoading(true);
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const fetchVendors = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error("No active session");
        return;
      }

      const response = await fetch(
        `/api/vendors?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch vendors");
      }
      const result = await response.json();
      setVendors(result.data || []);
      setTotalCount(result.count || 0);

      console.log("✅ Vendors fetched successfully:", {
        count: result.data?.length || 0,
        totalCount: result.count,
      });
    } catch (error: unknown) {
      console.error("❌ Error fetching vendors:", error);
      const message =
        error instanceof Error ? error.message : "Failed to fetch vendors";
      showNotification(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session");
      }

      if (editingVendor) {
        // Update existing vendor
        const response = await fetch(`/api/vendors/${editingVendor.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update vendor");
        }

        showNotification("Vendor updated successfully!");
      } else {
        // Create new vendor
        const response = await fetch("/api/vendors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create vendor");
        }

        showNotification("Vendor created successfully!");
      }

      setShowModal(false);
      resetForm();
      setLoading(false);
      fetchVendors();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while saving.";
      console.error("Error saving vendor:", error);
      showNotification(message, "error");
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No active session");
      }

      const response = await fetch(`/api/vendors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete vendor");
      }

      showNotification("Vendor deleted successfully");
      fetchVendors();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error deleting vendor";
      console.error("Error deleting vendor:", error);
      showNotification(message, "error");
    }
  };

  const openDeleteDialog = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setShowDeleteDialog(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      studio_name: vendor.studio_name,
      contact_person: vendor.contact_person,
      mobile: vendor.mobile,
      email: vendor.email || "",
      location: vendor.location || "",
      notes: vendor.notes || "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingVendor(null);
    setFormData({
      studio_name: "",
      contact_person: "",
      mobile: "",
      email: "",
      location: "",
      notes: "",
    });
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const paginatedVendors = vendors;

  // Reset to page 1 when search term changes (handled by useEffect above)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 lg:ml-[var(--sidebar-offset)]">
      <div className="w-full px-2 py-4 lg:px-4 lg:py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 px-2">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black">
                Vendors & Studios
              </h1>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-5 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center space-x-2 shrink-0"
          >
            <Plus size={14} />
            <span>Add Vendor</span>
          </button>
        </div>

        {/* Main Operations Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Toolbar Inside Card */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-[320px] group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors"
                size={14}
              />
              <input
                type="text"
                placeholder="Search by studio or contact name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 h-9 bg-white border border-gray-300 rounded-lg text-sm font-normal focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Table */}
          <Table
            columns={[
              { key: "studio_name", header: "Studio Name", align: "left" },
              { key: "location", header: "Location", align: "left" },
              {
                key: "contact_person",
                header: "Contact Person",
                align: "left",
              },
              { key: "contact_info", header: "Contact Info", align: "left" },
              { key: "actions", header: "Actions", align: "right" },
            ]}
            data={paginatedVendors}
            loading={loading}
            emptyIcon={<Building2 size={28} className="text-slate-200" />}
            emptyMessage="No vendors found"
            onRowClick={(vendor) =>
              router.push(`/dashboard/admin/vendors/view/${vendor.id}`)
            }
            renderCell={(column, vendor, vIdx) => {
              if (column.key === "studio_name") {
                return (
                  <div className="font-bold group-hover/row:text-indigo-600 transition-colors flex items-center">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${["bg-indigo-400", "bg-rose-400", "bg-amber-400", "bg-emerald-400"][vIdx % 4]} mr-3 opacity-0 group-hover/row:opacity-100 transition-all scale-0 group-hover/row:scale-100`}
                    />
                    {vendor.studio_name}
                  </div>
                );
              }
              if (column.key === "location") {
                return (
                  <div className="flex items-center">
                    <MapPin className="w-4 mr-2 text-sky-400" />
                    {vendor.location || "N/A"}
                  </div>
                );
              }
              if (column.key === "contact_person") {
                return (
                  <div className="flex items-center">
                    <User className="w-4 mr-2 text-amber-500" />
                    {vendor.contact_person}
                  </div>
                );
              }
              if (column.key === "contact_info") {
                return (
                  <div className="flex flex-col space-y-0.5">
                    <div className="flex items-center">
                      <Smartphone className="w-4 mr-2 text-sky-400" />
                      {vendor.mobile}
                    </div>
                    {vendor.email && (
                      <div className="flex items-center pl-6">
                        {/* <Mail className=" mr-2 text-blue-400" /> */}
                        {vendor.email}
                      </div>
                    )}
                  </div>
                );
              }
              if (column.key === "actions") {
                return (
                  <div
                    className="flex items-center justify-end space-x-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip text="View Details">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/admin/vendors/view/${vendor.id}`,
                          )
                        }
                        className="w-7 h-7 flex items-center justify-center text-indigo-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100 shadow-sm"
                      >
                        <Eye size={13} />
                      </button>
                    </Tooltip>
                    <Tooltip text="Edit">
                      <button
                        onClick={() => openEditModal(vendor)}
                        className="w-7 h-7 flex items-center justify-center text-sky-400 hover:text-sky-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100 shadow-sm"
                      >
                        <Edit2 size={13} />
                      </button>
                    </Tooltip>
                    <Tooltip text="Delete">
                      <button
                        onClick={() => openDeleteDialog(vendor)}
                        className="w-7 h-7 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100 shadow-sm"
                      >
                        <Trash2 size={13} />
                      </button>
                    </Tooltip>
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Pagination Container */}
          <div className="p-4 border-t border-slate-50 bg-slate-50/20">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <VendorForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingVendor}
      />
      <ConfirmationDialog
        open={showDeleteDialog}
        title="Delete vendor"
        message={
          <span>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{vendorToDelete?.studio_name}</span>
            ?
          </span>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (vendorToDelete) {
            handleDelete(vendorToDelete.id);
          }
          setShowDeleteDialog(false);
          setVendorToDelete(null);
        }}
        onCancel={() => {
          setShowDeleteDialog(false);
          setVendorToDelete(null);
        }}
      />
      {/* Proper Notification Toast */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center space-x-3 px-6 py-3 rounded-2xl shadow-2xl border ${
              notification.type === "success"
                ? "bg-emerald-500 border-emerald-400 text-white"
                : "bg-rose-500 border-rose-400 text-white"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle size={18} className="text-white" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">
                !
              </div>
            )}
            <p className="text-[11px] font-black uppercase tracking-widest">
              {notification.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
