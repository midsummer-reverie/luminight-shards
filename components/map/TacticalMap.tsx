"use client";

import Link from "next/link";

interface TacticalMapProps {
  onHover: (id: string | null) => void;
  locDataMap?: Record<string, any>;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ready: { label: "พร้อม", color: "#6fe3a0" },
  doom: { label: "ดูม", color: "#ff5f6f" },
  hurt: { label: "บาดเจ็บ", color: "#ff9f5f" },
  mission: { label: "ปฏิบัติการ", color: "#7be0ff" },
  rest: { label: "พักผ่อน", color: "#a78bfa" },
  root: { label: "ติดรูท", color: "#ffd35f" },
};

/* ---------- เครื่องมือวาดเส้นโค้งธรรมชาติ ---------- */
type Pt = readonly [number, number];
const f = (n: number) => +n.toFixed(1);
const segs = (p: Pt[]) =>
  p.slice(0, -1).map((_, i) => {
    const a = p[Math.max(i - 1, 0)], b = p[i], c = p[i + 1], d = p[Math.min(i + 2, p.length - 1)];
    return `C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (d[0] - b[0]) / 6)} ${f(c[1] - (d[1] - b[1]) / 6)} ${c[0]} ${c[1]}`;
  }).join(" ");
const rev = (p: Pt[]) => [...p].reverse();
const open = (p: Pt[]) => `M${p[0][0]} ${p[0][1]} ${segs(p)}`;
const trace = (...edges: Pt[][]) => `M${edges[0][0][0]} ${edges[0][0][1]} ${edges.map(segs).join(" ")} Z`;

/* ---------- พิกัดขอบเขตแผนที่ ---------- */
const O_CIVIC: Pt[] = [[232, 62], [300, 58], [365, 64], [430, 82]];
const O_GUILD: Pt[] = [[430, 82], [492, 118], [532, 162]];
const O_BIZ: Pt[] = [[532, 162], [545, 205], [528, 252], [488, 290]];
const O_OUTLAW: Pt[] = [[488, 290], [430, 318], [360, 330], [300, 326]];
const O_RES: Pt[] = [[300, 326], [235, 334], [170, 318], [112, 288], [70, 245], [58, 198], [72, 150], [112, 108], [170, 76], [232, 62]];

const K_CIVIC: Pt[] = [[270, 146], [290, 136], [318, 138], [345, 152]];
const K_GUILD: Pt[] = [[345, 152], [358, 168], [363, 181]];
const K_BIZ: Pt[] = [[363, 181], [368, 200], [355, 221]];
const K_OUTLAW: Pt[] = [[355, 221], [334, 244], [298, 252]];
const K_RES: Pt[] = [[298, 252], [264, 244], [242, 224], [236, 196], [248, 166], [270, 146]];

const R1: Pt[] = [[270, 146], [258, 118], [250, 90], [232, 62]];
const R2: Pt[] = [[345, 152], [366, 126], [404, 108], [430, 82]];
const R3: Pt[] = [[363, 181], [415, 166], [470, 170], [532, 162]];
const R4: Pt[] = [[355, 221], [398, 232], [440, 262], [488, 290]];
const R5: Pt[] = [[298, 252], [310, 280], [292, 304], [300, 326]];

const CITY_BORDER = trace(O_CIVIC, O_GUILD, O_BIZ, O_OUTLAW, O_RES);

const DISTRICTschaft = [
  { id: "l1", d: trace(K_CIVIC, K_GUILD, K_BIZ, K_OUTLAW, K_RES), fill: "#ff5fa833" },
  { id: "l2", d: trace(O_GUILD, rev(R3), rev(K_GUILD), R2), fill: "#a78bfa2e" },
  { id: "l5", d: trace(O_CIVIC, rev(R2), rev(K_CIVIC), R1), fill: "#7be0ff2e" },
  { id: "l4", d: trace(O_BIZ, rev(R4), rev(K_BIZ), R3), fill: "#6fe3a02e" },
  { id: "l6", d: trace(O_OUTLAW, rev(R5), rev(K_OUTLAW), R4), fill: "#ff9f5f2e" },
  { id: "l3", d: trace(O_RES, rev(R1), rev(K_RES), R5), fill: "#ffffff14" },
];

const RIVERS: { pts: Pt[]; w: number; d: string }[] = [
  { w: 8, pts: [[130, -4], [138, 28], [132, 58], [150, 88], [172, 120], [202, 152], [216, 190], [212, 230], [226, 268], [262, 296], [310, 306], [352, 316], [400, 326], [452, 340], [505, 346], [560, 352], [604, 356]] as Pt[] },
  { w: 5, pts: [[276, -4], [284, 30], [274, 60], [262, 92], [250, 122], [230, 156], [216, 190]] as Pt[] },
  { w: 5, pts: [[226, 268], [224, 300], [214, 334], [220, 384]] as Pt[] },
  { w: 5, pts: [[352, 316], [346, 346], [352, 384]] as Pt[] },
  { w: 4, pts: [[604, 250], [566, 266], [520, 284], [478, 300], [450, 320], [448, 340]] as Pt[] },
].map((r) => ({ ...r, d: open(r.pts) }));

