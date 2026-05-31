"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080C14", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #00D4FF, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#000", margin: "0 auto 16px" }}>C</div>
          <h1 style={{ color: "#E8F0FE", fontSize: 24, fontWeight: 800, margin: 0 }}>CleyFlow <span style={{ color: "#00D4FF" }}>AI</span></h1>
          <p style={{ color: "#6B7A99", marginTop: 6, fontSize: 14 }}>Sign in to your workspace</p>
        </div>
        <div style={{ background: "#0D1321", border: "1px solid #1C2A3A", borderRadius: 16, padding: 32 }}>
          {error && <div style={{ background: "#FF456022", border: "1px solid #FF456044", borderRadius: 8, padding: "10px 14px", color: "#FF4560", fontSize: 13, marginBottom: 20 }}>{error}</div>}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ color: "#6B7A99", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@business.com" required
                style={{ width: "100%", background: "#080C14", border: "1px solid #1C2A3A", borderRadius: 8, padding: "11px 14px", color: "#E8F0FE", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ color: "#6B7A99", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width: "100%", background: "#080C14", border: "1px solid #1C2A3A", borderRadius: 8, padding: "11px 14px", color: "#E8F0FE", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: "100%", background: "linear-gradient(135deg, #00D4FF, #A855F7)", border: "none", borderRadius: 10, padding: "12px", color: "#000", fontSize: 14, fontWeight: 800, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
          <p style={{ textAlign: "center", color: "#6B7A99", fontSize: 13, marginTop: 20 }}>
            No account? <a href="/auth/register" style={{ color: "#00D4FF", textDecoration: "none", fontWeight: 600 }}>Create one free</a>
          </p>
        </div>
      </div>
    </div>
  );
}