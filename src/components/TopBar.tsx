import { Search, Bell, Boxes, Store, GitBranch, Package, Rocket } from "lucide-react";
import type { PageId, Health } from "@/types";

const TABS: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: "containers", label: "Containers", icon: <Boxes className="h-4 w-4" /> },
  { id: "marketplace", label: "Marketplace", icon: <Store className="h-4 w-4" /> },
  { id: "git", label: "Git Deploy", icon: <GitBranch className="h-4 w-4" /> },
  { id: "oneclick", label: "One-Click Apps", icon: <Rocket className="h-4 w-4" /> },
  { id: "migration", label: "Migration", icon: <Package className="h-4 w-4" /> },
];

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-7 w-7">
        <rect width="32" height="32" rx="7" fill="#2F9BE8" />
        <path d="M8 13h4v4H8zM14 13h4v4h-4zM20 13h4v4h-4zM11 8h4v4h-4zM17 8h4v4h-4zM6 18h20l-2.5 6.5a2 2 0 0 1-1.9 1.3H10.4a2 2 0 0 1-1.9-1.3z" fill="#fff" />
      </svg>
      <span className="text-[17px] font-extrabold tracking-tight">RUNTAINER</span>
    </div>
  );
}

export function TopBar({ page, setPage, query, setQuery, health }: {
  page: PageId; setPage: (p: PageId) => void;
  query: string; setQuery: (q: string) => void;
  health: Health | null;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-5 border-b border-border bg-panel px-5">
      <Logo />
      <nav className="ml-2 flex items-center gap-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setPage(t.id)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
              page === t.id
                ? "border border-primary/60 bg-[#12283D] text-primary"
                : "border border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search containers…"
            className="w-56 rounded-full border border-border bg-[#0C0F14] py-1.5 pl-9 pr-3 text-[13px] text-foreground placeholder:text-faint focus:border-primary/60 focus:outline-none" />
        </div>
        <span className="hidden items-center gap-1.5 text-[12px] text-muted-foreground md:flex">
          <span className="h-2 w-2 animate-pulse rounded-full bg-live" /> Auto-scan · 5s
        </span>
        {health?.demo && (
          <span className="rounded-full border border-warn/40 bg-warn/10 px-2.5 py-1 text-[11px] font-semibold text-warn">DEMO MODE</span>
        )}
        <Bell className="h-4.5 w-4.5 h-[18px] w-[18px] cursor-pointer text-muted-foreground hover:text-foreground" />
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">A</span>
          <span className="text-[13px] text-muted-foreground">admin</span>
        </div>
      </div>
    </header>
  );
}
