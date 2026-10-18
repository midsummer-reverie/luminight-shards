import path from "node:path";
import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

const schema = path.resolve(process.cwd(), "db", "schema.ts").replace(/\\/g, "/");

export default defineConfig({
  dialect: "postgresql",
  schema,
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL! },
});