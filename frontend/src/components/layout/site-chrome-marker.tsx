"use client";

import { useEffect } from "react";

/** Marks pages that include the public site header so toast/loader offsets match. */
export function SiteChromeMarker() {
  useEffect(() => {
    document.documentElement.classList.add("site-chrome");
    document.body.classList.add("site-chrome");
    return () => {
      document.documentElement.classList.remove("site-chrome");
      document.body.classList.remove("site-chrome");
    };
  }, []);

  return null;
}
