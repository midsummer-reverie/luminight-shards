"use client";

import { useActionState } from "react";
import { login, type AuthState } from "@/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, {});
  return (
    <form action={action} className="gb">
      <div className="tag">// RESTRICTED ACCESS</div>
      <div className="gate-jp">光夜の欠片</div>
      <h2 style={{ color: "var(--cy)", letterSpacing: ".25em" }}>LUMINIGHT SHARDS</h2>
      <input name="username" placeholder="USERNAME" defaultValue={state.username} autoComplete="username" required maxLength={40} />
      <input name="password" type="password" placeholder="PASSWORD" autoComplete="current-password" required />
      <button disabled={pending}>{pending ? "AUTHENTICATING..." : "AUTHENTICATE"}</button>
      <div className={state.error ? "err" : "mut"}>{state.error ?? "บัญชีสร้างโดยแอดมิน"}</div>
    </form>
  );
}