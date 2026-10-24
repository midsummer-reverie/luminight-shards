import { getCurrentUser } from "@/lib/session";
import { logout } from "@/actions/auth";

export default async function UserBar() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <span className="mut">ผู้เล่น:</span>
      <b className="sb" style={{ ["--sc" as string]: "#ff5fa8" }}>{user.username}</b>
      <form action={logout} style={{ margin: 0, display: "flex" }}>
        <button type="submit" className="mini">LOGOUT</button>
      </form>
    </div>
  );
}