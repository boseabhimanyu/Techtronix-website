"use client";

import axios from "axios";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "@/lib/api";
import { useNotification } from "@/components/notifications/notification-provider";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  altEmail: string;
  phone: string;
  role: string;
  profilePic?: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  dateOfBirth?: string | null;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
  twoFactorEnabled: boolean;
};

type CustomerForm = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  altEmail: string;
  phone: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
};

const emptyCustomerForm: CustomerForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  altEmail: "",
  phone: "",
  dateOfBirth: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pinCode: "",
};

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error ??
      error.response?.data?.message ??
      fallback
    );
  }

  return fallback;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateForInput(
  value?: string | null,
) {
  if (!value) return "";

  const isoMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T/,
  );

  if (isoMatch) {
    const [, year, month, day] = isoMatch;

    return `${year}-${month}-${day}`;
  }

  const dmyMatch = value.match(
    /^(\d{2})-(\d{2})-(\d{4})$/,
  );

  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;

    return `${year}-${month}-${day}`;
  }

  return "";
}

function formatDateForApi(value: string) {
  if (!value) return "";

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  );

  if (!match) return "";

  const [, year, month, day] = match;

  return `${day}-${month}-${year}`;
}

function customerToForm(
  customer: Customer,
): CustomerForm {
  return {
    firstName: customer.firstName ?? "",
    lastName: customer.lastName ?? "",
    username: customer.username ?? "",
    email: customer.email ?? "",
    altEmail: customer.altEmail ?? "",
    phone: customer.phone ?? "",
    dateOfBirth: formatDateForInput(
      customer.dateOfBirth,
    ),
    addressLine1: customer.addressLine1 ?? "",
    addressLine2: customer.addressLine2 ?? "",
    city: customer.city ?? "",
    state: customer.state ?? "",
    pinCode: customer.pinCode ?? "",
  };
}

function CustomerField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-600">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-white/70 bg-white/60 px-3.5 text-sm text-zinc-900 outline-none backdrop-blur-xl transition focus:border-white focus:ring-2 focus:ring-white/70"
      />
    </label>
  );
}

