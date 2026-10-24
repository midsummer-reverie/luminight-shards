import { sql } from "drizzle-orm";
import {
  pgTable, pgEnum, serial, text, varchar, integer, boolean,
  timestamp, jsonb, index, uniqueIndex, primaryKey, AnyPgColumn
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------
// 🟢 Types สำหรับจัดการโครงสร้าง JSONB ของ Code Studio
// ---------------------------------------------------------
export type TemplateSchema = {
  studioVariables: { name: string; type: string; label?: string }[];
  postVariables: { name: string; type: string; label?: string }[];
  blocks: { id: string; name: string; placeholder: string; html: string; postVariables: any[] }[];
};

export type StudioValues = {
  variables: Record<string, any>;
  blocksLayout: string[];
};

export type PostValues = {
  variables: Record<string, any>;
  blocksData: Record<string, any>;
};

export interface CharacterTie {
  targetId: number | string;
  relation: string;
  note: string;
}

// ---------------------------------------------------------
// 🟢 Enums & Existing Tables
// ---------------------------------------------------------
export const charType = pgEnum("char_type", ["esper", "guide"]);
export const charRank = pgEnum("char_rank", ["S", "A", "B", "C", "D", "E", "F"]);
export const charStatus = pgEnum("char_status", ["ready", "doom", "hurt", "mission", "rest", "root"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 40 }).notNull().unique(),
  password: text("password"),
  role: text("role").$type<"admin" | "user">().default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("users_username_lower_idx").on(sql`lower(${t.username})`)]);

export const guilds = pgTable("guilds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  motto: text("motto"),
  description: text("description"),
  color: varchar("color", { length: 9 }).default("#ff5fa8").notNull(),
  logoUrl: text("logo_url"),                        
  icon: varchar("icon", { length: 20 }).default("star").notNull(),
  guildRolesOrder: jsonb("guild_roles_order").default(["หัวหน้ากิลด์", "รองหัวหน้า", "เลขาธิการ", "สมาชิก"]).notNull(), 
  createdByUserId: integer("created_by_user_id").references(() => users.id, { onDelete: "set null" }), // 🟢 เพิ่มฟิลด์นี้
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const locations: any = pgTable("locations", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 40 }).notNull().unique(),
  name: text("name").notNull(),                     
  nameJp: text("name_jp"),                           
  nameEn: text("name_en").notNull(),                 
  themeColor: text("theme_color").default("#38c8ff"),
  description: text("description"),                  
  danger: integer("danger").default(0).notNull(),
  mapX: integer("map_x"),
  mapY: integer("map_y"),
  bannerUrl: text("banner_url"),                     
  residentChars: jsonb("resident_chars").$type<number[]>().default([]).notNull(),             
  parentId: integer("parent_id").references((): AnyPgColumn => locations.id, { onDelete: "cascade" }),
  isMainMapZone: boolean("is_main_map_zone").default(false).notNull(), 
  sortOrder: integer("sort_order").default(0).notNull(),
  createdByUserId: integer("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("locations_parent_idx").on(t.parentId)]);

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
  note: text("note"),
  age: integer("age"),
  birthday: varchar("birthday", { length: 20 }),
  heightWeight: varchar("height_weight", { length: 30 }),
  bloodType: varchar("blood_type", { length: 10 }),
  mbti: varchar("mbti", { length: 8 }),
  quote: text("quote"),
  story: text("story"),
  traits: jsonb("traits").$type<string[]>().default([]).notNull(),
  ties: jsonb("ties").$type<CharacterTie[]>().default([]).notNull(),
  stats: jsonb("stats").$type<number[]>().default([50, 50, 50, 50, 50, 50]).notNull(),
  abilityName: text("ability_name"),
  abilityDesc: text("ability_desc"),
  doomLevel: integer("doom_level").default(0).notNull(),
  colorPrimary: varchar("color_primary", { length: 9 }).default("#ff5fa8").notNull(),
  imageMainUrl: text("image_main_url"),
  verticalBannerUrl: text("vertical_banner_url"), 
  faceUrl: text("face_url"),
  guildTitle: text("guild_title").default("สมาชิก"),
  status: charStatus("status").default("ready").notNull(),
  statusLocationId: integer("status_location_id").references(() => locations.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("characters_user_idx").on(t.userId), index("characters_guild_idx").on(t.guildId)]);

export const threads = pgTable("threads", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }), 
  authorUserId: integer("author_user_id").notNull().references(() => users.id, { onDelete: "cascade" }), 
  authorCharacterId: integer("author_character_id").references(() => characters.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  themeColor: text("theme_color").default("#38c8ff"),
  templateStyle: text("template_style").default("classic"),
  bannerUrl: text("banner_url"),
  customCss: text("custom_css"),
  pinned: boolean("pinned").default(false),
  locked: boolean("locked").default(false),
  closed: boolean("closed").default(false),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("threads_location_idx").on(t.locationId),   
  index("threads_author_user_idx").on(t.authorUserId),
]);

// ---------------------------------------------------------
// 🟢 Code Studio System (Phase 1-2)
// ---------------------------------------------------------

// 1. Templates (แทนที่ studioCodes เดิม) สำหรับให้ Admin จัดการ
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  htmlContent: text("html_content").notNull(),
  cssLink: text("css_link"),
  schemaJson: jsonb("schema_json").$type<TemplateSchema>().default({ studioVariables: [], postVariables: [], blocks: [] }).notNull(), 
  authorUserId: integer("author_user_id").notNull().references(() => users.id, { onDelete: "cascade" }), 
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. User Codes (โค้ดที่ผู้ใช้เลือกมาปรุงแต่ง และตั้งชื่อเอง)
export const userCodes = pgTable("user_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), 
  templateId: integer("template_id").notNull().references(() => templates.id, { onDelete: "cascade" }),
  customName: varchar("custom_name", { length: 255 }).notNull(),
  studioValuesJson: jsonb("studio_values_json").$type<StudioValues>().default({ variables: {}, blocksLayout: [] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. ผูก User Code เข้ากับ Characters (Many-to-Many)
export const userCodeCharacters = pgTable("user_code_characters", {
  userCodeId: integer("user_code_id").notNull().references(() => userCodes.id, { onDelete: "cascade" }),
  characterId: integer("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.userCodeId, t.characterId] })
]);

// ---------------------------------------------------------
// 🟢 Posts Table (Phase 3)
// ---------------------------------------------------------
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" }), 
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  characterId: integer("character_id").references(() => characters.id, { onDelete: "set null" }),
  
  // ปรับ body ให้เป็น Nullable เผื่อผู้ใช้บางคนตอบแบบใช้ Template ล้วนๆ
  body: text("body"),
  renderedHtml: text("rendered_html"),   // เพิ่มบรรทัดนี้
  userCodeId: integer("user_code_id").references(() => userCodes.id, { onDelete: "set null" }),
  postVariablesJson: jsonb("post_variables_json").$type<PostValues>(), 

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("posts_thread_idx").on(t.threadId),          
]);

export const bulletins = pgTable("bulletins", {
  id: serial("id").primaryKey(),
  tag: varchar("tag", { length: 50 }).notNull().default("ข่าวสาร"), // เช่น ประกาศ, ข่าวลือ, คำเตือน
  color: varchar("color", { length: 20 }).notNull().default("#38c8ff"), // รหัสสีประจำแท็ก
  title: text("title").notNull(), // ข้อความหลัก
  hook: text("hook"), // ข้อความฮุคกระตุ้นการโรลเพลย์
  linkUrl: text("link_url"), // ลิงก์ปลายทาง (ถ้ามี)
  authorUserId: integer("author_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});