// RUNTAINER demo mode — realistic simulated Docker host.
// Used automatically when no Docker socket is available, or with RUNTAINER_DEMO=1.
// Lets novices explore the full UI before (or without) installing Docker.

const now = Date.now();

const state = {
  containers: [
    {
      id: "a1b2c3d4e5f6", name: "nexus-dashboard", image: "node:20-alpine",
      state: "running", status: "Up 6 days", created: now - 6 * 864e5,
      ports: [{ host: 3000, container: 3000, proto: "tcp" }],
      stats: { cpu: 12, memMb: 214, memLimitMb: 4096, netMbps: 3.1 },
      preview: "dashboard", git: null,
    },
    {
      id: "b2c3d4e5f6a7", name: "postgres-db", image: "postgres:16",
      state: "running", status: "Up 6 days", created: now - 6 * 864e5,
      ports: [{ host: 5432, container: 5432, proto: "tcp" }],
      stats: { cpu: 4, memMb: 88, memLimitMb: 4096, netMbps: 0.4 },
      preview: "terminal", git: null,
    },
    {
      id: "c3d4e5f6a7b8", name: "redis-cache", image: "redis:7-alpine",
      state: "running", status: "Up 2 days", created: now - 2 * 864e5,
      ports: [{ host: 6379, container: 6379, proto: "tcp" }],
      stats: { cpu: 1, memMb: 12, memLimitMb: 4096, netMbps: 0.1 },
      preview: "terminal", git: null,
    },
    {
      id: "d4e5f6a7b8c9", name: "code-server", image: "coder/code-server:4.9",
      state: "running", status: "Up 3 days", created: now - 3 * 864e5,
      ports: [{ host: 8080, container: 8080, proto: "tcp" }],
      stats: { cpu: 18, memMb: 412, memLimitMb: 8192, netMbps: 5.6 },
      preview: "editor", git: null,
    },
    {
      id: "e5f6a7b8c9d0", name: "pihole-dns", image: "pihole/pihole:latest",
      state: "running", status: "Up 12 days", created: now - 12 * 864e5,
      ports: [{ host: 8053, container: 80, proto: "tcp" }],
      stats: { cpu: 2, memMb: 96, memLimitMb: 2048, netMbps: 1.8 },
      preview: "dns", git: null,
    },
    {
      id: "f6a7b8c9d0e1", name: "jellyfin-media", image: "jellyfin/jellyfin:10.9",
      state: "running", status: "Up 5 days", created: now - 5 * 864e5,
      ports: [{ host: 8096, container: 8096, proto: "tcp" }],
      stats: { cpu: 22, memMb: 1126, memLimitMb: 8192, netMbps: 8.4 },
      preview: "media", git: null,
    },
    {
      id: "0a1b2c3d4e5f", name: "invoice-app", image: "runtainer/git:invoice-app",
      state: "running", status: "Up 4 hours", created: now - 4 * 36e5,
      ports: [{ host: 3001, container: 3000, proto: "tcp" }],
      stats: { cpu: 6, memMb: 148, memLimitMb: 4096, netMbps: 0.9 },
      preview: "dashboard",
      git: { repo: "https://github.com/acme/invoice-app.git", branch: "main", commit: "a1b2c3d", isolated: true, network: "git-net-07" },
    },
    {
      id: "1b2c3d4e5f6a", name: "docs-site", image: "runtainer/git:docs-site",
      state: "running", status: "Up 2 hours", created: now - 2 * 36e5,
      ports: [{ host: 4000, container: 4000, proto: "tcp" }],
      stats: { cpu: 2, memMb: 64, memLimitMb: 2048, netMbps: 0.3 },
      preview: "generic",
      git: { repo: "https://github.com/acme/docs-site.git", branch: "main", commit: "77aa01c", isolated: true, network: "git-net-09" },
    },
    {
      id: "2c3d4e5f6a7b", name: "api-gateway", image: "runtainer/git:api-gateway",
      state: "running", status: "Up 50 minutes", created: now - 50 * 6e4,
      ports: [{ host: 8081, container: 8080, proto: "tcp" }],
      stats: { cpu: 9, memMb: 203, memLimitMb: 4096, netMbps: 4.2 },
      preview: "terminal",
      git: { repo: "https://github.com/acme/api-gateway.git", branch: "main", commit: "e4f5a6b", isolated: true, network: "git-net-11" },
    },
    {
      id: "3d4e5f6a7b8c", name: "ml-training", image: "runtainer/git:ml-training",
      state: "exited", status: "Exited (0) 20 minutes ago", created: now - 3 * 36e5,
      ports: [],
      stats: { cpu: 0, memMb: 0, memLimitMb: 4096, netMbps: 0 },
      preview: "terminal",
      git: { repo: "https://github.com/acme/ml-training.git", branch: "dev", commit: "9f8e7d6", isolated: true, network: "git-net-08" },
    },
  ],
  images: [
    { repo: "node", tag: "20-alpine", id: "sha256:7f3a", sizeMb: 132, created: "2 weeks ago" },
    { repo: "postgres", tag: "16", id: "sha256:91bc", sizeMb: 431, created: "3 weeks ago" },
    { repo: "redis", tag: "7-alpine", id: "sha256:55de", sizeMb: 41, created: "1 month ago" },
    { repo: "coder/code-server", tag: "4.9", id: "sha256:aa10", sizeMb: 876, created: "1 month ago" },
    { repo: "pihole/pihole", tag: "latest", id: "sha256:c4d2", sizeMb: 298, created: "2 months ago" },
    { repo: "jellyfin/jellyfin", tag: "10.9", id: "sha256:77ef", sizeMb: 962, created: "2 months ago" },
    { repo: "runtainer/git", tag: "invoice-app", id: "sha256:0b31", sizeMb: 412, created: "4 hours ago" },
    { repo: "ubuntu", tag: "24.04", id: "sha256:ed22", sizeMb: 78, created: "3 weeks ago" },
  ],
  networks: [
    { id: "net-01", name: "bridge", driver: "bridge", scope: "local", containers: 6, subnet: "172.17.0.0/16" },
    { id: "net-02", name: "host", driver: "host", scope: "local", containers: 0, subnet: "—" },
    { id: "git-net-07", name: "git-net-07", driver: "bridge", scope: "local", containers: 1, subnet: "172.24.0.0/16" },
    { id: "git-net-09", name: "git-net-09", driver: "bridge", scope: "local", containers: 1, subnet: "172.26.0.0/16" },
    { id: "git-net-11", name: "git-net-11", driver: "bridge", scope: "local", containers: 1, subnet: "172.28.0.0/16" },
  ],
  volumes: [
    { name: "pgdata", driver: "local", mountpoint: "/var/lib/docker/volumes/pgdata/_data", sizeMb: 1228, usedBy: "postgres-db" },
    { name: "jellyfin-config", driver: "local", mountpoint: "/var/lib/docker/volumes/jellyfin-config/_data", sizeMb: 310, usedBy: "jellyfin-media" },
    { name: "ml-training-data", driver: "local", mountpoint: "/var/lib/docker/volumes/ml-training-data/_data", sizeMb: 8601, usedBy: "ml-training" },
    { name: "code-server-home", driver: "local", mountpoint: "/var/lib/docker/volumes/code-server-home/_data", sizeMb: 640, usedBy: "code-server" },
  ],
};

