import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// โหลดตัวแปรจากไฟล์ .env (ถ้าคุณใช้ .env.local ให้เปลี่ยนชื่อตรงนี้)
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts", // 🟢 แก้ Path ตรงนี้ให้ชี้ไปที่ไฟล์ schema.ts ของคุณ
  out: "./drizzle",             // โฟลเดอร์ที่ Drizzle จะใช้เก็บประวัติ (ถ้าไม่มีมันจะสร้างให้เอง)
  dialect: "postgresql",        // ระบุว่าใช้ PostgreSQL (Neon)
  dbCredentials: {
    url: process.env.DATABASE_URL!, // ดึง Connection String จากไฟล์ .env
  },
  verbose: true,
  strict: true,
});