import { useState } from "react";
import { Copy, Check, ExternalLink, Globe, Play, Square, RotateCw, Trash2, GitBranch } from "lucide-react";
import { toast } from "sonner";
import type { ContainerInfo } from "@/types";
import { api, accessUrl, fmtMb, uptimeOf } from "@/lib/api";
import { PreviewTile } from "./PreviewTile";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium tracking-widest text-faint">{label}</div>
      <div className="text-[15px] font-bold text-foreground">{value}</div>
    </div>
  );
}

export function ContainerCard({ c, onChanged }: { c: ContainerInfo; onChanged: () => void }) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const running = c.state === "running";
  const url = accessUrl(c.ports[0]?.host);

  const copy = async () => {
    if (!url) return;
    try { await navigator.clipboard.writeText(url); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const act = async (action: string, confirmMsg?: string) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(true);
    try {
      await api.post(`/api/containers/${c.id}/action`, { action });
      toast.success(`${c.name}: ${action} ok`);
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#27303E]">
      <div className="mb-1 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${running ? "bg-live shadow-[0_0_8px_rgba(63,185,80,.7)]" : "bg-[#4A5568]"}`} />
          <div>
            <div className="flex items-center gap-2 text-[16px] font-bold leading-tight">{c.name}
              {c.git && (
                <span className="mono flex items-center gap-1 rounded-full border border-live/30 px-1.5 py-px text-[9px] font-medium text-live">
                  <GitBranch className="h-2.5 w-2.5" />{c.git.branch} · {c.git.commit}
                </span>
              )}
            </div>
            <div className="mono text-[12px] text-muted-foreground">{c.image}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[12px] text-muted-foreground">{uptimeOf(c.created, c.status)}</span>
          <div className="flex gap-0.5">
            {!running && (
              <button disabled={busy} title="Start" onClick={() => act("start")}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-live disabled:opacity-40"><Play className="h-3.5 w-3.5" /></button>
            )}
            {running && (
              <button disabled={busy} title="Stop" onClick={() => act("stop")}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-warn disabled:opacity-40"><Square className="h-3.5 w-3.5" fill="currentColor" /></button>
            )}
            <button disabled={busy} title="Restart" onClick={() => act("restart")}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-primary disabled:opacity-40"><RotateCw className="h-3.5 w-3.5" /></button>
            <button disabled={busy} title="Remove" onClick={() => act("remove", `Remove container "${c.name}"? This cannot be undone.`)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      <div className="mt-3"><PreviewTile c={c} /></div>

      <div className="mt-3 flex justify-between border-b border-border pb-3">
        <Stat label="CPU" value={running ? `${Math.round(c.stats.cpu)}%` : "—"} />
        <Stat label="MEM" value={running ? fmtMb(c.stats.memMb) : "—"} />
        <Stat label="NET" value={running ? `${c.stats.netMbps.toFixed(1)} MB/s` : "—"} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        {url ? (
          <>
            <Globe className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="mono min-w-0 flex-1 truncate text-[13px] text-primary">{url}</span>
            <button onClick={copy} title="Copy link"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
              {copied ? <Check className="h-3.5 w-3.5 text-live" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <a href={url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[#4AABEE]">
              Open <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </>
        ) : (
          <span className="mono text-[12px] text-faint">no published port</span>
        )}
      </div>
    </div>
  );
}