const BRIDGES: [number, number, number][] = [
  [202, 152, 148],
  [262, 296, 118],
  [310, 306, 100],
];

export default function TacticalMap({ onHover, locDataMap }: TacticalMapProps) {
  const LOCATIONS = [
    { id: "l1", jp: "指令区", en: "COMMAND", x: 300, y: 195, href: "/forums/l1" },
    { id: "l2", jp: "組合区", en: "GUILD OFFICES", x: 450, y: 130, href: "/forums/l2" },
    { id: "l5", jp: "教育地区", en: "CIVIC", x: 340, y: 100, href: "/forums/l5" },
    { id: "l4", jp: "商業地区", en: "BUSINESS", x: 450, y: 188, href: "/forums/l4" },
    { id: "l6", jp: "暗黒街", en: "OUTLAW", x: 418, y: 268, href: "/forums/l6" },
    { id: "l3", jp: "居住区", en: "RESIDENTS", x: 180, y: 220, href: "/forums/l3" },
    { id: "l7", jp: "エリア", en: "AREA", x: 75, y: 55, href: "/forums/l7" },
  ];

  const starPts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 24 : 58;
    const a = (-90 + i * 36) * Math.PI / 180;
    return `${(300 + r * Math.cos(a)).toFixed(0)},${(190 + r * Math.sin(a)).toFixed(0)}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 600 380" className="map">
      <defs>
        <pattern id="gp" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0H0V30" fill="none" stroke="#ff5fa81a" />
        </pattern>
        <pattern id="hz" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="9" height="9" fill="#ff5f5f14" />
          <path d="M0 0V9" stroke="#ff5f5f55" strokeWidth="3" />
        </pattern>
        <radialGradient id="cg">
          <stop offset="0" stopColor="#ff5fa8" stopOpacity=".35" />
          <stop offset="1" stopColor="#ff5fa8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background Grid & Stars */}
      <rect width="600" height="380" fill="url(#gp)" />
      <circle cx="300" cy="190" r="210" fill="url(#cg)" style={{ pointerEvents: "none" }} />

      {Array.from({ length: 50 }).map((_, i) => (
        <circle
          key={`st${i}`}
          cx={(i * 137.5) % 600}
          cy={(i * 71.3) % 380}
          r={0.6 + (i % 3) * 0.5}
          fill="#ffd6ea"
          className="st"
          style={{ animationDelay: `${(i % 7) * 0.4}s`, pointerEvents: "none" }}
        />
      ))}

      {/* Districts & City Border */}
      <g>
        <Link href="/forums/l7" passHref>
          <path
            className="dz"
            fillRule="evenodd"
            d={`M0 0H600V380H0Z ${CITY_BORDER}`}
            fill="url(#hz)"
            onMouseEnter={() => onHover("l7")}
            onMouseLeave={() => onHover(null)}
            style={{ cursor: "pointer" }}
          />
        </Link>

        {DISTRICTschaft.map((z) => (
          <Link href={`/forums/${z.id}`} key={z.id} passHref>
            <path
              className="dz"
              d={z.d}
              fill={z.fill}
              stroke="#ff5fa888"
              strokeWidth="1.2"
              strokeLinejoin="round"
              onMouseEnter={() => onHover(z.id)}
              onMouseLeave={() => onHover(null)}
              style={{ cursor: "pointer" }}
            />
          </Link>
        ))}

        <path d={CITY_BORDER} fill="none" stroke="#ff5fa8" strokeWidth="2" strokeDasharray="10 4" style={{ pointerEvents: "none" }} />
      </g>

      {/* Rivers & Bridges */}
      <g style={{ pointerEvents: "none" }} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {RIVERS.map((r, i) => (
          <g key={`rv${i}`}>
            <path d={r.d} stroke="rgb(129, 187, 221)" strokeOpacity=".55" strokeWidth={r.w + 4} />
            <path d={r.d} stroke="rgb(129, 187, 221)" strokeOpacity=".5" strokeWidth={r.w} />
            <path d={r.d} stroke="#3f6ea4" strokeOpacity=".45" strokeWidth="1" strokeDasharray="3 9">
              <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="3s" repeatCount="indefinite" />
            </path>
          </g>
        ))}
        {BRIDGES.map(([x, y, a], i) => (
          <g key={`br${i}`} transform={`translate(${x},${y}) rotate(${a})`}>
            <rect x="-9" y="-2.5" width="18" height="5" fill="#08050a" stroke="#ffd6ea" strokeWidth="1" />
          </g>
        ))}
      </g>

      {/* Map Decorations & Icons */}
      <g style={{ pointerEvents: "none" }}>
        <g className="rn">
          <circle cx="300" cy="190" r="72" fill="none" stroke="#ffd6ea88" strokeDasharray="3 5" />
          <circle cx="300" cy="190" r="96" fill="none" stroke="#ff5fa855" />
          {Array.from({ length: 8 }).map((_, i) => (
            <text key={i} x={300 + Math.cos(i * Math.PI / 4) * 84} y={194 + Math.sin(i * Math.PI / 4) * 84} textAnchor="middle" fill="#ffd6ea" fontSize="12">
              {"ᚠᚢᚦᚨᚱᚲᚷᚹ"[i]}
            </text>
          ))}
        </g>
        <polygon className="rn2" points={starPts} fill="none" stroke="#ff5fa888" />

        {[[205, 100], [392, 256], [170, 290], [500, 225], [120, 165]].map(([x, y], i) => (
          <g key={`sp${i}`} transform={`translate(${x},${y})`}>
            <g className="sp" style={{ animationDelay: `${i * 0.7}s` }}>
              <path d="M0-22L6-4 0 8-6-4Z" fill="#ffb3d9" />
              <path d="M0-22L6-4 0 8Z" fill="#ff5fa8" />
            </g>
          </g>
        ))}

        <path d="M70 232L180 212 300 218 420 206 548 218" fill="none" stroke="#ffd6ea77" strokeDasharray="6 3" />
        {[[180, 212], [420, 206], [300, 218]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill="#08050a" stroke="#ffd6ea" />)}

        {[
          ["⛩", 130, 130], ["✚", 150, 260], ["⚑", 435, 102], ["♣", 300, 90],
          ["⚙", 385, 300], ["★", 490, 148], ["⚓", 90, 210], ["♜", 300, 190],
        ].map(([icon, x, y], i) => (
          <text key={i} x={x as number} y={y as number} className="ic" textAnchor="middle">
            {icon}
          </text>
        ))}
      </g>

      {/* Radar Sweep Effect */}
      <g className="sweep" style={{ transformOrigin: "300px 190px", pointerEvents: "none" }}>
        <path d="M300 190L300 -200" stroke="#ff5fa8" strokeWidth="2.5" opacity=".6" />
        <path d="M300 190L550 -100 300 -200Z" fill="url(#cg)" opacity=".4" />
      </g>

      {/* Location Pins */}
      {LOCATIONS.map((l) => (
        <Link href={l.href} key={l.id} passHref>
          <g className="pin" transform={`translate(${l.x},${l.y})`} onMouseEnter={() => onHover(l.id)} onMouseLeave={() => onHover(null)} style={{ cursor: "pointer" }}>
            <circle className="pl" r="10" />
            <path d="M0-9L7 0 0 9-7 0Z" />
            <text y="27" textAnchor="middle">{l.jp}</text>
            <text y="39" textAnchor="middle" className="ml">{l.en}</text>
          </g>
        </Link>
      ))}

      {/* Character Avatars on Map */}
      <g style={{ pointerEvents: "none" }}>
        {Object.entries(locDataMap || {}).map(([key, zone]: [string, any]) => {
          if (!zone.residents || zone.residents.length === 0) return null;

          const locMeta = LOCATIONS.find((l) => l.id === key);
          if (!locMeta) return null;

          return zone.residents.map((char: any, cIdx: number) => {
            const offsetX = (cIdx % 3) * 16 - 8;
            const offsetY = Math.floor(cIdx / 3) * 16 - 8;
            const stColor = STATUS_MAP[char.status || "ready"]?.color || "#6fe3a0";

            return (
              <g key={`map-char-${key}-${char.id}-${cIdx}`} transform={`translate(${locMeta.x + offsetX}, ${locMeta.y + offsetY - 18})`}>
                <circle r="11" fill="#120a16" stroke={stColor} strokeWidth="2" />
                {char.faceUrl ? (
                  <image
                    href={char.faceUrl}
                    x="-9"
                    y="-9"
                    width="18"
                    height="18"
                    clipPath="circle(9px at center)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : null}
              </g>
            );
          });
        })}
      </g>

      {/* Footer Details */}
      <text x="528" y="350" fill="#ff5f5f" fontSize="22" style={{ pointerEvents: "none" }}>☣</text>
      <text x="12" y="368" className="ml" style={{ pointerEvents: "none" }}>新星市 SHINSEI · CONTAMINATION RING 100%→</text>
    </svg>
  );
}