import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sprout } from "lucide-react";
import { loginAPI } from "@/services/services";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginAPI(email, password);
      if ((res as any)?.status === 401) {
        setError("Invalid credentials. Please try again.");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
        err?.response?.data?.detail ??
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--gfm-ink-50)", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      {/* Left — brand */}
      <div style={{ background: "linear-gradient(135deg, #0f6e33 0%, #16A34A 100%)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: 999, background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 280, height: 280, borderRadius: 999, background: "rgba(245,158,11,0.15)" }} />
        <div style={{ position: "relative", textAlign: "center", color: "#fff", maxWidth: 380 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", margin: "0 auto 24px" }}>
            <Sprout size={32} />
          </div>
          <img src="/assets/logo_long.png" alt="GrowForMe"
            style={{ height: 36, width: "auto", marginBottom: 16, filter: "brightness(0) invert(1)" }}
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
            Track every cedi. Grow every season.<br />Your farm's financial story starts here.
          </div>
          <div style={{ marginTop: 40, display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {["Budget tracking", "Expense logging", "Revenue analytics"].map(f => (
              <div key={f} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
                <div style={{ width: 6, height: 6, borderRadius: 999, background: "#fbbf24" }} />{f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 48px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em", color: "var(--gfm-ink-900)", marginBottom: 6 }}>
              Welcome back
            </div>
            <div style={{ fontSize: 14, color: "var(--gfm-ink-500)" }}>Sign in to your farm dashboard</div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="gfm-label">Email address</span>
              <input
                className="gfm-input"
                type="email"
                placeholder="ama@growforme.gh"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="gfm-label">Password</span>
              <div style={{ position: "relative" }}>
                <input
                  className="gfm-input"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: 0, color: "var(--gfm-ink-400)", cursor: "pointer", padding: 0 }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {error && (
              <div style={{ padding: "10px 14px", background: "var(--gfm-danger-50)", border: "1px solid #fecaca", borderRadius: 10, fontSize: 13, color: "var(--gfm-danger)", fontWeight: 600 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="gfm-btn gfm-btn-primary"
              style={{ width: "100%", height: 44, borderRadius: 12, fontSize: 14, justifyContent: "center", marginTop: 4 }}
              disabled={loading}
            >
              {loading
                ? <div className="gfm-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                : "Sign in"}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center", fontSize: 12.5, color: "var(--gfm-ink-500)" }}>
            Don't have an account?{" "}
            <span style={{ color: "var(--gfm-green-600)", fontWeight: 700, cursor: "pointer" }}>
              Contact your admin
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .gfm-login-wrap { grid-template-columns: 1fr !important; }
          .gfm-login-brand { min-height: 220px; padding: 40px 24px !important; }
          .gfm-login-form  { padding: 40px 24px !important; }
        }
      `}</style>
    </div>
  );
}
