"use client";

import { useEffect } from "react";

/** Prevents document scroll on admin routes so only the main panel scrolls. */
export function AdminScrollLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.add("admin-route");
    body.classList.add("admin-route");

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.classList.remove("admin-route");
      body.classList.remove("admin-route");
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return null;
}
