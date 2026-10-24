// lib/generateLocationSvg.ts

export type LocationStylePreset = "mixed" | "classic" | "japan" | "futuristic" | "ruins" | "outpost";

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return { h: 340, s: 70, l: 35 };

  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function seededRandom(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return function (index: number) {
    const x = Math.sin(hash + index * 13.37) * 10000;
    return x - Math.floor(x);
  };
}

export function generateLocationSvg(
  seed: string = "location",
  themeColor: string = "#38c8ff",
  preset: LocationStylePreset = "mixed"
): string {
  const rand = seededRandom(seed);
  const { h, s } = hexToHsl(themeColor);

  const primaryColor = themeColor;
  const accentGlow = `hsl(${h}, ${Math.max(s, 70)}%, 75%)`;

  // 1. ดวงจันทร์ / แหล่งพลังงาน
  const cx = 120 + rand(2) * 360;
  const cy = 60 + rand(3) * 50;
  let celestialSvg = "";

  if (preset === "japan" || preset === "classic") {
    celestialSvg = `<circle cx='${cx}' cy='${cy}' r='42' fill='${accentGlow}' opacity='0.85' filter='drop-shadow(0 0 16px ${primaryColor})'/>`;
  } else if (preset === "futuristic") {
    celestialSvg = `<g transform='translate(${cx},${cy})'>
      <path d='M0-35 A35 35 0 1 1 -25 25 A30 30 0 1 0 0-35 Z' fill='${accentGlow}' opacity='0.9'/>
    </g>`;
  } else if (preset === "ruins") {
    celestialSvg = `<g transform='translate(${cx},${cy})'>
      <circle cx='0' cy='0' r='38' fill='none' stroke='${primaryColor}' stroke-width='3' opacity='0.8'/>
      <circle cx='0' cy='0' r='30' fill='#0c0610'/>
      <circle cx='0' cy='0' r='48' fill='none' stroke='${accentGlow}' stroke-width='1' stroke-dasharray='4 6' opacity='0.6'/>
    </g>`;
  } else {
    // mixed & outpost
    celestialSvg = `<circle cx='${cx}' cy='${cy}' r='38' fill='${accentGlow}' opacity='0.85'/>`;
  }

  // 2. สิ่งก่อสร้าง
  let structures = "";
  const count = preset === "classic" ? 14 : 8 + Math.floor(rand(4) * 6);

  for (let i = 0; i < count; i++) {
    const x = i * (580 / count) - 10 + rand(i + 10) * 15;
    const height = 60 + rand(i + 30) * 160;
    const y = 300 - height;
    const width = 30 + rand(i + 40) * 40;

    // เลือกสไตล์รูปทรง
    let activeStyle = preset;
    if (preset === "mixed") {
      const styles: LocationStylePreset[] = ["classic", "japan", "futuristic", "ruins", "outpost"];
      activeStyle = styles[Math.floor(rand(i + 99) * styles.length)];
    }

    if (activeStyle === "classic") {
      // 🏢 ตึกเรียบๆ สี่เหลี่ยมแบบเดิม
      structures += `<rect x='${x}' y='${y}' width='${width}' height='${height}' fill='#0c0610'/>`;
      if (rand(i + 40) > 0.4) {
        structures += `<rect x='${x + 6}' y='${y + 10}' width='4' height='4' fill='${primaryColor}'/>`;
      }
    } else if (activeStyle === "japan") {
      // ⛩️ ญี่ปุ่น / Torii / วัด
      if (i % 2 === 0) {
        const gateW = 40 + rand(i + 50) * 15;
        const gateH = 65 + rand(i + 52) * 35;
        const gateY = 300 - gateH;
        structures += `<path d='M${x} 300 V${gateY} M${x + gateW} 300 V${gateY}' stroke='#0c0610' stroke-width='6'/>`;
        structures += `<path d='M${x - 8} ${gateY + 8} H${x + gateW + 8}' stroke='#0c0610' stroke-width='5'/>`;
        structures += `<path d='M${x - 12} ${gateY} Q${x + gateW / 2} ${gateY - 8} ${x + gateW + 12} ${gateY}' stroke='${primaryColor}' stroke-width='4' fill='none'/>`;
      } else {
        structures += `<rect x='${x}' y='${y}' width='${width}' height='${height}' fill='#0c0610'/>`;
        structures += `<path d='M${x - 6} ${y} L${x + width / 2} ${y - 12} L${x + width + 6} ${y} Z' fill='${primaryColor}' opacity='0.7'/>`;
      }
    } else if (activeStyle === "futuristic") {
      // 🏙️ เมืองอนาคต
      structures += `<rect x='${x}' y='${y}' width='${width}' height='${height}' fill='#0c0610'/>`;
      if (rand(i + 50) > 0.3) {
        structures += `<line x1='${x + width / 2}' y1='${y}' x2='${x + width / 2}' y2='${y - 25}' stroke='#0c0610' stroke-width='3'/>`;
        structures += `<circle cx='${x + width / 2}' cy='${y - 25}' r='3' fill='${primaryColor}'/>`;
      }
      if (rand(i + 60) > 0.4) {
        const winY = y + 15 + rand(i + 70) * 30;
        structures += `<rect x='${x + 6}' y='${winY}' width='${width - 12}' height='6' fill='${primaryColor}' opacity='0.85'/>`;
      }
    } else if (activeStyle === "ruins") {
      // 🔮 เสาผลึกโบราณลอยตัว
      const obW = 20 + rand(i + 55) * 15;
      const floatY = y + 15;
      structures += `<polygon points='${x + obW / 2},${floatY - 35} ${x + obW},${floatY} ${x + obW / 2},${300} ${x},${floatY}' fill='#0d0714' stroke='${primaryColor}' stroke-width='1.5'/>`;
    } else {
      // 🗼 หอคอยเฝ้าระวัง
      const towerW = 20 + rand(i + 45) * 10;
      const topY = y - 15;
      structures += `<path d='M${x} 300 L${x + 5} ${topY + 15} L${x + towerW - 5} ${topY + 15} L${x + towerW} 300 Z' fill='#0a050e'/>`;
      structures += `<rect x='${x - 4}' y='${topY}' width='${towerW + 8}' height='18' fill='#0c0610'/>`;
      structures += `<line x1='${x - 2}' y1='${topY + 9}' x2='${x + towerW + 2}' y2='${topY + 9}' stroke='${primaryColor}' stroke-width='2'/>`;
    }
  }

  // 3. ละอองผลึก
  let crystals = "";
  for (let k = 0; k < 10; k++) {
    const px = rand(k + 80) * 580 + 10;
    const py = rand(k + 90) * 180 + 10;
    const sizeNum = 2 + rand(k + 100) * 5;
    const size = sizeNum.toFixed(1);
    const rot = (rand(k + 110) * 180).toFixed(0);

    crystals += `<path d='M0,-${sizeNum} L${sizeNum * 0.6},0 L0,${sizeNum * 1.4} L-${sizeNum * 0.6},0 Z' transform='translate(${px},${py}) rotate(${rot})' fill='${accentGlow}' opacity='0.75'/>`;
  }

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 300'>
    <defs>
      <linearGradient id='bgGrad' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='hsl(${h}, ${Math.max(s, 50)}%, 10%)'/>
        <stop offset='60%' stop-color='hsl(${h}, ${Math.max(s, 60)}%, 22%)'/>
        <stop offset='100%' stop-color='#08050a'/>
      </linearGradient>
    </defs>
    <rect width='600' height='300' fill='url(#bgGrad)'/>
    ${celestialSvg}
    ${crystals}
    ${structures}
    <path d='M0 260 Q150 240 300 265 T600 250 V300 H0 Z' fill='${primaryColor}' opacity='0.15'/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}