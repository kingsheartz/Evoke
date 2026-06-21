"use client";

import { useEffect, useState } from "react";

/** Matches Tailwind `lg` — admin uses drawer nav below this width. */
export const ADMIN_MOBILE_MQ = "(max-width: 1023px)";

export function useAdminMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(ADMIN_MOBILE_MQ);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}
