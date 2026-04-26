"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Send } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = { teamSlug: string; engineerId: string; teamName: string };

export function SignalInterestButton({ teamSlug, engineerId, teamName }: Props) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signal() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/teams/signal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamSlug, engineerId }),
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
    <div className="relative flex flex-col gap-2">
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
