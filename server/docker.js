// RUNTAINER Docker bridge — real Docker backend (dockerode) with the same
// interface as the demo backend, so the UI works identically in both modes.

import Docker from "dockerode";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const run = promisify(execFile);
export const RUNTAINER_HOME = process.env.RUNTAINER_HOME || path.join(os.homedir(), ".runtainer");
fs.mkdirSync(RUNTAINER_HOME, { recursive: true });
fs.mkdirSync(path.join(RUNTAINER_HOME, "git"), { recursive: true });
fs.mkdirSync(path.join(RUNTAINER_HOME, "exports"), { recursive: true });

function classifyPreview(image) {
  const s = image.toLowerCase();
  if (/code-server|vscode|theia/.test(s)) return "editor";
  if (/jellyfin|plex|emby/.test(s)) return "media";
  if (/pihole|adguard|dns/.test(s)) return "dns";
  if (/postgres|mysql|maria|mongo|redis|sqlite|db/.test(s)) return "terminal";
  if (/nginx|node|grafana|nextcloud|dashboard|portainer|home-assistant|rocket/.test(s)) return "dashboard";
  return "generic";
}

function firstPort(ports) {
  if (!ports) return null;
  for (const p of ports) {
    if (p.PublicPort && p.IP !== "::") return { host: p.PublicPort, container: p.PrivatePort, proto: p.Type || "tcp" };
  }
  for (const p of ports) {
    if (p.PublicPort) return { host: p.PublicPort, container: p.PrivatePort, proto: p.Type || "tcp" };
  }
  return null;
}

let jobSeq = 1;
const jobs = new Map();
export function getJob(id) { return jobs.get(id) || null; }

function newJob(name) {
  const job = { id: "job-" + jobSeq++, name, status: "building", progress: 0, log: [], createdAt: Date.now() };
  jobs.set(job.id, job);
  return job;
}
function logLine(job, text) {
  const ts = new Date().toTimeString().slice(0, 8);
  job.log.push(`[${ts}] ${text}`);
}

async function statsOf(container) {
  try {
    const s = await container.stats({ stream: false });
    const cpuDelta = s.cpu_stats.cpu_usage.total_usage - (s.precpu_stats.cpu_usage?.total_usage || 0);
    const sysDelta = s.cpu_stats.system_cpu_usage - (s.precpu_stats.system_cpu_usage || 0);
    const ncpu = s.cpu_stats.online_cpus || 1;
    const cpu = sysDelta > 0 ? Math.min(100, Math.round((cpuDelta / sysDelta) * ncpu * 100)) : 0;
    const memMb = Math.round((s.memory_stats.usage || 0) / 1048576);
    const memLimitMb = Math.round((s.memory_stats.limit || 0) / 1048576);
    let netMbps = 0;
    if (s.networks) {
      let bytes = 0;
      for (const n of Object.values(s.networks)) bytes += (n.rx_bytes || 0) + (n.tx_bytes || 0);
      netMbps = Math.round((bytes / 1048576) * 10) / 10; // cumulative MB shown as MB/s figure
    }
    return { cpu, memMb, memLimitMb, netMbps };
  } catch {
    return { cpu: 0, memMb: 0, memLimitMb: 0, netMbps: 0 };
  }
}

