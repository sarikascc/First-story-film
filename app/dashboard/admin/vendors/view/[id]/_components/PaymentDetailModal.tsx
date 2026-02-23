"use client";

import { X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any | null; // the clicked payment row
  payments: any[]; // all payments (to group by payment_number)
  savedInvoices: any[];
  vendor: any;
}

export default function PaymentDetailModal({
  isOpen,
  onClose,
  payment,
  payments,
  savedInvoices,
  vendor,
}: PaymentDetailModalProps) {
  if (!isOpen || !payment) return null;

  // Group all rows that share the same payment_number (or just this row if no number)
  const groupedRows = payment.payment_number
    ? payments.filter((p) => p.payment_number === payment.payment_number)
    : [payment];

  const totalAmount = groupedRows.reduce(
    (s, p) => s + Number(p.amount || 0),
    0,
  );

  return (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-black">
              Payment Details
            </h2>
            {payment.payment_number && (
              <p className="text-xs text-emerald-600 font-medium mt-0.5">
                {payment.payment_number}
              </p>
            )}
          </div>
          <button
            title="Close"
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {/* Vendor & Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TO */}
            <div className="bg-gray-50 rounded-md border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                To,
              </p>
              <p className="font-semibold text-gray-900 text-sm">
                {vendor.studio_name}
              </p>
              {vendor.contact_person && (
                <p className="text-xs text-gray-600 mt-0.5">
                  {vendor.contact_person}
                </p>
              )}
              {vendor.mobile && (
                <p className="text-xs text-gray-600">{vendor.mobile}</p>
              )}
              {vendor.email && (
                <p className="text-xs text-gray-600">{vendor.email}</p>
              )}
              {vendor.location && (
                <p className="text-xs text-gray-600">{vendor.location}</p>
              )}
            </div>

            {/* Payment Note */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Payment Note
              </p>
              <div className="w-full px-3 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700 min-h-[100px]">
                {payment.note ? (
                  <span>{payment.note}</span>
                ) : (
                  <span className="text-gray-400 italic">No note</span>
                )}
              </div>
            </div>
          </div>

          {/* Info bar */}
          <div className="flex items-center gap-6 text-sm text-gray-600 bg-gray-50 rounded-md border border-gray-200 px-4 py-2.5">
            {payment.payment_number && (
              <div>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Payment #
                </span>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {payment.payment_number}
                </p>
              </div>
            )}
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Date
              </span>
              <p className="font-medium text-gray-700 mt-0.5">
                {new Date(payment.payment_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Total Paid
              </span>
              <p className="font-semibold text-emerald-700 mt-0.5">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Invoices
              </span>
              <p className="font-medium text-gray-700 mt-0.5">
                {groupedRows.filter((r) => r.invoice_id).length}
              </p>
            </div>
          </div>

          {/* Invoices table */}
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Invoice #
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Invoice Total
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Amount Paid
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groupedRows.map((row) => {
                  const inv = savedInvoices.find(
                    (i) => i.id === row.invoice_id,
                  );
                  const invNum =
                    row.invoice?.invoice_number || inv?.invoice_number || null;
                  return (
                    <tr key={row.id} className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {invNum ? (
                          <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {invNum}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-xs">
                            No invoice linked
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">
                        {inv ? formatCurrency(inv.total_amount) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-gray-800 text-sm">
                          {formatCurrency(row.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td
                    className="px-4 py-3 text-sm font-bold text-gray-700"
                    colSpan={2}
                  >
                    Total
                  </td>
                  <td className="px-4 py-3 text-right text-base font-bold text-emerald-700">
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
