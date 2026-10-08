export interface ContainerPort { host: number; container: number; proto: string }
export interface ContainerStats { cpu: number; memMb: number; memLimitMb: number; netMbps: number }
export interface GitMeta { repo: string; branch: string; commit: string; isolated: boolean; network: string }

export interface ContainerInfo {
  id: string; name: string; image: string; state: string; status: string;
  created: number; ports: ContainerPort[]; stats: ContainerStats;
  preview: "dashboard" | "terminal" | "editor" | "media" | "dns" | "generic";
  git: GitMeta | null;
}

export interface Overview {
  host: string; dockerVersion: string; demo: boolean;
  containers: { total: number; running: number; stopped: number };
  images: number; networks: number; volumes: number;
  cpuLoad: number; memUsedMb: number; memTotalMb: number;
  diskUsedGb: number | null; diskTotalGb: number | null;
  uptime: string; os: string;
}

export interface ImageInfo { repo: string; tag: string; id: string; sizeMb: number; created: string }
export interface NetworkInfo { id: string; name: string; driver: string; scope: string; containers: number; subnet: string }
export interface VolumeInfo { name: string; driver: string; mountpoint: string; sizeMb: number | null; usedBy: string }

export interface MarketplaceApp {
  id: string; name: string; publisher: string; registry: string; image: string;
  pulls: string; icon: string; port: number; containerPort: number; verified: boolean;
}
export interface LinuxImage { id: string; name: string; tag: string; image: string; sizeMb: number; icon: string }

export interface OneClickApp {
  id: string; name: string; category: string; tagline: string;
  port: number; preview: string; icon: string;
  stack: { name: string; image: string }[];
}

export interface GitContainer {
  id: string; name: string; repo: string; branch: string; commit: string;
  isolated: boolean; network: string; state: string; status: string;
  port: number | null; image: string;
}

export interface Job {
  id: string; name: string; status: "building" | "done" | "error";
  progress: number; log: string[]; port?: number;
}

export interface Health { ok: boolean; version: string; mode: "demo" | "real"; demo: boolean }

export type PageId =
  | "containers" | "marketplace" | "git" | "oneclick" | "migration"
  | "overview" | "images" | "networks" | "volumes" | "settings";
