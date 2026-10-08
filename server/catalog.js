// RUNTAINER catalogs — marketplace templates, Linux base images, one-click app stacks.

export const registries = ["All", "Docker Hub", "GHCR", "LinuxServer.io", "Bitnami"];

export const marketplaceApps = [
  { id: "nginx", name: "Nginx", publisher: "Docker Official", registry: "Docker Hub", image: "nginx:alpine", pulls: "1.2B", icon: "nginx", port: 8080, containerPort: 80, verified: true },
  { id: "postgres", name: "PostgreSQL", publisher: "Docker Official", registry: "Docker Hub", image: "postgres:16", pulls: "890M", icon: "postgres", port: 5432, containerPort: 5432, verified: true },
  { id: "redis", name: "Redis", publisher: "Docker Official", registry: "Docker Hub", image: "redis:7-alpine", pulls: "1.5B", icon: "redis", port: 6379, containerPort: 6379, verified: true },
  { id: "grafana", name: "Grafana", publisher: "Grafana Labs", registry: "Docker Hub", image: "grafana/grafana:latest", pulls: "210M", icon: "grafana", port: 3100, containerPort: 3000, verified: true },
  { id: "homeassistant", name: "Home Assistant", publisher: "Nabu Casa", registry: "GHCR", image: "ghcr.io/home-assistant/home-assistant:stable", pulls: "96M", icon: "homeassistant", port: 8123, containerPort: 8123, verified: true },
  { id: "nextcloud", name: "Nextcloud", publisher: "Nextcloud GmbH", registry: "Docker Hub", image: "nextcloud:latest", pulls: "140M", icon: "nextcloud", port: 8088, containerPort: 80, verified: true },
  { id: "jellyfin", name: "Jellyfin", publisher: "Jellyfin Team", registry: "Docker Hub", image: "jellyfin/jellyfin:latest", pulls: "48M", icon: "jellyfin", port: 8096, containerPort: 8096, verified: true },
  { id: "portainer", name: "Portainer CE", publisher: "Portainer.io", registry: "Docker Hub", image: "portainer/portainer-ce:latest", pulls: "620M", icon: "portainer", port: 9443, containerPort: 9443, verified: true },
];

export const linuxBaseImages = [
  { id: "ubuntu", name: "Ubuntu", tag: "24.04 LTS", image: "ubuntu:24.04", sizeMb: 78, icon: "ubuntu" },
  { id: "debian", name: "Debian", tag: "12 bookworm", image: "debian:12", sizeMb: 55, icon: "debian" },
  { id: "alpine", name: "Alpine", tag: "3.20", image: "alpine:3.20", sizeMb: 7.8, icon: "alpine" },
  { id: "fedora", name: "Fedora", tag: "41", image: "fedora:41", sizeMb: 162, icon: "fedora" },
  { id: "arch", name: "Arch Linux", tag: "rolling", image: "archlinux:latest", sizeMb: 148, icon: "arch" },
  { id: "opensuse", name: "openSUSE", tag: "Leap 15.6", image: "opensuse/leap:15.6", sizeMb: 120, icon: "opensuse" },
];

// One-click, prepackaged deployments. Each is a small stack that RUNTAINER
// brings up with sensible defaults; the user can fine-tune before launching.
export const oneClickApps = [
  {
    id: "nextcloud-hub", name: "Nextcloud Auto Deploy", category: "Files & Sync",
    tagline: "Private cloud storage, files, calendar and contacts — preconfigured with a database and cron.",
    port: 8088, preview: "dashboard", icon: "nextcloud",
    stack: [
      { name: "nextcloud-db", image: "postgres:16-alpine" },
      { name: "nextcloud-redis", image: "redis:7-alpine" },
      { name: "nextcloud-app", image: "nextcloud:latest" },
      { name: "nextcloud-cron", image: "nextcloud:latest" },
    ],
  },
  {
    id: "mail-platform", name: "Email Platform", category: "Communication",
    tagline: "Complete mail server — SMTP, IMAP, webmail and spam filtering, ready to run with one click.",
    port: 8443, preview: "dashboard", icon: "mail",
    stack: [
      { name: "mail-core", image: "mailu/postfix:latest" },
      { name: "mail-imap", image: "mailu/dovecot:latest" },
      { name: "mail-webmail", image: "mailu/roundcube:latest" },
      { name: "mail-filter", image: "mailu/rspamd:latest" },
    ],
  },
  {
    id: "web-host", name: "Web Host", category: "Hosting",
    tagline: "Host websites instantly — reverse proxy, SSL certificates and a site manager in one stack.",
    port: 8181, preview: "dashboard", icon: "web",
    stack: [
      { name: "web-proxy", image: "jc21/nginx-proxy-manager:latest" },
      { name: "web-edge", image: "nginx:alpine" },
      { name: "web-certbot", image: "certbot/certbot:latest" },
    ],
  },
  {
    id: "chat-client", name: "Chat Client", category: "Communication",
    tagline: "Team chat with channels, DMs and file sharing — a self-hosted Rocket.Chat workspace.",
    port: 3100, preview: "dashboard", icon: "chat",
    stack: [
      { name: "chat-db", image: "mongo:7" },
      { name: "chat-app", image: "rocket.chat:latest" },
    ],
  },
  {
    id: "dev-hub", name: "Dev Hub", category: "Development",
    tagline: "A developer command center — git hosting, browser IDE and CI runner, prewired together.",
    port: 3000, preview: "editor", icon: "dev",
    stack: [
      { name: "dev-gitea", image: "gitea/gitea:latest" },
      { name: "dev-ide", image: "coder/code-server:latest" },
      { name: "dev-runner", image: "gitea/act_runner:latest" },
    ],
  },
  {
    id: "monitoring", name: "Monitoring Stack", category: "Operations",
    tagline: "Grafana + Prometheus dashboards for every container on this host, auto-discovered.",
    port: 3101, preview: "dashboard", icon: "grafana",
    stack: [
      { name: "mon-prometheus", image: "prom/prometheus:latest" },
      { name: "mon-grafana", image: "grafana/grafana:latest" },
      { name: "mon-cadvisor", image: "gcr.io/cadvisor/cadvisor:latest" },
    ],
  },
];
