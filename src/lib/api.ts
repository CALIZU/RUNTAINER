async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, init);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as { error?: string }).error || `request failed (${r.status})`);
  return data as T;
}

export const api = {
  get: <T>(path: string) => req<T>(path),
  post: <T>(path: string, body?: unknown) =>
    req<T>(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) }),
  upload: async <T>(path: string, file: File): Promise<T> => {
    const fd = new FormData();
    fd.append("bundle", file);
    const r = await fetch(path, { method: "POST", body: fd });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error((data as { error?: string }).error || "upload failed");
    return data as T;
  },
};

export function accessUrl(port: number | null | undefined): string | null {
  if (!port) return null;
  return `http://${window.location.hostname}:${port}`;
}

export function fmtMb(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

export function uptimeOf(created: number, status: string): string {
  if (/^Up/.test(status)) {
    if (/just now/.test(status)) return "Up just now";
    return status;
  }
  const diff = Date.now() - created;
  const d = Math.floor(diff / 864e5);
  const h = Math.floor(diff / 36e5);
  const m = Math.floor(diff / 6e4);
  if (d > 0) return `Up ${d} day${d > 1 ? "s" : ""}`;
  if (h > 0) return `Up ${h} hour${h > 1 ? "s" : ""}`;
  return `Up ${m} min`;
}


