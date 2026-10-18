// ใช้ถ้าอยากใส่ hash ลงตารางเอง: npx tsx db/hash.ts รหัสที่ต้องการ
import { hashPassword } from "../lib/password";

const pw = process.argv[2];
if (!pw) { console.error("ใช้: npx tsx db/hash.ts <password>"); process.exit(1); }
hashPassword(pw).then((h) => console.log(h));