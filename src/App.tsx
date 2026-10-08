import { useState } from "react";
import { Toaster } from "sonner";
import type { PageId, ContainerInfo, Overview, Health } from "@/types";
import { usePoll } from "@/hooks/usePoll";
import { api } from "@/lib/api";
import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";
import { ContainersPage } from "@/pages/ContainersPage";
import { MarketplacePage } from "@/pages/MarketplacePage";
import { GitDeployPage } from "@/pages/GitDeployPage";
import { OneClickPage } from "@/pages/OneClickPage";
import { MigrationPage } from "@/pages/MigrationPage";
import { OverviewPage } from "@/pages/OverviewPage";
import { ImagesPage, NetworksPage, VolumesPage, SettingsPage } from "@/pages/SystemPages";

export default function App() {
  const [page, setPage] = useState<PageId>("containers");
  const [query, setQuery] = useState("");

  const [health] = usePoll<Health>(() => api.get("/api/health"), 30000);
  const [overview] = usePoll<Overview>(() => api.get("/api/overview"), 5000);
  const [containers, refreshContainers] = usePoll<ContainerInfo[]>(() => api.get("/api/containers"), 5000);

  return (
    <div className="min-h-full bg-background">
      <TopBar page={page} setPage={setPage} query={query} setQuery={setQuery} health={health} />
      <Sidebar page={page} setPage={setPage} overview={overview} />
      <main className="ml-[212px] px-6 pb-16 pt-[76px]">
        {page === "containers" && <ContainersPage containers={containers} query={query} refresh={refreshContainers} />}
        {page === "marketplace" && <MarketplacePage onDeployed={refreshContainers} />}
        {page === "git" && <GitDeployPage onDeployed={refreshContainers} />}
        {page === "oneclick" && <OneClickPage onDeployed={refreshContainers} />}
        {page === "migration" && <MigrationPage />}
        {page === "overview" && <OverviewPage overview={overview} />}
        {page === "images" && <ImagesPage />}
        {page === "networks" && <NetworksPage />}
        {page === "volumes" && <VolumesPage />}
        {page === "settings" && <SettingsPage health={health} overview={overview} />}
      </main>
      <Toaster theme="dark" position="bottom-right" toastOptions={{
        style: { background: "#12161E", border: "1px solid #1F2632", color: "#E9EEF5" },
      }} />
    </div>
  );
}
