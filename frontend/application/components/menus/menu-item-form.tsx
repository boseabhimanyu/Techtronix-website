"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";

import type {
  MenuItem,
  MenuItemType,
} from "./sortable-menu-item";

type PageOption = {
  id: string;
  title: string;
  slug: string;
};

type GroupDestination = "none" | "page" | "url";

type MenuItemFormProps = {
  menuId: string;
  item?: MenuItem | null;
  groups: MenuItem[];
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  label: string;
  type: MenuItemType;
  pageId: string;
  url: string;
  parentId: string;
  displayStatus: boolean;
  groupDestination: GroupDestination;
};

// Helper function to validate absolute URLs and relative paths
function isValidMenuUrl(value: string): boolean {
  const trimmed = value.trim();
  
  // 1. Allow relative paths starting with '/' (e.g., /dashboard, /about)
  if (trimmed.startsWith("/")) {
    return trimmed.length > 1; 
  }

  // 2. Allow valid http:// or https:// absolute URLs
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function initialState(item?: MenuItem | null): FormState {
  const pageId = item?.pageId ?? "";
  const url = item?.url ?? "";

  return {
    label: item?.label ?? "",
    type: item?.type ?? "group",
    pageId,
    url,
    parentId: "",
    displayStatus: item?.displayStatus ?? true,
    groupDestination:
      item?.type === "group"
        ? pageId
          ? "page"
          : url
            ? "url"
            : "none"
        : "none",
  };
}

export default function MenuItemForm({
  menuId,
  item,
  groups,
  onClose,
  onSaved,
}: MenuItemFormProps) {
  const [form, setForm] = useState<FormState>(
    initialState(item),
  );

  const [pages, setPages] = useState<PageOption[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const editing = Boolean(item);

  useEffect(() => {
    setForm(initialState(item));
    setError("");
  }, [item]);

  useEffect(() => {
    if (
      form.type !== "page" &&
      form.type !== "group"
    ) {
      return;
    }

    let cancelled = false;

    async function loadPages() {
      try {
        setLoadingPages(true);

        const response = await api.get("/admin/pages");
        const payload = response.data;

        const rawPages =
          payload?.pages ??
          payload?.data?.pages ??
          payload?.data ??
          payload?.items ??
          [];

        const normalized: PageOption[] = Array.isArray(
          rawPages,
        )
          ? rawPages.map((page: any) => ({
              id: String(page.id ?? page._id ?? ""),
              title: page.title ?? "",
              slug: page.slug ?? "",
            })).filter((page) => page.id !== "")
          : [];

        if (!cancelled) {
          setPages(normalized);
        }
      } catch (err) {
        console.error("Unable to load pages:", err);

        if (!cancelled) {
          setPages([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPages(false);
        }
      }
    }

    void loadPages();

    return () => {
      cancelled = true;
    };
  }, [form.type]);

  function update<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleTypeChange(type: MenuItemType) {
    setForm((current) => ({
      ...current,
      type,
      ...(type === "page"
        ? {
            url: "",
            groupDestination: "page" as GroupDestination,
          }
        : type === "url"
          ? {
              pageId: "",
              groupDestination: "url" as GroupDestination,
            }
          : {
              groupDestination: current.pageId
                ? "page"
                : current.url
                  ? "url"
                  : "none",
            }),
    }));
  }

  function handleGroupDestinationChange(
    destination: GroupDestination,
  ) {
    setForm((current) => ({
      ...current,
      groupDestination: destination,
      pageId: destination === "page" ? current.pageId : "",
      url: destination === "url" ? current.url : "",
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    if (!form.label.trim()) {
      setError("Label is required.");
      return;
    }

    if (
      form.type === "page" &&
      !form.pageId.trim()
    ) {
      setError("Please select a page.");
      return;
    }

    if (
      form.type === "url" &&
      !form.url.trim()
    ) {
      setError("URL is required.");
      return;
    }

    if (
      form.type === "group" &&
      form.groupDestination === "page" &&
      !form.pageId.trim()
    ) {
      setError("Please select a page for this group.");
      return;
    }

    if (
      form.type === "group" &&
      form.groupDestination === "url" &&
      !form.url.trim()
    ) {
      setError("Please enter a URL for this group.");
      return;
    }

    // Validate absolute URL or relative path format
    const isUrlActive =
      form.type === "url" ||
      (form.type === "group" && form.groupDestination === "url");

    if (isUrlActive && form.url.trim()) {
      if (!isValidMenuUrl(form.url)) {
        setError(
          "Please enter a valid absolute URL (e.g., https://example.com) or relative path (e.g., /dashboard)."
        );
        return;
      }
    }

    try {
      setSaving(true);

      const payload: Record<string, unknown> = {
        label: form.label.trim(),
        type: form.type,
        displayStatus: form.displayStatus,
      };

      if (form.type === "page") {
        payload.pageId = form.pageId;
      }

      if (form.type === "url") {
        payload.url = form.url.trim();
      }

      if (form.type === "group") {
        if (form.groupDestination === "page") {
          payload.pageId = form.pageId;
          payload.url = "";
        } else if (form.groupDestination === "url") {
          payload.pageId = "";
          payload.url = form.url.trim();
        } else {
          payload.pageId = "";
          payload.url = "";
        }
      }

      if (!editing && form.parentId) {
        payload.parentId = form.parentId;
      }

      if (editing && item) {
        await api.patch(
          `/admin/menus/${menuId}/items/${item.id}`,
          payload,
        );
      } else {
        await api.post(
          `/admin/menus/${menuId}/items`,
          payload,
        );
      }

      onSaved();
    } catch (err: unknown) {
      console.error("Unable to save menu item:", err);

      const getBackendMessage = (data: unknown): string | null => {
        if (typeof data === "string" && data.trim()) {
          return data;
        }

        if (!data || typeof data !== "object") {
          return null;
        }

        const body = data as Record<string, unknown>;

        for (const key of ["message", "error", "detail"]) {
          const value = body[key];

          if (typeof value === "string" && value.trim()) {
            return value;
          }

          if (
            value &&
            typeof value === "object" &&
            "message" in value &&
            typeof (value as { message?: unknown }).message === "string"
          ) {
            return (value as { message: string }).message;
          }
        }

        if (Array.isArray(body.errors)) {
          const messages = body.errors
            .map((entry) => {
              if (typeof entry === "string") return entry;

              if (
                entry &&
                typeof entry === "object" &&
                "message" in entry &&
                typeof (entry as { message?: unknown }).message === "string"
              ) {
                return (entry as { message: string }).message;
              }

              return null;
            })
            .filter((message): message is string => Boolean(message));

          if (messages.length) {
            return messages.join(" ");
          }
        }

        return null;
      };

      const error = err as {
        response?: { data?: unknown; status?: number };
        message?: string;
      };

      const backendMessage = getBackendMessage(error.response?.data);

      setError(
        backendMessage ??
          (error.response?.status
            ? `Request failed (${error.response.status}).`
            : error.message || "Unable to save the menu item."),
      );
    } finally {
      setSaving(false);
    }
  }

  const showPageSelector =
    form.type === "page" ||
    (form.type === "group" &&
      form.groupDestination === "page");

  const showUrlInput =
    form.type === "url" ||
    (form.type === "group" &&
      form.groupDestination === "url");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
  <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-2xl">
    {/* Modal Header */}
    <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-white">
          {editing ? "Edit Menu Item" : "Add Menu Item"}
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Add or update a group, page, or external URL.
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        aria-label="Close form"
      >
        <X className="h-5 w-5" />
      </button>
    </div>

    {/* Form Body */}
    <form onSubmit={handleSubmit} className="space-y-5 p-6">
      {/* Label Field */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Label
        </label>

        <input
          value={form.label}
          onChange={(event) => update("label", event.target.value)}
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:bg-slate-800"
          placeholder="About Us"
        />
      </div>

      {/* Type Selector */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Type
        </label>

        <select
          value={form.type}
          onChange={(event) =>
            handleTypeChange(event.target.value as MenuItemType)
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500"
        >
          <option value="group" className="bg-slate-900 text-white">Group</option>
          <option value="page" className="bg-slate-900 text-white">Page</option>
          <option value="url" className="bg-slate-900 text-white">URL</option>
        </select>
      </div>

      {/* Group Destination */}
      {form.type === "group" && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Group destination
          </label>

          <select
            value={form.groupDestination}
            onChange={(event) =>
              handleGroupDestinationChange(
                event.target.value as GroupDestination,
              )
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500"
          >
            <option value="none" className="bg-slate-900 text-white">No destination</option>
            <option value="page" className="bg-slate-900 text-white">Link to a page</option>
            <option value="url" className="bg-slate-900 text-white">Link to a URL</option>
          </select>

          <p className="mt-1.5 text-xs text-slate-400">
            Groups can have child items and an optional destination.
          </p>
        </div>
      )}

      {/* Parent Group */}
      {!editing && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Parent group
          </label>

          <select
            value={form.parentId}
            onChange={(event) => update("parentId", event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500"
          >
            <option value="" className="bg-slate-900 text-white">Top level</option>

            {groups.map((group) => (
              <option key={group.id} value={group.id} className="bg-slate-900 text-white">
                {group.label}
              </option>
            ))}
          </select>

          <p className="mt-1.5 text-xs text-slate-400">
            Child items can belong to a group in this menu.
          </p>
        </div>
      )}

      {/* Page Selector */}
      {showPageSelector && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Page
          </label>

          <select
            value={form.pageId}
            onChange={(event) => update("pageId", event.target.value)}
            disabled={loadingPages}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500 disabled:opacity-50"
          >
            <option value="" className="bg-slate-900 text-white">
              {loadingPages ? "Loading pages..." : "Select a page"}
            </option>

            {pages.map((page) => (
              <option key={page.id} value={page.id} className="bg-slate-900 text-white">
                {page.title}
                {page.slug ? ` (${page.slug})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* URL or Path */}
      {showUrlInput && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            URL or Path
          </label>

          <input
            type="text"
            value={form.url}
            onChange={(event) => update("url", event.target.value)}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:bg-slate-800"
            placeholder="https://example.com or /dashboard"
          />
        </div>
      )}

      {/* Display Status Checkbox */}
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 transition hover:border-slate-700">
        <input
          type="checkbox"
          checked={form.displayStatus}
          onChange={(event) =>
            update("displayStatus", event.target.checked)
          }
          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0"
        />

        <span>
          <span className="block text-sm font-semibold text-slate-200">
            Display item
          </span>

          <span className="block text-xs text-slate-400">
            Hidden items remain in the menu but are not displayed.
          </span>
        </span>
      </label>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm font-medium text-red-300">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving || (loadingPages && showPageSelector)}
          className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : editing
              ? "Save Changes"
              : "Add Item"}
        </button>
      </div>
    </form>
  </div>
</div>
  );
}