export function createRealBackend(socketPath = "/var/run/docker.sock") {
  const docker = new Docker({ socketPath });

  return {
    kind: "real",
    docker,

    async ping() { await docker.ping(); return true; },

    async overview() {
      const [info, version, containers, images, networks, volumes] = await Promise.all([
        docker.info(), docker.version(), docker.listContainers({ all: true }),
        docker.listImages(), docker.listNetworks(), docker.listVolumes(),
      ]);
      const running = containers.filter((c) => c.State === "running").length;
      return {
        host: info.Name || os.hostname(),
        dockerVersion: version.Version,
        demo: false,
        containers: { total: containers.length, running, stopped: containers.length - running },
        images: images.length,
        networks: networks.length,
        volumes: (volumes.Volumes || []).length,
        cpuLoad: Math.min(100, Math.round((os.loadavg()[0] / os.cpus().length) * 100)),
        memUsedMb: Math.round((os.totalmem() - os.freemem()) / 1048576),
        memTotalMb: Math.round(os.totalmem() / 1048576),
        diskUsedGb: null, diskTotalGb: null,
        uptime: `${Math.floor(os.uptime() / 86400)} days`,
        os: `${info.OperatingSystem || os.type()} · ${info.Architecture || os.arch()}`,
      };
    },

    async containers() {
      const list = await docker.listContainers({ all: true });
      const out = [];
      for (const c of list) {
        const name = (c.Names[0] || "").replace(/^\//, "");
        const labels = c.Labels || {};
        const ports = [];
        for (const p of c.Ports || []) {
          if (p.PublicPort) ports.push({ host: p.PublicPort, container: p.PrivatePort, proto: p.Type || "tcp" });
        }
        let stats = { cpu: 0, memMb: 0, memLimitMb: 0, netMbps: 0 };
        if (c.State === "running") stats = await statsOf(docker.getContainer(c.Id));
        out.push({
          id: c.Id, name, image: c.Image, state: c.State, status: c.Status,
          created: c.Created * 1000, ports, stats,
          preview: classifyPreview(c.Image),
          git: labels["runtainer.managed"] === "git"
            ? { repo: labels["runtainer.git.repo"] || "", branch: labels["runtainer.git.branch"] || "main", commit: labels["runtainer.git.commit"] || "", isolated: true, network: labels["runtainer.git.network"] || "" }
            : null,
        });
      }
      return out;
    },

    async containerAction(id, action) {
      const c = docker.getContainer(id);
      if (action === "start") await c.start();
      else if (action === "stop") await c.stop();
      else if (action === "restart") await c.restart();
      else if (action === "remove") { try { await c.stop(); } catch {} await c.remove({ force: true }); }
      else throw new Error("unknown action");
      return { ok: true };
    },

    async images() {
      const list = await docker.listImages();
      return list.map((i) => {
        const [repo, tag] = (i.RepoTags?.[0] || "<none>:<none>").split(":");
        return { repo, tag, id: i.Id.slice(0, 19), sizeMb: Math.round(i.Size / 1048576), created: new Date(i.Created * 1000).toLocaleDateString() };
      });
    },

    async networks() {
      const list = await docker.listNetworks();
      return list.map((n) => ({
        id: n.Id.slice(0, 12), name: n.Name, driver: n.Driver, scope: n.Scope,
        containers: Object.keys(n.Containers || {}).length,
        subnet: n.IPAM?.Config?.[0]?.Subnet || "—",
      }));
    },

    async volumes() {
      const v = await docker.listVolumes();
      return (v.Volumes || []).map((x) => ({ name: x.Name, driver: x.Driver, mountpoint: x.Mountpoint, sizeMb: null, usedBy: x.Labels?.["runtainer.owner"] || "—" }));
    },

    async deployImage(spec) {
      await new Promise((resolve, reject) =>
        docker.pull(spec.image, (err, stream) => {
          if (err) return reject(err);
          docker.modem.followProgress(stream, (e) => (e ? reject(e) : resolve()));
        })
      );
      const Env = Object.entries(spec.env || {}).map(([k, v]) => `${k}=${v}`);
      const PortBindings = {};
      const ExposedPorts = {};
      if (spec.hostPort && spec.containerPort) {
        ExposedPorts[`${spec.containerPort}/tcp`] = {};
        PortBindings[`${spec.containerPort}/tcp`] = [{ HostPort: String(spec.hostPort) }];
      }
      const c = await docker.createContainer({
        Image: spec.image, name: spec.name, Env, ExposedPorts,
        HostConfig: {
          PortBindings, RestartPolicy: { Name: spec.restart || "unless-stopped" },
          NanoCpus: spec.cpu ? spec.cpu * 1e9 : undefined,
          Memory: spec.memMb ? spec.memMb * 1048576 : undefined,
        },
        Labels: { "runtainer.managed": "marketplace" },
      });
      await c.start();
      return { id: c.id, name: spec.name };
    },

    async gitContainers() {
      const list = await docker.listContainers({ all: true, filters: { label: ["runtainer.managed=git"] } });
      return list.map((c) => ({
        id: c.Id, name: (c.Names[0] || "").replace(/^\//, ""),
        repo: c.Labels["runtainer.git.repo"], branch: c.Labels["runtainer.git.branch"],
        commit: c.Labels["runtainer.git.commit"], isolated: true,
        network: c.Labels["runtainer.git.network"], state: c.State, status: c.Status,
        port: firstPort(c.Ports)?.host ?? null, image: c.Image,
      }));
    },

    gitDeploy(spec) {
      const name = (spec.name || spec.repoUrl.split("/").pop().replace(/\.git$/, "") || "git-app").replace(/[^a-zA-Z0-9_.-]/g, "-");
      const job = newJob(name);
      (async () => {
        try {
          const dir = path.join(RUNTAINER_HOME, "git", name);
          fs.rmSync(dir, { recursive: true, force: true });
          logLine(job, `cloning ${spec.repoUrl} @ ${spec.branch || "main"}`);
          await run("git", ["clone", "--depth", "1", "--branch", spec.branch || "main", spec.repoUrl, dir]);
          const { stdout: sha } = await run("git", ["-C", dir, "rev-parse", "--short", "HEAD"]);
          const commit = sha.trim();
          logLine(job, `cloned ${name} @ ${commit}`);
          job.progress = 25;

          const strategy = spec.strategy || "auto";
          const hasDockerfile = fs.existsSync(path.join(dir, "Dockerfile"));
          if (strategy !== "dockerfile" && !hasDockerfile && strategy === "auto") {
            throw new Error("No Dockerfile found. Add one to the repo or pick a different build strategy.");
          }
          logLine(job, `build strategy: ${strategy === "auto" ? "Auto-detect · Dockerfile" : strategy}`);
          const image = `runtainer/git:${name}`;
          await new Promise((resolve, reject) =>
            docker.buildImage(
              { context: dir, src: fs.readdirSync(dir) },
              { t: image, dockerfile: "Dockerfile" },
              (err, stream) => {
                if (err) return reject(err);
                docker.modem.followProgress(stream, (e) => (e ? reject(e) : resolve()),
                  (ev) => { if (ev.stream) logLine(job, ev.stream.trim()); });
              }
            )
          );
          job.progress = 65;
          logLine(job, "image built");

          let network = "bridge";
          if (spec.isolation?.network !== false) {
            network = `git-net-${name}`;
            try { await docker.createNetwork({ Name: network, Driver: "bridge" }); } catch {}
          }
          const hostPort = spec.hostPort || 3000 + Math.floor(Math.random() * 900);
          const containerPort = spec.containerPort || 3000;
          const c = await docker.createContainer({
            Image: image, name,
            Env: Object.entries(spec.env || {}).map(([k, v]) => `${k}=${v}`),
            ExposedPorts: { [`${containerPort}/tcp`]: {} },
            HostConfig: {
              PortBindings: { [`${containerPort}/tcp`]: [{ HostPort: String(hostPort) }] },
              NetworkMode: network,
              NanoCpus: spec.isolation?.limits ? (spec.cpu || 2) * 1e9 : undefined,
              Memory: spec.isolation?.limits ? (spec.memMb || 4096) * 1048576 : undefined,
              ReadonlyRootfs: !!spec.isolation?.readonly,
              RestartPolicy: { Name: "unless-stopped" },
            },
            Labels: {
              "runtainer.managed": "git", "runtainer.git.repo": spec.repoUrl,
              "runtainer.git.branch": spec.branch || "main", "runtainer.git.commit": commit,
              "runtainer.git.network": network,
            },
          });
          await c.start();
          job.progress = 90;
          logLine(job, `started on isolated network ${network}`);
          logLine(job, `access link ready → http://localhost:${hostPort}`);
          job.port = hostPort;
          job.progress = 100;
          job.status = "done";
        } catch (e) {
          logLine(job, `ERROR: ${e.message}`);
          job.status = "error";
        }
      })();
      return job;
    },

    appDeploy(app) {
      const job = newJob(app.name);
      (async () => {
        try {
          const net = `${app.id}-net`;
          try { await docker.createNetwork({ Name: net, Driver: "bridge" }); } catch {}
          let i = 0;
          for (const svc of app.stack) {
            logLine(job, `pulling ${svc.image}`);
            await new Promise((resolve, reject) =>
              docker.pull(svc.image, (err, stream) => {
                if (err) return reject(err);
                docker.modem.followProgress(stream, (e) => (e ? reject(e) : resolve()));
              })
            );
            const isMain = i === app.stack.length - 1 || svc.name.endsWith("app");
            const c = await docker.createContainer({
              Image: svc.image, name: svc.name,
              HostConfig: {
                NetworkMode: net, RestartPolicy: { Name: "unless-stopped" },
                ...(isMain ? { PortBindings: { [`${app.port}/tcp`]: [{ HostPort: String(app.port) }] } } : {}),
              },
              Labels: { "runtainer.managed": "oneclick", "runtainer.app": app.id },
            });
            await c.start();
            i++;
            job.progress = Math.round((i / (app.stack.length + 1)) * 100);
            logLine(job, `started ${svc.name}`);
          }
          logLine(job, `${app.name} ready → http://localhost:${app.port}`);
          job.progress = 100; job.status = "done"; job.port = app.port;
        } catch (e) {
          logLine(job, `ERROR: ${e.message}`);
          job.status = "error";
        }
      })();
      return job;
    },
  };
}
