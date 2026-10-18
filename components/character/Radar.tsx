import { STAT_LABELS } from "@/lib/constants";

export default function Radar({ stats, color }: { stats: number[]; color: string }) {
  const P = (i: number, v: number) => {
    const a = ((-90 + i * 60) * Math.PI) / 180;
    return [150 + v * 1.1 * Math.cos(a), 130 + v * 1.1 * Math.sin(a)] as const;
  };
  const poly = (f: (i: number) => number) =>
    STAT_LABELS.map((_, i) => P(i, f(i)).map((n) => n.toFixed(0)).join(",")).join(" ");
  return (
    <svg viewBox="0 -14 300 290" className="rad">
      {[25, 50, 75, 100].map((k) => (
        <polygon key={k} points={poly(() => k)} fill="none" stroke={`${color}33`} />
      ))}
      {STAT_LABELS.map((l, i) => {
        const [x, y] = P(i, 100), [tx, ty] = P(i, 120);
        return (
          <g key={l}>
            <line x1={150} y1={130} x2={x} y2={y} stroke={`${color}33`} />
            <text x={tx} y={ty + 3} textAnchor="middle" className="rl">{l}</text>
          </g>
        );
      })}
      <polygon points={poly((i) => stats[i] ?? 0)} fill={`${color}55`} stroke={color} strokeWidth={2} />
    </svg>
  );
}