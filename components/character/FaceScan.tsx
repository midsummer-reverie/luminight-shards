// ภาพหน้าตรง + เส้นสแกนวิ่งขึ้นลง (ภาพมาจากลิงก์ภายนอกเท่านั้น ถ้าไม่มีใช้ภาพใบหน้าเส้นตามสีตัวละคร)
export default function FaceScan({ url, color, id }: { url?: string | null; color: string; id: number }) {
  const match = (96 + ((id * 37) % 40) / 10).toFixed(1);
  const marks = [[50, 62], [70, 62], [60, 80], [53, 88], [67, 88], [34, 70], [86, 70], [60, 98]];
  return (
    <>
      <div className="fpw">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="fpi" src={url} alt="" referrerPolicy="no-referrer" />
        ) : (
          <svg viewBox="0 0 120 150" width="100%" height="190">
            <g fill="none" stroke={color} strokeWidth={1.4}>
              <path d="M18 150C20 118 40 108 60 108S100 118 102 150" />
              <path d="M52 98V110M68 98V110" />
              <ellipse cx="60" cy="64" rx="27" ry="34" />
              <path d="M33 58C34 28 86 28 87 58C80 44 42 44 33 58Z" fill={`${color}55`} />
              <path d="M45 62Q50 59 55 62M65 62Q70 59 75 62M60 66V80M52 88Q60 92 68 88" />
            </g>
            <g fill={color}>
              {marks.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} />)}
            </g>
            <path d="M10 24V10H24M96 10H110V24M10 126V140H24M96 140H110V126" fill="none" stroke={color} strokeWidth={2} />
            <path d="M60 6V144M6 70H114" stroke={`${color}33`} strokeDasharray="2 3" />
          </svg>
        )}
        <i className="scan" />
      </div>
      <div className="mut" style={{ fontSize: 11 }}>FACE MATCH {match}% · ID-{id}</div>
    </>
  );
}