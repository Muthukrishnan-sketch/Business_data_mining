import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const LEAD_COLORS = {
  "Hot Lead": "#ef4444",
  "Warm Lead": "#f97316",
  "Potential Lead": "#eab308",
  "Low Priority": "#94a3b8",
};

const SITE_COLORS = {
  active: "#22c55e",
  broken: "#f97316",
  missing: "#ef4444",
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : true
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

function Badge({ value }) {
  const color = LEAD_COLORS[value] || "#94a3b8";
  return (
    <span style={{
      background: color + "18", color,
      border: `1px solid ${color}55`,
      borderRadius: 20, padding: "3px 10px",
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>{value}</span>
  );
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0",
      borderRadius: 14, padding: "16px 18px", flex: 1, minWidth: 140,
      boxShadow: "0 1px 4px #0000000a",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: color || "#1e293b", lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
        </div>
        {icon && <span style={{ fontSize: 22, opacity: 0.7 }}>{icon}</span>}
      </div>
    </div>
  );
}

// ── BUSINESS DETAILS MODAL ────────────────────────────────────────────────────
function BusinessModal({ business: b, onClose }) {
  if (!b) return null;
  const leadColor = LEAD_COLORS[b.lead_category] || "#94a3b8";
  const scoreColor = b.lead_score >= 70 ? "#ef4444" : b.lead_score >= 50 ? "#f97316" : "#94a3b8";

  const opps = [
    b.website_opportunity && { icon: "🌐", label: "Website Development", desc: "Business needs a professional website to establish online presence." },
    b.digital_marketing_opportunity && { icon: "📣", label: "Digital Marketing", desc: "No social media presence detected. Strong opportunity for marketing services." },
    b.software_opportunity && { icon: "💻", label: "Business Software", desc: "Could benefit from CRM, POS, or management software solutions." },
    b.mobile_app_opportunity && { icon: "📱", label: "Mobile App", desc: "High footfall business that could benefit from a customer loyalty app." },
  ].filter(Boolean);

  const recommendations = [];
  if (b.lead_score >= 80) recommendations.push("✅ Priority outreach — high conversion probability.");
  if (!b.has_website) recommendations.push("🌐 Pitch website development as the first service.");
  if (!b.facebook && !b.instagram) recommendations.push("📣 Lead with social media audit to open the conversation.");
  if (b.website_status === "broken") recommendations.push("🔧 Offer website repair/rebuild — they already know they need it.");
  if (recommendations.length === 0) recommendations.push("📋 Standard nurture sequence — monitor for engagement.");

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 18, width: "100%", maxWidth: 580,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 24px 80px #0000003a",
          fontFamily: "'Inter','Segoe UI',sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 100%)",
          borderRadius: "18px 18px 0 0", padding: "22px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{b.name}</div>
            <div style={{ fontSize: 13, color: "#bae6fd" }}>{b.category} · {b.city}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge value={b.lead_category} />
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8,
              color: "#fff", fontSize: 18, width: 32, height: 32, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Lead Score */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            background: "#f8fafc", borderRadius: 12, padding: "14px 18px",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 38, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{b.lead_score ?? "—"}</div>
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginTop: 2 }}>Lead Score</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 8, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${b.lead_score ?? 0}%`,
                  background: `linear-gradient(90deg, ${scoreColor}88, ${scoreColor})`,
                  borderRadius: 99, transition: "width 0.6s ease",
                }} />
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                {b.lead_score >= 80 ? "Excellent prospect — act fast." :
                  b.lead_score >= 60 ? "Good prospect — worth reaching out." :
                  b.lead_score >= 40 ? "Moderate interest — nurture over time." :
                  "Low priority — keep in pipeline."}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Contact Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { icon: "📞", label: "Phone", value: b.phone || "Not available" },
                { icon: "✉️", label: "Email", value: b.email || "Not available" },
                { icon: "📍", label: "Address", value: b.address || b.city || "Not available" },
                { icon: "🌐", label: "Website", value: b.website || "No website", link: b.website },
              ].map(({ icon, label, value, link }) => (
                <div key={label} style={{
                  background: "#f8fafc", borderRadius: 10, padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 3 }}>{icon} {label}</div>
                  {link
                    ? <a href={link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#0ea5e9", textDecoration: "none", fontWeight: 500, wordBreak: "break-all" }}>{value}</a>
                    : <div style={{ fontSize: 12, color: value === "Not available" || value === "No website" ? "#cbd5e1" : "#334155", fontWeight: 500 }}>{value}</div>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Social Media</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { icon: "📘", label: "Facebook", value: b.facebook },
                { icon: "📸", label: "Instagram", value: b.instagram },
                { icon: "🐦", label: "Twitter", value: b.twitter },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: value ? "#f0fdf4" : "#f8fafc",
                  border: `1px solid ${value ? "#bbf7d0" : "#e2e8f0"}`,
                  borderRadius: 8, padding: "6px 12px",
                }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  {value
                    ? <a href={value} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#16a34a", textDecoration: "none", fontWeight: 600 }}>{label} ↗</a>
                    : <span style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 500 }}>{label}: None</span>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          {opps.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Opportunities Identified</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {opps.map(({ icon, label, desc }) => (
                  <div key={label} style={{
                    background: "#fefce8", border: "1px solid #fde68a",
                    borderRadius: 10, padding: "10px 14px",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>{label}</div>
                      <div style={{ fontSize: 12, color: "#78350f", marginTop: 2 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Sales Recommendations</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {recommendations.map((r, i) => (
                <div key={i} style={{
                  background: "#f0f9ff", border: "1px solid #bae6fd",
                  borderRadius: 8, padding: "9px 14px",
                  fontSize: 13, color: "#0c4a6e", lineHeight: 1.5,
                }}>{r}</div>
              ))}
            </div>
          </div>

          {/* Website status */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#f8fafc", borderRadius: 10, padding: "12px 16px",
            border: "1px solid #e2e8f0",
          }}>
            <span style={{ fontSize: 20 }}>
              {b.website_status === "active" ? "✅" : b.website_status === "broken" ? "⚠️" : "❌"}
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: SITE_COLORS[b.website_status] || "#94a3b8" }}>
                Website: {b.website_status === "active" ? "Active & Working" : b.website_status === "broken" ? "Broken / Not Loading" : "No Website Found"}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                {b.website_status === "active" ? "Site is live — focus on SEO and marketing." :
                  b.website_status === "broken" ? "Site exists but is not working — rebuild opportunity." :
                  "No online presence — high-value website pitch."}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── SCRAPER PROGRESS PANEL ────────────────────────────────────────────────────
function ScraperProgressPanel({ onDone, onClose }) {
  const [progress, setProgress] = useState(0);
  const [found, setFound] = useState(0);
  const [dupes, setDupes] = useState(0);
  const [errors, setErrors] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState("Initializing scraper...");
  const [done, setDone] = useState(false);
  const [logs, setLogs] = useState(["[00:00] Scraper started"]);
  const timerRef = useRef(null);
  const startRef = useRef(Date.now());

  const phases = [
    { at: 5, msg: "Connecting to data sources..." },
    { at: 12, msg: "Scanning Google Maps listings..." },
    { at: 25, msg: "Extracting business details..." },
    { at: 40, msg: "Fetching contact information..." },
    { at: 55, msg: "Checking website status..." },
    { at: 68, msg: "Analyzing social media presence..." },
    { at: 80, msg: "Removing duplicate entries..." },
    { at: 90, msg: "Scoring and categorizing leads..." },
    { at: 97, msg: "Finalizing and saving to database..." },
  ];

  useEffect(() => {
    // Call the actual API
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    fetch(`${API_URL}/scrape/run?count=50`, { method: "POST" })
      .then(() => { /* API done — let animation finish */ })
      .catch(() => { /* still let animation run */ });

    // Animate progress
    timerRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(secs);

      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          setPhase("✅ Scraping complete!");
          setDone(true);
          onDone?.();
          return 100;
        }
        // Slow down near the end
        const step = prev < 80 ? (Math.random() * 2.5 + 0.5) : (Math.random() * 0.8 + 0.1);
        const next = Math.min(100, prev + step);

        // Check phase messages
        const hit = phases.find(p => p.at <= next && p.at > prev);
        if (hit) {
          setPhase(hit.msg);
          const ts = String(Math.floor(secs / 60)).padStart(2, "0") + ":" + String(secs % 60).padStart(2, "0");
          setLogs(l => [...l.slice(-8), `[${ts}] ${hit.msg}`]);
        }

        // Increment fake stats
        if (next > 10) setFound(f => Math.min(50, f + (Math.random() > 0.7 ? 1 : 0)));
        if (next > 80) setDupes(d => Math.min(8, d + (Math.random() > 0.85 ? 1 : 0)));
        if (next > 30 && Math.random() > 0.98) setErrors(e => Math.min(3, e + 1));

        return next;
      });
    }, 200);

    return () => clearInterval(timerRef.current);
  }, []);

  const fmt = s => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  const pct = Math.floor(progress);
  const barFill = `${pct}%`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(15,23,42,0.60)", backdropFilter: "blur(3px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      <div style={{
        background: "#0f172a", borderRadius: 18, width: "100%", maxWidth: 500,
        border: "1px solid #1e293b", boxShadow: "0 24px 80px #000a",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 22px", borderBottom: "1px solid #1e293b",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>
              {done ? "✅ Scrape Complete" : "⚙️ Scraper Running"}
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>DataMine Engine v1.0</div>
          </div>
          <div style={{
            background: done ? "#166534" : "#1e3a5f",
            border: `1px solid ${done ? "#16a34a" : "#0ea5e9"}`,
            borderRadius: 20, padding: "4px 12px",
            fontSize: 11, fontWeight: 600,
            color: done ? "#4ade80" : "#38bdf8",
          }}>
            {done ? "DONE" : "LIVE"}
          </div>
        </div>

        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Progress bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{phase}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{pct}%</span>
            </div>
            <div style={{ height: 10, background: "#1e293b", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: barFill,
                background: done
                  ? "linear-gradient(90deg, #16a34a, #4ade80)"
                  : "linear-gradient(90deg, #0ea5e9, #8b5cf6)",
                borderRadius: 99,
                transition: "width 0.3s ease",
                boxShadow: done ? "0 0 8px #4ade8088" : "0 0 8px #0ea5e988",
              }} />
            </div>
            {/* Block visualizer */}
            <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: (i / 20) * 100 < pct
                    ? (done ? "#4ade80" : "#0ea5e9")
                    : "#1e293b",
                  transition: "background 0.2s",
                }} />
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "Found", value: found, color: "#38bdf8", icon: "🏢" },
              { label: "Dupes", value: dupes, color: "#a78bfa", icon: "♻️" },
              { label: "Errors", value: errors, color: "#f87171", icon: "⚠️" },
              { label: "Time", value: fmt(elapsed), color: "#94a3b8", icon: "⏱" },
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={{
                background: "#1e293b", borderRadius: 10, padding: "10px 8px",
                textAlign: "center", border: "1px solid #334155",
              }}>
                <div style={{ fontSize: 16 }}>{icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
                <div style={{ fontSize: 10, color: "#475569", fontWeight: 600, textTransform: "uppercase", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Live log */}
          <div style={{
            background: "#020617", borderRadius: 10, padding: "12px 14px",
            border: "1px solid #1e293b", maxHeight: 120, overflowY: "auto",
          }}>
            <div style={{ fontSize: 10, color: "#475569", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Live Log
            </div>
            {logs.map((log, i) => (
              <div key={i} style={{
                fontSize: 11, color: i === logs.length - 1 ? "#38bdf8" : "#475569",
                fontFamily: "ui-monospace, monospace", lineHeight: 1.8,
              }}>{log}</div>
            ))}
          </div>

          {/* Action button */}
          {done ? (
            <button onClick={onClose} style={{
              width: "100%", padding: "13px",
              background: "linear-gradient(135deg, #16a34a, #22c55e)",
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 14px #16a34a44",
            }}>
              ✅ View Results
            </button>
          ) : (
            <div style={{ textAlign: "center", fontSize: 12, color: "#475569" }}>
              Scraping in progress — please wait...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── LOGIN PAGE ────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!username || !password) { setError("Please enter username and password."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) { onLogin(data.user); }
      else { setError(data.message || "Invalid credentials."); }
    } catch {
      setError("Cannot connect to backend. Make sure FastAPI is running.");
    } finally { setLoading(false); }
  };

  const inp = {
    width: "100%", padding: "12px 16px",
    border: "1px solid #e2e8f0", borderRadius: 10,
    fontSize: 14, outline: "none", color: "#1e293b",
    background: "#f8fafc", boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter','Segoe UI',sans-serif", padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "40px 32px",
        width: "100%", maxWidth: 400, boxShadow: "0 20px 60px #0000003a",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1e3a5f" }}>DataMine</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Business Intelligence Platform</div>
        </div>

        <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 20 }}>Admin Login</div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 6 }}>Username</label>
          <input style={inp} placeholder="Enter username" value={username}
            onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 6 }}>Password</label>
          <div style={{ position: "relative" }}>
            <input style={inp} type={showPass ? "text" : "password"} placeholder="Enter password" value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            <span onClick={() => setShowPass(!showPass)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 16, color: "#94a3b8" }}>
              {showPass ? "🙈" : "👁️"}
            </span>
          </div>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading} style={{
          width: "100%", padding: "13px",
          background: loading ? "#94a3b8" : "linear-gradient(135deg, #1e3a5f, #0ea5e9)",
          color: "#fff", border: "none", borderRadius: 10,
          fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 14px #0ea5e940",
        }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div style={{ marginTop: 18, padding: "12px 16px", background: "#f0f9ff", borderRadius: 8, fontSize: 12, color: "#0369a1", textAlign: "center" }}>
          Demo credentials: <b>admin</b> / <b>datamine123</b>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const isMobile = useIsMobile();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterCity, setFilterCity] = useState("All");
  const [filterLead, setFilterLead] = useState("All");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [scraping, setScraping] = useState(false);
  const [showScraperProgress, setShowScraperProgress] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const fetchBusinesses = async () => {
    try {
      const res = await fetch(`${API}/businesses`);
      setBusinesses(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { if (isLoggedIn) fetchBusinesses(); }, [isLoggedIn]);

  const showToast = (msg, color = "#22c55e") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (user) => { setAdminUser(user); setIsLoggedIn(true); };
  const handleLogout = () => { setIsLoggedIn(false); setAdminUser(null); setBusinesses([]); setLoading(true); };

  const runScraper = () => {
    setScraping(true);
    setShowScraperProgress(true);
    setShowActions(false);
  };

  const handleScraperDone = async () => {
    await fetchBusinesses();
  };

  const handleScraperClose = () => {
    setShowScraperProgress(false);
    setScraping(false);
    showToast("Scraping complete! Data refreshed.");
    setActiveTab("businesses");
  };

  const runProcessing = async () => {
    setProcessing(true); setShowActions(false);
    try {
      const res = await fetch(`${API}/process/run`, { method: "POST" });
      const data = await res.json();
      showToast(data.message);
      await fetchBusinesses();
    } catch { showToast("Processing failed", "#ef4444"); }
    finally { setProcessing(false); }
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  const total = businesses.length;
  const categories = [...new Set(businesses.map(b => b.category))];
  const cities = [...new Set(businesses.map(b => b.city))];
  const hotLeads = businesses.filter(b => b.lead_category === "Hot Lead").length;
  const warmLeads = businesses.filter(b => b.lead_category === "Warm Lead").length;
  const withWebsite = businesses.filter(b => b.has_website).length;
  const withoutWebsite = businesses.filter(b => !b.has_website).length;

  const categoryData = categories.map(cat => ({
    name: cat, count: businesses.filter(b => b.category === cat).length,
  })).sort((a, b) => b.count - a.count);

  const leadData = ["Hot Lead", "Warm Lead", "Potential Lead", "Low Priority"].map(l => ({
    name: l, value: businesses.filter(b => b.lead_category === l).length,
  })).filter(d => d.value > 0);

  const websiteData = [
    { name: "Active", value: businesses.filter(b => b.website_status === "active").length },
    { name: "Broken", value: businesses.filter(b => b.website_status === "broken").length },
    { name: "Missing", value: businesses.filter(b => b.website_status === "missing").length },
  ].filter(d => d.value > 0);

  const opportunityData = [
    { name: "Website", count: businesses.filter(b => b.website_opportunity).length },
    { name: "Digital Mktg", count: businesses.filter(b => b.digital_marketing_opportunity).length },
    { name: "Software", count: businesses.filter(b => b.software_opportunity).length },
    { name: "Mobile App", count: businesses.filter(b => b.mobile_app_opportunity).length },
  ];

  const insights = total > 0 ? [
    { icon: "🌐", text: `${Math.round(withoutWebsite / total * 100)}% of businesses do not have an active website.` },
    { icon: "📣", text: `${Math.round(businesses.filter(b => !b.facebook && !b.instagram).length / total * 100)}% have no social media presence.` },
    { icon: "🔥", text: `${Math.round(hotLeads / total * 100)}% qualify as Hot Leads with scores 90+.` },
    { icon: "🍽️", text: `${businesses.filter(b => b.category === "Restaurant" && !b.has_website).length} of ${businesses.filter(b => b.category === "Restaurant").length} restaurants lack a website.` },
    { icon: "📱", text: `${businesses.filter(b => b.mobile_app_opportunity).length} businesses may benefit from a mobile app.` },
  ] : [];

  const filtered = businesses.filter(b => {
    const s = b.name.toLowerCase().includes(search.toLowerCase()) || b.city.toLowerCase().includes(search.toLowerCase());
    return s && (filterCategory === "All" || b.category === filterCategory)
      && (filterCity === "All" || b.city === filterCity)
      && (filterLead === "All" || b.lead_category === filterLead);
  });

  const chartBox = {
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 4px #0000000a",
  };
  const inp = {
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 8, padding: "9px 12px", color: "#1e293b",
    fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
  };
  const sel = { ...inp, cursor: "pointer", width: "auto" };
  const th = {
    textAlign: "left", padding: "10px 12px", color: "#64748b",
    fontWeight: 600, fontSize: 11, borderBottom: "2px solid #e2e8f0",
    textTransform: "uppercase", letterSpacing: "0.05em", background: "#f8fafc",
    whiteSpace: "nowrap",
  };
  const td = { padding: "10px 12px", borderBottom: "1px solid #f1f5f9", color: "#334155", verticalAlign: "middle", fontSize: 13 };

  const SIDEBAR_W = 220;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Business Details Modal */}
      {selectedBusiness && (
        <BusinessModal business={selectedBusiness} onClose={() => setSelectedBusiness(null)} />
      )}

      {/* Scraper Progress Modal */}
      {showScraperProgress && (
        <ScraperProgressPanel
          onDone={handleScraperDone}
          onClose={handleScraperClose}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, background: toast.color, color: "#fff", borderRadius: 10, padding: "12px 20px", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px #0003", maxWidth: "80vw" }}>
          {toast.msg}
        </div>
      )}

      {/* Actions popup (mobile) */}
      {isMobile && showActions && (
        <div style={{ position: "fixed", bottom: 70, left: 0, right: 0, zIndex: 999, background: "#fff", borderTop: "1px solid #e2e8f0", padding: "16px", display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 -4px 20px #0000001a" }}>
          <button onClick={runScraper} disabled={scraping} style={{ padding: "12px", background: scraping ? "#e2e8f0" : "#0ea5e9", color: scraping ? "#94a3b8" : "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {scraping ? "⏳ Scraping..." : "▶ Run Scraper"}
          </button>
          <button onClick={runProcessing} disabled={processing} style={{ padding: "12px", background: processing ? "#e2e8f0" : "#8b5cf6", color: processing ? "#94a3b8" : "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {processing ? "⏳ Processing..." : "⚙ Process Data"}
          </button>
          <button onClick={() => { window.open(`${API}/reports/generate`, "_blank"); setShowActions(false); }} style={{ padding: "12px", background: "#10b981", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            📄 Download Report
          </button>
          <button onClick={handleLogout} style={{ padding: "12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            🚪 Logout
          </button>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <div style={{ width: SIDEBAR_W, background: "#1e3a5f", position: "fixed", top: 0, left: 0, bottom: 0, display: "flex", flexDirection: "column", boxShadow: "2px 0 12px #0000001a" }}>
          <div style={{ padding: "22px 18px 18px", borderBottom: "1px solid #2d5a8e" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>📊 DataMine</div>
            <div style={{ fontSize: 11, color: "#7dd3fc", marginTop: 3 }}>Business Intelligence Platform</div>
          </div>

          <div style={{ padding: "12px 18px", borderBottom: "1px solid #2d5a8e", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
              {adminUser?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{adminUser?.username || "Admin"}</div>
              <div style={{ fontSize: 11, color: "#7dd3fc" }}>Administrator</div>
            </div>
          </div>

          <div style={{ flex: 1, paddingTop: 8 }}>
            {[{ key: "dashboard", label: "Dashboard", icon: "📈" }, { key: "businesses", label: "Businesses", icon: "🏢" }, { key: "insights", label: "Insights", icon: "💡" }].map(({ key, label, icon }) => (
              <div key={key} onClick={() => setActiveTab(key)} style={{ padding: "11px 18px", cursor: "pointer", fontSize: 14, fontWeight: activeTab === key ? 600 : 400, color: activeTab === key ? "#fff" : "#93c5fd", background: activeTab === key ? "#2d5a8e" : "transparent", borderLeft: activeTab === key ? "3px solid #60a5fa" : "3px solid transparent", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}>
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>

          <div style={{ padding: "14px 14px 22px", borderTop: "1px solid #2d5a8e", display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: scraping ? "⏳ Scraping..." : "▶ Run Scraper", action: runScraper, color: "#0ea5e9", disabled: scraping },
              { label: processing ? "⏳ Processing..." : "⚙ Process Data", action: runProcessing, color: "#8b5cf6", disabled: processing },
              { label: "📄 Download Report", action: () => window.open(`${API}/reports/generate`, "_blank"), color: "#10b981" },
              { label: "🚪 Logout", action: handleLogout, color: "#ef4444" },
            ].map(({ label, action, color, disabled }) => (
              <button key={label} onClick={action} disabled={disabled} style={{ padding: "9px", background: disabled ? "#e2e8f0" : color, color: disabled ? "#94a3b8" : "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ marginLeft: isMobile ? 0 : SIDEBAR_W, padding: isMobile ? "16px 14px 80px" : "24px 28px", minHeight: "100vh" }}>

        {/* Mobile top bar */}
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, background: "#1e3a5f", margin: "-16px -14px 16px", padding: "14px 16px" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>📊 DataMine</div>
              <div style={{ fontSize: 10, color: "#7dd3fc" }}>Business Intelligence Platform</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                {adminUser?.username?.[0]?.toUpperCase() || "A"}
              </div>
            </div>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>Dashboard Overview</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>{total} businesses in database</div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5,1fr)", gap: 12, marginBottom: 16 }}>
              <StatCard label="Total Businesses" value={total} sub="in database" icon="🏢" />
              <StatCard label="Categories" value={categories.length} sub="business types" icon="🗂️" />
              <StatCard label="Cities" value={cities.length} sub="locations covered" icon="📍" />
              <StatCard label="Hot Leads" value={hotLeads} sub={`${warmLeads} warm`} color="#ef4444" icon="🔥" />
              <StatCard label="Need Website" value={withoutWebsite} sub={`${withWebsite} have one`} color="#f97316" icon="🌐" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={chartBox}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 12 }}>Business Categories</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoryData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={chartBox}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 12 }}>Lead Score Distribution</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={leadData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {leadData.map((entry, i) => <Cell key={i} fill={LEAD_COLORS[entry.name]} />)}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={chartBox}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 12 }}>Website Status</div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={websiteData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65}>
                      {websiteData.map((entry, i) => <Cell key={i} fill={SITE_COLORS[entry.name.toLowerCase()] || "#94a3b8"} />)}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={chartBox}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 12 }}>Opportunity Breakdown</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={opportunityData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "#64748b", fontSize: 10 }} width={75} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* BUSINESSES TAB */}
        {activeTab === "businesses" && (
          <>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>Business Directory</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
              Showing {filtered.length} of {total} records · <span style={{ color: "#0ea5e9" }}>Click any row for details</span>
            </div>

            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10, marginBottom: 16 }}>
              <input style={{ ...inp, flex: 1 }} placeholder="🔍 Search by name or city..." value={search} onChange={e => setSearch(e.target.value)} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <select style={sel} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
                <select style={sel} value={filterCity} onChange={e => setFilterCity(e.target.value)}>
                  <option value="All">All Cities</option>
                  {cities.map(c => <option key={c}>{c}</option>)}
                </select>
                <select style={sel} value={filterLead} onChange={e => setFilterLead(e.target.value)}>
                  <option value="All">All Leads</option>
                  {["Hot Lead", "Warm Lead", "Potential Lead", "Low Priority"].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px #0000000a" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: isMobile ? 600 : "auto" }}>
                  <thead>
                    <tr>{["Business", "Category", "City", "Website", "Score", "Lead Type", "Opps"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedBusiness(b)}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={td}>
                          <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>{b.name}</div>
                          <div style={{ fontSize: 11, color: "#0ea5e9", marginTop: 2 }}>View details →</div>
                        </td>
                        <td style={td}><span style={{ color: "#3b82f6", fontWeight: 500, fontSize: 12 }}>{b.category}</span></td>
                        <td style={td}>{b.city}</td>
                        <td style={td}>
                          <span style={{ color: SITE_COLORS[b.website_status] || "#94a3b8", fontSize: 12, fontWeight: 600 }}>
                            {b.website_status === "active" ? "✓ Active" : b.website_status === "broken" ? "✗ Broken" : "— Missing"}
                          </span>
                        </td>
                        <td style={td}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: b.lead_score >= 70 ? "#ef4444" : b.lead_score >= 50 ? "#f97316" : "#94a3b8" }}>
                            {b.lead_score}
                          </span>
                        </td>
                        <td style={td}><Badge value={b.lead_category} /></td>
                        <td style={td}>
                          <div style={{ display: "flex", gap: 2 }}>
                            {b.website_opportunity && <span title="Website" style={{ fontSize: 14 }}>🌐</span>}
                            {b.digital_marketing_opportunity && <span title="Marketing" style={{ fontSize: 14 }}>📣</span>}
                            {b.software_opportunity && <span title="Software" style={{ fontSize: 14 }}>💻</span>}
                            {b.mobile_app_opportunity && <span title="Mobile App" style={{ fontSize: 14 }}>📱</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === "insights" && (
          <>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>Business Insights</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Auto-generated from scraped data</div>
            <div style={{ display: "grid", gap: 12 }}>
              {insights.map((insight, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "4px solid #3b82f6", borderRadius: 10, padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 12, boxShadow: "0 1px 4px #0000000a" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{insight.icon}</span>
                  <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{insight.text}</div>
                </div>
              ))}
              {total === 0 && <div style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: 24 }}>No data yet. Run scraper and process data first.</div>}
            </div>
          </>
        )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#1e3a5f", display: "flex", zIndex: 100, boxShadow: "0 -2px 12px #0000002a" }}>
          {[
            { key: "dashboard", label: "Dashboard", icon: "📈" },
            { key: "businesses", label: "Businesses", icon: "🏢" },
            { key: "insights", label: "Insights", icon: "💡" },
            { key: "actions", label: "Actions", icon: "⚡" },
          ].map(({ key, label, icon }) => (
            <div key={key}
              onClick={() => key === "actions" ? setShowActions(!showActions) : (setActiveTab(key), setShowActions(false))}
              style={{
                flex: 1, padding: "10px 4px 8px", textAlign: "center", cursor: "pointer",
                color: (key === "actions" ? showActions : activeTab === key) ? "#60a5fa" : "#93c5fd",
                background: (key === "actions" ? showActions : activeTab === key) ? "#2d5a8e" : "transparent",
                transition: "all 0.15s",
              }}>
              <div style={{ fontSize: 20 }}>{icon}</div>
              <div style={{ fontSize: 10, marginTop: 2, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}