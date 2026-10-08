import { useState } from "react";
import { BadgeCheck, Download, Terminal } from "lucide-react";
import type { MarketplaceApp, LinuxImage } from "@/types";
import { usePoll } from "@/hooks/usePoll";
import { api } from "@/lib/api";
import { AppIcon } from "@/components/AppIcon";
import { DeployDialog } from "@/components/DeployDialog";

interface Catalog { registries: string[]; apps: MarketplaceApp[]; linux: LinuxImage[] }

export function MarketplacePage({ onDeployed }: { onDeployed: () => void }) {
  const [catalog] = usePoll<Catalog>(() => api.get("/api/marketplace"), 0);
  const [registry, setRegistry] = useState("All");
  const [deploy, setDeploy] = useState<{ image: string; name: string; port?: number; cport?: number } | null>(null);

  if (!catalog) return <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />;

  const apps = catalog.apps.filter((a) => registry === "All" || a.registry === registry);

  return (
    <div>
      <h1 className="text-[26px] font-extrabold tracking-tight">Marketplace</h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">
        Deploy containers from public registries, or start from a clean Linux base image.
      </p>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex gap-2">
          {catalog.registries.map((r) => (
            <button key={r} onClick={() => setRegistry(r)}
              className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition ${
                registry === r ? "border-primary/60 bg-[#12283D] text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}>{r}</button>
          ))}
        </div>
        <span className="text-[12.5px] text-muted-foreground">Sort · Most pulled</span>
      </div>

      <div className="mt-7 mb-3 flex items-baseline gap-3">
        <h2 className="text-[18px] font-bold">App Templates</h2>
        <span className="text-[12px] text-faint">{apps.length} curated apps · verified publishers</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {apps.map((a) => (
          <div key={a.id} className="flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#27303E]">
            <div className="flex items-center gap-3">
              <AppIcon id={a.icon} />
              <div>
                <div className="text-[15px] font-bold">{a.name}</div>
                <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                  <BadgeCheck className="h-3 w-3 text-primary" />{a.publisher}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Download className="h-3.5 w-3.5" />{a.pulls} pulls
              </span>
              <button onClick={() => setDeploy({ image: a.image, name: a.id, port: a.port, cport: a.containerPort })}
                className="rounded-full border border-primary/60 px-4 py-1.5 text-[13px] font-semibold text-primary transition hover:bg-primary hover:text-white">
                Deploy
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-9 mb-3 flex items-baseline gap-3">
        <h2 className="text-[18px] font-bold">Linux Base Images</h2>
        <span className="text-[12px] text-faint">fresh container from a minimal OS image — no app preinstalled</span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {catalog.linux.map((l) => (
          <div key={l.id} className="flex flex-col items-center rounded-xl border border-border bg-card p-5 transition-colors hover:border-[#27303E]">
            <AppIcon id={l.icon} size={44} />
            <div className="mt-3 text-[15px] font-bold">{l.name}</div>
            <div className="mono text-[11.5px] text-muted-foreground">{l.tag}</div>
            <div className="mono mt-0.5 text-[11.5px] text-faint">{l.sizeMb} MB</div>
            <button onClick={() => setDeploy({ image: l.image, name: `${l.id}-sandbox` })}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/60 py-2 text-[13px] font-semibold text-primary transition hover:bg-primary hover:text-white">
              <Terminal className="h-3.5 w-3.5" /> Deploy
            </button>
          </div>
        ))}
      </div>

      {deploy && (
        <DeployDialog image={deploy.image} defaultName={deploy.name}
          defaultPort={deploy.port} defaultContainerPort={deploy.cport}
          onClose={() => setDeploy(null)} onDeployed={onDeployed} />
      )}
    </div>
  );
}
