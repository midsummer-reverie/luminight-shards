// components/map/TacticalMapContainer.tsx
import { db, schema } from "@/db";
import { eq, count } from "drizzle-orm";
import TacticalMapClient from "./TacticalMapClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function MapDataFetcher() {
  const { locations, threads, characters } = schema;

  // 1. ดึงข้อมูลตัวละครทั้งหมด
  const allChars = await db
    .select({
      id: characters.id,
      faceUrl: characters.faceUrl,
      firstName: characters.firstName,
      nameJp: characters.nameJp,
      status: characters.status,
      statusLocationId: characters.statusLocationId,
      rank: characters.rank,
    })
    .from(characters);

  // 2. ดึงข้อมูลย่านทั้งหมดจากฐานข้อมูล
  const locRows = await db
    .select({
      id: locations.id,
      slug: locations.slug,
      name: locations.name,
      nameJp: locations.nameJp,
      nameEn: locations.nameEn,
      themeColor: locations.themeColor,
      danger: locations.danger,
      isMainMapZone: locations.isMainMapZone,
      threadCount: count(threads.id),
    })
    .from(locations)
    .leftJoin(threads, eq(threads.locationId, locations.id))
    .groupBy(locations.id);

  const locDataMap: Record<string, any> = {};

  for (const loc of locRows) {
    // 🟢 กรองตัวละครที่ statusLocationId ตรงกับ id ของย่านนี้เป๊ะๆ (ป้องกันการซ้ำซ้อน)
    const residents = allChars.filter((c) => Number(c.statusLocationId) === Number(loc.id));

    const zoneInfo = {
      ...loc,
      residents,
    };

    // 🟢 ใช้ slug (เช่น l1, l2, ..., l7) เป็นคีย์หลักในการอ้างอิงบนแผนที่
    if (loc.slug) {
      locDataMap[loc.slug] = zoneInfo;
    }
    // สำรองเผื่อกรณีเรียกผ่าน id หรือชื่อ
    locDataMap[loc.id] = zoneInfo;
    locDataMap[loc.name] = zoneInfo;
  }

  const defaultInfo = {
    name: "ย่านชินเซ",
    nameJp: "新星区",
    nameEn: "SHINSEI",
    danger: 5,
    themeColor: "#ff5fa8",
    residents: [],
  };

  return <TacticalMapClient locDataMap={locDataMap} defaultInfo={defaultInfo} />;
}

export default function TacticalMapContainer() {
  return (
    <Suspense fallback={<div className="mut" style={{ padding: "16px" }}>กำลังโหลดแผนที่ยุทธศาสตร์...</div>}>
      <MapDataFetcher />
    </Suspense>
  );
}