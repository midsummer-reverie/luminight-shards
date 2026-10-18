import { sql } from "drizzle-orm";
import {
  pgTable, pgEnum, serial, text, varchar, integer, boolean,
  timestamp, jsonb, index, uniqueIndex,
} from "drizzle-orm/pg-core";
 
export const charType = pgEnum("char_type", ["esper", "guide"]);
export const charRank = pgEnum("char_rank", ["S", "A", "B", "C", "D", "E", "F"]);
export const charStatus = pgEnum("char_status", ["ready", "doom", "hurt", "mission", "rest", "root"]);
 
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 40 }).notNull().unique(),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("users_username_lower_idx").on(sql`lower(${t.username})`)]);
 
export const guilds = pgTable("guilds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  motto: text("motto"),
  description: text("description"),
  color: varchar("color", { length: 9 }).default("#ff5fa8").notNull(),
  logoUrl: text("logo_url"),                       // ลิงก์ภาพภายนอกเท่านั้น
  icon: varchar("icon", { length: 20 }).default("star").notNull(), // fallback
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
 
// "ฟอรั่ม" = ย่านบนแผนที่
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 40 }).notNull().unique(),
  name: text("name").notNull(),
  nameJp: text("name_jp"),
  description: text("description"),
  danger: integer("danger").default(0).notNull(),
  mapX: integer("map_x"),
  mapY: integer("map_y"),
  bannerUrl: text("banner_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
});
 
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  guildId: integer("guild_id").references(() => guilds.id, { onDelete: "set null" }),
  type: charType("type").notNull(),
  rank: charRank("rank").default("C").notNull(),
  nameJp: text("name_jp").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  className: text("class_name"),
  homeText: text("home_text"),
  note: text("note"),
  age: integer("age"),
  birthday: varchar("birthday", { length: 20 }),
  heightWeight: varchar("height_weight", { length: 30 }),
  bloodType: varchar("blood_type", { length: 10 }),
  mbti: varchar("mbti", { length: 8 }),
  quote: text("quote"),
  story: text("story"),
  traits: jsonb("traits").$type<string[]>().default([]).notNull(),
  ties: jsonb("ties").$type<string[]>().default([]).notNull(),
  // PSI, STAMINA, TALENT, MENTAL, SYNC, CHARISMA
  stats: jsonb("stats").$type<number[]>().default([50, 50, 50, 50, 50, 50]).notNull(),
  abilityName: text("ability_name"),
  abilityDesc: text("ability_desc"),
  doomLevel: integer("doom_level").default(0).notNull(),
  colorPrimary: varchar("color_primary", { length: 9 }).default("#ff5fa8").notNull(),
  colorSecondary: varchar("color_secondary", { length: 9 }).default("#ffd6ea").notNull(),
  colorBg: varchar("color_bg", { length: 9 }).default("#130c15").notNull(),
  sparkPercent: integer("spark_percent").default(50).notNull(),
  imageMainUrl: text("image_main_url"),
  imageSubUrl: text("image_sub_url"),
  faceUrl: text("face_url"),
  status: charStatus("status").default("ready").notNull(),
  statusLocationId: integer("status_location_id").references(() => locations.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("characters_user_idx").on(t.userId), index("characters_guild_idx").on(t.guildId)]);
 
export const threads = pgTable("threads", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  authorCharacterId: integer("author_character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  pinned: boolean("pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("threads_location_idx").on(t.locationId)]);
 
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" }),
  characterId: integer("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  body: text("body").notNull(),             // BBCode ดิบ
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("posts_thread_idx").on(t.threadId)]);