import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const colors = {
  bg: "#080C14",
  surface: "#0D1321",
  surfaceHover: "#111827",
  border: "#1C2A3A",
  borderLight: "#243347",
  accent: "#00D4FF",
  accentDim: "#00D4FF22",
  accentGlow: "#00D4FF44",
  green: "#00E5A0",
  greenDim: "#00E5A022",
  amber: "#FFAA00",
  amberDim: "#FFAA0022",
  red: "#FF4560",
  redDim: "#FF456022",
  purple: "#A855F7",
  purpleDim: "#A855F722",
  text: "#E8F0FE",
  textMuted: "#6B7A99",
  textDim: "#3D4F6B",
};

const DEMO_CONFIG = {
  clientName: "Dhe Luxury Suites",
  clientHandle: "dhe_luxury_suites",
  clientIndustry: "Short Stay Rental",
  clientPhone: "+254 758 416395",
  clientEmail: "hello@dheluxurysuites.com",
  founderName: "Baldwin Cley",
  founderInitials: "BC",
  trialDay: 1,
  currency: "KSh",
};

const currencyOptions = ["KSh", "USD", "GHS", "NGN", "UGX"];

const getShortName = (name) => (name || "").split(" ")[0] || name;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const mockLeads = [
  { id: 1, name: "Sarah Kimani", channel: "WhatsApp", status: "hot", score: 92, message: "I need a 2BR apartment in Kilimani for December, budget 80k", time: "2m ago", avatar: "SK", business: "Airbnb Host", tags: ["urgent", "high-budget"], unread: 3 },
  { id: 2, name: "James Odhiambo", channel: "Instagram", status: "warm", score: 67, message: "Is the salon open on Sunday? I need hair treatment", time: "8m ago", avatar: "JO", business: "Salon", tags: ["returning"], unread: 1 },
  { id: 3, name: "Aisha Mohamed", channel: "Email", status: "hot", score: 88, message: "Looking to rent a car for 5 days next week, SUV preferred", time: "15m ago", avatar: "AM", business: "Car Rental", tags: ["fleet-client"], unread: 0 },
  { id: 4, name: "Brian Waweru", channel: "Telegram", status: "cold", score: 31, message: "What are your gym membership prices?", time: "1h ago", avatar: "BW", business: "Gym", tags: [], unread: 0 },
  { id: 5, name: "Grace Muthoni", channel: "LiveChat", status: "warm", score: 74, message: "Do you have availability for a clinic appointment Thursday?", time: "2h ago", avatar: "GM", business: "Clinic", tags: ["follow-up"], unread: 2 },
  { id: 6, name: "David Njoroge", channel: "Facebook", status: "hot", score: 95, message: "I want to book the penthouse suite for my anniversary weekend", time: "3h ago", avatar: "DN", business: "Hotel", tags: ["vip", "urgent"], unread: 5 },
  { id: 7, name: "Fatuma Hassan", channel: "WhatsApp", status: "warm", score: 61, message: "Still thinking about the 3-bedroom property in Westlands", time: "5h ago", avatar: "FH", business: "Real Estate", tags: ["follow-up"], unread: 0 },
];

const mockMessages = [
  { id: 1, sender: "customer", text: "Hi, I saw your listing on Airbnb. Is the 2BR apartment in Kilimani still available for December 15-22?", time: "10:24 AM", read: true },
  { id: 2, sender: "ai", text: "AI Suggestion: Great timing — the Kilimani property is available! Would you like me to auto-respond with availability + pricing?", time: "", isAiSuggest: true },
  { id: 3, sender: "agent", text: "Yes, the apartment is available for those dates! It's a stunning 2BR with city views. The rate is KES 7,500/night. Shall I send you the full details and booking link?", time: "10:26 AM", read: true },
  { id: 4, sender: "customer", text: "Perfect! What's included? And is there parking?", time: "10:27 AM", read: true },
  { id: 5, sender: "agent", text: "Absolutely! The unit includes WiFi, Netflix, fully equipped kitchen, and 24/7 security. Free parking for 1 vehicle. Total for 7 nights = KES 52,500. Want me to hold the dates for you?", time: "10:28 AM", read: true },
  { id: 6, sender: "customer", text: "Yes please! How do I pay?", time: "10:29 AM", read: false },
  { id: 7, sender: "ai", text: "AI Suggestion: Send the M-Pesa payment link. Offer 10% early bird if they pay today — closes the deal faster.", time: "", isAiSuggest: true },
];

const mockStats = [
  { label: "Total Leads", value: "1,247", change: "+18%", up: true, icon: "👥" },
  { label: "Hot Leads", value: "89", change: "+34%", up: true, icon: "🔥" },
  { label: "Conversion Rate", value: "23.4%", change: "+5.2%", up: true, icon: "📈" },
  { label: "Recovered", value: "156", change: "+41%", up: true, icon: "🔄" },
  { label: "Avg Response", value: "4.2min", change: "-38%", up: true, icon: "⚡" },
  { label: "Revenue MTD", value: "KES 2.4M", change: "+29%", up: true, icon: "💰" },
];

const mockContacts = [];

const mockBookings = [
  { id: 1, client: "Sarah Kimani", service: "Kilimani 2BR Apartment", date: "Dec 15-22", time: "Check-in 2PM", status: "confirmed", amount: "KES 52,500", avatar: "SK" },
  { id: 2, client: "David Njoroge", service: "Penthouse Suite - Nairobi Serena", date: "Dec 20-22", time: "Check-in 3PM", status: "pending", amount: "KES 48,000", avatar: "DN" },
  { id: 3, client: "Aisha Mohamed", service: "Toyota Land Cruiser (5 days)", date: "Nov 27-Dec 1", time: "Pickup 8AM", status: "confirmed", amount: "KES 25,000", avatar: "AM" },
  { id: 4, client: "James Odhiambo", service: "Full Hair Treatment + Trim", date: "Nov 24", time: "2:30 PM", status: "confirmed", amount: "KES 3,500", avatar: "JO" },
  { id: 5, client: "Grace Muthoni", service: "General Consultation - Dr. Wanjiku", date: "Nov 28", time: "9:00 AM", status: "pending", amount: "KES 1,500", avatar: "GM" },
];

const mockCampaigns = [
  { id: 1, name: "Black Friday Deals 2024", type: "Email", status: "active", sent: 1240, opened: 847, clicked: 312, rate: "68.3%", date: "Nov 20" },
  { id: 2, name: "WhatsApp Promo — December Stays", type: "WhatsApp", status: "scheduled", sent: 0, opened: 0, clicked: 0, rate: "—", date: "Nov 25" },
  { id: 3, name: "Re-engagement: Cold Leads Q4", type: "Email", status: "completed", sent: 560, opened: 203, clicked: 78, rate: "36.2%", date: "Nov 15" },
  { id: 4, name: "New Members Gym Offer", type: "SMS", status: "completed", sent: 890, opened: 641, clicked: 220, rate: "72.0%", date: "Nov 10" },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "inbox", label: "Inbox", icon: "💬", badge: 11 },
  { id: "leads", label: "Leads", icon: "🎯" },
  { id: "crm", label: "CRM", icon: "👤" },
  { id: "bookings", label: "Bookings", icon: "📅" },
  { id: "campaigns", label: "Campaigns", icon: "📧" },
  { id: "automation", label: "Automation", icon: "⚡" },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "ai-tools", label: "AI Tools", icon: "✦" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

