// Minimal hand-drawn SVG marks for marketplace apps and Linux distros.
const wrap = (bg: string, children: React.ReactNode) => (
  <svg viewBox="0 0 40 40" className="h-10 w-10">
    <rect width="40" height="40" rx="9" fill={bg} />
    {children}
  </svg>
);

export function AppIcon({ id, size = 40 }: { id: string; size?: number }) {
  const s = { width: size, height: size };
  switch (id) {
    case "nginx":
      return <span style={s} className="inline-block">{wrap("#0B3D2E", <>
        <rect x="11" y="13" width="18" height="4" rx="1.5" fill="#34C759" />
        <rect x="11" y="19" width="18" height="4" rx="1.5" fill="#34C759" opacity=".75" />
        <rect x="11" y="25" width="12" height="4" rx="1.5" fill="#34C759" opacity=".5" />
      </>)}</span>;
    case "postgres":
      return <span style={s} className="inline-block">{wrap("#13293D", <>
        <ellipse cx="20" cy="14" rx="8" ry="3.2" fill="#4FA8EF" />
        <path d="M12 14v10c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V14" fill="none" stroke="#4FA8EF" strokeWidth="2.4" />
        <path d="M12 19c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2" fill="none" stroke="#4FA8EF" strokeWidth="2.4" opacity=".6" />
      </>)}</span>;
    case "redis":
      return <span style={s} className="inline-block">{wrap("#3D1420", <>
        <path d="M22 9l-9 12h6l-3 10 10-13h-6.5z" fill="#FF4D5E" />
      </>)}</span>;
    case "grafana":
      return <span style={s} className="inline-block">{wrap("#3D2A12", <>
        <path d="M9 28l6-9 4 4 6-11 6 6" fill="none" stroke="#F59E0B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="31" cy="18" r="2.2" fill="#F59E0B" />
      </>)}</span>;
    case "homeassistant":
      return <span style={s} className="inline-block">{wrap("#12303D", <>
        <path d="M20 9l10 9h-3v9h-5v-6h-4v6h-5v-9h-3z" fill="#2ECBD9" />
      </>)}</span>;
    case "nextcloud":
      return <span style={s} className="inline-block">{wrap("#12314D", <>
        <circle cx="20" cy="20" r="10" fill="none" stroke="#4FA8EF" strokeWidth="2.6" />
        <circle cx="20" cy="20" r="3.4" fill="#4FA8EF" />
      </>)}</span>;
    case "jellyfin":
      return <span style={s} className="inline-block">{wrap("#2A1538", <>
        <path d="M15 12l13 8-13 8z" fill="#B565E8" />
        <path d="M12 30q8-4 16 0" stroke="#6E4FA8" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </>)}</span>;
    case "portainer":
      return <span style={s} className="inline-block">{wrap("#0E2A45", <>
        <rect x="11" y="12" width="5" height="5" rx="1" fill="#4FA8EF" />
        <rect x="17.5" y="12" width="5" height="5" rx="1" fill="#4FA8EF" opacity=".8" />
        <rect x="24" y="12" width="5" height="5" rx="1" fill="#4FA8EF" opacity=".6" />
        <path d="M9 19h22l-2.6 8.4a2 2 0 01-1.9 1.4H13.5a2 2 0 01-1.9-1.4z" fill="#2F9BE8" />
      </>)}</span>;
    case "ubuntu":
      return <span style={s} className="inline-block">{wrap("#3D1A0E", <>
        <circle cx="20" cy="20" r="9.5" fill="none" stroke="#F47421" strokeWidth="2.6" />
        <circle cx="20" cy="11.5" r="2.1" fill="#F47421" /><circle cx="12.6" cy="24.2" r="2.1" fill="#F47421" /><circle cx="27.4" cy="24.2" r="2.1" fill="#F47421" />
      </>)}</span>;
    case "debian":
      return <span style={s} className="inline-block">{wrap("#3D1218", <>
        <path d="M26 12c-5-3-12-1-13 5-.8 5 3 9 8 9 4.4 0 7-2.8 7-6 0-2.8-2.2-5-5-5-2.4 0-4 1.8-4 3.8" fill="none" stroke="#E84D6A" strokeWidth="2.4" strokeLinecap="round" />
      </>)}</span>;
    case "alpine":
      return <span style={s} className="inline-block">{wrap("#12283D", <>
        <path d="M8 28l8-14 5 8 3-4 8 10z" fill="#4FA8EF" />
      </>)}</span>;
    case "fedora":
      return <span style={s} className="inline-block">{wrap("#122A45", <>
        <path d="M25 10h-4c-5 0-7 3-7 7v13" fill="none" stroke="#51A2DA" strokeWidth="3" strokeLinecap="round" />
        <path d="M12 22h11" stroke="#51A2DA" strokeWidth="3" strokeLinecap="round" />
      </>)}</span>;
    case "arch":
      return <span style={s} className="inline-block">{wrap("#12303D", <>
        <path d="M20 9l9 20h-5.5L20 19.5 16.5 29H11z" fill="#2ECBD9" />
        <rect x="17" y="25" width="6" height="2.6" rx="1.3" fill="#0C0F15" />
      </>)}</span>;
    case "opensuse":
      return <span style={s} className="inline-block">{wrap("#1E3312", <>
        <path d="M28 14c-2-3-8-4-11-1s-4 8-1 11 8 4 11 1" fill="none" stroke="#8CC63F" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="26" cy="15" r="2" fill="#8CC63F" />
      </>)}</span>;
    case "mail":
      return <span style={s} className="inline-block">{wrap("#12303D", <>
        <rect x="9" y="13" width="22" height="15" rx="2.5" fill="none" stroke="#2ECBD9" strokeWidth="2.4" />
        <path d="M10 15l10 8 10-8" fill="none" stroke="#2ECBD9" strokeWidth="2.4" strokeLinecap="round" />
      </>)}</span>;
    case "web":
      return <span style={s} className="inline-block">{wrap("#13293D", <>
        <circle cx="20" cy="20" r="10" fill="none" stroke="#4FA8EF" strokeWidth="2.4" />
        <path d="M10 20h20M20 10c-5 5-5 15 0 20M20 10c5 5 5 15 0 20" fill="none" stroke="#4FA8EF" strokeWidth="2" opacity=".8" />
      </>)}</span>;
    case "chat":
      return <span style={s} className="inline-block">{wrap("#123D2A", <>
        <path d="M10 12h20v12H18l-6 5v-5h-2z" fill="none" stroke="#34C759" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M14 18h12M14 21h7" stroke="#34C759" strokeWidth="2" strokeLinecap="round" opacity=".7" />
      </>)}</span>;
    case "dev":
      return <span style={s} className="inline-block">{wrap("#23133D", <>
        <path d="M15 13l-6 7 6 7M25 13l6 7-6 7" fill="none" stroke="#B565E8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </>)}</span>;
    default:
      return <span style={s} className="inline-block">{wrap("#1A2432", <>
        <path d="M20 9l9 5v10l-9 5-9-5V14z" fill="none" stroke="#4FA8EF" strokeWidth="2.4" strokeLinejoin="round" />
      </>)}</span>;
  }
}
