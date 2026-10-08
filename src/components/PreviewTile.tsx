import type { ContainerInfo } from "@/types";

function Sparkline({ color = "#2F9BE8", seed = 1 }: { color?: string; seed?: number }) {
  // deterministic pseudo-random sparkline
  const pts: string[] = [];
  let v = 30 + seed * 7;
  for (let i = 0; i <= 24; i++) {
    v = Math.max(6, Math.min(54, v + Math.sin(i * 1.7 + seed) * 8 + (seed % 3) - 1));
    pts.push(`${i * 10},${60 - v}`);
  }
  return (
    <svg viewBox="0 0 240 60" className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,60 ${pts.join(" ")} 240,60`} fill={`url(#sg-${seed})`} stroke="none" />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function Chip({ value, tone }: { value: string; tone: "green" | "blue" | "amber" }) {
  const colors = { green: "#34C759", blue: "#2F9BE8", amber: "#E8A33D" };
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-md bg-[#161B24] px-2.5 py-2">
      <span className="mono truncate text-[11px] font-semibold text-foreground">{value}</span>
      <div className="h-1 w-full rounded-full bg-[#0C0F15]">
        <div className="h-1 rounded-full" style={{ width: "70%", background: colors[tone] }} />
      </div>
    </div>
  );
}

function Body({ c }: { c: ContainerInfo }) {
  const seed = c.name.length + c.id.charCodeAt(0);
  switch (c.preview) {
    case "dashboard":
      return (
        <div className="flex h-full gap-2 p-2.5">
          <div className="flex w-9 flex-col gap-1.5 pt-1">
            {[0, 1, 2].map((i) => <div key={i} className="h-1.5 rounded bg-[#232B38]" />)}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <Chip value={`${c.stats.cpu || 12}%`} tone="green" />
              <Chip value={`${((seed * 37) % 9 + 1)}.${seed % 9}k`} tone="blue" />
              <Chip value={`${20 + (seed * 13) % 60}ms`} tone="amber" />
            </div>
            <div className="min-h-0 flex-1"><Sparkline seed={seed} /></div>
          </div>
        </div>
      );
    case "terminal":
      return (
        <div className="mono h-full space-y-1.5 p-3 text-[10.5px] leading-relaxed">
          <div><span className="text-live">$</span> <span className="text-[#9AA7BA]">{c.image.includes("redis") ? "redis-cli ping" : c.image.includes("postgres") ? "psql -U admin -d shop" : "tail -f /var/log/app.log"}</span></div>
          <div className="text-[#6B7789]">{c.image.includes("redis") ? "PONG" : c.image.includes("postgres") ? "psql (16.4, server 16.4)" : "[ok] worker listening"}</div>
          <div><span className="text-live">$</span> <span className="text-[#9AA7BA]">{c.image.includes("redis") ? "redis-cli info memory" : "SELECT count(*) FROM orders;"}</span></div>
          <div className="text-[#6B7789]">used_memory_human:<span className="text-live">{c.stats.memMb}M</span></div>
          <div className="text-[#46536B]"><span className="animate-pulse">▊</span></div>
        </div>
      );
    case "editor":
      return (
        <div className="mono h-full space-y-1.5 p-3 text-[10.5px] leading-relaxed">
          <div className="mb-1 flex gap-1">
            <span className="rounded bg-[#1C2431] px-2 py-0.5 text-[#7FA8E8]">app.tsx</span>
          </div>
          <div><span className="text-[#B565E8]">import</span> <span className="text-[#9AA7BA]">{"{ scan }"}</span> <span className="text-[#B565E8]">from</span> <span className="text-[#7FC78F]">"./docker"</span></div>
          <div><span className="text-[#B565E8]">export async function</span> <span className="text-[#7FA8E8]">watch</span><span className="text-[#9AA7BA]">() {"{"}</span></div>
          <div className="pl-3 text-[#9AA7BA]"><span className="text-[#B565E8]">const</span> list = <span className="text-[#B565E8]">await</span> scan()</div>
          <div className="pl-3 text-[#9AA7BA]"><span className="text-[#B565E8]">return</span> list.filter(running)</div>
          <div className="text-[#9AA7BA]">{"}"}</div>
        </div>
      );
    case "dns":
      return (
        <div className="flex h-full gap-2 p-2.5">
          <div className="flex w-9 flex-col gap-1.5 pt-1">
            {[0, 1, 2].map((i) => <div key={i} className="h-1.5 rounded bg-[#232B38]" />)}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <Chip value={`${50 + (seed * 7) % 30}%`} tone="green" />
              <Chip value={`${(seed * 2.3).toFixed(1)}k`} tone="blue" />
              <Chip value={`${seed % 12}`} tone="amber" />
            </div>
            <div className="min-h-0 flex-1"><Sparkline seed={seed + 3} /></div>
          </div>
        </div>
      );
    case "media":
      return (
        <div className="flex h-full gap-2 p-2.5">
          <div className="flex w-9 flex-col gap-1.5 pt-1">
            {[0, 1, 2].map((i) => <div key={i} className="h-1.5 rounded bg-[#232B38]" />)}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <Chip value="4K" tone="blue" />
              <Chip value={`${(seed * 3) % 20 + 5}`} tone="green" />
              <Chip value={`${90 + seed % 9}%`} tone="amber" />
            </div>
            <div className="min-h-0 flex-1"><Sparkline seed={seed + 7} color="#B565E8" /></div>
          </div>
        </div>
      );
    default:
      return (
        <div className="flex h-full flex-col justify-center gap-2 p-4">
          <div className="h-2 w-2/3 rounded bg-[#232B38]" />
          <div className="h-2 w-1/2 rounded bg-[#1C2431]" />
          <div className="h-2 w-3/5 rounded bg-[#232B38]" />
          <div className="mt-2 h-8"><Sparkline seed={seed + 11} /></div>
        </div>
      );
  }
}

export function PreviewTile({ c }: { c: ContainerInfo }) {
  const running = c.state === "running";
  const appLabel =
    c.preview === "editor" ? "VS Code" : c.preview === "terminal" ? (c.image.includes("redis") ? "redis-cli" : c.image.includes("postgres") ? "psql" : "shell")
    : c.preview === "media" ? "Firefox" : c.preview === "dns" ? "Admin" : "Chrome";
  return (
    <div className="overflow-hidden rounded-lg border border-[#1E2530] bg-[#0C0F14]">
      <div className="flex items-center gap-2 border-b border-[#1A2029] bg-[#12161E] px-3 py-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="mono mx-auto truncate text-[10.5px] text-faint">{c.name} — {appLabel}</span>
        {running ? (
          <span className="mono rounded-full border border-live/40 px-1.5 py-px text-[9px] font-semibold tracking-wider text-live">LIVE</span>
        ) : (
          <span className="mono rounded-full border border-[#2A3342] px-1.5 py-px text-[9px] font-semibold tracking-wider text-faint">IDLE</span>
        )}
      </div>
      <div className={`relative h-28 ${running ? "" : "opacity-40 saturate-50"}`}>
        <Body c={c} />
        {!running && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-md bg-[#0C0F14]/85 px-3 py-1 text-[11px] font-medium text-muted-foreground">Container stopped</span>
          </div>
        )}
      </div>
    </div>
  );
}