let seq = 100;
const jobs = new Map();

function jitter(n, spread) {
  return Math.max(0, Math.round((n + (Math.random() - 0.5) * spread) * 10) / 10);
}

export const demo = {
  kind: "demo",

  async ping() { return true; },

  async overview() {
    const running = state.containers.filter((c) => c.state === "running").length;
    return {
      host: "docker-host-01",
      dockerVersion: "27.3.1 (demo)",
      demo: true,
      containers: { total: state.containers.length, running, stopped: state.containers.length - running },
      images: state.images.length,
      networks: state.networks.length,
      volumes: state.volumes.length,
      cpuLoad: jitter(14, 6),
      memUsedMb: 2350,
      memTotalMb: 16384,
      diskUsedGb: 42,
      diskTotalGb: 238,
      uptime: "12 days, 4 hours",
      os: "Ubuntu 24.04 LTS · x86_64",
    };
  },

  async containers() {
    // jitter stats so the UI feels alive
    for (const c of state.containers) {
      if (c.state === "running") {
        c.stats.cpu = jitter(c.stats.cpu, 4);
        c.stats.memMb = Math.max(8, Math.round(jitter(c.stats.memMb, 12)));
        c.stats.netMbps = jitter(c.stats.netMbps, 0.6);
      }
    }
    return state.containers.map((c) => ({ ...c }));
  },

  async containerAction(id, action) {
    const c = state.containers.find((x) => x.id.startsWith(id) || x.name === id);
    if (!c) throw new Error("container not found");
    if (action === "start") { c.state = "running"; c.status = "Up just now"; }
    if (action === "stop") { c.state = "exited"; c.status = "Exited (0) just now"; c.stats = { cpu: 0, memMb: 0, memLimitMb: c.stats.memLimitMb, netMbps: 0 }; }
    if (action === "restart") { c.state = "running"; c.status = "Up just now"; }
    if (action === "remove") state.containers = state.containers.filter((x) => x !== c);
    return { ok: true };
  },

  async images() { return state.images; },
  async networks() { return state.networks; },
  async volumes() { return state.volumes; },

  async deployImage(spec) {
    const name = spec.name || spec.image.split("/").pop().split(":")[0] + "-" + Math.floor(Math.random() * 900 + 100);
    const port = spec.hostPort ? [{ host: spec.hostPort, container: spec.containerPort || spec.hostPort, proto: "tcp" }] : [];
    const c = {
      id: Math.random().toString(16).slice(2, 14), name, image: spec.image,
      state: "running", status: "Up just now", created: Date.now(),
      ports: port, stats: { cpu: jitter(3, 3), memMb: 48, memLimitMb: spec.memMb || 4096, netMbps: 0.2 },
      preview: "generic", git: null,
    };
    state.containers.push(c);
    return c;
  },

  async gitContainers() {
    return state.containers.filter((c) => c.git).map((c) => ({
      id: c.id, name: c.name, repo: c.git.repo, branch: c.git.branch, commit: c.git.commit,
      isolated: c.git.isolated, network: c.git.network, state: c.state, status: c.status,
      port: c.ports[0]?.host ?? null, image: c.image,
    }));
  },

  gitDeploy(spec) {
    const id = "job-" + ++seq;
    const name = spec.repoUrl.split("/").pop().replace(/\.git$/, "") || "git-app";
    const port = 3000 + Math.floor(Math.random() * 900);
    const lines = [
      [400, `cloning ${spec.repoUrl} @ ${spec.branch || "main"}`],
      [1400, `cloned ${name} @ ${Math.random().toString(16).slice(2, 9)}`],
      [2200, `build strategy: ${spec.strategy || "Auto-detect · Dockerfile"}`],
      [3600, `image built · ${180 + Math.floor(Math.random() * 500)} MB · cache hit ${8 + Math.floor(Math.random() * 5)}/14 layers`],
      [4800, `started on isolated network git-net-${Math.floor(Math.random() * 80 + 10)}`],
      [5200, `access link ready → http://localhost:${port}`],
    ];
    const job = { id, name, status: "building", progress: 0, log: [], port, createdAt: Date.now() };
    jobs.set(id, job);
    let t = 0;
    lines.forEach(([delay, text], i) => {
      t = delay;
      setTimeout(() => {
        const ts = new Date().toTimeString().slice(0, 8);
        job.log.push(`[${ts}] ${text}`);
        job.progress = Math.round(((i + 1) / lines.length) * 100);
        if (i === lines.length - 1) {
          job.status = "done";
          state.containers.push({
            id: Math.random().toString(16).slice(2, 14), name, image: `runtainer/git:${name}`,
            state: "running", status: "Up just now", created: Date.now(),
            ports: [{ host: port, container: spec.containerPort || 3000, proto: "tcp" }],
            stats: { cpu: 4, memMb: 96, memLimitMb: spec.memMb || 4096, netMbps: 0.4 },
            preview: "generic",
            git: { repo: spec.repoUrl, branch: spec.branch || "main", commit: Math.random().toString(16).slice(2, 9), isolated: true, network: "git-net-new" },
          });
        }
      }, delay);
    });
    return job;
  },

  gitJob(id) { return jobs.get(id) || null; },

  appDeploy(app) {
    const id = "job-" + ++seq;
    const port = app.port;
    const job = { id, name: app.name, status: "building", progress: 0, log: [], port, createdAt: Date.now() };
    jobs.set(id, job);
    const steps = app.stack.map((s, i) => [900 * (i + 1), `pulled ${s.image} · started as ${s.name}`]);
    steps.push([900 * (app.stack.length + 1), `${app.name} ready → http://localhost:${port}`]);
    steps.forEach(([delay, text], i) => {
      setTimeout(() => {
        const ts = new Date().toTimeString().slice(0, 8);
        job.log.push(`[${ts}] ${text}`);
        job.progress = Math.round(((i + 1) / steps.length) * 100);
        if (i === steps.length - 1) {
          job.status = "done";
          state.containers.push({
            id: Math.random().toString(16).slice(2, 14), name: app.id, image: app.stack[0].image,
            state: "running", status: "Up just now", created: Date.now(),
            ports: [{ host: port, container: port, proto: "tcp" }],
            stats: { cpu: 5, memMb: 256, memLimitMb: 8192, netMbps: 1.2 },
            preview: app.preview || "dashboard", git: null,
          });
        }
      }, delay);
    });
    return job;
  },
};
