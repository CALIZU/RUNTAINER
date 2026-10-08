import { useState } from "react";
import type { ImageInfo, NetworkInfo, VolumeInfo, Health, Overview } from "@/types";
import { usePoll } from "@/hooks/usePoll";
import { api } from "@/lib/api";

const th = "px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-widest text-faint";
const td = "px-4 py-3 text-[13px]";
const tableWrap = "overflow-hidden rounded-xl border border-border bg-card";

export function ImagesPage() {
  const [images] = usePoll<ImageInfo[]>(() => api.get("/api/images"), 10000);
  return (
    <div>
      <h1 className="text-[26px] font-extrabold tracking-tight">Images</h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">{images?.length ?? 0} images on this host</p>
      <div className={`${tableWrap} mt-6`}>
        <table className="w-full">
          <thead className="border-b border-border bg-[#0C0F14]"><tr>
            <th className={th}>Repository</th><th className={th}>Tag</th><th className={th}>Image ID</th><th className={th}>Size</th><th className={th}>Created</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {(images ?? []).map((i) => (
              <tr key={i.id + i.tag} className="hover:bg-accent/30">
                <td className={`${td} mono font-medium`}>{i.repo}</td>
                <td className={`${td} mono text-muted-foreground`}>{i.tag}</td>
                <td className={`${td} mono text-faint`}>{i.id}</td>
                <td className={`${td} text-muted-foreground`}>{i.sizeMb} MB</td>
                <td className={`${td} text-muted-foreground`}>{i.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function NetworksPage() {
  const [networks] = usePoll<NetworkInfo[]>(() => api.get("/api/networks"), 10000);
  return (
    <div>
      <h1 className="text-[26px] font-extrabold tracking-tight">Networks</h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">Git deploys get their own isolated bridge networks automatically.</p>
      <div className={`${tableWrap} mt-6`}>
        <table className="w-full">
          <thead className="border-b border-border bg-[#0C0F14]"><tr>
            <th className={th}>Name</th><th className={th}>Driver</th><th className={th}>Scope</th><th className={th}>Subnet</th><th className={th}>Containers</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {(networks ?? []).map((n) => (
              <tr key={n.id} className="hover:bg-accent/30">
                <td className={`${td} mono font-medium`}>
                  {n.name}
                  {n.name.startsWith("git-net") && <span className="ml-2 rounded-full border border-live/30 px-1.5 py-px text-[9.5px] text-live">isolated</span>}
                </td>
                <td className={`${td} text-muted-foreground`}>{n.driver}</td>
                <td className={`${td} text-muted-foreground`}>{n.scope}</td>
                <td className={`${td} mono text-muted-foreground`}>{n.subnet}</td>
                <td className={`${td} text-muted-foreground`}>{n.containers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function VolumesPage() {
  const [volumes] = usePoll<VolumeInfo[]>(() => api.get("/api/volumes"), 10000);
  return (
    <div>
      <h1 className="text-[26px] font-extrabold tracking-tight">Volumes</h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">Persistent data — included in migration bundles when selected.</p>
      <div className={`${tableWrap} mt-6`}>
        <table className="w-full">
          <thead className="border-b border-border bg-[#0C0F14]"><tr>
            <th className={th}>Name</th><th className={th}>Driver</th><th className={th}>Used by</th><th className={th}>Size</th><th className={th}>Mountpoint</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {(volumes ?? []).map((v) => (
              <tr key={v.name} className="hover:bg-accent/30">
                <td className={`${td} mono font-medium`}>{v.name}</td>
                <td className={`${td} text-muted-foreground`}>{v.driver}</td>
                <td className={`${td} text-muted-foreground`}>{v.usedBy}</td>
                <td className={`${td} text-muted-foreground`}>{v.sizeMb === null ? "—" : v.sizeMb >= 1024 ? `${(v.sizeMb / 1024).toFixed(1)} GB` : `${v.sizeMb} MB`}</td>
                <td className={`${td} mono max-w-[260px] truncate text-faint`}>{v.mountpoint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SettingsPage({ health, overview }: { health: Health | null; overview: Overview | null }) {
  const [interval, setIntervalS] = useState(5);
  const row = "flex items-center justify-between border-b border-border py-4 last:border-0";
  return (
    <div className="max-w-2xl">
      <h1 className="text-[26px] font-extrabold tracking-tight">Settings</h1>
      <div className="mt-6 rounded-xl border border-border bg-card px-6 py-2">
        <div className={row}>
          <div>
            <div className="text-[14px] font-semibold">Auto-scan interval</div>
            <div className="text-[12px] text-muted-foreground">How often RUNTAINER refreshes container state and stats.</div>
          </div>
          <select value={interval} onChange={(e) => setIntervalS(parseInt(e.target.value))}
            className="rounded-lg border border-input bg-[#0C0F14] px-3 py-1.5 text-[13px]">
            <option value={2}>2s</option><option value={5}>5s</option><option value={10}>10s</option><option value={30}>30s</option>
          </select>
        </div>
        <div className={row}>
          <div>
            <div className="text-[14px] font-semibold">Backend mode</div>
            <div className="text-[12px] text-muted-foreground">
              {health?.demo ? "Demo — simulated host. Start on a machine with Docker to go live." : "Live — connected to the Docker socket."}
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${health?.demo ? "bg-warn/15 text-warn" : "bg-live/15 text-live"}`}>
            {health?.demo ? "DEMO" : "LIVE"}
          </span>
        </div>
        <div className={row}>
          <div>
            <div className="text-[14px] font-semibold">Host</div>
            <div className="text-[12px] text-muted-foreground">{overview?.os ?? "—"}</div>
          </div>
          <span className="mono text-[12.5px] text-muted-foreground">{overview?.host ?? "—"}</span>
        </div>
        <div className={row}>
          <div>
            <div className="text-[14px] font-semibold">Version</div>
            <div className="text-[12px] text-muted-foreground">RUNTAINER engine + UI</div>
          </div>
          <span className="mono text-[12.5px] text-primary">v{health?.version ?? "1.0.0"}</span>
        </div>
      </div>
    </div>
  );
}
