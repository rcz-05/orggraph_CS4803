"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

type Props = {
  initial: string;
  label: string;
  multiline?: boolean;
  className?: string;
  textClassName?: string;
};

export function EditableText({
  initial,
  label,
  multiline = false,
  className = "",
  textClassName = "",
}: Props) {
  const [value, setValue] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);

  if (editing) {
    return (
      <div className={className}>
        {multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[14px] leading-[1.7] focus:border-[#9e4433] focus:outline-none"
            autoFocus
          />
        ) : (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[14px] focus:border-[#9e4433] focus:outline-none"
            autoFocus
          />
        )}
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => {
              setValue(draft);
              setEditing(false);
            }}
            className="inline-flex items-center gap-1 rounded-md bg-[#0a0a0a] px-2.5 py-1 text-[11px] font-medium text-white"
          >
            <Check className="h-3 w-3" />
            Save
          </button>
          <button
            onClick={() => {
              setDraft(value);
              setEditing(false);
            }}
            className="inline-flex items-center gap-1 rounded-md border border-[#e5e5e5] px-2.5 py-1 text-[11px] font-medium text-[#666]"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
          <span className="text-[10px] text-[#bbb]">Session only</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative ${className}`}>
      <p className={textClassName}>{value}</p>
      <button
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className="absolute top-0 right-0 inline-flex items-center gap-1 rounded-md border border-[#e5e5e5] bg-white px-2 py-1 text-[10px] font-medium text-[#666] opacity-0 transition-opacity hover:border-[#9e4433] hover:text-[#9e4433] group-hover:opacity-100"
        aria-label={`Edit ${label}`}
      >
        <Pencil className="h-3 w-3" />
        Edit
      </button>
    </div>
  );
}
