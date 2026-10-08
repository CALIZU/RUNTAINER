import { RefreshCw, Paintbrush } from "lucide-react";
import { toast } from "sonner";
import type { ContainerInfo } from "@/types";
import { ContainerCard } from "@/components/ContainerCard";

export function ContainersPage({ containers, query, refresh }: {
  containers: ContainerInfo[] | null; query: string; refresh: () => void;
}) {
  const list = (containers ?? []).filter((c) =>
    !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.image.toLowerCase().includes(query.toLowerCase())
  );
  const running = list.filter((c) => c.state === "running").length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[26px] font-extrabold tracking-tight">Running Containers</h1>
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[12px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-live" />
            {running} of {list.length} running
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.info("Stopped containers pruned")}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-muted-foreground transition hover:text-foreground">
            <Paintbrush className="h-3.5 w-3.5" /> Prune stopped
          </button>
          <button onClick={() => { refresh(); toast.success("Scan complete"); }}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#4AABEE]">
            <RefreshCw className="h-3.5 w-3.5" /> Scan now
          </button>
        </div>
      </div>

      {containers === null ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-80 animate-pulse rounded-xl border border-border bg-card" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-20 text-muted-foreground">
          <span className="text-[15px] font-medium">No containers match</span>
          <span className="text-[13px]">Deploy one from the Marketplace, One-Click Apps or Git Deploy tab.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => <ContainerCard key={c.id} c={c} onChanged={refresh} />)}
        </div>
      )}
    </div>
  );
}
