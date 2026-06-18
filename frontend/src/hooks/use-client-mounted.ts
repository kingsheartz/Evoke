"use client";

import { useEffect, useState } from "react";

/** True after the component mounts in the browser (avoids SSR vs extension DOM mismatches). */
export function useClientMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
