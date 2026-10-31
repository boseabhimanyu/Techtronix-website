"use client";

import React, { useState } from "react";
import DOMPurify from "dompurify";
import api from "@/lib/api"; 

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

interface FormState {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  pincode: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
    pincode: "",
  });

  const [messageError, setMessageError] = useState<string>("");
  const [backendError, setBackendError] = useState<string>("");
  const [successId, setSuccessId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear local error if user is typing in message
    if (name === "message" && messageError) {
      setMessageError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendError("");
    setMessageError("");

    // Frontend validation only for Message
    if (!formData.message.trim()) {
      setMessageError("Please enter your message or query details.");
      return;
    }

    setIsSubmitting(true);

    // Sanitize values via DOMPurify before dispatch
    const payload = {
      name: DOMPurify.sanitize(formData.name.trim()),
      phone: DOMPurify.sanitize(formData.phone.trim()),
      email: DOMPurify.sanitize(formData.email.trim()),
      service: DOMPurify.sanitize(formData.service.trim()),
      message: DOMPurify.sanitize(formData.message.trim()),
      pincode: DOMPurify.sanitize(formData.pincode.trim()), // Represents City/Area
    };

    try {
      const response = await api.post("/enquiries", payload);
      setSuccessId(response.data?.id || "SUBMITTED");
      setFormData({
        name: "",
        phone: "",
        email: "",
        service: "",
        message: "",
        pincode: "",
      });
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setBackendError(err.response.data.error);
      } else {
        setBackendError("Failed to submit enquiry. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl text-slate-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          Submit an Enquiry
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Direct hardware diagnostics, OS setups, and repair requests.
        </p>
      </div>

      {/* Backend API Error Banner */}
      {backendError && (
        <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-500/50 text-red-300 text-sm flex items-start gap-3">
          <span className="font-mono font-bold text-red-400 mt-0.5"></span>
          <div>
            <div className="text-red-400 text-xs mt-0.5">{backendError}</div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successId ? (
        <div className="p-6 rounded-lg bg-cyan-950/30 border border-cyan-500/40 text-slate-200">
          <div className="text-cyan-400 font-semibold text-lg flex items-center gap-2">
            ✓ Enquiry Dispatched
          </div>
          <p className="text-sm text-slate-300 mt-2">
            Thank you. Your request has been logged. We will reach out on you shortly.
          </p>
          
          <button
            onClick={() => setSuccessId("")}
            className="mt-6 text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
          >
            Submit another enquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Rohan Sharma"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>

            {/* Phone No. */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Phone No. <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-slate-500 font-mono">
                  +91
                </span>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-12 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Email
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>

            {/* Reason / Service Selection */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Reason <span className="text-cyan-400">*</span>
              </label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              >
                <option value="" disabled className="text-slate-600">
                  Select a reason
                </option>
                {REASON_OPTIONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
          </div>

                {/* Message */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Message <span className="text-cyan-400">*</span>
            </label>
            <textarea
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Describe the issue, symptoms, or what you need assistance with..."
              className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 transition-all ${
                messageError
                  ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/30"
                  : "border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/30"
              }`}
            />
            {messageError && (
              <p className="text-red-400 text-xs mt-1.5 font-mono">{messageError}</p>
            )}
          </div>
          
          {/* City/Area (Mapped to PinCode in backend) */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              City/Area
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="e.g. Koramangala / 560034"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>

          

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-slate-950"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span>Dispatching...</span>
              </>
            ) : (
              <span>Submit Enquiry</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}