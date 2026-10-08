import { useEffect, useRef } from "react";
import type { Job } from "@/types";

export function JobLog({ job }: { job: Job | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [job?.log.length]);

  if (!job) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[15px] font-bold">Deploy log</h3>
        <span className={`mono text-[11px] font-semibold ${
          job.status === "done" ? "text-live" : job.status === "error" ? "text-destructive" : "text-warn"
        }`}>
          {job.status === "done" ? "READY" : job.status === "error" ? "FAILED" : `BUILDING ${job.progress}%`}
        </span>
      </div>
      {job.status === "building" && (
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#0C0F14]">
          <div className="h-full rounded-full bg-warn transition-all duration-500" style={{ width: `${job.progress}%` }} />
        </div>
      )}
      <div ref={ref} className="mono max-h-44 space-y-1 overflow-y-auto rounded-lg bg-[#0C0F14] p-3 text-[12px] leading-relaxed scrollbar-thin">
        {job.log.map((l, i) => (
          <div key={i} className={
            l.includes("ERROR") ? "text-destructive"
            : l.includes("access link") || l.includes("ready →") ? "text-primary"
            : l.includes("built") || l.includes("cloned") ? "text-[#9AA7BA]"
            : "text-[#6B7789]"
          }>
            <span className="text-faint">{l.slice(0, 10)}</span>{l.slice(10)}
          </div>
        ))}
        {job.status === "building" && <span className="animate-pulse text-live">▊</span>}
      </div>
    </div>
  );
}
