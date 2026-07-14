"use client";

import { useEffect } from "react";
import { registerView } from "@/lib/recentlyViewed";

export default function RegisterView({ slug }: { slug: string }) {
  useEffect(() => {
    registerView(slug);
  }, [slug]);
  return null;
}
