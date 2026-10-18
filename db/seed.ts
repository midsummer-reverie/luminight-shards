import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db, schema } = await import("./index");
  await db.insert(schema.locations).values([
    { slug: "command",  name: "ย่านบัญชาการ",       nameJp: "指令区", danger: 5,  mapX: 300, mapY: 192, sortOrder: 1, description: "ศูนย์บัญชาการและหอเฝ้าระวัง" },
    { slug: "guilds",   name: "ย่านสำนักงานกิลด์",  nameJp: "組合区", danger: 10, mapX: 425, mapY: 118, sortOrder: 2, description: "สำนักงานใหญ่ของทุกกิลด์" },
    { slug: "homes",    name: "ย่านที่อยู่อาศัย",    nameJp: "居住区", danger: 22, mapX: 170, mapY: 190, sortOrder: 3, description: "บ้านพักและตลาดสด" },
    { slug: "outlaw",   name: "ย่านนอกกฎหมาย",      nameJp: "無法区", danger: 64, mapX: 440, mapY: 265, sortOrder: 4, description: "ตลาดมืดและแก๊ง" },
    { slug: "area",     name: "แอเรีย",              nameJp: "エリア", danger: 96, mapX: 40,  mapY: 40,  sortOrder: 5, description: "จุดบรรจบของสองโลก" },
  ]).onConflictDoNothing();
  await db.insert(schema.guilds).values([
    { name: "สภาเอสเปอร์", nameEn: "Esper Assembly", motto: "พลังต้องมีผู้ควบคุม", color: "#C3B1C4", icon: "eye" },
    { name: "สำนักไกด์", nameEn: "Guide Bureau", motto: "ประคองกันและกันให้ผ่านคืนนี้", color: "#38c8ff", icon: "link" },
    { name: "กองพิทักษ์กำแพง", nameEn: "Wall Guard", motto: "ไม่ถอย ไม่หยุด", color: "#e08aa8", icon: "shield" },
    { name: "เครือข่ายใต้ดิน", nameEn: "Undercroft", motto: "ทุกอย่างมีราคา", color: "#9be3b0", icon: "hex" },
    { name: "คณะศาลเจ้า", nameEn: "Shrine Order", motto: "แสงสุดท้ายยังไม่ดับ", color: "#e6c76a", icon: "torii" },
  ]);
  console.log("seeded");
}
main();