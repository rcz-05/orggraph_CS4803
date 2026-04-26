"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";

type Props = {
  initialPublished: boolean;
};

export function ProfileStatusBadge({ initialPublished }: Props) {
  const [published, setPublished] = useState(initialPublished);

  useEffect(() => {
    function handleChange(event: Event) {
      const detail = (event as CustomEvent<{ published?: boolean }>).detail;
      if (typeof detail?.published === "boolean") {
        setPublished(detail.published);
      }
    }

    window.addEventListener("profile-published-change", handleChange);
    return () =>
      window.removeEventListener("profile-published-change", handleChange);
  }, []);

  return (
    <Badge variant={published ? "default" : "outline"}>
      {published ? "Published" : "Draft"}
    </Badge>
  );
}
