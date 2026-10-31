"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

type EnquiryStatus = "NEW" | "CONTACTED" | "CLOSED";

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  pincode: string; // City / Area
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
}

const REASON_OPTIONS = [
  "Laptop",
  "Desktop",
  "Servicing",
  "Query",
  "Upgrade",
  "OS Installation",
  "Problem Resolution",
  "Others",
];

export default function AdminEnquiryDashboard() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Selection & UI State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [activeModalEnquiry, setActiveModalEnquiry] = useState<Enquiry | null>(null);

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch enquiries with active filters and pagination
  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const params: Record<string, any> = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (serviceFilter) params.service = serviceFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const res = await api.get("/admin/enquiries", { params });
      
      const records = res.data?.enquiries || res.data?.inquiries || [];
      setEnquiries(records);
      setTotal(res.data?.total ?? 0);
      setTotalPages(res.data?.totalPages ?? 1);
      setSelectedIds([]);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to load enquiries.");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, statusFilter, serviceFilter, fromDate, toDate]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Reset all filters to default state
  const handleResetFilters = () => {
    setStatusFilter("");
    setServiceFilter("");
    setFromDate("");
    setToDate("");
    setLimit(20);
    setPage(1);
  };

  // Bulk status update
  const handleBulkStatusUpdate = async (status: EnquiryStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await api.patch("/admin/enquiries", {
        ids: selectedIds,
        status: status,
      });
      fetchEnquiries();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to update statuses.");
    }
  };

  // Delete modal triggers
  const promptBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setIdsToDelete(selectedIds);
    setIsDeleteModalOpen(true);
  };

  const promptSingleDelete = (id: string) => {
    setIdsToDelete([id]);
    setIsDeleteModalOpen(true);
  };

  // Execute deletion
  const confirmDelete = async () => {
    if (idsToDelete.length === 0) return;
    setIsDeleting(true);
    try {
      await api.delete("/admin/enquiries", {
        data: { ids: idsToDelete },
      });
      setIsDeleteModalOpen(false);
      setIdsToDelete([]);
      if (activeModalEnquiry && idsToDelete.includes(activeModalEnquiry.id)) {
        setActiveModalEnquiry(null);
      }
      fetchEnquiries();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to delete enquiries.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Individual status update
  const handleSingleStatusUpdate = async (id: string, status: EnquiryStatus) => {
    try {
      await api.patch("/admin/enquiries", {
        ids: [id],
        status: status,
      });
      setEnquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
      if (activeModalEnquiry && activeModalEnquiry.id === id) {
        setActiveModalEnquiry((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to update status.");
    }
  };

  // Selection helpers
  const toggleSelectAll = () => {
    if (selectedIds.length === enquiries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(enquiries.map((e) => e.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Client-side CSV export
  const exportToCSV = () => {
    if (enquiries.length === 0) {
      setErrorMsg("No data available to export.");
      return;
    }

    const headers = [
      "Customer",
      "Phone",
      "Email",
      "Reason",
      "City/Area",
      "Message",
      "Status",
      "Date",
    ];

    const rows = enquiries.map((item) => [
      `"${item.name.replace(/"/g, '""')}"`,
      `"+91 ${item.phone}"`,
      `"${item.email || ""}"`,
      `"${item.service || ""}"`,
      `"${(item.pincode || "").replace(/"/g, '""')}"`,
      `"${item.message.replace(/"/g, '""').replace(/\n/g, " ")}"`,
      `"${item.status}"`,
      `"${new Date(item.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `enquiries_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: EnquiryStatus) => {
    switch (status) {
      case "NEW":
        return "bg-cyan-950/80 text-cyan-400 border border-cyan-500/40";
      case "CONTACTED":
        return "bg-amber-950/80 text-amber-400 border border-amber-500/40";
      case "CLOSED":
        return "bg-slate-800 text-slate-400 border border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              Enquiries
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              TOTAL RECORDS: <span className="text-cyan-400 font-semibold">{total}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="px-3.5 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>↓ Export CSV</span>
            </button>
            <button
              onClick={() => fetchEnquiries()}
              className="px-3.5 py-1.5 text-xs font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {["", "NEW", "CONTACTED", "CLOSED"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    statusFilter === s
                      ? "bg-cyan-500 text-slate-950 font-semibold"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {s === "" ? "ALL STATUSES" : s}
                </button>
              ))}
            </div>

            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              ✕ Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/60">
            {/* Reason Filter */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                Reason
              </label>
              <select
                value={serviceFilter}
                onChange={(e) => {
                  setServiceFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="">All Reasons</option>
                {REASON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 [color-scheme:dark] cursor-pointer"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 [color-scheme:dark] cursor-pointer"
              />
            </div>

            {/* Rows Per Page */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                Rows Per Page
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg text-xs text-red-300 font-mono flex items-center justify-between">
            <span>[ERROR] {errorMsg}</span>
            <button
              onClick={() => setErrorMsg("")}
              className="text-red-400 hover:text-red-200 font-bold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Bulk Action Strip */}
        {selectedIds.length > 0 && (
          <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-mono text-cyan-300">
              {selectedIds.length} item(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusUpdate("NEW")}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 cursor-pointer transition-colors"
              >
                Mark NEW
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("CONTACTED")}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 cursor-pointer transition-colors"
              >
                Mark CONTACTED
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("CLOSED")}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
              >
                Mark CLOSED
              </button>
              <button
                onClick={promptBulkDelete}
                className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 cursor-pointer transition-colors"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Table View */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        enquiries.length > 0 && selectedIds.length === enquiries.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-700 bg-slate-900 accent-cyan-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3 w-[18%]">Customer</th>
                  <th className="p-3 w-[20%]">Contact</th>
                  <th className="p-3 w-[16%]">Reason</th>
                  <th className="p-3 w-[12%]">City/Area</th>
                  <th className="p-3 w-[12%]">Status</th>
                  <th className="p-3 w-[10%]">Date</th>
                  <th className="p-3 w-[12%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                      Loading enquiries...
                    </td>
                  </tr>
                ) : enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-default"
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectOne(item.id)}
                          className="rounded border-slate-700 bg-slate-900 accent-cyan-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-3">
                        <div
                          onClick={() => setActiveModalEnquiry(item)}
                          className="font-medium text-slate-100 hover:text-cyan-400 cursor-pointer truncate"
                          title={item.name}
                        >
                          {item.name}
                        </div>
                      </td>

                      <td className="p-3 font-mono text-slate-300">
                        <div>+91 {item.phone}</div>
                        {item.email && (
                          <div className="text-[11px] text-slate-500 truncate" title={item.email}>
                            {item.email}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          title={item.service}
                          className="inline-block max-w-full truncate px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700 align-middle"
                        >
                          {item.service}
                        </span>
                      </td>

                      <td className="p-3 text-slate-400 truncate" title={item.pincode || "—"}>
                        {item.pincode || "—"}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="p-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-3 text-right whitespace-nowrap align-middle">
                        <button
                          type="button"
                          onClick={() => setActiveModalEnquiry(item)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page <span className="text-slate-200 font-mono">{page}</span> of{" "}
              <span className="text-slate-200 font-mono">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Inspection Modal */}
        {activeModalEnquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-semibold text-white text-base">
                  {activeModalEnquiry.name}
                </h3>
                <button
                  onClick={() => setActiveModalEnquiry(null)}
                  className="text-slate-400 hover:text-white text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-mono block">Phone</span>
                  <span className="text-slate-200 font-mono">+91 {activeModalEnquiry.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block">Email</span>
                  <span className="text-slate-200">{activeModalEnquiry.email || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block">Reason</span>
                  <span className="text-slate-200">{activeModalEnquiry.service}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block">City / Area</span>
                  <span className="text-slate-200">{activeModalEnquiry.pincode || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block">Submitted At</span>
                  <span className="text-slate-300 font-mono">
                    {new Date(activeModalEnquiry.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block mb-1">Status</span>
                  <select
                    value={activeModalEnquiry.status}
                    onChange={(e) =>
                      handleSingleStatusUpdate(
                        activeModalEnquiry.id,
                        e.target.value as EnquiryStatus
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-mono text-xs block mb-1">
                  Customer Message:
                </span>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {activeModalEnquiry.message}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => promptSingleDelete(activeModalEnquiry.id)}
                  className="px-3 py-1.5 bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-xs text-red-300 rounded cursor-pointer transition-colors"
                >
                  Delete Enquiry
                </button>
                <button
                  onClick={() => setActiveModalEnquiry(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    Confirm Deletion
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed font-mono">
                Permanently remove{" "}
                <span className="text-red-400 font-bold">
                  {idsToDelete.length}
                </span>{" "}
                enquiry record{idsToDelete.length > 1 ? "s" : ""}?
              </p>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800/80">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setIdsToDelete([]);
                  }}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs text-slate-300 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-red-950 disabled:text-red-400 text-xs text-white font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}