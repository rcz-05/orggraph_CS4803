"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = { teamSlug: string; engineerId: string; teamName: string };
type Intent = "coffee-chat" | "role-interest";

export function SignalInterestButton({ teamSlug, engineerId, teamName }: Props) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intent, setIntent] = useState<Intent>("coffee-chat");
  const [message, setMessage] = useState("");

  async function signal() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/teams/signal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamSlug, engineerId, intent, message }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Signal failed (${res.status})`);
      }
      setDone(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signal failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative flex flex-col gap-3 rounded-2xl border border-[#eee] bg-white p-5">
      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-medium text-[#666]">
          What kind of interest is this?
        </span>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ["coffee-chat", "Coffee chat"],
            ["role-interest", "Interested in a role"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setIntent(value as Intent)}
              disabled={pending || done}
              className={cn(
                "rounded-full border px-3 py-2 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70",
                intent === value
                  ? "border-[#3a566e] bg-[#dce4ef] text-[#3a566e]"
                  : "border-[#e5e5e5] bg-[#fafafa] text-[#666]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={`signal-message-${teamSlug}`}
          className="text-[12px] font-medium text-[#666]"
        >
          Message to manager
        </label>
        <textarea
          id={`signal-message-${teamSlug}`}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={pending || done}
          rows={4}
          placeholder={
            intent === "coffee-chat"
              ? "I would love a short coffee chat to learn more about the team."
              : "I am interested in future roles on this team because..."
          }
          className="w-full resize-none rounded-xl border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] leading-[1.55] focus:border-[#3a566e] focus:outline-none disabled:bg-[#f5f5f5] disabled:text-[#777]"
        />
      </div>

      <Button
        onClick={signal}
        disabled={pending || done}
        size="lg"
        className="w-full justify-center"
      >
        {done ? (
          <>
            <Check className="h-4 w-4" />
            Interest signaled · Manager notified
          </>
        ) : pending ? (
          "Signaling…"
        ) : (
          <>
            <Send className="h-4 w-4" />
            Signal interest
          </>
        )}
      </Button>
      {error && <p className="text-[11px] text-[#9e4433]">{error}</p>}

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#3a566e] px-5 py-2.5 text-[13px] font-medium text-white shadow-lg"
          >
            <Check className="mr-2 inline h-3.5 w-3.5" />
            {teamName}&apos;s manager has been notified.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
