"use client";

import { useState } from "react";
import { Check, Lock, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/shared/eyebrow";
import { CaveatHeading } from "@/components/shared/caveat-heading";
import { cn } from "@/lib/utils";
import type { Preferences } from "@/lib/schemas";

type Props = {
  initial: Preferences;
  initialPublished: boolean;
};

export function PreferencesEditor({ initial, initialPublished }: Props) {
  const [openToTransfer, setOpenToTransfer] = useState(initial.openToTransfer);
  const [interests, setInterests] = useState(initial.interests.join(", "));
  const [growthGoals, setGrowthGoals] = useState(initial.growthGoals.join(", "));
  const [published, setPublished] = useState(initialPublished);
  const [editing, setEditing] = useState(false);
  const [draftOpenToTransfer, setDraftOpenToTransfer] = useState(
    initial.openToTransfer
  );
  const [draftInterests, setDraftInterests] = useState(
    initial.interests.join(", ")
  );
  const [draftGrowthGoals, setDraftGrowthGoals] = useState(
    initial.growthGoals.join(", ")
  );

  const hasChanges =
    draftOpenToTransfer !== openToTransfer ||
    draftInterests !== interests ||
    draftGrowthGoals !== growthGoals;

  function resetDraft() {
    setDraftOpenToTransfer(openToTransfer);
    setDraftInterests(interests);
    setDraftGrowthGoals(growthGoals);
  }

  function startEditing() {
    resetDraft();
    setEditing(true);
  }

  function saveDraft() {
    setOpenToTransfer(draftOpenToTransfer);
    setInterests(draftInterests);
    setGrowthGoals(draftGrowthGoals);
    setEditing(false);
  }

  function cancelDraft() {
    resetDraft();
    setEditing(false);
  }

  function updatePublished(nextPublished: boolean) {
    setPublished(nextPublished);
    window.dispatchEvent(
      new CustomEvent("profile-published-change", {
        detail: { published: nextPublished },
      })
    );
  }

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-[#eee] bg-[#fafafa] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Eyebrow>
            Preferences · {published ? "published" : editing ? "editing" : "draft"}
          </Eyebrow>
          <CaveatHeading as="h3">Where you want to grow.</CaveatHeading>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={published ? "default" : "outline"}>
            {published ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      {published && (
        <div className="flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-[13px] text-[#666]">
          <Lock className="h-4 w-4 text-[#999]" />
          Published profiles are locked. Unpublish before making preference changes.
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-medium text-[#666]">
          Internal transfer visibility
        </span>
        <button
          type="button"
          onClick={() => setDraftOpenToTransfer((v) => !v)}
          disabled={!editing || published}
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70",
            (editing ? draftOpenToTransfer : openToTransfer)
              ? "border-[#b8cdb0] bg-[#e2edd9] text-[#3d6132]"
              : "border-[#e5e5e5] bg-white text-[#666]"
          )}
          aria-pressed={editing ? draftOpenToTransfer : openToTransfer}
        >
          <span
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-full border transition-colors",
              (editing ? draftOpenToTransfer : openToTransfer)
                ? "border-[#3d6132] bg-[#b8cdb0]"
                : "border-[#ccc] bg-[#f5f5f5]"
            )}
          >
            {(editing ? draftOpenToTransfer : openToTransfer) && (
              <Check className="h-3 w-3 text-[#3d6132]" />
            )}
          </span>
          {(editing ? draftOpenToTransfer : openToTransfer)
            ? "Open to internal transfer"
            : "Not open to transfer"}
        </button>
        <p className="text-[12px] leading-[1.5] text-[#777]">
          When enabled, this surfaces a sage pill on your profile and in search
          results.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-[#666]" htmlFor="interests">
            Interests
          </label>
          <input
            id="interests"
            value={editing ? draftInterests : interests}
            onChange={(e) => setDraftInterests(e.target.value)}
            disabled={!editing || published}
            placeholder="AI infra, fraud systems"
            className="rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] focus:border-[#9e4433] focus:outline-none disabled:bg-[#f5f5f5] disabled:text-[#777]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-[#666]" htmlFor="growth">
            Growth goals
          </label>
          <input
            id="growth"
            value={editing ? draftGrowthGoals : growthGoals}
            onChange={(e) => setDraftGrowthGoals(e.target.value)}
            disabled={!editing || published}
            placeholder="Tech lead, cross-team architecture"
            className="rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] focus:border-[#9e4433] focus:outline-none disabled:bg-[#f5f5f5] disabled:text-[#777]"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {editing ? (
          <>
            <Button onClick={saveDraft} disabled={!hasChanges}>
              <Check className="h-4 w-4" />
              Save changes
            </Button>
            <Button onClick={cancelDraft} variant="outline">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </>
        ) : (
          <>
            {!published && (
              <Button onClick={startEditing} variant="outline">
                <Pencil className="h-4 w-4" />
                Edit preferences
              </Button>
            )}
            <Button
              onClick={() => {
                if (published) {
                  updatePublished(false);
                  startEditing();
                } else {
                  updatePublished(true);
                  setEditing(false);
                  resetDraft();
                }
              }}
              variant={published ? "outline" : "default"}
            >
              {published ? "Unpublish to edit" : "Publish profile"}
            </Button>
          </>
        )}
        <p className="text-[11px] text-[#999]">
          Preference edits live in this session only for the MVP.
        </p>
      </div>
    </section>
  );
}