export default function CustomersPage() {
  const { showNotification } =
    useNotification();

  const [customers, setCustomers] = useState<
    Customer[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [pageLoading, setPageLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | "true" | "false">(
      "all",
    );

  const [page, setPage] = useState(1);

  const [limit] = useState(20);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const [
    selectedCustomerId,
    setSelectedCustomerId,
  ] = useState<string | null>(null);

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState<Customer | null>(null);

  const [
    customerLoading,
    setCustomerLoading,
  ] = useState(false);

  const [
    customerForm,
    setCustomerForm,
  ] = useState<CustomerForm>(
    emptyCustomerForm,
  );

  const [
    detailsSaving,
    setDetailsSaving,
  ] = useState(false);

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    passwordSaving,
    setPasswordSaving,
  ] = useState(false);

  const [
    statusSaving,
    setStatusSaving,
  ] = useState(false);

  const [
    twoFactorResetting,
    setTwoFactorResetting,
  ] = useState(false);

  const [
    showAddCustomer,
    setShowAddCustomer,
  ] = useState(false);

  const [
    newCustomer,
    setNewCustomer,
  ] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    altEmail: "",
    phone: "",
    password: "",
  });

  const [
    addCustomerLoading,
    setAddCustomerLoading,
  ] = useState(false);

  const queryString = useMemo(() => {
    const params =
      new URLSearchParams();

    params.set(
      "page",
      String(page),
    );

    params.set(
      "limit",
      String(limit),
    );

    if (statusFilter !== "all") {
      params.set(
        "status",
        statusFilter,
      );
    }

    if (search.trim()) {
      params.set(
        "search",
        search.trim(),
      );
    }

    return params.toString();
  }, [
    page,
    limit,
    search,
    statusFilter,
  ]);

  async function loadCustomers() {
    try {
      if (customers.length === 0) {
        setLoading(true);
      } else {
        setPageLoading(true);
      }

      const response =
        await api.get(
          `/customers?${queryString}`,
        );

      setCustomers(
        response.data.customers ?? [],
      );

      const pagination =
        response.data.pagination;

      setTotal(
        pagination?.total ?? 0,
      );

      setTotalPages(
        pagination?.totalPages ?? 1,
      );
    } catch (error) {
      showNotification(
        getErrorMessage(
          error,
          "Unable to load customers",
        ),
        "error",
      );
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, [queryString]);

  async function openCustomer(
    customerId: string,
  ) {
    setSelectedCustomerId(
      customerId,
    );

    setSelectedCustomer(null);

    setCustomerLoading(true);

    try {
      const response =
        await api.get(
          `/customers/${customerId}`,
        );

      const customer: Customer =
        response.data.customer;

      setSelectedCustomer(
        customer,
      );

      setCustomerForm(
        customerToForm(customer),
      );
    } catch (error) {
      showNotification(
        getErrorMessage(
          error,
          "Unable to load customer details",
        ),
        "error",
      );
    } finally {
      setCustomerLoading(false);
    }
  }

  function closeCustomer() {
    setSelectedCustomerId(null);
    setSelectedCustomer(null);
    setNewPassword("");
  }

  async function handleUpdateDetails(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedCustomerId) {
      return;
    }

    setDetailsSaving(true);

    try {
      const response =
        await api.patch(
          `/customers/${selectedCustomerId}`,
          {
            ...customerForm,
            dateOfBirth:
              formatDateForApi(
                customerForm.dateOfBirth,
              ),
          },
        );

      const updatedCustomer: Customer =
        response.data.user;

      setSelectedCustomer(
        updatedCustomer,
      );

      setCustomerForm(
        customerToForm(
          updatedCustomer,
        ),
      );

      setCustomers((current) =>
        current.map(
          (customer) =>
            customer.id ===
            updatedCustomer.id
              ? updatedCustomer
              : customer,
        ),
      );

      showNotification(
        response.data.message ??
          "Customer updated successfully",
        "success",
      );
    } catch (error) {
      showNotification(
        getErrorMessage(
          error,
          "Unable to update customer",
        ),
        "error",
      );
    } finally {
      setDetailsSaving(false);
    }
  }

  async function handlePasswordUpdate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedCustomerId) {
      return;
    }

    setPasswordSaving(true);

    try {
      const response =
        await api.patch(
          `/customers/${selectedCustomerId}/password`,
          {
            newPassword,
          },
        );

      setNewPassword("");

      showNotification(
        response.data.message ??
          "Customer password changed successfully",
        "success",
      );
    } catch (error) {
      showNotification(
        getErrorMessage(
          error,
          "Unable to change customer password",
        ),
        "error",
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleStatusChange() {
    if (!selectedCustomer) {
      return;
    }

    setStatusSaving(true);

    const nextStatus =
      !selectedCustomer.status;

    try {
      const response =
        await api.patch(
          `/customers/${selectedCustomer.id}/status`,
          {
            status: nextStatus,
          },
        );

      setSelectedCustomer(
        (current) =>
          current
            ? {
                ...current,
                status:
                  response.data.status,
              }
            : current,
      );

      setCustomers((current) =>
        current.map(
          (customer) =>
            customer.id ===
            selectedCustomer.id
              ? {
                  ...customer,
                  status:
                    response.data.status,
                }
              : customer,
        ),
      );

      showNotification(
        response.data.message ??
          "Customer status updated successfully",
        "success",
      );
    } catch (error) {
      showNotification(
        getErrorMessage(
          error,
          "Unable to change customer status",
        ),
        "error",
      );
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleTwoFactorReset() {
    if (!selectedCustomer) {
      return;
    }

    setTwoFactorResetting(true);

    try {
      const response =
        await api.post(
          `/customers/${selectedCustomer.id}/2fa/reset`,
        );

      setSelectedCustomer(
        (current) =>
          current
            ? {
                ...current,
                twoFactorEnabled:
                  false,
              }
            : current,
      );

      setCustomers((current) =>
        current.map(
          (customer) =>
            customer.id ===
            selectedCustomer.id
              ? {
                  ...customer,
                  twoFactorEnabled:
                    false,
                }
              : customer,
        ),
      );

      showNotification(
        response.data.message ??
          "Two-factor authentication reset successfully",
        "success",
      );
    } catch (error) {
      showNotification(
        getErrorMessage(
          error,
          "Unable to reset two-factor authentication",
        ),
        "error",
      );
    } finally {
      setTwoFactorResetting(false);
    }
  }

  async function handleAddCustomer(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setAddCustomerLoading(true);

    try {
      const response =
        await api.post(
          "/customers",
          newCustomer,
        );

      setShowAddCustomer(false);

      setNewCustomer({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        altEmail: "",
        phone: "",
        password: "",
      });

      showNotification(
        response.data.message ??
          "Customer created successfully",
        "success",
      );

      setPage(1);

      await loadCustomers();
    } catch (error) {
      showNotification(
        getErrorMessage(
          error,
          "Unable to create customer",
        ),
        "error",
      );
    } finally {
      setAddCustomerLoading(false);
    }
  }

  function updateCustomerForm(
    field: keyof CustomerForm,
    value: string,
  ) {
    setCustomerForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateNewCustomer(
    field: keyof typeof newCustomer,
    value: string,
  ) {
    setNewCustomer((current) => ({
      ...current,
      [field]: value,
    }));
  }

  const firstItem =
    total === 0
      ? 0
      : (page - 1) * limit + 1;

  const lastItem = Math.min(
    page * limit,
    total,
  );

  return (
    <div className="space-y-6">
  {/* Page Title */}
  <div>
    <h1 className="text-2xl font-bold tracking-tight text-white">
      Customers
    </h1>

    <p className="mt-1 text-sm text-slate-400">
      Manage customer accounts
    </p>
  </div>

  {/* Main Customers Card */}
  <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search customers..."
          className="h-11 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950/60 px-4 text-sm text-slate-100 outline-none backdrop-blur-xl placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40"
        />

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as "all" | "true" | "false");
            setPage(1);
          }}
          className="h-11 rounded-xl border border-slate-700 bg-slate-950/60 px-4 text-sm text-slate-200 outline-none backdrop-blur-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40"
        >
          <option value="all" className="bg-slate-900 text-slate-200">All status</option>
          <option value="true" className="bg-slate-900 text-slate-200">Active</option>
          <option value="false" className="bg-slate-900 text-slate-200">Inactive</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() => setShowAddCustomer(true)}
        className="h-11 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-[0.98]"
      >
        + Add customer
      </button>
    </div>

    {/* Table List Section */}
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Username</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">2FA</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-800/80">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">
                Loading customers...
              </td>
            </tr>
          ) : customers.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">
                No customers found.
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => openCustomer(customer.id)}
                className="cursor-pointer transition hover:bg-slate-800/50"
              >
                <td className="px-4 py-4">
                  <div className="font-semibold text-white">
                    {customer.firstName} {customer.lastName}
                  </div>
                </td>

                <td className="px-4 py-4 font-mono text-sm text-slate-300">
                  {customer.username}
                </td>

                <td className="px-4 py-4 text-sm text-slate-300">
                  {customer.email}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={
                      customer.status
                        ? "inline-flex rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-300"
                        : "inline-flex rounded-full border border-red-500/30 bg-red-950/50 px-2.5 py-0.5 text-xs font-semibold text-red-300"
                    }
                  >
                    {customer.status ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span
                    className={
                      customer.twoFactorEnabled
                        ? "inline-flex rounded-full border border-cyan-500/30 bg-cyan-950/50 px-2.5 py-0.5 text-xs font-semibold text-cyan-300"
                        : "inline-flex rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-xs font-medium text-slate-400"
                    }
                  >
                    {customer.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination Bar */}
    <div className="mt-5 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-400">
        {pageLoading ? "Loading..." : `Showing ${firstItem}-${lastItem} of ${total}`}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1 || pageLoading}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <span className="px-2 text-sm font-medium text-slate-400">
          <strong className="text-white">{page}</strong> / {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages || pageLoading}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  </section>

  {/* ================= ADD CUSTOMER MODAL ================= */}
  {showAddCustomer && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Add customer
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Create a new customer account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddCustomer(false)}
            className="rounded-xl px-3 py-1.5 text-xl font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleAddCustomer} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <CustomerField
              label="First name"
              value={newCustomer.firstName}
              required
              onChange={(value) => updateNewCustomer("firstName", value)}
            />

            <CustomerField
              label="Last name"
              value={newCustomer.lastName}
              required
              onChange={(value) => updateNewCustomer("lastName", value)}
            />

            <CustomerField
              label="Username"
              value={newCustomer.username}
              required
              onChange={(value) => updateNewCustomer("username", value)}
            />

            <CustomerField
              label="Email"
              type="email"
              value={newCustomer.email}
              required
              onChange={(value) => updateNewCustomer("email", value)}
            />

            <CustomerField
              label="Alternate email"
              type="email"
              value={newCustomer.altEmail}
              onChange={(value) => updateNewCustomer("altEmail", value)}
            />

            <CustomerField
              label="Phone"
              value={newCustomer.phone}
              required
              onChange={(value) => updateNewCustomer("phone", value)}
            />

            <div className="sm:col-span-2">
              <CustomerField
                label="Password"
                type="password"
                value={newCustomer.password}
                required
                onChange={(value) => updateNewCustomer("password", value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-5">
            <button
              type="button"
              onClick={() => setShowAddCustomer(false)}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={addCustomerLoading}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addCustomerLoading ? "Creating..." : "Create customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* ================= CUSTOMER DETAILS MODAL ================= */}
  {selectedCustomerId && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5 sm:p-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Customer details
            </h2>

            {selectedCustomer && (
              <p className="mt-1 text-sm text-slate-400">
                <span className="font-semibold text-slate-200">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </span>{" "}
                · <span className="font-mono text-cyan-400">@{selectedCustomer.username}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={closeCustomer}
            className="rounded-xl px-3 py-1.5 text-xl font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close customer details"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">
          {customerLoading ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Loading customer details...
            </div>
          ) : !selectedCustomer ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Customer details could not be loaded.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Personal Information Card */}
              <form
                onSubmit={handleUpdateDetails}
                className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 backdrop-blur-xl"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  Personal information
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <CustomerField
                    label="First name"
                    value={customerForm.firstName}
                    onChange={(value) => updateCustomerForm("firstName", value)}
                  />

                  <CustomerField
                    label="Last name"
                    value={customerForm.lastName}
                    onChange={(value) => updateCustomerForm("lastName", value)}
                  />

                  <CustomerField
                    label="Username"
                    value={customerForm.username}
                    onChange={(value) => updateCustomerForm("username", value)}
                  />

                  <CustomerField
                    label="Email"
                    type="email"
                    value={customerForm.email}
                    onChange={(value) => updateCustomerForm("email", value)}
                  />

                  <CustomerField
                    label="Alternate email"
                    type="email"
                    value={customerForm.altEmail}
                    onChange={(value) => updateCustomerForm("altEmail", value)}
                  />

                  <CustomerField
                    label="Phone"
                    value={customerForm.phone}
                    onChange={(value) => updateCustomerForm("phone", value)}
                  />

                  <CustomerField
                    label="Date of birth"
                    type="date"
                    value={customerForm.dateOfBirth}
                    onChange={(value) => updateCustomerForm("dateOfBirth", value)}
                  />
                </div>

                <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  Address
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <CustomerField
                      label="Address line 1"
                      value={customerForm.addressLine1}
                      onChange={(value) => updateCustomerForm("addressLine1", value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <CustomerField
                      label="Address line 2"
                      value={customerForm.addressLine2}
                      onChange={(value) => updateCustomerForm("addressLine2", value)}
                    />
                  </div>

                  <CustomerField
                    label="City"
                    value={customerForm.city}
                    onChange={(value) => updateCustomerForm("city", value)}
                  />

                  <CustomerField
                    label="State"
                    value={customerForm.state}
                    onChange={(value) => updateCustomerForm("state", value)}
                  />

                  <CustomerField
                    label="PIN code"
                    value={customerForm.pinCode}
                    onChange={(value) => updateCustomerForm("pinCode", value)}
                  />
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={detailsSaving}
                    className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {detailsSaving ? "Saving..." : "Update details"}
                  </button>
                </div>
              </form>

              {/* Account Meta Section */}
              <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 backdrop-blur-xl">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  Account status
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">
                      {selectedCustomer.status ? "Active" : "Inactive"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Two-factor authentication
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">
                      {selectedCustomer.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Created
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      {formatDate(selectedCustomer.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Last login
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      {formatDate(selectedCustomer.lastLoginAt)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Password Management */}
              <form
                onSubmit={handlePasswordUpdate}
                className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 backdrop-blur-xl"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  Password
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Set a new password for this customer.
                </p>

                <div className="mt-4 max-w-md">
                  <CustomerField
                    label="New password"
                    type="password"
                    value={newPassword}
                    required
                    onChange={setNewPassword}
                  />
                </div>

                <div className="mt-5">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {passwordSaving ? "Updating..." : "Update password"}
                  </button>
                </div>
              </form>

              {/* Danger / Action Section */}
              <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 backdrop-blur-xl">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  Account actions
                </h3>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleStatusChange}
                    disabled={statusSaving}
                    className={
                      selectedCustomer.status
                        ? "rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:border-red-500/50 hover:bg-red-900/60 hover:text-red-100 disabled:opacity-50"
                        : "rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:border-emerald-500/50 hover:bg-emerald-900/60 hover:text-emerald-100 disabled:opacity-50"
                    }
                  >
                    {statusSaving
                      ? "Updating..."
                      : selectedCustomer.status
                        ? "Disable account"
                        : "Enable account"}
                  </button>

                  <button
                    type="button"
                    onClick={handleTwoFactorReset}
                    disabled={twoFactorResetting || !selectedCustomer.twoFactorEnabled}
                    className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {twoFactorResetting ? "Resetting..." : "Reset 2FA"}
                  </button>
                </div>

                {!selectedCustomer.twoFactorEnabled && (
                  <p className="mt-3 text-xs text-slate-500">
                    Two-factor authentication is already disabled for this customer.
                  </p>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )}
</div>
  );
}