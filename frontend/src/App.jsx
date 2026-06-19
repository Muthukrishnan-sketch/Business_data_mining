import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Admin credentials (demo)
const ADMIN_USER = "admin";
const ADMIN_PASS = "datamine123";

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

function Badge({ value }) {
  const color = LEAD_COLORS[value] || "#94a3b8";
  return (
    <span style={{
      background: color + "18", color,
      border: `1px solid ${color}55`,
      borderRadius: 20, padding: "3px 12px",
      fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
    }}>{value}</span>
  );
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0",
      borderRadius: 14, padding: "20px 24px", flex: 1, minWidth: 160,
      boxShadow: "0 1px 4px #0000000a",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: color || "#1e293b", lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>{sub}</div>}
        </div>
        {icon && <span style={{ fontSize: 26, opacity: 0.7 }}>{icon}</span>}
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
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch {
      setError("Cannot connect to backend. Make sure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    border: "1px solid #e2e8f0", borderRadius: 10,
    fontSize: 14, outline: "none", color: "#1e293b",
    background: "#f8fafc", boxSizing: "border-box",
    transition: "border 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "44px 40px",
        width: 400, boxShadow: "0 20px 60px #0000003a",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1e3a5f" }}>DataMine</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Business Intelligence Platform</div>
        </div>

        <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 20 }}>
          Admin Login
        </div>

        {/* Username */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 6 }}>
            Username
          </label>
          <input
            style={inputStyle}
            placeholder="Enter username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "#64748b", display: "block", marginBottom: 6 }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              style={inputStyle}
              type={showPass ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
            <span
              onClick={() => setShowPass(!showPass)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 16, color: "#94a3b8" }}
            >{showPass ? "🙈" : "👁️"}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fca5a5",
            borderRadius: 8, padding: "10px 14px",
            color: "#ef4444", fontSize: 13, marginBottom: 16,
          }}>{error}</div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "13px",
            background: loading ? "#94a3b8" : "linear-gradient(135deg, #1e3a5f, #0ea5e9)",
            color: "#fff", border: "none", borderRadius: 10,
            fontSize: 15, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px #0ea5e940",
            transition: "opacity 0.2s",
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Demo hint */}
        <div style={{
          marginTop: 20, padding: "12px 16px",
          background: "#f0f9ff", borderRadius: 8,
          fontSize: 12, color: "#0369a1", textAlign: "center",
        }}>
          Demo credentials: <b>admin</b> / <b>datamine123</b>
        </div>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function App() {
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
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchBusinesses = async () => {
    try {
      const res = await fetch(`${API}/businesses`);
      const data = await res.json();
      setBusinesses(data);
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

  const runScraper = async () => {
    setScraping(true);
    try {
      const res = await fetch(`${API}/scrape/run?count=50`, { method: "POST" });
      const data = await res.json();
      showToast(data.message);
      await fetchBusinesses();
    } catch { showToast("Scraper failed", "#ef4444"); }
    finally { setScraping(false); }
  };

  const runProcessing = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${API}/process/run`, { method: "POST" });
      const data = await res.json();
      showToast(data.message);
      await fetchBusinesses();
    } catch { showToast("Processing failed", "#ef4444"); }
    finally { setProcessing(false); }
  };

  // Show login if not authenticated
  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  // Derived stats
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

  const insights = [];
  if (total > 0) {
    const noWebPct = Math.round((withoutWebsite / total) * 100);
    const noSocialPct = Math.round((businesses.filter(b => !b.facebook && !b.instagram).length / total) * 100);
    const hotPct = Math.round((hotLeads / total) * 100);
    const restaurants = businesses.filter(b => b.category === "Restaurant");
    const restNoWeb = restaurants.filter(b => !b.has_website).length;
    insights.push({ icon: "🌐", text: `${noWebPct}% of businesses do not have an active website — a key digital opportunity.` });
    insights.push({ icon: "📣", text: `${noSocialPct}% of businesses have no social media presence on Facebook or Instagram.` });
    insights.push({ icon: "🔥", text: `${hotPct}% of businesses qualify as Hot Leads with scores 90+.` });
    insights.push({ icon: "🍽️", text: `${restNoWeb} of ${restaurants.length} restaurants lack a website — prime candidates for web development.` });
    insights.push({ icon: "📱", text: `${businesses.filter(b => b.mobile_app_opportunity).length} businesses in service categories may benefit from a mobile app.` });
  }

  const filtered = businesses.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.city.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "All" || b.category === filterCategory;
    const matchCity = filterCity === "All" || b.city === filterCity;
    const matchLead = filterLead === "All" || b.lead_category === filterLead;
    return matchSearch && matchCat && matchCity && matchLead;
  });

  const s = {
    sidebar: {
      width: 230, background: "#1e3a5f", position: "fixed",
      top: 0, left: 0, bottom: 0, display: "flex", flexDirection: "column",
      boxShadow: "2px 0 12px #0000001a",
    },
    navItem: (active) => ({
      padding: "11px 20px", cursor: "pointer", fontSize: 14,
      fontWeight: active ? 600 : 400,
      color: active ? "#fff" : "#93c5fd",
      background: active ? "#2d5a8e" : "transparent",
      borderLeft: active ? "3px solid #60a5fa" : "3px solid transparent",
      display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s",
    }),
    btn: (bg, disabled = false) => ({
      background: disabled ? "#e2e8f0" : bg, color: disabled ? "#94a3b8" : "#fff",
      border: "none", borderRadius: 8, padding: "10px 16px",
      fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
      width: "100%", marginBottom: 8,
    }),
    chartBox: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 4px #0000000a" },
    th: { textAlign: "left", padding: "11px 14px", color: "#64748b", fontWeight: 600, fontSize: 12, borderBottom: "2px solid #e2e8f0", textTransform: "uppercase", letterSpacing: "0.05em", background: "#f8fafc" },
    td: { padding: "12px 14px", borderBottom: "1px solid #f1f5f9", color: "#334155", verticalAlign: "middle" },
    input: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 14px", color: "#1e293b", fontSize: 13, outline: "none" },
    select: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", color: "#1e293b", fontSize: 13, outline: "none", cursor: "pointer" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',sans-serif", display: "flex" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.color, color: "#fff", borderRadius: 10, padding: "12px 22px", fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px #0003" }}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #2d5a8e" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>📊 DataMine</div>
          <div style={{ fontSize: 11, color: "#7dd3fc", marginTop: 3 }}>Business Intelligence Platform</div>
        </div>

        {/* Admin badge */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #2d5a8e", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>
            {adminUser?.username?.[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{adminUser?.username || "Admin"}</div>
            <div style={{ fontSize: 11, color: "#7dd3fc" }}>Administrator</div>
          </div>
        </div>

        <div style={{ padding: "12px 0", flex: 1 }}>
          {[
            { key: "dashboard", label: "Dashboard", icon: "📈" },
            { key: "businesses", label: "Businesses", icon: "🏢" },
            { key: "insights", label: "Insights", icon: "💡" },
          ].map(({ key, label, icon }) => (
            <div key={key} style={s.navItem(activeTab === key)} onClick={() => setActiveTab(key)}>
              <span>{icon}</span>{label}
            </div>
          ))}
        </div>

        <div style={{ padding: "16px 16px 24px", borderTop: "1px solid #2d5a8e" }}>
          <button style={s.btn("#0ea5e9", scraping)} onClick={runScraper} disabled={scraping}>
            {scraping ? "⏳ Scraping..." : "▶ Run Scraper"}
          </button>
          <button style={s.btn("#8b5cf6", processing)} onClick={runProcessing} disabled={processing}>
            {processing ? "⏳ Processing..." : "⚙ Process Data"}
          </button>
          <button style={s.btn("#10b981")} onClick={() => window.open(`${API}/reports/generate`, "_blank")}>
            📄 Download Report
          </button>
          <button style={{ ...s.btn("#ef4444"), marginBottom: 0 }} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 230, padding: "28px 32px", flex: 1 }}>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>Dashboard Overview</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>{total} businesses in database</div>

            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              <StatCard label="Total Businesses" value={total} sub="in database" icon="🏢" />
              <StatCard label="Categories" value={categories.length} sub="business types" icon="🗂️" />
              <StatCard label="Cities" value={cities.length} sub="locations covered" icon="📍" />
              <StatCard label="Hot Leads" value={hotLeads} sub={`${warmLeads} warm leads`} color="#ef4444" icon="🔥" />
              <StatCard label="Need Website" value={withoutWebsite} sub={`${withWebsite} have one`} color="#f97316" icon="🌐" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div style={s.chartBox}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 16 }}>Business Categories</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData} margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13 }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={s.chartBox}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 16 }}>Lead Score Distribution</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={leadData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                      {leadData.map((entry, i) => <Cell key={i} fill={LEAD_COLORS[entry.name]} />)}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={s.chartBox}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 16 }}>Website Status</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={websiteData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                      {websiteData.map((entry, i) => <Cell key={i} fill={SITE_COLORS[entry.name.toLowerCase()] || "#94a3b8"} />)}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={s.chartBox}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 16 }}>Opportunity Breakdown</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={opportunityData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "#64748b", fontSize: 11 }} width={80} />
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
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>Business Directory</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Showing {filtered.length} of {total} records</div>

            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <input style={{ ...s.input, flex: 1, minWidth: 200 }} placeholder="🔍  Search by name or city..." value={search} onChange={e => setSearch(e.target.value)} />
              <select style={s.select} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <select style={s.select} value={filterCity} onChange={e => setFilterCity(e.target.value)}>
                <option value="All">All Cities</option>
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
              <select style={s.select} value={filterLead} onChange={e => setFilterLead(e.target.value)}>
                <option value="All">All Lead Types</option>
                {["Hot Lead", "Warm Lead", "Potential Lead", "Low Priority"].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            <div style={{ ...s.chartBox, padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>{["Business", "Category", "City", "Phone", "Website", "Score", "Lead Type", "Opportunities"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => (
                      <tr key={b.id}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={s.td}>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>{b.name}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{b.address}</div>
                        </td>
                        <td style={s.td}><span style={{ color: "#3b82f6", fontWeight: 500 }}>{b.category}</span></td>
                        <td style={s.td}>{b.city}</td>
                        <td style={{ ...s.td, fontFamily: "monospace", fontSize: 12 }}>{b.phone}</td>
                        <td style={s.td}>
                          <span style={{ color: SITE_COLORS[b.website_status] || "#94a3b8", fontSize: 12, fontWeight: 600 }}>
                            {b.website_status === "active" ? "✓ Active" : b.website_status === "broken" ? "✗ Broken" : "— Missing"}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: b.lead_score >= 70 ? "#ef4444" : b.lead_score >= 50 ? "#f97316" : "#94a3b8" }}>
                            {b.lead_score}
                          </span>
                        </td>
                        <td style={s.td}><Badge value={b.lead_category} /></td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: 4 }}>
                            {b.website_opportunity && <span title="Website" style={{ fontSize: 16 }}>🌐</span>}
                            {b.digital_marketing_opportunity && <span title="Digital Marketing" style={{ fontSize: 16 }}>📣</span>}
                            {b.software_opportunity && <span title="Software" style={{ fontSize: 16 }}>💻</span>}
                            {b.mobile_app_opportunity && <span title="Mobile App" style={{ fontSize: 16 }}>📱</span>}
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
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>Business Insights</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>Auto-generated from your scraped data</div>
            <div style={{ display: "grid", gap: 14, maxWidth: 740 }}>
              {insights.map((insight, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "4px solid #3b82f6", borderRadius: 10, padding: "18px 22px", display: "flex", alignItems: "flex-start", gap: 14, boxShadow: "0 1px 4px #0000000a" }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{insight.icon}</span>
                  <div style={{ fontSize: 15, color: "#334155", lineHeight: 1.7 }}>{insight.text}</div>
                </div>
              ))}
              {total === 0 && <div style={{ color: "#94a3b8", fontSize: 14, padding: 24, textAlign: "center" }}>No data yet. Run scraper and process data first.</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}