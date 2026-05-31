"use client";
import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", business: "", industry: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, business_name: form.business, industry: form.industry } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080C14", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #00D4FF, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#000", margin: "0 auto 16px" }}>C</div>
          <h1 style={{ color: "#E8F0FE", fontSize: 24, fontWeight: 800, margin: 0 }}>Start Free</h1>
          <p style={{ color: "#6B7A99", marginTop: 6, fontSize: 14 }}>Set up your CleyFlow workspace</p>
        </div>
        <div style={{ background: "#0D1321", border: "1px solid #1C2A3A", borderRadius: 16, padding: 32 }}>
          {error && <div style={{ background: "#FF456022", border: "1px solid #FF456044", borderRadius: 8, padding: "10px 14px", color: "#FF4560", fontSize: 13, marginBottom: 20 }}>{error}</div>}
          <form onSubmit={handleRegister}>
            {[
              { label: "Full Name", key: "name", type: "text", placeholder: "Baldwin Onyango" },
              { label: "Email", key: "email", type: "email", placeholder: "you@business.com" },
              { label: "Password", key: "password", type: "password", placeholder: "Min 8 characters" },
              { label: "Business Name", key: "business", type: "text", placeholder: "Your Business Ltd" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ color: "#6B7A99", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>{label.toUpperCase()}</label>
                <input type={type} value={form[key as keyof typeof form]} onChange={set(key)} placeholder={placeholder} required
                  style={{ width: "100%", background: "#080C14", border: "1px solid #1C2A3A", borderRadius: 8, padding: "11px 14px", color: "#E8F0FE", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "#6B7A99", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 7 }}>INDUSTRY</label>
              <select value={form.industry} onChange={set("industry")} required
                style={{ width: "100%", background: "#080C14", border: "1px solid #1C2A3A", borderRadius: 8, padding: "11px 14px", color: "#E8F0FE", fontSize: 14, outline: "none" }}>
                <option value="">Select industry...</option>
                {["Airbnb / Short-term Rental","Hotel","Car Rental","Salon / Spa","Gym / Fitness","Clinic / Healthcare","Real Estate","Other"].map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: "100%", background: "linear-gradient(135deg, #00D4FF, #A855F7)", border: "none", borderRadius: 10, padding: "12px", color: "#000", fontSize: 14, fontWeight: 800, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating workspace..." : "Create Account →"}
            </button>
          </form>
          <p style={{ textAlign: "center", color: "#6B7A99", fontSize: 13, marginTop: 20 }}>
            Already have an account? <a href="/auth/login" style={{ color: "#00D4FF", textDecoration: "none", fontWeight: 600 }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}