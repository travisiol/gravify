"use client";

import { useCallback, useEffect, useState } from "react";
import { readAllReserves, type ReserveReport } from "./reserves";

const REFRESH = 30_000;

/** Re-reads every reserve on a fixed interval, and on demand. */
export function useReserves() {
  const [reports, setReports] = useState<ReserveReport[] | null>(null);

  const read = useCallback(() => {
    return readAllReserves().then(setReports);
  }, []);

  useEffect(() => {
    let live = true;
    const load = () => readAllReserves().then((r) => live && setReports(r));
    load();
    const poll = setInterval(load, REFRESH);
    return () => {
      live = false;
      clearInterval(poll);
    };
  }, []);

  return { reports, pending: reports === null, refresh: read };
}
