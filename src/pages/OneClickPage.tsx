import { useEffect, useState } from "react";
import { Rocket, Layers, Globe } from "lucide-react";
import { toast } from "sonner";
import type { OneClickApp, Job } from "@/types";
import { usePoll } from "@/hooks/usePoll";
import { api } from "@/lib/api";
import { AppIcon } from "@/components/AppIcon";
import { JobLog } from "@/components/JobLog";

export function OneClickPage({ onDeployed }: { onDeployed: () => void }) {
  const [apps] = usePoll<OneClickApp[]>(() => api.get("/api/apps"), 0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const t = setInterval(async () => {
      const j = await api.get<Job>(`/api/git/jobs/${jobId}`).catch(() => null);
      if (j) {
        setJob(j);
        if (j.status !== "building") {
          clearInterval(t);
          onDeployed();
          if (j.status === "done") toast.success(`${j.name} is live`, { description: `http://localhost:${j.port}` });
        }
      }
    }, 700);
    return () => clearInterval(t);
  }, [jobId]);

  const deploy = async (a: OneClickApp) => {
    try {
      const r = await api.post<{ jobId: string }>(`/api/apps/${a.id}/deploy`);
      setJob({ id: r.jobId, name: a.name, status: "building", progress: 0, log: [] });
      setJobId(r.jobId);
      toast.info(`Deploying ${a.name}…`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-[26px] font-extrabold tracking-tight">One-Click Apps</h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">
        Complete, prepackaged platforms — one click and it's running. No config files, no manuals.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(apps ?? []).map((a) => (
          <div key={a.id} className="flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-[#27303E]">
            <div className="flex items-center gap-3">
              <AppIcon id={a.icon} size={44} />
              <div>
                <div className="text-[16px] font-bold">{a.name}</div>
                <div className="text-[11.5px] font-medium uppercase tracking-wider text-primary">{a.category}</div>
              </div>
            </div>
            <p className="mt-3 min-h-[54px] text-[13px] leading-relaxed text-muted-foreground">{a.tagline}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {a.stack.map((s) => (
                <span key={s.name} className="mono flex items-center gap-1 rounded-md bg-secondary/70 px-2 py-1 text-[10.5px] text-muted-foreground">
                  <Layers className="h-3 w-3" />{s.image.split("/").pop()}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="mono flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Globe className="h-3.5 w-3.5 text-primary" />:{a.port}
              </span>
              <button onClick={() => deploy(a)}
                className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[#4AABEE]">
                <Rocket className="h-3.5 w-3.5" /> Deploy
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6"><JobLog job={job} /></div>
    </div>
  );
}
