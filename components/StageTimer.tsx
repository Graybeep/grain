"use client";

import { useEffect, useState } from "react";

export function StageTimer({ startedAt }: { startedAt: number | null }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (startedAt === null) { setElapsedSeconds(0); return; }
    const update = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");
  return <div className="stage-timer" role="timer" aria-label={`${elapsedSeconds} seconds elapsed`}><span>{minutes}:{seconds}</span><small>Local stages can take up to a minute. This request will keep waiting.</small></div>;
}

