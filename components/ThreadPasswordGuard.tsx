// components/ThreadPasswordGuard.tsx
"use client";

import { useState } from "react";
import { verifyThreadPasswordAction } from "@/actions/threadAuth";

interface ThreadPasswordGuardProps {
  threadId: number;
  themeColor: string;
  children: React.ReactNode;
}

export default function ThreadPasswordGuard({
  threadId,
  themeColor,
  children,
}: ThreadPasswordGuardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (isUnlocked) {
    return <>{children}</>;
  }

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await verifyThreadPasswordAction(threadId, passwordInput);
    setLoading(false);

    if (res.success) {
      setIsUnlocked(true);
    } else {
      setErrorMsg(res.error || "รหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "60px auto",
        padding: "32px",
        background: "rgba(10, 10, 12, 0.95)",
        border: `1px solid ${themeColor}`,
        boxShadow: `0 0 25px ${themeColor}33`,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "42px", marginBottom: "12px" }}>🔑</div>
      <h3 style={{ color: "#fff", fontSize: "20px", margin: "0 0 8px 0" }}>
        RESTRICTED ACCESS
      </h3>
      <p style={{ color: "#a1a1aa", fontSize: "13px", marginBottom: "24px" }}>
        กระทู้นี้ถูกล็อกรหัสผ่านไว้ กรุณากรอกรหัสผ่านเพื่อเข้าอ่านบทสนทนา
      </p>

      <form onSubmit={handleUnlock} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="ENTER SECURITY CODE..."
          required
          style={{
            padding: "12px",
            background: "#050307",
            border: `1px solid ${errorMsg ? "#ff5f6f" : themeColor}`,
            color: "#fff",
            fontSize: "14px",
            textAlign: "center",
            letterSpacing: "2px",
          }}
        />

        {errorMsg && (
          <div style={{ color: "#ff5f6f", fontSize: "12px" }}>⚠️ {errorMsg}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            background: themeColor,
            border: "none",
            color: "#000",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "VERIFYING..." : "UNLOCK THREAD"}
        </button>
      </form>
    </div>
  );
}