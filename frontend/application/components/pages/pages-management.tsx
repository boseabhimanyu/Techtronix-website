"use client";

import axios from "axios";
import DOMPurify from "dompurify";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import dynamic from "next/dynamic";

import api from "@/lib/api";
import { useNotification } from "@/components/notifications/notification-provider";
import type {
  Page,
  PageVisibility,
  PagesResponse,
} from "@/lib/types";

import styles from "../../app/(website)/[slug]/editor-typography.module.css"
import "../../styles/page-custom-styles.css"
// Dynamic import with SSR disabled to prevent hydration errors with TinyMCE
const PageEditor = dynamic(
  () => import("@/components/pages/page-editor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-white/70 bg-white/40 text-sm text-zinc-500 backdrop-blur-xl">
        Loading editor...
      </div>
    ),
  }
);

type PageForm = {
  title: string;
  content: string;
  visibility: PageVisibility;
  slug: string;
};

const emptyForm: PageForm = {
  title: "",
  content: "",
  visibility: "public",
  slug: "",
};

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      error.response?.data?.error ??
      fallback
    );
  }

  return fallback;
}

export default function PagesManagement() {
  const { showNotification } = useNotification();

  const [viewingPage, setViewingPage] =
    useState<Page | null>(null);

  const [pages, setPages] = useState<Page[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] =
    useState<"" | PageVisibility>("");

  const [showEditor, setShowEditor] = useState(false);
  const [editingPage, setEditingPage] =
    useState<Page | null>(null);

  const [form, setForm] = useState<PageForm>(
    emptyForm,
  );

  const [saving, setSaving] = useState(false);

  // State to track which page is pending confirmation
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function confirmDelete(selectedPage: Page) {
    setPageToDelete(selectedPage);
  }

  function cancelDelete() {
    if (isDeleting) return;
    setPageToDelete(null);
  }

  async function loadPages() {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));

      if (visibilityFilter) {
        params.set(
          "visibility",
          visibilityFilter,
        );
      }

      const response =
        await api.get<PagesResponse>(
          `/admin/pages?${params.toString()}`,
        );

      setPages(response.data.pages ?? []);

      setTotalPages(
        response.data.pagination?.totalPages ?? 1,
      );
    } catch (error) {
      showNotification(
        getErrorMessage(
          error,
          "Unable to load pages.",
        ),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPages();
  }, [page, visibilityFilter]);

  function handleViewPage(selectedPage: Page) {
    setViewingPage(selectedPage);
  }

  // Opens the live URL in a new browser tab/window
  function handleViewNewPage(selectedPage: Page) {
    if (!selectedPage.slug) {
      showNotification(
        "This page does not have a slug.",
        "error",
      );
      return;
    }

    window.open(
      `/${selectedPage.slug}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function closeView() {
    setViewingPage(null);
  }

  function openCreate() {
    setEditingPage(null);

    setForm({
      title: "",
      content: "",
      visibility: "public",
      slug: "",
    });

    setShowEditor(true);
  }

  function openEdit(selectedPage: Page) {
    setEditingPage(selectedPage);

    setForm({
      title: selectedPage.title,
      content: selectedPage.content,
      visibility: selectedPage.visibility,
      slug: selectedPage.slug,
    });

    setShowEditor(true);
  }

  function closeEditor() {
    if (saving) {
      return;
    }

    setShowEditor(false);
    setEditingPage(null);
    setForm(emptyForm);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const title = form.title.trim();

    if (!title) {
      showNotification(
        "Page title cannot be blank.",
        "error",
      );
      return;
    }

    setSaving(true);

    try {
      if (editingPage) {
        const payload: {
          title: string;
          content: string;
          visibility: PageVisibility;
          slug?: string;
        } = {
          title,
          content: form.content,
          visibility: form.visibility,
        };

        if (title !== "") {
          payload.slug = form.slug.trim();
        }

        const response = await api.patch(
          `/admin/pages/${editingPage.id}`,
          payload,
        );

        showNotification(
          response.data?.message ??
            "Page updated successfully.",
          "success",
        );
      } else {
        const response = await api.post(
          "/admin/pages",
          {
            title,
            content: form.content,
            visibility: form.visibility,
          },
        );

        showNotification(
          response.data?.message ??
            "Page created successfully.",
          "success",
        );
      }

      setShowEditor(false);
      setEditingPage(null);
      setForm(emptyForm);

      await loadPages();
    } catch (error) {
      showNotification(
        getErrorMessage(
          error,
          editingPage
            ? "Unable to update page."
            : "Unable to create page.",
        ),
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function executeDelete() {
    if (!pageToDelete) return;

    setIsDeleting(true);

    try {
      const response = await api.delete(`/admin/pages/${pageToDelete.id}`);

      showNotification(
        response.data?.message ?? "Page deleted successfully.",
        "success",
      );

      setPageToDelete(null);

      if (pages.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadPages();
      }
    } catch (error) {
      showNotification(
        getErrorMessage(error, "Unable to delete page."),
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredPages = pages.filter((item) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      item.title
        .toLowerCase()
        .includes(query) ||
      item.slug
        .toLowerCase()
        .includes(query)
    );
  });

  return (
<>
  <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 lg:p-6 backdrop-blur-xl shadow-2xl">
    {/* Dark Cyber Header Bar */}
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-800/40 p-5 shadow-lg backdrop-blur-xl transition-all">
      {/* Specular cyan highlight line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <select
            value={visibilityFilter}
            onChange={(event) => {
              setVisibilityFilter(event.target.value as "" | PageVisibility);
              setPage(1);
            }}
            className="rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-medium text-slate-200 outline-none backdrop-blur-xl transition focus:border-cyan-500"
          >
            <option value="" className="bg-slate-900 text-slate-200">All visibility</option>
            <option value="public" className="bg-slate-900 text-slate-200">Public</option>
            <option value="registered" className="bg-slate-900 text-slate-200">Registered</option>
          </select>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search pages..."
          className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none backdrop-blur-xl transition focus:border-cyan-500 focus:bg-slate-900"
        />

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-[0.98]"
        >
          + Create page
        </button>
      </div>
    </div>

    {/* Table List Section */}
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
      {loading ? (
        <div className="px-5 py-12 text-center text-sm text-slate-400">
          Loading pages...
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-slate-400">
          No pages found.
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80">
          {filteredPages.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 bg-slate-900/30 px-5 py-4 backdrop-blur-xl transition hover:bg-slate-800/40 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="truncate text-left text-sm font-semibold text-white underline-offset-4 transition hover:text-cyan-400 hover:underline"
                  >
                    {item.title}
                  </button>

                  <span
                    className={
                      item.visibility === "public"
                        ? "rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-300"
                        : "rounded-full border border-cyan-500/30 bg-cyan-950/50 px-2.5 py-0.5 text-xs font-semibold text-cyan-300"
                    }
                  >
                    {item.visibility === "public" ? "Public" : "Registered"}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>Updated {new Date(item.updatedAt).toLocaleString()}</span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleViewPage(item)}
                    className="truncate text-left font-mono text-xs text-slate-400 transition hover:text-cyan-400 hover:underline"
                  >
                    /{item.slug}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleViewPage(item)}
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-[0.98]"
                >
                  View
                </button>

                <button
                  type="button"
                  onClick={() => handleViewNewPage(item)}
                  title="Open live page in new tab"
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-[0.98]"
                >
                  Live ↗
                </button>

                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-[0.98]"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => confirmDelete(item)}
                  disabled={isDeleting && pageToDelete?.id === item.id}
                  className="rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm font-medium text-red-300 transition hover:border-red-500/50 hover:bg-red-900/60 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                >
                  {isDeleting && pageToDelete?.id === item.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Pagination Controls */}
    {totalPages > 1 && (
      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((current) => current - 1)}
          className="rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <p className="text-sm font-medium text-slate-400">
          Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
        </p>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((current) => current + 1)}
          className="rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    )}
  </div>

  {/* Editor Modal */}
  {showEditor && (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/80 px-4 py-8 backdrop-blur-md">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-2xl sm:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {editingPage ? "Edit page" : "Create page"}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {editingPage
                  ? "Update page content, slug and visibility."
                  : "Create and manage page content."}
              </p>
            </div>

            <button
              type="button"
              onClick={closeEditor}
              disabled={saving}
              className="rounded-xl px-3 py-1.5 text-xl font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-40"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:bg-slate-800"
              />
            </div>

            {editingPage && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Slug
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                  placeholder="page-slug"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:bg-slate-800"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Visibility
              </label>
              <select
                value={form.visibility}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    visibility: event.target.value as PageVisibility,
                  }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
              >
                <option value="public" className="bg-slate-900 text-white">Public</option>
                <option value="registered" className="bg-slate-900 text-white">Registered</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Content
              </label>
              <PageEditor
                key={editingPage?.id ?? "new-page"}
                initialContent={form.content}
                onChange={(content) =>
                  setForm((current) => ({
                    ...current,
                    content,
                  }))
                }
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                className="rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !form.title.trim()}
                className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingPage
                    ? "Save changes"
                    : "Create page"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )}

  {/* Preview Modal */}
  {viewingPage && (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/80 px-4 py-8 backdrop-blur-md">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {viewingPage.title}
                </h2>
                <span
                  className={
                    viewingPage.visibility === "public"
                      ? "rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-300"
                      : "rounded-full border border-cyan-500/30 bg-cyan-950/50 px-2.5 py-0.5 text-xs font-semibold text-cyan-300"
                  }
                >
                  {viewingPage.visibility === "public" ? "Public" : "Registered"}
                </span>
              </div>
              {viewingPage.slug && (
                <p className="mt-1 font-mono text-xs text-slate-400">
                  Slug: /{viewingPage.slug}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={closeView}
              className="rounded-xl px-3 py-1.5 text-xl font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Content Body */}
          <div className={`pt-6 text-slate-300 ${styles.typographyContainer}`}>
            {viewingPage.content ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(viewingPage.content),
                }}
              />
            ) : (
              <p className="italic text-slate-500">No content available.</p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-wrap items-center justify-end gap-2 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={closeView}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => handleViewNewPage(viewingPage)}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              Live ↗
            </button>

            <button
              type="button"
              onClick={() => {
                const targetPage = viewingPage;
                closeView();
                openEdit(targetPage);
              }}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Delete Confirmation Modal */}
  {pageToDelete && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/50 text-red-400">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.75"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-white">
              Delete page
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                &quot;{pageToDelete.title}&quot;
              </span>
              ? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={cancelDelete}
            disabled={isDeleting}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={executeDelete}
            disabled={isDeleting}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )}
</>
  );
}