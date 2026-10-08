import { useState } from "react";
import { X, Plus, Trash2, Rocket, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export interface DeploySpec {
  image: string; name: string; hostPort?: number; containerPort?: number;
  env: Record<string, string>; cpu: number; memMb: number;
  restart: string; network: string; readonly: boolean;
}

export function DeployDialog({ image, defaultName, defaultPort, defaultContainerPort, onClose, onDeployed }: {
  image: string; defaultName: string; defaultPort?: number; defaultContainerPort?: number;
  onClose: () => void; onDeployed: () => void;
}) {
  const [name, setName] = useState(defaultName);
  const [hostPort, setHostPort] = useState(defaultPort ? String(defaultPort) : "");
  const [containerPort, setContainerPort] = useState(defaultContainerPort ? String(defaultContainerPort) : (defaultPort ? String(defaultPort) : ""));
  const [envRows, setEnvRows] = useState<{ k: string; v: string }[]>([]);
  const [cpu, setCpu] = useState(2);
  const [mem, setMem] = useState(4096);
  const [restart, setRestart] = useState("unless-stopped");
  const [network, setNetwork] = useState("bridge");
  const [readonly, setReadonly] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);

  const deploy = async () => {
    setBusy(true);
    try {
      const env: Record<string, string> = {};
      for (const r of envRows) if (r.k.trim()) env[r.k.trim()] = r.v;
      await api.post("/api/deploy", {
        image, name,
        hostPort: hostPort ? parseInt(hostPort) : undefined,
        containerPort: containerPort ? parseInt(containerPort) : undefined,
        env, cpu, memMb: mem, restart, network, readonly,
      });
      toast.success(`${name} deployed`, { description: hostPort ? `http://localhost:${hostPort}` : image });
      onDeployed();
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-input bg-[#0C0F14] px-3 py-2 text-[13px] text-foreground placeholder:text-faint focus:border-primary/60 focus:outline-none";
  const labelCls = "mono mb-1.5 block text-[10.5px] font-medium tracking-widest text-faint";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 scrollbar-thin" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-[18px] font-bold">Deploy container</h2>
            <div className="mono mt-0.5 text-[12px] text-muted-foreground">{image}</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>CONTAINER NAME</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>HOST PORT (ACCESS LINK)</label>
            <input className={inputCls} placeholder="e.g. 8080" value={hostPort} onChange={(e) => setHostPort(e.target.value.replace(/\D/g, ""))} />
          </div>
          <div>
            <label className={labelCls}>CONTAINER PORT</label>
            <input className={inputCls} placeholder="e.g. 80" value={containerPort} onChange={(e) => setContainerPort(e.target.value.replace(/\D/g, ""))} />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelCls}>ENVIRONMENT VARIABLES</label>
          {envRows.map((r, i) => (
            <div key={i} className="mb-2 flex gap-2">
              <input className={inputCls} placeholder="KEY" value={r.k} onChange={(e) => setEnvRows(envRows.map((x, j) => j === i ? { ...x, k: e.target.value } : x))} />
              <input className={inputCls} placeholder="value" value={r.v} onChange={(e) => setEnvRows(envRows.map((x, j) => j === i ? { ...x, v: e.target.value } : x))} />
              <button onClick={() => setEnvRows(envRows.filter((_, j) => j !== i))} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button onClick={() => setEnvRows([...envRows, { k: "", v: "" }])}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#2A3342] py-2 text-[12.5px] text-muted-foreground hover:border-primary/50 hover:text-primary">
            <Plus className="h-3.5 w-3.5" /> Add variable
          </button>
        </div>

        <button onClick={() => setAdvanced(!advanced)}
          className="mt-5 flex w-full items-center justify-between rounded-lg bg-secondary/60 px-3.5 py-2.5 text-[13px] font-medium text-foreground">
          Advanced — fine-tune resources
          <ChevronDown className={`h-4 w-4 transition ${advanced ? "rotate-180" : ""}`} />
        </button>

        {advanced && (
          <div className="mt-4 space-y-4 rounded-xl border border-border p-4">
            <div>
              <div className="mb-1 flex justify-between text-[12px]"><span className="text-muted-foreground">CPU limit</span><span className="mono font-semibold text-primary">{cpu} cores</span></div>
              <input type="range" min={0.5} max={8} step={0.5} value={cpu} onChange={(e) => setCpu(parseFloat(e.target.value))} className="w-full accent-[#2F9BE8]" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[12px]"><span className="text-muted-foreground">Memory limit</span><span className="mono font-semibold text-primary">{mem >= 1024 ? `${mem / 1024} GB` : `${mem} MB`}</span></div>
              <input type="range" min={256} max={16384} step={256} value={mem} onChange={(e) => setMem(parseInt(e.target.value))} className="w-full accent-[#2F9BE8]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>RESTART POLICY</label>
                <select className={inputCls} value={restart} onChange={(e) => setRestart(e.target.value)}>
                  <option value="unless-stopped">unless-stopped</option>
                  <option value="always">always</option>
                  <option value="on-failure">on-failure</option>
                  <option value="no">never</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>NETWORK</label>
                <select className={inputCls} value={network} onChange={(e) => setNetwork(e.target.value)}>
                  <option value="bridge">bridge (default)</option>
                  <option value="host">host</option>
                  <option value="none">none (offline)</option>
                </select>
              </div>
            </div>
            <label className="flex cursor-pointer items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Read-only root filesystem</span>
              <button onClick={() => setReadonly(!readonly)}
                className={`h-5 w-9 rounded-full p-0.5 transition ${readonly ? "bg-primary" : "bg-[#2A3342]"}`}>
                <span className={`block h-4 w-4 rounded-full bg-white transition ${readonly ? "translate-x-4" : ""}`} />
              </button>
            </label>
          </div>
        )}

        <button disabled={busy || !name.trim()} onClick={deploy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#4AABEE] disabled:opacity-40">
          <Rocket className="h-4 w-4" /> {busy ? "Deploying…" : "Deploy container"}
        </button>
      </div>
    </div>
  );
}
