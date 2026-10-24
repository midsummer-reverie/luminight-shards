export const STATUS = {
  ready:   { label: "พร้อม",       color: "#6fe3a0" },
  doom:    { label: "ดูม",         color: "#ff5f6f" },
  hurt:    { label: "บาดเจ็บ",     color: "#ff9f5f" },
  mission: { label: "ปฏิบัติการ",  color: "#7be0ff" },
  rest:    { label: "พักผ่อน",     color: "#a78bfa" },
  root:    { label: "ติดรูท",      color: "#ffd35f" },
} as const;
export type StatusKey = keyof typeof STATUS;
 
export const CHAR_TYPES = { esper: "เอสเปอร์", guide: "ไกด์", citizen: "พลเมืองทั่วไป" } as const;
export const RANKS = ["S", "A", "B", "C", "D", "E", "F"] as const;
export const STAT_LABELS = ["STRENGTH", "AGILITY", "INTELLECT", "CHARISMA", "INTUITION", "FORTITUDE"] as const;