// ─── UTILITY COMPONENTS ───────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const cfg = {
    hot: { bg: colors.redDim, color: colors.red, label: "Hot" },
    warm: { bg: colors.amberDim, color: colors.amber, label: "Warm" },
    cold: { bg: "#1C2A3A", color: colors.textMuted, label: "Cold" },
    confirmed: { bg: colors.greenDim, color: colors.green, label: "Confirmed" },
    pending: { bg: colors.amberDim, color: colors.amber, label: "Pending" },
    active: { bg: colors.greenDim, color: colors.green, label: "Active" },
    scheduled: { bg: colors.accentDim, color: colors.accent, label: "Scheduled" },
    completed: { bg: "#1C2A3A", color: colors.textMuted, label: "Completed" },
  };
  const c = cfg[status] || cfg.cold;
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}33`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" }}>
      {c.label}
    </span>
  );
};

const Avatar = ({ initials, size = 36, glow }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: `linear-gradient(135deg, ${colors.accent}33, ${colors.purple}33)`,
    border: `1px solid ${glow ? colors.accent : colors.border}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.35, fontWeight: 700, color: colors.accent,
    boxShadow: glow ? `0 0 12px ${colors.accentGlow}` : "none",
    flexShrink: 0,
  }}>
    {initials}
  </div>
);

const ChannelBadge = ({ channel }) => {
  const map = { WhatsApp: { icon: "💬", color: "#25D366" }, Instagram: { icon: "📸", color: "#E1306C" }, Facebook: { icon: "📘", color: "#1877F2" }, Telegram: { icon: "✈️", color: "#0088CC" }, Email: { icon: "📧", color: colors.amber }, LiveChat: { icon: "⚡", color: colors.green } };
  const c = map[channel] || { icon: "💬", color: colors.accent };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, color: c.color, background: `${c.color}18`, border: `1px solid ${c.color}33`, borderRadius: 4, padding: "1px 5px" }}>
      {c.icon} {channel}
    </span>
  );
};

const ScoreBar = ({ score }) => {
  const color = score >= 80 ? colors.red : score >= 60 ? colors.amber : colors.textMuted;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: colors.border, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 700, width: 24, textAlign: "right" }}>{score}</span>
    </div>
  );
};

const Card = ({ children, style = {}, glow }) => (
  <div style={{
    background: colors.surface,
    border: `1px solid ${glow ? colors.accentGlow : colors.border}`,
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: glow ? `0 0 20px ${colors.accentGlow}` : "0 2px 8px #00000044",
    ...style
  }}>
    {children}
  </div>
);

