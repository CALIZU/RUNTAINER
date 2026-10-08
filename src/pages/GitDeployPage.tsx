import { useEffect, useState } from "react";
import { Link2, GitBranch, Layers, Plus, ShieldCheck, Rocket, GitFork, Hammer, Box, ExternalLink, FileText, Square } from "lucide-react";
import { toast } from "sonner";
import type { GitContainer, Job } from "@/types";
import { usePoll } from "@/hooks/usePoll";
import { api } from "@/lib/api";
import { JobLog } from "@/components/JobLog";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition ${on ? "bg-primary" : "bg-[#2A3342]"}`}>
      <span className={`block h-5 w-5 rounded-full bg-white transition ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

export function GitDeployPage({ onDeployed }: { onDeployed: () => void }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [strategy, setStrategy] = useState("auto");
  const [isoNet, setIsoNet] = useState(true);
  const [limits, setLimits] = useState(true);
  const [readonly, setReadonly] = useState(false);
  const [envRows, setEnvRows] = useState<{ k: string; v: string }[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);

  const [gitContainers, refreshGit] = usePoll<GitContainer[]>(() => api.get("/api/git/containers"), 5000);

  useEffect(() => {
    if (!jobId) return;
    const t = setInterval(async () => {
      const j = await api.get<Job>(`/api/git/jobs/${jobId}`).catch(() => null);
      if (j) {
        setJob(j);
        if (j.status !== "building") {
          clearInterval(t);
          refreshGit();
          onDeployed();
          if (j.status === "done") toast.success(`${j.name} is live`, { description: `http://localhost:${j.port}` });
          if (j.status === "error") toast.error("Build failed — see log");
        }
      }
    }, 700);
    return () => clearInterval(t);
  }, [jobId]);

  const deploy = async () => {
    if (!/^https?:\/\/.+/.test(repoUrl)) return toast.error("Paste a valid https git URL first");
    const env: Record<string, string> = {};
    for (const r of envRows) if (r.k.trim()) env[r.k.trim()] = r.v;
    try {
      const r = await api.post<{ jobId: string }>("/api/git/deploy", {
        repoUrl, branch, strategy, env,
        isolation: { network: isoNet, limits, readonly },
        cpu: 2, memMb: 4096,
      });
      setJob({ id: r.jobId, name: repoUrl.split("/").pop() || "repo", status: "building", progress: 0, log: [] });
      setJobId(r.jobId);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const inputCls = "w-full rounded-lg border border-input bg-[#0C0F14] px-3 py-2.5 text-[13px] text-foreground placeholder:text-faint focus:border-primary/60 focus:outline-none";
  const labelCls = "mono mb-1.5 block text-[10.5px] font-medium tracking-widest text-faint";

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
      {/* left: deploy form */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-[22px] font-extrabold tracking-tight">Deploy from Git</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Paste a repository link — RUNTAINER clones, builds and runs it in an isolated container.
        </p>

        <div className="mt-5">
          <label className={labelCls}>REPOSITORY URL</label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input className={`${inputCls} mono pl-9`} placeholder="https://github.com/you/project.git"
              value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>BRANCH</label>
            <div className="relative">
              <GitBranch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <select className={`${inputCls} pl-9`} value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option value="main">main</option>
                <option value="master">master</option>
                <option value="dev">dev</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>BUILD STRATEGY</label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <select className={`${inputCls} pl-9`} value={strategy} onChange={(e) => setStrategy(e.target.value)}>
                <option value="auto">Auto-detect · Dockerfile</option>
                <option value="dockerfile">Dockerfile</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <label className={labelCls}>ISOLATION</label>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold">Dedicated network namespace</div>
              <div className="text-[12px] text-muted-foreground">No shared bridge — the container cannot reach other containers.</div>
            </div>
            <Toggle on={isoNet} onChange={setIsoNet} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold">CPU &amp; memory limits</div>
              <div className="text-[12px] text-muted-foreground">Capped at 2 cores and 4 GB RAM.</div>
            </div>
            <Toggle on={limits} onChange={setLimits} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold">Read-only root filesystem</div>
              <div className="text-[12px] text-muted-foreground">Writes go to a dedicated volume only.</div>
            </div>
            <Toggle on={readonly} onChange={setReadonly} />
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <label className={labelCls}>ENVIRONMENT VARIABLES</label>
          {envRows.map((r, i) => (
            <div key={i} className="mb-2 flex gap-2">
              <input className={`${inputCls} mono`} placeholder="KEY" value={r.k} onChange={(e) => setEnvRows(envRows.map((x, j) => j === i ? { ...x, k: e.target.value } : x))} />
              <input className={`${inputCls} mono`} placeholder="value" value={r.v} onChange={(e) => setEnvRows(envRows.map((x, j) => j === i ? { ...x, v: e.target.value } : x))} />
            </div>
          ))}
          <button onClick={() => setEnvRows([...envRows, { k: "", v: "" }])}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#2A3342] py-2.5 text-[12.5px] text-muted-foreground hover:border-primary/50 hover:text-primary">
            <Plus className="h-3.5 w-3.5" /> Add variable · .env files supported
          </button>
        </div>

        <button onClick={deploy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-[15px] font-semibold text-white transition hover:bg-[#4AABEE]">
          <Rocket className="h-4.5 w-4.5 h-[18px] w-[18px]" /> Deploy isolated container
        </button>

        <div className="mt-4 flex items-start gap-2 text-[12.5px] text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-live" />
          Git deploys run in their own network, volume and cgroup — the host and other containers stay untouched.
        </div>
      </div>

      {/* right column */}
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-baseline justify-between p-4 pb-3">
            <h3 className="text-[15px] font-bold">Git-backed containers</h3>
            <span className="text-[11.5px] text-faint">
              {gitContainers?.length ?? 0} linked · {gitContainers?.filter((g) => g.state === "running").length ?? 0} running
            </span>
          </div>
          <div className="divide-y divide-border">
            {(gitContainers ?? []).map((g) => (
              <div key={g.id} className="flex items-center gap-3 px-4 py-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${g.state === "running" ? "bg-live" : "bg-warn"}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-bold">{g.name}</div>
                  <div className="mono flex items-center gap-1 text-[11px] text-faint">
                    <GitFork className="h-3 w-3" />{g.branch} · {g.commit}
                  </div>
                </div>
                {g.isolated && <span className="rounded-full border border-live/30 px-2 py-0.5 text-[10px] font-medium text-live">isolated</span>}
                <div className="flex flex-col items-end gap-0.5">
                  {g.port ? <span className="mono text-[12px] font-semibold text-primary">:{g.port}</span> : <span className="text-[12px] text-faint">—</span>}
                  <span className={`text-[11px] ${g.state === "running" ? "text-live" : "text-warn"}`}>
                    {g.state === "running" ? "Running" : "Stopped"}
                  </span>
                </div>
                <div className="flex gap-0.5 text-muted-foreground">
                  {g.port && (
                    <a href={`http://${window.location.hostname}:${g.port}`} target="_blank" rel="noreferrer" title="Open"
                      className="rounded p-1.5 hover:bg-accent hover:text-foreground"><ExternalLink className="h-3.5 w-3.5" /></a>
                  )}
                  <button title="Logs" className="rounded p-1.5 hover:bg-accent hover:text-foreground"
                    onClick={() => toast.info("Log viewer: use `docker logs " + g.name + "` on the host for now")}>
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                  {g.state === "running" && (
                    <button title="Stop" className="rounded p-1.5 hover:bg-accent hover:text-warn"
                      onClick={async () => { await api.post(`/api/containers/${g.id}/action`, { action: "stop" }); refreshGit(); }}>
                      <Square className="h-3.5 w-3.5" fill="currentColor" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {gitContainers && gitContainers.length === 0 && (
              <div className="px-4 py-8 text-center text-[12.5px] text-faint">No git containers yet — deploy one on the left.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 text-[15px] font-bold">How it works</h3>
          <div className="flex items-center justify-between">
            {[
              { icon: <GitFork className="h-5 w-5 text-primary" />, label: "Clone repo" },
              { icon: <Hammer className="h-5 w-5 text-primary" />, label: "Build image" },
              { icon: <Box className="h-5 w-5 text-primary" />, label: "Isolated run" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#12283D]">{s.icon}</div>
                  <span className="text-[11.5px] text-muted-foreground">{s.label}</span>
                </div>
                {i < 2 && <span className="mb-5 text-faint">→</span>}
              </div>
            ))}
          </div>
        </div>

        <JobLog job={job} />
      </div>
    </div>
  );
}
