"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BBEditor from "@/components/bbcode/BBEditor";
import { updateSubForumAction } from "@/actions/locations";
import { generateLocationSvg, LocationStylePreset } from "@/lib/generateLocationSvg";

interface CharacterOption {
  id: number;
  firstName: string;
  nameJp: string | null;
  faceUrl: string | null;
}

interface ForumData {
  id: number;
  slug: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  bannerUrl: string | null;
  residentChars: any; // รองรับได้ทั้ง String และ Array
  themeColor: string | null;
}

interface EditSubForumFormProps {
  forum: ForumData;
  parentLocation: { id: number; name: string; nameEn: string | null } | null;
  allCharacters: CharacterOption[];
}

export default function EditSubForumForm({
  forum,
  parentLocation,
  allCharacters,
}: EditSubForumFormProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [themeColor, setThemeColor] = useState(forum.themeColor || "#38c8ff");
  
  const [bannerUrlInput, setBannerUrlInput] = useState(
    forum.bannerUrl && !forum.bannerUrl.startsWith("data:image/svg+xml") ? forum.bannerUrl : ""
  );
  const [presetStyle, setPresetStyle] = useState<LocationStylePreset>("mixed");

  const [svgSeed, setSvgSeed] = useState("fixed-initial-edit-seed");
  const [useGeneratedSvg, setUseGeneratedSvg] = useState(
    !forum.bannerUrl || forum.bannerUrl.startsWith("data:image/svg+xml")
  );

  useEffect(() => {
    setSvgSeed(`edit-seed-${forum.id}-${forum.slug}`);
  }, [forum.id, forum.slug]);

  // 🟢 กรองตัวละครที่เลือกไว้ตอนเปิดฟอร์ม (รองรับทั้ง Database แบบใหม่และเก่า)
  const initialSelectedChars = allCharacters.filter((c) => {
    if (Array.isArray(forum.residentChars)) {
      return forum.residentChars.includes(c.id);
    }
    if (typeof forum.residentChars === "string") {
      return forum.residentChars.includes(c.firstName);
    }
    return false;
  });

  const [selectedChars, setSelectedChars] = useState<CharacterOption[]>(initialSelectedChars);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);

  const currentGeneratedSvg = generateLocationSvg(svgSeed, themeColor, presetStyle);

  const finalBannerValue =
    !useGeneratedSvg && bannerUrlInput.trim() !== ""
      ? bannerUrlInput.trim()
      : currentGeneratedSvg;

  const toggleCharacter = (char: CharacterOption) => {
    if (selectedChars.some((c) => c.id === char.id)) {
      setSelectedChars(selectedChars.filter((c) => c.id !== char.id));
    } else {
      setSelectedChars([...selectedChars, char]);
    }
  };

  // 🟢 เตรียมค่าตัวละครเป็น JSON Array สำหรับส่งให้ Database
  const residentCharsValue = JSON.stringify(selectedChars.map((c) => c.id));

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", fontFamily: "'Google Sans', sans-serif" }}>
      <div style={{ marginBottom: "16px" }}>
        <Link href={`/forums/${forum.slug}`} className="mut" style={{ fontSize: "12px", textDecoration: "none" }}>
          ← กลับสู่ฟอรั่ม ({forum.name})
        </Link>
      </div>

      <div
        className="box"
        style={{
          borderRadius: 0,
          border: "1px solid var(--cy)",
          padding: "24px",
          position: "relative",
        }}
      >
        <div className="tag" style={{ marginBottom: "8px" }}>// EDIT SUB-FORUM //</div>
        <h2 style={{ fontSize: "24px", margin: "0 0 20px 0", color: "#fff" }}>
          ⚙️ แก้ไขเขตส่วนตัว / ฟอรั่มย่อย
        </h2>

        {parentLocation && (
          <div
            style={{
              background: `${themeColor}12`,
              border: `1px solid ${themeColor}`,
              borderLeft: `4px solid ${themeColor}`,
              marginBottom: "20px",
              padding: "12px 16px",
            }}
          >
            <span style={{ fontSize: "13px", color: themeColor, fontWeight: 500 }}>
              📍 เขตหลักสังกัด: <b>{parentLocation.name} {parentLocation.nameEn ? `(${parentLocation.nameEn})` : ""}</b>
            </span>
          </div>
        )}

        {/* 🟢 ใช้ .bind ส่ง ID ป้องกัน Hydration Error */}
        <form action={updateSubForumAction.bind(null, forum.id)} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <input type="hidden" name="slug" value={forum.slug} />
          <input type="hidden" name="residentChars" value={residentCharsValue} />
          <input type="hidden" name="bannerUrl" value={finalBannerValue} />

          <div>
            <label style={{ display: "block", fontSize: "13px", color: "#ffd6ea", marginBottom: "6px" }}>
              🌐 ชื่อเขตภาษาอังกฤษ (English Name):
            </label>
            <input
              type="text"
              name="nameEn"
              required
              defaultValue={forum.nameEn || ""}
              style={{
                width: "100%",
                padding: "10px",
                background: "rgba(10, 6, 12, 0.9)",
                border: "1px solid #ffd6ea",
                color: "#fff",
                borderRadius: "0px",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", color: "#ffd6ea", marginBottom: "6px" }}>
              🇹🇭 ชื่อเขตภาษาไทย (Thai Name):
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={forum.name}
              style={{
                width: "100%",
                padding: "10px",
                background: "rgba(10, 6, 12, 0.9)",
                border: "1px solid #ffd6ea",
                color: "#fff",
                borderRadius: "0px",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", color: "var(--cy)", marginBottom: "6px" }}>
              🎨 สีธีมประจำเขต (Theme Color):
            </label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="color"
                name="themeColor"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                style={{
                  width: "50px",
                  height: "38px",
                  padding: "2px",
                  background: "rgba(10, 6, 12, 0.9)",
                  border: "1px solid var(--cy)",
                  cursor: "pointer",
                }}
              />
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                ใช้เป็นสีเน้น สีขอบ และสีของภาพแบนเนอร์ SVG ประจำเขต
              </span>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", color: "var(--cy)", marginBottom: "6px" }}>
              🖼️ ภาพพื้นหลังแบนเนอร์ประจำเขต:
            </label>

            <div
              style={{
                position: "relative",
                width: "100%",
                height: "180px",
                marginBottom: "12px",
                border: `1px solid ${themeColor}`,
                overflow: "hidden",
                background: "#08050a",
              }}
            >
              {mounted ? (
                <img
                  src={finalBannerValue}
                  alt="Banner Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "#0a060c" }} />
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "10px",
                  fontSize: "10px",
                  padding: "2px 8px",
                  background: "rgba(0,0,0,0.75)",
                  color: themeColor,
                  border: `1px solid ${themeColor}`,
                }}
              >
                {useGeneratedSvg && !bannerUrlInput ? `✦ PRESET: ${presetStyle.toUpperCase()}` : "🔗 CUSTOM URL BANNER"}
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", color: "#aaa", display: "block", marginBottom: "6px" }}>
                เลือกสไตล์สถาปัตยกรรมฉาก:
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { id: "mixed", label: "🌀 ผสมทุกสไตล์" },
                  { id: "classic", label: "🏢 ตึกเรียบๆ (ดั้งเดิม)" },
                  { id: "japan", label: "⛩️ ญี่ปุ่น / ศาลเจ้า" },
                  { id: "futuristic", label: "🏙️ เมืองอนาคต / ไซเบอร์" },
                  { id: "ruins", label: "🔮 ซากวิหาร / ผลึกมิติ" },
                  { id: "outpost", label: "🗼 หอคอย / ฐานยุทธการ" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setUseGeneratedSvg(true);
                      setPresetStyle(st.id as LocationStylePreset);
                    }}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      background: presetStyle === st.id ? `${themeColor}33` : "transparent",
                      border: `1px solid ${presetStyle === st.id ? themeColor : "#444"}`,
                      color: presetStyle === st.id ? "#fff" : "#888",
                      cursor: "pointer",
                      fontWeight: presetStyle === st.id ? "bold" : "normal",
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setUseGeneratedSvg(true);
                  setSvgSeed(`seed-${Date.now()}-${Math.random()}`);
                }}
                style={{
                  padding: "6px 14px",
                  background: `${themeColor}22`,
                  border: `1px solid ${themeColor}`,
                  color: "#fff",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                🎲 สุ่มแบบฉากในสไตล์นี้ใหม่
              </button>

              {bannerUrlInput && (
                <button
                  type="button"
                  onClick={() => setUseGeneratedSvg(!useGeneratedSvg)}
                  style={{
                    padding: "6px 14px",
                    background: "transparent",
                    border: "1px solid #666",
                    color: "#ccc",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {useGeneratedSvg ? "สลับใช้ URL ที่กรอกไว้" : "สลับใช้ภาพ SVG สุ่ม"}
                </button>
              )}
            </div>

            <input
              type="url"
              value={bannerUrlInput}
              onChange={(e) => {
                const val = e.target.value;
                setBannerUrlInput(val);
                if (val.trim() !== "") setUseGeneratedSvg(false);
                else setUseGeneratedSvg(true);
              }}
              placeholder="หรือ วาง URL ภาพภายนอกที่นี่ (https://...)"
              style={{
                width: "100%",
                padding: "10px",
                background: "rgba(10, 6, 12, 0.9)",
                border: "1px solid rgba(255, 95, 168, 0.4)",
                color: "#fff",
                borderRadius: "0px",
                fontSize: "13px",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <label style={{ display: "block", fontSize: "13px", color: "var(--cy)", marginBottom: "6px" }}>
              👥 ตัวละครประจำถิ่น / เจ้าของพื้นที่ (เลือกได้หลายคน):
            </label>

            <div
              onClick={() => setIsOpenDropdown(!isOpenDropdown)}
              style={{
                minHeight: "42px",
                padding: "6px 12px",
                background: "rgba(10, 6, 12, 0.9)",
                border: "1px solid rgba(255, 95, 168, 0.4)",
                cursor: "pointer",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                {selectedChars.length === 0 ? (
                  <span style={{ color: "#777", fontSize: "13px" }}>— คลิกเพื่อเลือกตัวละครประจำถิ่น —</span>
                ) : (
                  selectedChars.map((char) => (
                    <span
                      key={char.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: `${themeColor}22`,
                        border: `1px solid ${themeColor}`,
                        padding: "2px 8px 2px 4px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                    >
                      <img
                        src={char.faceUrl || "https://via.placeholder.com/30"}
                        alt={char.firstName}
                        style={{ width: "20px", height: "20px", objectFit: "cover" }}
                      />
                      {char.firstName}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCharacter(char);
                        }}
                        style={{ marginLeft: "4px", color: "#ff5f6f", fontWeight: "bold", cursor: "pointer" }}
                      >
                        ✕
                      </span>
                    </span>
                  ))
                )}
              </div>
              <span style={{ fontSize: "12px", color: "var(--cy)" }}>{isOpenDropdown ? "▲" : "▼"}</span>
            </div>

            {isOpenDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  maxHeight: "220px",
                  overflowY: "auto",
                  background: "#0a060c",
                  border: "1px solid var(--cy)",
                  borderTop: "none",
                  zIndex: 20,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.8)",
                }}
              >
                {allCharacters.map((char) => {
                  const isSelected = selectedChars.some((c) => c.id === char.id);
                  return (
                    <div
                      key={char.id}
                      onClick={() => toggleCharacter(char)}
                      style={{
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        background: isSelected ? `${themeColor}33` : "transparent",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <input type="checkbox" checked={isSelected} readOnly style={{ cursor: "pointer" }} />
                      <img
                        src={char.faceUrl || "https://via.placeholder.com/40"}
                        alt={char.firstName}
                        style={{
                          width: "32px",
                          height: "32px",
                          objectFit: "cover",
                          border: `1px solid ${themeColor}`,
                        }}
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "13px", color: "#fff", fontWeight: "bold" }}>
                          {char.firstName}
                        </span>
                        {char.nameJp && <span style={{ fontSize: "11px", color: "#aaa" }}>{char.nameJp}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <BBEditor
            name="description"
            label="📝 คำอธิบายสถานที่ (DESCRIPTION)"
            defaultValue={forum.description || ""}
            minHeight={220}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
            <Link href={`/forums/${forum.slug}`}>
              <button
                type="button"
                style={{
                  padding: "10px 20px",
                  background: "transparent",
                  border: "1px solid #666",
                  color: "#ccc",
                  cursor: "pointer",
                }}
              >
                ยกเลิก
              </button>
            </Link>
            <button
              type="submit"
              style={{
                padding: "10px 24px",
                background: "var(--cy)",
                border: "none",
                color: "#000",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}