"use client";

import Link from "next/link";
import {
  ChevronRight,
  Menu as MenuIcon,
  Power,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";

export type AdminMenu = {
  id: string;
  name: string;
  location: "top" | "left" | "bottom";
  status: boolean;
};

type MenuListProps = {
  menus: AdminMenu[];
  onChanged?: () => void | Promise<void>;
  onDelete?: (menu: AdminMenu) => void; // Added onDelete prop
};

const menuInfo = {
  top: {
    title: "Header Menu",
    description: 
    "Navigation displayed in the site header.",
  },
  left: {
    title: "Sidebar Menu",
    description: 
    "Navigation displayed in the left sidebar.",
  },
  bottom: {
    title: "Footer Menu",
    description: 
    "Navigation displayed in the site footer.",
  },
};

const locations: Array<
AdminMenu["location"]
> = [
  "top",
  "left",
  "bottom",
];

export default function MenuList({
  menus,
  onChanged,
  onDelete,
}: MenuListProps) {
  const [busyId, setBusyId] = 
    useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");

  // Activate or deactivate a menu.
  async function toggleStatus(
    menu: AdminMenu,
  ) {
    setBusyId(menu.id);

    try {
      await api.patch(
        `/admin/menus/${menu.id}`, 
        {
        status: !menu.status,
      },
    );

      await onChanged?.();
    } catch (error) {
      console.error("Unable to change menu status:", error);

      window.alert("Unable to change the menu status.");
    } finally {
      setBusyId(null);
    }
  }

  // Update the menu title using the existing PATCH endpoint.
  async function updateMenuName(menu: AdminMenu) {
    const name = editedName.trim();

    if (!name) {
      window.alert("Menu title cannot be empty.");
      return;
    }

    if (name.length > 100) {
      window.alert("Menu title cannot exceed 100 characters.");
      return;
    }

    if (name === menu.name) {
      setEditingId(null);
      setEditedName("");
      return;
    }

    setBusyId(menu.id);

    try {
      await api.patch(`/admin/menus/${menu.id}`, {
        name,
      });

      setEditingId(null);
      setEditedName("");

      await onChanged?.();
    } catch (error) {
      console.error("Unable to update menu title:", error);

      window.alert(
        "Unable to update the menu title.",
      );
    } finally {
      setBusyId(null);
    }
  }

  // Initialize a menu when it does not exist.
  async function initializeMenu(
    location: AdminMenu["location"],
  ) {
    setBusyId(location);

    try {
      const info = menuInfo[location];

      await api.post("/admin/menus", {
        name: info.title,
        location,
        status: true,
      });

      await onChanged?.();
    } catch (error) {
      console.error("Unable to initialize menu:", error);

      window.alert(
        `Unable to initialize the ${menuInfo[location].title}.`,
      );
    } finally {
      setBusyId(null);
    }
  }

  // Start editing a menu title.
  function startEditing(menu: AdminMenu) {
    setEditingId(menu.id);
    setEditedName(menu.name);
  }

  // Cancel title editing.
  function cancelEditing() {
    setEditingId(null);
    setEditedName("");
  }

  return (
    <div className="space-y-4">
  {locations.map((location) => {
    const menu = menus.find((item) => item.location === location);
    const info = menuInfo[location];
    const isEditing = menu ? editingId === menu.id : false;
    const isBusy = menu ? busyId === menu.id : busyId === location;

    return (
      <div
        key={location}
        className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl transition hover:border-slate-700/80"
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="rounded-xl border border-slate-700/60 bg-slate-800/80 p-3 text-cyan-400">
              <MenuIcon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Editable menu title */}
                {menu && isEditing ? (
                  <form
                    className="flex flex-wrap items-center gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void updateMenuName(menu);
                    }}
                  >
                    <input
                      type="text"
                      value={editedName}
                      onChange={(event) => setEditedName(event.target.value)}
                      maxLength={100}
                      autoFocus
                      required
                      disabled={isBusy}
                      aria-label="Menu title"
                      placeholder="Enter menu title"
                      className="w-full max-w-xs rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-sm font-medium text-white outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 disabled:opacity-50"
                    />

                    <button
                      type="submit"
                      disabled={isBusy || !editedName.trim()}
                      aria-label="Save menu title"
                      title="Save title"
                      className="inline-flex items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-2 text-emerald-300 transition hover:bg-emerald-900/50 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isBusy ? (
                        <span className="px-1 text-xs">Saving...</span>
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={cancelEditing}
                      aria-label="Cancel title editing"
                      title="Cancel"
                      className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <>
                    <h2 className="text-base font-bold tracking-tight text-white">
                      {menu?.name ?? info.title}
                    </h2>

                    {menu && (
                      <button
                        type="button"
                        disabled={isBusy || editingId !== null}
                        onClick={() => startEditing(menu)}
                        aria-label={`Edit ${menu.name} title`}
                        title="Edit title"
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}

                {/* Menu location badge */}
                <span className="rounded-full border border-slate-700/80 bg-slate-800/80 px-2.5 py-0.5 font-mono text-xs font-semibold text-slate-300">
                  {location}
                </span>

                {/* Menu status badge */}
                {menu && (
                  <span
                    className={[
                      "rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm",
                      menu.status
                        ? "border-emerald-500/30 bg-emerald-950/50 text-emerald-300"
                        : "border-slate-700 bg-slate-800/80 text-slate-400",
                    ].join(" ")}
                  >
                    {menu.status ? "Active" : "Inactive"}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-slate-400">
                {info.description}
              </p>
            </div>
          </div>

          {/* Menu actions */}
          {menu ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/menus/${menu.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-[0.98]"
              >
                Manage
                <ChevronRight className="h-4 w-4 text-cyan-400" />
              </Link>

              <button
                type="button"
                disabled={isBusy || isEditing}
                onClick={() => void toggleStatus(menu)}
                className={[
                  "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
                  menu.status
                    ? "border-amber-500/30 bg-amber-950/40 text-amber-300 hover:border-amber-500/50 hover:bg-amber-900/50 hover:text-amber-100"
                    : "border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-900/50 hover:text-emerald-100",
                ].join(" ")}
              >
                <Power className="h-4 w-4" />
                {menu.status ? "Deactivate" : "Activate"}
              </button>

              <button
                type="button"
                disabled={isBusy || isEditing}
                onClick={() => onDelete?.(menu)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:border-red-500/50 hover:bg-red-900/50 hover:text-red-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void initializeMenu(location)}
              className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? "Initializing..." : "Initialize Menu"}
            </button>
          )}
        </div>
      </div>
    );
  })}
</div>
  );
}