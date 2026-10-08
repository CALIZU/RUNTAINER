import { useEffect, useState } from "react";
import { Check, Laptop, FileBox, Server, Database, Lock, Package, UploadCloud, Download, Copy } from "lucide-react";
import { toast } from "sonner";
import type { GitContainer } from "@/types";
import { usePoll } from "@/hooks/usePoll";
import { api } from "@/lib/api";

interface ExportResult { file: string; sizeMb: number; containers: number }

export function MigrationPage() {
  const [gitContainers, refresh] = usePoll<GitContainer[]>(() => api.get("/api/git/containers"), 5000);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [includeVolumes, setIncludeVolumes] = useState(true);
  const [encrypt, setEncrypt] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);

  useEffect(() => {
    if (gitContainers && selected.size === 0) {
      setSelected(new Set(gitContainers.map((g) => g.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gitContainers]);

  const all = gitContainers ?? [];
  const allSelected = all.length > 0 && selected.size === all.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(all.map((g) => g.id)));
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    setSelected(next);
  };

  const createBundle = async () => {
    setBusy(true);
    setResult(null);
    try {
      const r = await api.post<ExportResult & { ok: boolean }>("/api/migration/export", {
        containerIds: [...selected], includeVolumes, encrypt,
      });
      setResult(r);
      toast.success(`Bundle created — ${r.containers} container(s), ${r.sizeMb} MB`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onDropFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const r = await api.upload<{ manifest: { containers: { name: string }[] } }>("/api/migration/import", f);
      toast.success("Bundle verified", { description: `${r.manifest.containers.length} container(s) inside. Run restore.sh on this host to rebuild them.` });
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const Checkbox = ({ on }: { on: boolean }) => (
    <span className={`flex h-4.5 w-4.5 h-[18px] w-[18px] items-center justify-center rounded border transition ${on ? "border-primary bg-primary" : "border-[#3A4556]"}`}>
      {on && <Check className="h-3 w-3 text-white" />}
    </span>
  );

  return (
    <div>
      <h1 className="text-[26px] font-extrabold tracking-tight">Migration</h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">
        Package every git-backed container on this machine, then restore them on a new host. RUNTAINER itself travels inside the bundle.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* left: package */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[17px] font-bold">Package git containers</h2>
            <span className="mono text-[11.5px] text-faint">source: git deploys only</span>
          </div>

          <button onClick={toggleAll} className="mb-3 flex items-center gap-2.5 text-[13.5px] font-medium text-foreground">
            <Checkbox on={allSelected} /> Select all · {all.length} containers
          </button>

          <div className="space-y-1">
            {all.map((g) => (
              <button key={g.id} onClick={() => toggle(g.id)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition hover:bg-accent/40">
                <Checkbox on={selected.has(g.id)} />
                <span className={`h-2 w-2 rounded-full ${g.state === "running" ? "bg-live" : "bg-[#4A5568]"}`} />
                <div className="flex-1">
                  <div className="text-[14.5px] font-bold">{g.name}</div>
                  <div className="mono text-[11.5px] text-faint">{g.branch} · {g.commit}{g.port ? ` · :${g.port}` : ""}</div>
                </div>
              </button>
            ))}
            {all.length === 0 && <div className="py-8 text-center text-[12.5px] text-faint">No git-backed containers on this host yet.</div>}
          </div>

          <div className="mt-4 space-y-2.5 border-t border-border pt-4">
            <button onClick={() => setIncludeVolumes(!includeVolumes)} className="flex items-center gap-2.5 text-[13.5px] text-foreground">
              <Checkbox on={includeVolumes} /><Database className="h-4 w-4 text-muted-foreground" /> Include volumes &amp; bind mounts
            </button>
            <button onClick={() => setEncrypt(!encrypt)} className="flex items-center gap-2.5 text-[13.5px] text-foreground">
              <Checkbox on={encrypt} /><Lock className="h-4 w-4 text-muted-foreground" /> Encrypt secrets inside the bundle
            </button>
          </div>

          <div className="mono mt-4 text-[11.5px] text-faint">{selected.size} selected</div>

          <button onClick={createBundle} disabled={busy || selected.size === 0}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-[14.5px] font-semibold text-white transition hover:bg-[#4AABEE] disabled:opacity-40">
            <Package className="h-4 w-4" /> {busy ? "Creating bundle…" : "Create migration bundle"}
          </button>

          {result && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-live/30 bg-live/10 px-4 py-3">
              <div>
                <div className="mono text-[13px] font-semibold text-live">{result.file}</div>
                <div className="text-[11.5px] text-muted-foreground">{result.containers} containers · {result.sizeMb} MB · includes RUNTAINER + restore.sh</div>
              </div>
              <a href={`/api/migration/download/${result.file}`}
                className="flex items-center gap-1.5 rounded-full bg-live px-3.5 py-1.5 text-[12.5px] font-semibold text-black transition hover:brightness-110">
                <Download className="h-3.5 w-3.5" /> Download
              </a>
            </div>
          )}
        </div>

        {/* right: move + import */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-5 text-[17px] font-bold">Move to a new machine</h2>
            <div className="flex items-center justify-between">
              {[
                { icon: <Laptop className="h-5 w-5 text-primary" />, label: "This machine" },
                { icon: <FileBox className="h-5 w-5 text-warn" />, label: "bundle.rtpack" },
                { icon: <Server className="h-5 w-5 text-live" />, label: "New machine" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-[#0C0F14] px-5 py-3">
                    {s.icon}<span className="text-[11.5px] text-muted-foreground">{s.label}</span>
                  </div>
                  {i < 2 && <span className="text-[18px] text-faint">→</span>}
                </div>
              ))}
            </div>
            <div className="mono mt-5 rounded-lg bg-[#0C0F14] p-4 text-[12.5px] leading-relaxed">
              <div className="text-faint"># on the new machine — restores containers, volumes and RUNTAINER itself</div>
              <div className="mt-1.5"><span className="text-live">$</span> <span className="text-foreground">unzip bundle.rtpack &amp;&amp; cd bundle &amp;&amp; bash restore.sh</span>
                <button className="ml-2 inline text-faint hover:text-foreground" title="Copy"
                  onClick={() => { navigator.clipboard.writeText("unzip bundle.rtpack && cd bundle && bash restore.sh").catch(() => {}); toast.success("Copied"); }}>
                  <Copy className="inline h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onDropFile(e.dataTransfer.files?.[0]); }}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-[#2A3342] bg-card py-12 transition hover:border-primary/50">
            <UploadCloud className="h-7 w-7 text-primary" />
            <span className="text-[14px] font-medium text-foreground">Drop a .rtpack bundle here, or browse</span>
            <span className="text-[12px] text-faint">bundles from any RUNTAINER machine accepted</span>
            <input type="file" accept=".rtpack,.zip" className="hidden" onChange={(e) => onDropFile(e.target.files?.[0])} />
          </label>
        </div>
      </div>
    </div>
  );
}
