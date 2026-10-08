import { Gauge, Boxes, Layers, Network, Database, Settings } from "lucide-react";
import type { PageId, Overview } from "@/types";

const ITEMS: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <Gauge className="h-4 w-4" /> },
  { id: "containers", label: "Containers", icon: <Boxes className="h-4 w-4" /> },
  { id: "images", label: "Images", icon: <Layers className="h-4 w-4" /> },
  { id: "networks", label: "Networks", icon: <Network className="h-4 w-4" /> },
  { id: "volumes", label: "Volumes", icon: <Database className="h-4 w-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

export function Sidebar({ page, setPage, overview }: {
  page: PageId; setPage: (p: PageId) => void; overview: Overview | null;
}) {
  return (
    <aside className="fixed bottom-0 left-0 top-14 z-30 flex w-[212px] flex-col border-r border-border bg-panel px-3 py-4">
      <nav className="flex flex-col gap-1">
        {ITEMS.map((it) => (
          <button key={it.id} onClick={() => setPage(it.id)}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition ${
              page === it.id
                ? "border-l-2 border-primary bg-accent text-foreground"
                : "border-l-2 border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}>
            {it.icon}{it.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-border bg-card p-3.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-live" />
          <span className="text-[13.5px] font-semibold">{overview?.host ?? "docker-host"}</span>
        </div>
        <div className="mt-1 text-[11.5px] text-muted-foreground">
          Docker {overview?.dockerVersion ?? "—"} · {overview?.containers.total ?? 0} containers
        </div>
        {overview?.demo && <div className="mono mt-1.5 text-[10.5px] text-warn">simulated host — connect Docker to go live</div>}
      </div>
    </aside>
  );
}
