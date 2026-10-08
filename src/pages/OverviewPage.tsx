import { Boxes, Layers, Cpu, MemoryStick, HardDrive, Network, Database, Clock } from "lucide-react";
import type { Overview } from "@/types";
import { fmtMb } from "@/lib/api";

function BigStat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-[12px] font-medium uppercase tracking-wider">{label}</span></div>
      <div className="mt-2 text-[26px] font-extrabold tracking-tight">{value}</div>
      {sub && <div className="mono mt-0.5 text-[11.5px] text-faint">{sub}</div>}
    </div>
  );
}

function Meter({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#0C0F14]">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
    </div>
  );
}

export function OverviewPage({ overview }: { overview: Overview | null }) {
  if (!overview) return <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />;
  const memPct = (overview.memUsedMb / overview.memTotalMb) * 100;
  const diskPct = overview.diskTotalGb ? (overview.diskUsedGb! / overview.diskTotalGb) * 100 : null;

  return (
    <div>
      <h1 className="text-[26px] font-extrabold tracking-tight">Overview</h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">{overview.host} · {overview.os}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <BigStat icon={<Boxes className="h-4 w-4" />} label="Containers" value={`${overview.containers.running} / ${overview.containers.total}`} sub="running / total" />
        <BigStat icon={<Layers className="h-4 w-4" />} label="Images" value={String(overview.images)} sub={`${overview.networks} networks · ${overview.volumes} volumes`} />
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground"><Cpu className="h-4 w-4" /><span className="text-[12px] font-medium uppercase tracking-wider">CPU load</span></div>
          <div className="mt-2 text-[26px] font-extrabold tracking-tight">{overview.cpuLoad}%</div>
          <Meter pct={overview.cpuLoad} color="#2F9BE8" />
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground"><MemoryStick className="h-4 w-4" /><span className="text-[12px] font-medium uppercase tracking-wider">Memory</span></div>
          <div className="mt-2 text-[26px] font-extrabold tracking-tight">{fmtMb(overview.memUsedMb)}</div>
          <Meter pct={memPct} color="#3FB950" />
          <div className="mono mt-1 text-[11px] text-faint">of {fmtMb(overview.memTotalMb)}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {diskPct !== null && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground"><HardDrive className="h-4 w-4" /><span className="text-[12px] font-medium uppercase tracking-wider">Disk</span></div>
            <div className="mt-2 text-[26px] font-extrabold tracking-tight">{overview.diskUsedGb} GB</div>
            <Meter pct={diskPct} color="#E8A33D" />
            <div className="mono mt-1 text-[11px] text-faint">of {overview.diskTotalGb} GB</div>
          </div>
        )}
        <BigStat icon={<Network className="h-4 w-4" />} label="Networks" value={String(overview.networks)} sub="bridge + isolated git nets" />
        <BigStat icon={<Database className="h-4 w-4" />} label="Volumes" value={String(overview.volumes)} sub="named volumes" />
        <BigStat icon={<Clock className="h-4 w-4" />} label="Uptime" value={overview.uptime} sub={`Docker ${overview.dockerVersion}`} />
      </div>

      {overview.demo && (
        <div className="mt-6 rounded-xl border border-warn/30 bg-warn/5 p-5 text-[13.5px] text-muted-foreground">
          <span className="font-semibold text-warn">Demo mode.</span> RUNTAINER could not reach a Docker socket, so it is showing a simulated host.
          Install Docker and restart RUNTAINER on a real machine to manage live containers — the interface is identical.
        </div>
      )}
    </div>
  );
}
