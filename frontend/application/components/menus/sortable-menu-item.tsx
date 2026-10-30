"use client";

import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Folder,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";

export type MenuItemType = "group" | "page" | "url";

export type MenuItem = {
  id: string;
  label: string;
  type: MenuItemType;
  pageId?: string | null;
  url?: string | null;
  order: number;
  displayStatus: boolean;
  children?: MenuItem[];
};

type SortableMenuItemProps = {
  item: MenuItem;
  index: number;
  groupId: string;
  depth: number;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
};

function getItemIcon(type: MenuItemType) {
  if (type === "group") {
    return Folder;
  }

  if (type === "page") {
    return FileText;
  }

  return ExternalLink;
}

export default function SortableMenuItem({
  item,
  index,
  groupId,
  depth,
  onEdit,
  onDelete,
}: SortableMenuItemProps) {
  const [expanded, setExpanded] = useState(true);

  const sortable = useSortable({
    id: item.id,
    index,
    group: groupId,
    type: "menu-item",
    accept: "menu-item",
  });

  const Icon = getItemIcon(item.type);

  const children = item.children ?? [];
  const hasChildren = children.length > 0;

  return (
    <div className="relative">
  <div
    ref={sortable.ref}
    className={[
      "group flex items-center gap-3 rounded-2xl border px-3.5 py-3 shadow-lg backdrop-blur-xl transition",
      sortable.isDragging
        ? "border-cyan-500/80 bg-slate-900/95 opacity-80 shadow-cyan-500/10 shadow-2xl"
        : "border-slate-800 bg-slate-900/70 hover:border-slate-700/80 hover:bg-slate-850/80",
      sortable.isDropTarget
        ? "ring-2 ring-cyan-500/50"
        : "",
      !item.displayStatus ? "opacity-60" : "",
    ].join(" ")}
  >
    {/* Drag handle */}
    <button
      type="button"
      ref={sortable.handleRef}
      aria-label={`Drag ${item.label}`}
      className="cursor-grab touch-none rounded-xl p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200 active:cursor-grabbing"
    >
      <GripVertical className="h-5 w-5" />
    </button>

    {/* Expand/collapse */}
    {hasChildren ? (
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-label={
          expanded
            ? `Collapse ${item.label}`
            : `Expand ${item.label}`
        }
        className="rounded-xl p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
    ) : (
      <div className="w-6" />
    )}

    {/* Type icon */}
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/80 p-2 text-cyan-400">
      <Icon className="h-4 w-4" />
    </div>

    {/* Label */}
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <p className="truncate text-sm font-semibold text-white">
          {item.label}
        </p>

        <span className="shrink-0 rounded-full border border-slate-700/80 bg-slate-800/80 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-300">
          {item.type}
        </span>

        {!item.displayStatus && (
          <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-950/50 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
            Hidden
          </span>
        )}
      </div>

      {item.url && (
        <p className="mt-0.5 truncate font-mono text-xs text-slate-400">
          {item.url}
        </p>
      )}

      {item.pageId && (
        <p className="mt-0.5 truncate text-xs text-slate-400">
          Page: <span className="font-mono text-cyan-400">{item.pageId}</span>
        </p>
      )}
    </div>

    {/* Edit button */}
    <button
      type="button"
      onClick={() => onEdit(item)}
      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-[0.98]"
    >
      <Pencil className="h-4 w-4 text-cyan-400" />
      <span className="hidden sm:inline">Edit</span>
    </button>

    {/* Delete button */}
    <button
      type="button"
      onClick={() => onDelete(item)}
      aria-label={`Delete ${item.label}`}
      title={`Delete ${item.label}`}
      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm font-semibold text-red-300 transition hover:border-red-500/50 hover:bg-red-900/50 hover:text-red-100 active:scale-[0.98]"
    >
      <Trash2 className="h-4 w-4" />
      <span className="hidden sm:inline">Delete</span>
    </button>
  </div>

  {/* Children list */}
  {hasChildren && expanded && (
    <div className="ml-8 mt-2 space-y-2 border-l-2 border-slate-800/90 pl-4">
      {children.map((child, childIndex) => (
        <SortableMenuItem
          key={child.id}
          item={child}
          index={childIndex}
          groupId={`parent:${item.id}`}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )}
</div>
  );
}