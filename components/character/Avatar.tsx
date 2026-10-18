export default function Avatar({ url, color, size = 64 }: { url?: string | null; color: string; size?: number }) {
  const s = { width: size, height: size, border: `1px solid ${color}`, flex: "none" } as const;
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" referrerPolicy="no-referrer" style={{ ...s, objectFit: "cover" }} />
  ) : (
    <div style={{ ...s, background: `linear-gradient(135deg, ${color}88, #130c15)` }} />
  );
}