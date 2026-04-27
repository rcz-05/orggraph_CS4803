"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { COOKIE_NAMES } from "@/lib/session";

function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

function setCookie(name: string, value: string) {
  const oneWeek = 60 * 60 * 24 * 7;
  document.cookie = `${name}=${value}; path=/; max-age=${oneWeek}; SameSite=Lax`;
}

export function DemoEngineerView() {
  const router = useRouter();

  useEffect(() => {
    if (getCookie(COOKIE_NAMES.role) === "engineer") return;

    setCookie(COOKIE_NAMES.role, "engineer");
    router.refresh();
  }, [router]);

  return null;
}
