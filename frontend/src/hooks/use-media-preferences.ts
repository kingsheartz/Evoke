"use client";

import { useEffect, useState } from "react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function useSaveData() {
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    type NetworkInfo = EventTarget & {
      saveData?: boolean;
      effectiveType?: string;
      addEventListener: (type: string, listener: () => void) => void;
      removeEventListener: (type: string, listener: () => void) => void;
    };

    const connection = (navigator as Navigator & { connection?: NetworkInfo }).connection;
    if (!connection) return;

    const update = () => {
      setSaveData(
        Boolean(connection.saveData) ||
          connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g",
      );
    };
    update();
    connection.addEventListener("change", update);
    return () => connection.removeEventListener("change", update);
  }, []);

  return saveData;
}
