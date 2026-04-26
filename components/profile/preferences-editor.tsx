"use client";

import { useState } from "react";
import { Check } from "lucide-react";

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
  const [savedFlash, setSavedFlash] = useState(false);

  function flashSaved() {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-[#eee] bg-[#fafafa] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Eyebrow>Preferences · editable</Eyebrow>
          <CaveatHeading as="h3">Where you want to grow.</CaveatHeading>
        </div>
        <div className="flex items-center gap-2">
          {savedFlash && (
            <span className="text-[12px] text-[#3d6132]">Saved · session only</span>
          )}
          <Badge variant={published ? "default" : "outline"}>
            {published ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 text-[14px]">
        <button
          type="button"
          onClick={() => {
            setOpenToTransfer((v) => !v);
            flashSaved();
          }}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md border transition-colors",
            openToTransfer
              ? "border-[#3d6132] bg-[#b8cdb0] text-[#3d6132]"
              : "border-[#ccc] bg-white"
          )}
          aria-pressed={openToTransfer}
        >
          {openToTransfer && <Check className="h-3.5 w-3.5" />}
        </button>
        <span>
          <span className="font-semibold">Open to internal transfer.</span>{" "}
          <span className="text-[#666]">
            Surfaces a sage pill on your profile and in search results.
          </span>
        </span>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-[#666]" htmlFor="interests">
            Interests
          </label>
          <input
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            onBlur={flashSaved}
            placeholder="AI infra, fraud systems"
            className="rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] focus:border-[#9e4433] focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-[#666]" htmlFor="growth">
            Growth goals
          </label>
          <input
            id="growth"
            value={growthGoals}
            onChange={(e) => setGrowthGoals(e.target.value)}
            onBlur={flashSaved}
            placeholder="Tech lead, cross-team architecture"
            className="rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] focus:border-[#9e4433] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => setPublished((p) => !p)}
          variant={published ? "outline" : "default"}
        >
          {published ? "Unpublish" : "Publish profile"}
        </Button>
        <p className="text-[11px] text-[#999]">
          Edits live in this session only — per CLAUDE.md, no persistence layer for the MVP.
        </p>
      </div>
    </section>
  );
}