const DemoSettingsPanel = ({ demoConfig, onChange, onReset, visible, onClose }) => {
  if (!visible) return null;

  return (
    <div style={{ position: "fixed", right: 20, bottom: 88, width: 320, maxWidth: "calc(100vw - 40px)", background: "#090F1B", border: `1px solid ${colors.purple}`, borderRadius: 18, boxShadow: "0 20px 50px rgba(0,0,0,0.45)", padding: 18, zIndex: 1000 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ color: colors.text, fontWeight: 700, fontSize: 14 }}>Settings</div>
          <div style={{ color: colors.textMuted, fontSize: 11 }}>Update config live across the app</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: colors.textMuted, cursor: "pointer", fontSize: 18 }}>✕</button>
      </div>

      {[
        { label: "Client Name", field: "clientName" },
        { label: "Client Handle", field: "clientHandle" },
        { label: "Industry", field: "clientIndustry" },
        { label: "Founder Name", field: "founderName" },
      ].map(({ label, field }) => (
        <div key={field} style={{ marginBottom: 12 }}>
          <label style={{ color: colors.textMuted, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>{label}</label>
          <input
            value={demoConfig[field]}
            onChange={(e) => onChange(field, e.target.value)}
            style={{ width: "100%", background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 10, padding: "10px 12px", color: colors.text, fontSize: 13, outline: "none" }}
          />
        </div>
      ))}

      <div style={{ marginBottom: 14 }}>
        <label style={{ color: colors.textMuted, fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>Currency</label>
        <select
          value={demoConfig.currency}
          onChange={(e) => onChange("currency", e.target.value)}
          style={{ width: "100%", background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 10, padding: "10px 12px", color: colors.text, fontSize: 13, outline: "none" }}
        >
          {currencyOptions.map((currency) => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
      </div>

      <button onClick={onReset} style={{ width: "100%", background: colors.purple, border: "none", borderRadius: 10, padding: "11px 16px", color: "#000", fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>Reset to Default</button>
      <button onClick={onClose} style={{ width: "100%", background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 10, padding: "11px 16px", color: colors.textMuted, fontWeight: 700, cursor: "pointer" }}>Close</button>
    </div>
  );
};

// ─── PAGES ────────────────────────────────────────────────────────────────────

// DASHBOARD
const DashboardPage = ({ setPage, demoConfig }) => {
  const [time, setTime] = useState(new Date());
  const [userName, setUserName] = useState("there");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const chartData = [38, 52, 45, 67, 58, 72, 89, 76, 94, 88, 102, 115];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.green, boxShadow: `0 0 8px ${colors.green}` }} />
            <span style={{ color: colors.textMuted, fontSize: 12 }}>Live · {time.toLocaleTimeString()}</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: colors.text, margin: 0, letterSpacing: "-0.5px" }}>Good morning, {userName} 👋</h1>
          <p style={{ color: colors.textMuted, marginTop: 4, fontSize: 14 }}>Here's what's happening across your business today.</p>
        </div>
        <button onClick={() => setPage("ai-tools")} style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`, color: "#000", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          ✦ AI Assistant
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(6, 1fr)", gap: 14, marginBottom: 24 }}>
        {mockStats.map((s, i) => (
          <Card key={i} style={{ padding: "18px 16px" }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: colors.text, letterSpacing: "-0.5px" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: s.up ? colors.green : colors.red, marginTop: 6, fontWeight: 600 }}>
              {s.up ? "↑" : "↓"} {s.change} this month
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 320px", gap: 20, marginBottom: 20 }}>
        {/* Chart */}
        <Card style={{ padding: 24, gridColumn: "1/2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ color: colors.text, margin: 0, fontSize: 15, fontWeight: 600 }}>Lead Volume</h3>
              <p style={{ color: colors.textMuted, margin: "2px 0 0", fontSize: 12 }}>Leads captured per month</p>
            </div>
            <span style={{ background: colors.greenDim, color: colors.green, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>+29% YoY</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
            {chartData.map((v, i) => {
              const maxV = Math.max(...chartData);
              const h = (v / maxV) * 100;
              const isLast = i === chartData.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%", height: `${h}%`,
                    background: isLast ? `linear-gradient(180deg, ${colors.accent}, ${colors.purple})` : `${colors.accent}33`,
                    borderRadius: "4px 4px 0 0",
                    border: isLast ? `1px solid ${colors.accent}` : "none",
                    boxShadow: isLast ? `0 0 12px ${colors.accentGlow}` : "none",
                    transition: "height 0.5s ease",
                  }} />
                  <span style={{ fontSize: 8, color: colors.textDim }}>{months[i]}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Conversion Funnel */}
        <Card style={{ padding: 24 }}>
          <h3 style={{ color: colors.text, margin: "0 0 16px", fontSize: 15, fontWeight: 600 }}>Conversion Funnel</h3>
          {[
            { label: "Leads Captured", val: 1247, pct: 100, color: colors.accent },
            { label: "Qualified", val: 834, pct: 67, color: colors.purple },
            { label: "Engaged", val: 456, pct: 37, color: colors.amber },
            { label: "Converted", val: 292, pct: 23, color: colors.green },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: colors.textMuted, fontSize: 12 }}>{f.label}</span>
                <span style={{ color: colors.text, fontSize: 12, fontWeight: 600 }}>{f.val.toLocaleString()}</span>
              </div>
              <div style={{ height: 6, background: colors.border, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${f.pct}%`, height: "100%", background: f.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </Card>

        {/* Live Feed */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ color: colors.text, margin: 0, fontSize: 14, fontWeight: 600 }}>Live Feed</h3>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.green, animation: "pulse 2s infinite" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mockLeads.slice(0, 5).map((l, i) => (
              <div key={i} onClick={() => setPage("inbox")} style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", padding: "8px 0", borderBottom: i < 4 ? `1px solid ${colors.border}` : "none" }}>
                <Avatar initials={l.avatar} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: colors.text, fontSize: 12, fontWeight: 600 }}>{l.name}</span>
                    <span style={{ color: colors.textDim, fontSize: 10 }}>{l.time}</span>
                  </div>
                  <p style={{ color: colors.textMuted, fontSize: 11, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
        {/* Recent Bookings */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ color: colors.text, margin: 0, fontSize: 14, fontWeight: 600 }}>Upcoming Bookings</h3>
            <button onClick={() => setPage("bookings")} style={{ background: "none", border: "none", color: colors.accent, fontSize: 12, cursor: "pointer" }}>View all →</button>
          </div>
          {mockBookings.slice(0, 4).map((b, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: i < 3 ? `1px solid ${colors.border}` : "none" }}>
              <Avatar initials={b.avatar} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ color: colors.text, fontSize: 12, fontWeight: 600 }}>{b.client}</div>
                <div style={{ color: colors.textMuted, fontSize: 11 }}>{b.service}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <Badge status={b.status} />
                <div style={{ color: colors.green, fontSize: 11, fontWeight: 600, marginTop: 3 }}>{b.amount}</div>
              </div>
            </div>
          ))}
        </Card>

        {/* Top Channels */}
        <Card style={{ padding: 20 }}>
          <h3 style={{ color: colors.text, margin: "0 0 14px", fontSize: 14, fontWeight: 600 }}>Lead Sources</h3>
          {[
            { ch: "WhatsApp", leads: 487, pct: 39, color: "#25D366" },
            { ch: "Instagram", leads: 298, pct: 24, color: "#E1306C" },
            { ch: "Email", leads: 213, pct: 17, color: colors.amber },
            { ch: "Facebook", leads: 175, pct: 14, color: "#1877F2" },
            { ch: "LiveChat", leads: 74, pct: 6, color: colors.green },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ width: 70, color: colors.textMuted, fontSize: 12 }}>{c.ch}</span>
              <div style={{ flex: 1, height: 6, background: colors.border, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${c.pct}%`, height: "100%", background: c.color, borderRadius: 3 }} />
              </div>
              <span style={{ color: colors.text, fontSize: 12, fontWeight: 600, width: 30, textAlign: "right" }}>{c.pct}%</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// INBOX PAGE
const InboxPage = () => {
  const [selected, setSelected] = useState(mockLeads[0]);
  const [newMsg, setNewMsg] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [filter, setFilter] = useState("all");

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    setMessages(m => [...m, { id: Date.now(), sender: "agent", text: newMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), read: true }]);
    setNewMsg("");
  };

  const filtered = filter === "all" ? mockLeads : mockLeads.filter(l => l.status === filter);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 320, borderRight: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Filters */}
        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "8px 12px", display: "flex", gap: 4, marginBottom: 10 }}>
            <input placeholder="Search conversations..." style={{ background: "none", border: "none", color: colors.text, fontSize: 13, outline: "none", flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["all","hot","warm","cold"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? colors.accentDim : "none", color: filter === f ? colors.accent : colors.textMuted, border: `1px solid ${filter === f ? colors.accent : colors.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", textTransform: "capitalize" }}>{f}</button>
            ))}
          </div>
        </div>
        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.map(lead => (
            <div key={lead.id} onClick={() => setSelected(lead)} style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.border}`, cursor: "pointer", background: selected?.id === lead.id ? colors.accentDim : "transparent", borderLeft: selected?.id === lead.id ? `3px solid ${colors.accent}` : "3px solid transparent", transition: "all 0.15s" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ position: "relative" }}>
                  <Avatar initials={lead.avatar} size={36} />
                  {lead.unread > 0 && <div style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: colors.accent, border: `2px solid ${colors.surface}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "#000", fontWeight: 700 }}>{lead.unread}</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ color: colors.text, fontSize: 13, fontWeight: 600 }}>{lead.name}</span>
                    <span style={{ color: colors.textDim, fontSize: 10 }}>{lead.time}</span>
                  </div>
                  <p style={{ color: colors.textMuted, fontSize: 11, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.message}</p>
                  <div style={{ display: "flex", gap: 4, marginTop: 5, alignItems: "center" }}>
                    <ChannelBadge channel={lead.channel} />
                    <Badge status={lead.status} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Chat Header */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar initials={selected?.avatar} size={40} glow />
            <div>
              <div style={{ color: colors.text, fontWeight: 600, fontSize: 15 }}>{selected?.name}</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.green }} />
                <span style={{ color: colors.textMuted, fontSize: 11 }}>Online · {selected?.business}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["📞","📋","⋯"].map((ic, i) => (
              <button key={i} style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, width: 34, height: 34, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map(m => m.isAiSuggest ? (
            <div key={m.id} style={{ background: `linear-gradient(135deg, ${colors.accentDim}, ${colors.purpleDim})`, border: `1px solid ${colors.accentGlow}`, borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14 }}>✦</span>
              <div>
                <div style={{ color: colors.accent, fontSize: 10, fontWeight: 700, marginBottom: 3, letterSpacing: "0.05em" }}>AI SUGGESTION</div>
                <div style={{ color: colors.text, fontSize: 12 }}>{m.text}</div>
              </div>
              <button style={{ background: colors.accent, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#000", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Use</button>
            </div>
          ) : (
            <div key={m.id} style={{ display: "flex", justifyContent: m.sender === "agent" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "70%", background: m.sender === "agent" ? `linear-gradient(135deg, ${colors.accent}22, ${colors.purple}22)` : colors.bg,
                border: `1px solid ${m.sender === "agent" ? colors.accentGlow : colors.border}`,
                borderRadius: m.sender === "agent" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "10px 14px",
              }}>
                <p style={{ color: colors.text, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{m.text}</p>
                <span style={{ color: colors.textDim, fontSize: 10, marginTop: 4, display: "block" }}>{m.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${colors.border}`, display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, display: "flex", alignItems: "center", padding: "0 14px", gap: 10 }}>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Type a message..." style={{ flex: 1, background: "none", border: "none", color: colors.text, fontSize: 13, outline: "none", padding: "12px 0" }} />
            <button style={{ background: "none", border: "none", color: colors.textMuted, cursor: "pointer", fontSize: 16 }}>✦</button>
          </div>
          <button onClick={sendMsg} style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`, border: "none", borderRadius: 10, width: 44, height: 44, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 700 }}>→</button>
        </div>
      </div>

      {/* Customer Panel */}
      <div style={{ width: 280, borderLeft: `1px solid ${colors.border}`, padding: "20px 16px", overflowY: "auto", flexShrink: 0 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Avatar initials={selected?.avatar} size={56} glow />
          <div style={{ color: colors.text, fontWeight: 700, fontSize: 15, marginTop: 10 }}>{selected?.name}</div>
          <div style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{selected?.business}</div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 8 }}>
            <Badge status={selected?.status} />
            <ChannelBadge channel={selected?.channel} />
          </div>
        </div>

        <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
          <div style={{ color: colors.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>LEAD SCORE</div>
          <ScoreBar score={selected?.score || 0} />
        </div>

        <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
          <div style={{ color: colors.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>QUICK ACTIONS</div>
          {["📅 Book Appointment","📧 Send Follow-up","🔖 Add to Sequence","⭐ Mark VIP"].map((a, i) => (
            <button key={i} style={{ width: "100%", background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 7, padding: "8px 12px", color: colors.text, fontSize: 12, cursor: "pointer", textAlign: "left", marginBottom: 6 }}>{a}</button>
          ))}
        </div>

        <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ color: colors.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>LAST INQUIRY</div>
          <p style={{ color: colors.text, fontSize: 12, lineHeight: 1.5, margin: 0 }}>{selected?.message}</p>
        </div>
      </div>
    </div>
  );
};

// LEADS PAGE
const LeadsPage = () => {
  const [view, setView] = useState("kanban");
  const cols = [
    { id: "hot", label: "🔥 Hot Leads", color: colors.red, leads: mockLeads.filter(l => l.status === "hot") },
    { id: "warm", label: "🌡 Warm Leads", color: colors.amber, leads: mockLeads.filter(l => l.status === "warm") },
    { id: "cold", label: "❄️ Cold Leads", color: colors.textMuted, leads: mockLeads.filter(l => l.status === "cold") },
  ];

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: colors.text, margin: 0, fontSize: 22, fontWeight: 700 }}>Lead Qualification</h2>
          <p style={{ color: colors.textMuted, margin: "4px 0 0", fontSize: 13 }}>AI-powered lead scoring and routing</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {["kanban","list"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ background: view === v ? colors.accentDim : "none", border: `1px solid ${view === v ? colors.accent : colors.border}`, color: view === v ? colors.accent : colors.textMuted, borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer", textTransform: "capitalize" }}>{v === "kanban" ? "⊞ Kanban" : "☰ List"}</button>
          ))}
        </div>
      </div>

      {view === "kanban" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {cols.map(col => (
            <div key={col.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ color: col.color, fontWeight: 700, fontSize: 13 }}>{col.label}</span>
                <span style={{ background: `${col.color}22`, color: col.color, borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{col.leads.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.leads.map(lead => (
                  <Card key={lead.id} style={{ padding: 14 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                      <Avatar initials={lead.avatar} size={36} />
                      <div style={{ flex: 1 }}>
                        <div style={{ color: colors.text, fontWeight: 600, fontSize: 13 }}>{lead.name}</div>
                        <div style={{ color: colors.textMuted, fontSize: 11, marginTop: 1 }}>{lead.business}</div>
                      </div>
                      <span style={{ color: colors.textDim, fontSize: 10 }}>{lead.time}</span>
                    </div>
                    <p style={{ color: colors.textMuted, fontSize: 12, margin: "0 0 10px", lineHeight: 1.4 }}>{lead.message}</p>
                    <ScoreBar score={lead.score} />
                    <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                      <ChannelBadge channel={lead.channel} />
                      {lead.tags.map(t => <span key={t} style={{ fontSize: 10, color: colors.textMuted, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, padding: "1px 5px" }}>#{t}</span>)}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                {["Contact","Channel","Business","Score","Status","Last Message","Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: colors.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockLeads.map((lead, i) => (
                <tr key={lead.id} style={{ borderBottom: i < mockLeads.length-1 ? `1px solid ${colors.border}` : "none" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Avatar initials={lead.avatar} size={30} />
                      <span style={{ color: colors.text, fontSize: 13, fontWeight: 600 }}>{lead.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}><ChannelBadge channel={lead.channel} /></td>
                  <td style={{ padding: "12px 16px", color: colors.textMuted, fontSize: 12 }}>{lead.business}</td>
                  <td style={{ padding: "12px 16px", width: 120 }}><ScoreBar score={lead.score} /></td>
                  <td style={{ padding: "12px 16px" }}><Badge status={lead.status} /></td>
                  <td style={{ padding: "12px 16px", color: colors.textMuted, fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.message}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["💬","📅","⚡"].map((ic, j) => (
                        <button key={j} style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

// CRM PAGE
const CRMPage = () => {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
    );
    let mounted = true;

    const fetchContacts = async () => {
      setLoadingContacts(true);
      try {
        const { data, error } = await supabase.from("contacts").select("*");
        if (!mounted) return;
        setContacts(data || []);
      } catch (e) {
        if (!mounted) return;
        setContacts([]);
      } finally {
        if (mounted) setLoadingContacts(false);
      }
    };

    fetchContacts();
    return () => { mounted = false; };
  }, []);

  const filtered = contacts.filter(c => (c.name || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "24px 28px", display: "flex", gap: 20, height: "calc(100vh - 60px)", overflow: "hidden" }}>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ color: colors.text, margin: 0, fontSize: 22, fontWeight: 700 }}>CRM</h2>
            <p style={{ color: colors.textMuted, margin: "4px 0 0", fontSize: 13 }}>{contacts.length} contacts · Click to view profile</p>
          </div>
          <button style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`, color: "#000", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Contact</button>
        </div>
        <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "8px 12px", marginBottom: 16, display: "flex" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..." style={{ background: "none", border: "none", color: colors.text, fontSize: 13, outline: "none", flex: 1 }} />
        </div>
        <Card style={{ flex: 1, overflow: "auto" }}>
          {loadingContacts ? (
            <div style={{ padding: 40, textAlign: "center", color: colors.textMuted }}>Loading contacts...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, background: colors.surface }}>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  {["Contact","Email","Phone","Status","Tags","Bookings","Last Seen"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: colors.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} onClick={() => setSelected(c)} style={{ borderBottom: `1px solid ${colors.border}`, cursor: "pointer", background: selected?.id === c.id ? colors.accentDim : "transparent" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Avatar initials={c.avatar} size={32} />
                        <span style={{ color: colors.text, fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: colors.textMuted, fontSize: 12 }}>{c.email}</td>
                    <td style={{ padding: "12px 16px", color: colors.textMuted, fontSize: 12 }}>{c.phone}</td>
                    <td style={{ padding: "12px 16px" }}><Badge status={c.status} /></td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {c.tags.map(t => <span key={t} style={{ fontSize: 10, color: colors.accent, background: colors.accentDim, border: `1px solid ${colors.accent}33`, borderRadius: 4, padding: "1px 5px" }}>#{t}</span>)}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: colors.text, fontSize: 12, fontWeight: 600 }}>{c.bookings}</td>
                    <td style={{ padding: "12px 16px", color: colors.textMuted, fontSize: 12 }}>{c.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {selected && (
        <div style={{ width: 300, flexShrink: 0 }}>
          <Card style={{ padding: 20 }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <Avatar initials={selected.avatar} size={56} glow />
              <div style={{ color: colors.text, fontWeight: 700, fontSize: 16, marginTop: 10 }}>{selected.name}</div>
              <Badge status={selected.status} />
            </div>
            {[["Email", selected.email], ["Phone", selected.phone], ["Bookings", selected.bookings], ["Last Seen", selected.lastSeen]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${colors.border}` }}>
                <span style={{ color: colors.textMuted, fontSize: 12 }}>{k}</span>
                <span style={{ color: colors.text, fontSize: 12, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 14 }}>
              <div style={{ color: colors.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>TAGS</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {selected.tags.map(t => <span key={t} style={{ fontSize: 11, color: colors.accent, background: colors.accentDim, borderRadius: 6, padding: "3px 8px" }}>#{t}</span>)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button style={{ flex: 1, background: colors.accentDim, border: `1px solid ${colors.accent}`, borderRadius: 8, padding: "8px", color: colors.accent, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>💬 Message</button>
              <button style={{ flex: 1, background: colors.greenDim, border: `1px solid ${colors.green}`, borderRadius: 8, padding: "8px", color: colors.green, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>📅 Book</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// BOOKINGS PAGE
const BookingsPage = () => {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const hours = [8,9,10,11,12,13,14,15,16,17,18];

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: colors.text, margin: 0, fontSize: 22, fontWeight: 700 }}>Bookings & Appointments</h2>
          <p style={{ color: colors.textMuted, margin: "4px 0 0", fontSize: 13 }}>November 2024</p>
        </div>
        <button style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`, color: "#000", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ New Booking</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Calendar */}
        <Card style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", borderBottom: `1px solid ${colors.border}` }}>
            <div style={{ padding: "12px 16px" }} />
            {days.map(d => <div key={d} style={{ padding: "12px 8px", textAlign: "center", color: colors.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", borderLeft: `1px solid ${colors.border}` }}>{d}</div>)}
          </div>
          <div style={{ overflowY: "auto", maxHeight: 400 }}>
            {hours.map(h => (
              <div key={h} style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ padding: "8px 12px", color: colors.textDim, fontSize: 11, borderRight: `1px solid ${colors.border}` }}>{h}:00</div>
                {days.map((d, di) => {
                  const hasEvent = (h === 9 && di === 1) || (h === 14 && di === 3) || (h === 11 && di === 0) || (h === 15 && di === 5);
                  const events = { "9-1": { name: "James O.", color: colors.amber, type: "Salon" }, "14-3": { name: "Grace M.", color: colors.green, type: "Clinic" }, "11-0": { name: "Aisha M.", color: colors.accent, type: "Car Rental" }, "15-5": { name: "David N.", color: colors.red, type: "Hotel" } };
                  const ev = events[`${h}-${di}`];
                  return (
                    <div key={d} style={{ borderLeft: `1px solid ${colors.border}`, minHeight: 36, padding: "2px 4px" }}>
                      {ev && <div style={{ background: `${ev.color}22`, border: `1px solid ${ev.color}44`, borderRadius: 4, padding: "3px 6px" }}>
                        <div style={{ color: ev.color, fontSize: 10, fontWeight: 700 }}>{ev.name}</div>
                        <div style={{ color: colors.textMuted, fontSize: 9 }}>{ev.type}</div>
                      </div>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ color: colors.text, margin: 0, fontSize: 14, fontWeight: 600 }}>Upcoming Bookings</h3>
          {mockBookings.map(b => (
            <Card key={b.id} style={{ padding: 14 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Avatar initials={b.avatar} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: colors.text, fontSize: 13, fontWeight: 600 }}>{b.client}</span>
                    <Badge status={b.status} />
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: 11, marginTop: 3 }}>{b.service}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ color: colors.textDim, fontSize: 11 }}>📅 {b.date} · {b.time}</span>
                    <span style={{ color: colors.green, fontSize: 12, fontWeight: 700 }}>{b.amount}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// CAMPAIGNS PAGE
const CampaignsPage = () => {
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState("🔥 Exclusive November Deals — Book Now!");
  const [body, setBody] = useState("Hey {{first_name}},\n\nDon't miss out on our biggest deals this November! We have exclusive offers just for you...\n\nBook now and save 20% on all services this week only.\n\n— The Team");

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: colors.text, margin: 0, fontSize: 22, fontWeight: 700 }}>Email & Campaign Marketing</h2>
          <p style={{ color: colors.textMuted, margin: "4px 0 0", fontSize: 13 }}>Build, schedule, and track campaigns</p>
        </div>
        <button onClick={() => setCreating(!creating)} style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`, color: "#000", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{creating ? "✕ Close" : "+ New Campaign"}</button>
      </div>

      {creating && (
        <Card style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ color: colors.text, margin: "0 0 16px", fontSize: 14, fontWeight: 600 }}>✦ Campaign Builder</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 14 }}>
            <div>
              <label style={{ color: colors.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>CAMPAIGN NAME</label>
              <input defaultValue="Black Friday Special" style={{ width: "100%", background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "9px 12px", color: colors.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ color: colors.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>CHANNEL</label>
              <select style={{ width: "100%", background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "9px 12px", color: colors.text, fontSize: 13, outline: "none" }}>
                <option>Email</option><option>WhatsApp</option><option>SMS</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: colors.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>SUBJECT LINE</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} style={{ width: "100%", background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "9px 12px", color: colors.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ color: colors.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>MESSAGE BODY</label>
              <button style={{ background: colors.accentDim, border: `1px solid ${colors.accent}`, borderRadius: 6, padding: "3px 10px", color: colors.accent, fontSize: 11, cursor: "pointer" }}>✦ AI Write</button>
            </div>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} style={{ width: "100%", background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "10px 12px", color: colors.text, fontSize: 13, outline: "none", resize: "none", lineHeight: 1.5, boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ background: colors.accentDim, border: `1px solid ${colors.accent}`, borderRadius: 8, padding: "9px 18px", color: colors.accent, fontSize: 12, cursor: "pointer", fontWeight: 700 }}>📤 Send Now</button>
            <button style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "9px 18px", color: colors.text, fontSize: 12, cursor: "pointer" }}>📅 Schedule</button>
            <button style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "9px 18px", color: colors.text, fontSize: 12, cursor: "pointer" }}>💾 Save Draft</button>
          </div>
        </Card>
      )}

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              {["Campaign","Type","Status","Sent","Opened","Clicked","Open Rate","Date"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: colors.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockCampaigns.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < mockCampaigns.length-1 ? `1px solid ${colors.border}` : "none" }}>
                <td style={{ padding: "14px 16px", color: colors.text, fontSize: 13, fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ background: colors.accentDim, color: colors.accent, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{c.type}</span>
                </td>
                <td style={{ padding: "14px 16px" }}><Badge status={c.status} /></td>
                <td style={{ padding: "14px 16px", color: colors.text, fontSize: 13, fontWeight: 600 }}>{c.sent.toLocaleString()}</td>
                <td style={{ padding: "14px 16px", color: colors.text, fontSize: 13 }}>{c.opened.toLocaleString()}</td>
                <td style={{ padding: "14px 16px", color: colors.text, fontSize: 13 }}>{c.clicked.toLocaleString()}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ color: parseFloat(c.rate) > 50 ? colors.green : colors.amber, fontWeight: 700, fontSize: 13 }}>{c.rate}</span>
                </td>
                <td style={{ padding: "14px 16px", color: colors.textMuted, fontSize: 12 }}>{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// AUTOMATION PAGE
const AutomationPage = () => {
  const flows = [
    { name: "Lead Capture → WhatsApp Welcome", trigger: "New Lead", steps: 3, active: true, runs: 847 },
    { name: "No-Reply 24hr Follow-up", trigger: "Silence > 24hrs", steps: 5, active: true, runs: 312 },
    { name: "Booking Confirmed Reminder", trigger: "Booking Created", steps: 2, active: true, runs: 156 },
    { name: "Abandoned Inquiry Recovery", trigger: "Lead Inactive 48hrs", steps: 4, active: false, runs: 89 },
    { name: "Post-Service Review Request", trigger: "Appointment Complete", steps: 2, active: true, runs: 234 },
  ];

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: colors.text, margin: 0, fontSize: 22, fontWeight: 700 }}>Automation Engine</h2>
          <p style={{ color: colors.textMuted, margin: "4px 0 0", fontSize: 13 }}>Trigger-based follow-up sequences</p>
        </div>
        <button style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`, color: "#000", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Create Flow</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[{ label: "Active Flows", val: "4", color: colors.green }, { label: "Runs Today", val: "128", color: colors.accent }, { label: "Total Automated", val: "1,638", color: colors.purple }, { label: "Recovered Leads", val: "156", color: colors.amber }].map((s, i) => (
          <Card key={i} style={{ padding: 18 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {flows.map((f, i) => (
          <Card key={i} style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: f.active ? colors.greenDim : colors.bg, border: `1px solid ${f.active ? colors.green : colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
                <div>
                  <div style={{ color: colors.text, fontWeight: 600, fontSize: 14 }}>{f.name}</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <span style={{ color: colors.textMuted, fontSize: 11 }}>Trigger: <span style={{ color: colors.accent }}>{f.trigger}</span></span>
                    <span style={{ color: colors.textMuted, fontSize: 11 }}>{f.steps} steps</span>
                    <span style={{ color: colors.textMuted, fontSize: 11 }}>{f.runs} runs</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <div style={{ width: 32, height: 18, borderRadius: 9, background: f.active ? colors.green : colors.border, position: "relative", cursor: "pointer" }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: f.active ? 16 : 2, transition: "left 0.2s" }} />
                  </div>
                  <span style={{ color: f.active ? colors.green : colors.textMuted, fontSize: 11, fontWeight: 600 }}>{f.active ? "Active" : "Paused"}</span>
                </div>
                <button style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 7, padding: "6px 12px", color: colors.textMuted, fontSize: 12, cursor: "pointer" }}>Edit</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ANALYTICS PAGE
const AnalyticsPage = () => {
  const weekly = [45, 62, 58, 74, 68, 91, 85, 102, 96, 118, 110, 134];
  const convData = [18, 22, 19, 25, 23, 28, 31, 27, 33, 29, 35, 38];

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: colors.text, margin: 0, fontSize: 22, fontWeight: 700 }}>Analytics</h2>
        <p style={{ color: colors.textMuted, margin: "4px 0 0", fontSize: 13 }}>Performance overview — November 2024</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {[{ title: "Leads Over Time", data: weekly, color: colors.accent, label: "Leads", unit: "" }, { title: "Conversion Rate (%)", data: convData, color: colors.green, label: "Rate", unit: "%" }].map((chart, ci) => (
          <Card key={ci} style={{ padding: 24 }}>
            <h3 style={{ color: colors.text, margin: "0 0 20px", fontSize: 14, fontWeight: 600 }}>{chart.title}</h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 120 }}>
              {chart.data.map((v, i) => {
                const maxV = Math.max(...chart.data);
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{ width: "100%", height: `${(v / maxV) * 100}%`, background: i === chart.data.length-1 ? chart.color : `${chart.color}44`, borderRadius: "3px 3px 0 0", position: "relative" }}>
                      {i === chart.data.length-1 && <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", background: chart.color, color: "#000", borderRadius: 4, padding: "1px 5px", fontSize: 9, fontWeight: 700, whiteSpace: "nowrap" }}>{v}{chart.unit}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
        {[
          { title: "Top Performing Channels", items: [["WhatsApp", 39, colors.accent], ["Instagram", 24, colors.purple], ["Email", 17, colors.amber], ["Facebook", 14, "#1877F2"], ["LiveChat", 6, colors.green]] },
          { title: "Response Time Distribution", items: [["< 5 min", 54, colors.green], ["5–15 min", 27, colors.amber], ["15–60 min", 13, colors.red], ["> 1 hour", 6, colors.textMuted]] },
          { title: "Lead Status Breakdown", items: [["Hot", 7, colors.red], ["Warm", 42, colors.amber], ["Cold", 51, colors.textMuted]] },
        ].map((block, bi) => (
          <Card key={bi} style={{ padding: 20 }}>
            <h3 style={{ color: colors.text, margin: "0 0 16px", fontSize: 14, fontWeight: 600 }}>{block.title}</h3>
            {block.items.map(([label, pct, color], i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: colors.textMuted, fontSize: 12 }}>{label}</span>
                  <span style={{ color, fontSize: 12, fontWeight: 700 }}>{pct}%</span>
                </div>
                <div style={{ height: 5, background: colors.border, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
};

// AI TOOLS PAGE
const AIToolsPage = () => {
  const [tool, setTool] = useState("reply");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  const tools = [
    { id: "reply", label: "💬 Smart Reply", desc: "Generate customer replies" },
    { id: "email", label: "📧 Email Writer", desc: "Promo emails & follow-ups" },
    { id: "whatsapp", label: "📲 WhatsApp Copy", desc: "Campaign messages" },
    { id: "caption", label: "📸 Instagram Caption", desc: "Social media content" },
    { id: "sales", label: "🎯 Sales Copy", desc: "Convert leads faster" },
  ];

  const samples = {
    reply: "Hi {{name}}! Thanks for reaching out 🙏 Our 2BR apartment in Kilimani is available for your dates at KES 7,500/night. It comes fully furnished with WiFi, parking & 24/7 security. Total for 7 nights = KES 52,500. Shall I reserve it for you? Reply YES and I'll send the booking link right away!",
    email: "Subject: 🔥 Your Exclusive November Deal — Act Before Midnight!\n\nHi {{first_name}},\n\nWe noticed you were interested in our services — and we don't want you to miss out.\n\nThis week only, we're offering 20% OFF all bookings. Whether you're looking for accommodation, transport, or a wellness appointment — now is the best time.\n\n🎯 Offer expires: Sunday 11:59PM\n✅ No hidden charges\n💳 M-Pesa accepted\n\nBook here: [LINK]\n\nTalk soon,\nThe Team",
    whatsapp: "Hey {{name}} 👋\n\nJust a quick one — our *November Special* is still running!\n\n🏠 Apartments from KES 5,000/night\n🚗 Car hire from KES 3,500/day\n💆 Salon packages from KES 1,500\n\nBook now before slots fill up ⚡\nReply *BOOK* or tap the link below:\n👉 [LINK]",
    caption: "The kind of stay that makes you never want to leave 🌆✨\n\nWake up to city views, premium amenities, and the comfort of home — all in the heart of Nairobi.\n\nApartments available from KES 5,000/night 🔑\n\nDM us to book or tap the link in bio 👆\n\n#NairobiAirbnb #NairobiStays #KenyanHospitality #ExploreNairobi #NairobiLiving",
    sales: "Stop losing customers to slow responses.\n\nCleyFlow AI responds to every inquiry in under 60 seconds — 24/7 — across WhatsApp, Instagram, Email, and more.\n\nBusinesses using CleyFlow report:\n✅ 3x faster response time\n✅ 40% more bookings converted\n✅ KES 200K+ in recovered abandoned inquiries\n\nStart today → [LINK]",
  };

  const generate = async () => {
    setLoading(true);
    setOutput("");
    await new Promise(r => setTimeout(r, 1200));
    const base = samples[tool] || samples.reply;
    const custom = prompt ? `[Customized for: "${prompt}"]\n\n${base}` : base;
    let i = 0;
    const interval = setInterval(() => {
      setOutput(custom.slice(0, i));
      i += 3;
      if (i > custom.length) clearInterval(interval);
    }, 20);
    setLoading(false);
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: colors.text, margin: 0, fontSize: 22, fontWeight: 700 }}>✦ AI Content Generator</h2>
        <p style={{ color: colors.textMuted, margin: "4px 0 0", fontSize: 13 }}>Generate sales copy, replies, campaigns, and more with AI</p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {tools.map(t => (
          <button key={t.id} onClick={() => { setTool(t.id); setOutput(""); }} style={{ background: tool === t.id ? `linear-gradient(135deg, ${colors.accentDim}, ${colors.purpleDim})` : colors.surface, border: `1px solid ${tool === t.id ? colors.accent : colors.border}`, borderRadius: 10, padding: "10px 16px", cursor: "pointer", textAlign: "left" }}>
            <div style={{ color: colors.text, fontSize: 13, fontWeight: 600 }}>{t.label}</div>
            <div style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      <Card style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: colors.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>CONTEXT / INSTRUCTIONS (optional)</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. Write for a luxury Airbnb in Karen, targeting high-income clients, formal tone..." rows={3} style={{ width: "100%", background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: "12px 14px", color: colors.text, fontSize: 13, outline: "none", resize: "none", lineHeight: 1.5, boxSizing: "border-box" }} />
        </div>
        <button onClick={generate} disabled={loading} style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`, color: "#000", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 20, opacity: loading ? 0.7 : 1 }}>
          {loading ? "⏳ Generating..." : "✦ Generate"}
        </button>
        {output && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ color: colors.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>OUTPUT</label>
              <button onClick={() => navigator.clipboard?.writeText(output)} style={{ background: colors.greenDim, border: `1px solid ${colors.green}`, borderRadius: 6, padding: "3px 10px", color: colors.green, fontSize: 11, cursor: "pointer" }}>Copy</button>
            </div>
            <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: "16px", color: colors.text, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", minHeight: 120 }}>{output}</div>
          </div>
        )}
      </Card>
    </div>
  );
};

// SETTINGS PAGE
const SettingsPage = ({ demoConfig }) => {
  const integrations = [
    { name: "WhatsApp Business API", icon: "💬", color: "#25D366", status: "connected" },
    { name: "Instagram Graph API", icon: "📸", color: "#E1306C", status: "connected" },
    { name: "Facebook Messenger", icon: "📘", color: "#1877F2", status: "connected" },
    { name: "Telegram Bot", icon: "✈️", color: "#0088CC", status: "pending" },
    { name: "SendGrid (Email)", icon: "📧", color: colors.amber, status: "connected" },
    { name: "Twilio (SMS)", icon: "📱", color: colors.purple, status: "disconnected" },
    { name: "Google Calendar", icon: "📅", color: colors.red, status: "connected" },
    { name: "Stripe / M-Pesa", icon: "💳", color: colors.green, status: "connected" },
  ];

  const workspaceFields = [
    ["Business Name", demoConfig.clientName],
    ["Industry", demoConfig.clientIndustry],
    ["Email", demoConfig.clientEmail],
    ["Phone", demoConfig.clientPhone],
  ];

  return (
    <div style={{ padding: "24px 28px", maxWidth: 900 }}>
      <h2 style={{ color: colors.text, margin: "0 0 24px", fontSize: 22, fontWeight: 700 }}>Settings & Integrations</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Profile */}
        <Card style={{ padding: 24 }}>
          <h3 style={{ color: colors.text, margin: "0 0 16px", fontSize: 14, fontWeight: 600 }}>Workspace</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
            {workspaceFields.map(([label, val]) => (
              <div key={label}>
                <label style={{ color: colors.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>{label.toUpperCase()}</label>
                <input defaultValue={val} style={{ width: "100%", background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "9px 12px", color: colors.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          <button style={{ marginTop: 16, background: colors.accentDim, border: `1px solid ${colors.accent}`, borderRadius: 8, padding: "9px 18px", color: colors.accent, fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Save Changes</button>
        </Card>

        {/* Integrations */}
        <Card style={{ padding: 24 }}>
          <h3 style={{ color: colors.text, margin: "0 0 16px", fontSize: 14, fontWeight: 600 }}>API Integrations</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
            {integrations.map((int, i) => {
              const sc = { connected: { color: colors.green, bg: colors.greenDim, label: "Connected" }, pending: { color: colors.amber, bg: colors.amberDim, label: "Pending" }, disconnected: { color: colors.textMuted, bg: colors.bg, label: "Connect" } };
              const s = sc[int.status];
              return (
                <div key={i} style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${int.color}22`, border: `1px solid ${int.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{int.icon}</div>
                    <span style={{ color: colors.text, fontSize: 13, fontWeight: 600 }}>{int.name}</span>
                  </div>
                  <button style={{ background: s.bg, border: `1px solid ${s.color}44`, borderRadius: 7, padding: "5px 12px", color: s.color, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>{s.label}</button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Billing */}
        <Card style={{ padding: 24 }}>
          <h3 style={{ color: colors.text, margin: "0 0 16px", fontSize: 14, fontWeight: 600 }}>Subscription</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 14 }}>
            {[
              { plan: "Starter", price: "KES 2,500", features: ["1 Inbox", "500 contacts", "Basic AI", "Email support"], current: false },
              { plan: "Growth", price: "KES 7,500", features: ["5 Inboxes", "5,000 contacts", "Full AI suite", "Priority support"], current: true },
              { plan: "Enterprise", price: "Custom", features: ["Unlimited inboxes", "Unlimited contacts", "Custom AI training", "Dedicated manager"], current: false },
            ].map((p, i) => (
              <div key={i} style={{ background: p.current ? colors.accentDim : colors.bg, border: `2px solid ${p.current ? colors.accent : colors.border}`, borderRadius: 12, padding: 18 }}>
                {p.current && <div style={{ background: colors.accent, color: "#000", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", borderRadius: 4, padding: "2px 6px", display: "inline-block", marginBottom: 8 }}>CURRENT PLAN</div>}
                <div style={{ color: colors.text, fontWeight: 700, fontSize: 16 }}>{p.plan}</div>
                <div style={{ color: p.current ? colors.accent : colors.textMuted, fontWeight: 700, fontSize: 20, margin: "6px 0 10px" }}>{p.price}<span style={{ fontSize: 11, fontWeight: 400 }}>/mo</span></div>
                {p.features.map(f => <div key={f} style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4 }}>✓ {f}</div>)}
                {!p.current && <button style={{ marginTop: 12, width: "100%", background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "8px", color: colors.text, fontSize: 12, cursor: "pointer" }}>Upgrade</button>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function CleyFlowAI() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [demoConfig, setDemoConfig] = useState({ ...DEMO_CONFIG });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userName, setUserName] = useState("there");
  const [userBusiness, setUserBusiness] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("cleyflow_name") || "there";
    const business = localStorage.getItem("cleyflow_business") || "";
    setUserName(name);
    setUserBusiness(business);
  }, []);

  const pages = { dashboard: DashboardPage, inbox: InboxPage, leads: LeadsPage, crm: CRMPage, bookings: BookingsPage, campaigns: CampaignsPage, automation: AutomationPage, analytics: AnalyticsPage, "ai-tools": AIToolsPage, settings: SettingsPage };
  const PageComponent = pages[page] || DashboardPage;
  const pageProps = { setPage, demoConfig };

  const updateDemoConfig = (field, value) => setDemoConfig((prev) => ({ ...prev, [field]: value }));
  const resetDemoConfig = () => setDemoConfig({ ...DEMO_CONFIG });

  const SidebarContent = ({ overlay = false }) => (
    <div style={{ width: overlay ? 280 : sidebarOpen ? 220 : 64, position: overlay ? "fixed" : "static", left: overlay ? 0 : undefined, top: overlay ? 0 : undefined, height: overlay ? "100vh" : undefined, background: colors.surface, borderRight: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", transition: "width 0.2s ease", flexShrink: 0, overflow: "hidden", zIndex: overlay ? 1300 : "auto" }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#000", flexShrink: 0 }}>C</div>
          {!isMobile && sidebarOpen && <div style={{ overflow: "hidden" }}>
            <div style={{ color: colors.text, fontWeight: 800, fontSize: 15, letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>CleyFlow<span style={{ color: colors.accent }}> AI</span></div>
          </div>}
        </div>
        <button onClick={() => setSidebarOpen(v => !v)} style={{ background: "none", border: "none", color: colors.textMuted, cursor: "pointer", fontSize: 16, padding: 0, flexShrink: 0 }}>{sidebarOpen ? "◂" : "▸"}</button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
        {navItems.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 2, background: active ? colors.accentDim : "transparent", color: active ? colors.accent : colors.textMuted, textAlign: "left", position: "relative", whiteSpace: "nowrap", overflow: "hidden" }}>
              <span style={{ fontSize: 16, flexShrink: 0, width: 20, textAlign: "center" }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize: 13, fontWeight: active ? 700 : 400 }}>{item.label}</span>}
              {item.badge && sidebarOpen && (
                <span style={{ marginLeft: "auto", background: colors.accent, color: "#000", borderRadius: 10, padding: "1px 6px", fontSize: 9, fontWeight: 800 }}>{item.badge}</span>
              )}
              {active && <div style={{ position: "absolute", right: 0, top: 4, bottom: 4, width: 3, background: colors.accent, borderRadius: "3px 0 0 3px" }} />}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "12px 10px", borderTop: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
        <Avatar initials={demoConfig.founderInitials} size={32} glow />
        {sidebarOpen && <div style={{ overflow: "hidden" }}>
          <div style={{ color: colors.text, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{demoConfig.founderName}</div>
          <div style={{ color: colors.textMuted, fontSize: 10 }}>Admin</div>
        </div>}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: colors.bg, fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", overflow: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: ${colors.bg}; }
        ::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${colors.borderLight}; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shimmer { 0%{opacity:0.6} 50%{opacity:1} 100%{opacity:0.6} }
        button { font-family: inherit; }
        input, textarea, select { font-family: inherit; }
      `}</style>

      {/* Sidebar */}
      {!isMobile ? (
        <SidebarContent />
      ) : (
        <>
          <button onClick={() => setSidebarOpen(true)} style={{ position: "fixed", left: 12, top: 12, zIndex: 1400, background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`, color: "#000", border: "none", width: 44, height: 44, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>☰</button>
          {sidebarOpen && <SidebarContent overlay={true} />}
        </>
      )}

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {/* Top Bar */}
        <div style={{ height: 52, borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", background: `${colors.surface}CC`, backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {isMobile && <button onClick={() => setSidebarOpen(v => !v)} style={{ background: "none", border: "none", color: colors.text, fontSize: 20, padding: 6, marginRight: 6, cursor: "pointer" }}>☰</button>}
            {navItems.find(n => n.id === page) && (
              <>
                <span style={{ color: colors.textDim, fontSize: 13 }}>CleyFlow</span>
                <span style={{ color: colors.textDim, fontSize: 13 }}>›</span>
                <span style={{ color: colors.text, fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{navItems.find(n => n.id === page)?.label}</span>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "6px 12px", display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ color: colors.textMuted, fontSize: 13 }}>🔍</span>
              <input placeholder="Search..." style={{ background: "none", border: "none", color: colors.text, fontSize: 12, outline: "none", width: 140 }} />
            </div>
            <button style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, width: 36, height: 36, cursor: "pointer", fontSize: 14, position: "relative" }}>
              🔔
              <div style={{ position: "absolute", top: 6, right: 7, width: 7, height: 7, borderRadius: "50%", background: colors.red, border: `2px solid ${colors.surface}` }} />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <PageComponent {...pageProps} />
      </div>

      <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
        <DemoSettingsPanel
          visible={settingsOpen}
          demoConfig={demoConfig}
          onChange={updateDemoConfig}
          onReset={resetDemoConfig}
          onClose={() => setSettingsOpen(false)}
        />
        <button onClick={() => setSettingsOpen((prev) => !prev)} style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${colors.purple}, ${colors.accent})`, border: "none", color: "#000", fontSize: 24, fontWeight: 700, cursor: "pointer", boxShadow: "0 12px 30px rgba(0,0,0,0.35)" }}>⚙</button>
      </div>
    </div>
  );
}
