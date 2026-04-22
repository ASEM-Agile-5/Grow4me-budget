import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Wallet, Receipt, TrendingUp, BarChart3,
  Package, CheckSquare, Sprout, Settings, HelpCircle, LogOut,
  Search, Bell, Plus, Menu, X, ChevronRight,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { setCookie } from "@/services/services";
import { useBudgets } from "@/hooks/use-budgets";

const NAV_MAIN = [
  { path: "/",          label: "Dashboard",  icon: LayoutDashboard },
  { path: "/budgets",   label: "Budgets",    icon: Wallet },
  { path: "/expenses",  label: "Expenses",   icon: Receipt },
  { path: "/revenue",   label: "Revenue",    icon: TrendingUp },
  { path: "/inventory", label: "Inventory",  icon: Package },
  { path: "/tasks",     label: "Tasks",      icon: CheckSquare },
];
const NAV_MANAGE = [
  { path: "/farms",     label: "Farms",      icon: Sprout },
  { path: "/reports",   label: "Reports",    icon: BarChart3 },
];
const NAV_FOOT = [
  { path: "/settings",  label: "Settings",   icon: Settings },
];

function NavItem({ path, label, Icon, onClick }: { path: string; label: string; Icon: any; onClick?: () => void }) {
  const location = useLocation();
  const active = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
  return (
    <Link to={path} className={`gfm-nav-item ${active ? "active" : ""}`} onClick={onClick}>
      <Icon size={17} strokeWidth={active ? 2.25 : 1.75} />
      <span>{label}</span>
    </Link>
  );
}

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();
  const { data: budgets = [] } = useBudgets();

  const handleLogout = () => {
    setCookie("access_token", "", -1);
    navigate("/login");
  };

  const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? "U"}`.toUpperCase();
  const firstName = user?.first_name ?? "there";
  const closeSidebar = () => setSidebarOpen(false);

  const SidebarContent = () => (
    <>
      <div className="gfm-logo">
        <img src="/assets/logo_long.png" alt="GrowForMe" onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
          (e.target as HTMLImageElement).insertAdjacentHTML("afterend", '<span style="font-size:16px;font-weight:800;color:var(--gfm-green-600)">GrowForMe</span>');
        }} />
      </div>

      <nav className="gfm-nav">
        <div className="gfm-nav-group">Overview</div>
        {NAV_MAIN.map(({ path, label, icon: Icon }) => (
          <NavItem key={path} path={path} label={label} Icon={Icon} onClick={closeSidebar} />
        ))}
        <div className="gfm-nav-group">Manage</div>
        {NAV_MANAGE.map(({ path, label, icon: Icon }) => (
          <NavItem key={path} path={path} label={label} Icon={Icon} onClick={closeSidebar} />
        ))}
      </nav>

      <div className="gfm-side-foot">
        {NAV_FOOT.map(({ path, label, icon: Icon }) => (
          <NavItem key={path} path={path} label={label} Icon={Icon} onClick={closeSidebar} />
        ))}
        <button className="gfm-nav-item" onClick={handleLogout}>
          <LogOut size={17} strokeWidth={1.75} /><span>Log out</span>
        </button>
        <div className="gfm-user-card">
          <div className="gfm-avatar">{initials}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--gfm-ink-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.first_name} {user?.last_name}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--gfm-green-700)", fontWeight: 700 }}>Farmer plan</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="gfm-app">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="gfm-overlay" onClick={closeSidebar} />}

      {/* Sidebar */}
      <aside className={`gfm-side ${sidebarOpen ? "open" : ""}`}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="gfm-main">
        {/* Desktop topbar */}
        <div className="gfm-top">
          <div className="gfm-search">
            <Search size={15} />
            <input placeholder="Search budgets, expenses, sales…" />
          </div>
          <div className="gfm-top-actions">
            <button className="gfm-icon-btn" title="Help" onClick={() => navigate("/settings")}>
              <HelpCircle size={17} />
            </button>
            <button className="gfm-icon-btn" title="Notifications" style={{ position: "relative" }}>
              <Bell size={17} />
              <span className="gfm-ping" />
            </button>
            <button className="gfm-btn gfm-btn-amber gfm-btn-sm" onClick={() => navigate("/expenses?log=1")}>
              <Plus size={13} />Log expense
            </button>
            <Link to="/settings" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px 4px 4px", borderRadius: 999, border: "1px solid var(--gfm-ink-100)", background: "var(--gfm-paper)", cursor: "pointer" }}>
                <div className="gfm-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{initials}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--gfm-ink-900)" }}>{firstName}</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile topbar */}
        <div style={{ display: "none", alignItems: "center", gap: 12, padding: "12px 20px", background: "var(--gfm-paper)", borderBottom: "1px solid var(--gfm-ink-100)", position: "sticky", top: 0, zIndex: 30 }}
          className="lg:hidden"
          id="mobile-topbar">
          <button className="gfm-icon-btn" style={{ border: 0, background: "transparent", color: "var(--gfm-ink-700)" }} onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <img src="/assets/logo_long.png" alt="GrowForMe" style={{ height: 24, width: "auto" }} />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <button className="gfm-icon-btn" style={{ width: 36, height: 36, position: "relative" }}>
              <Bell size={16} /><span className="gfm-ping" />
            </button>
          </div>
        </div>

        {/* Mobile hamburger — always visible on small screens */}
        <div style={{
          display: "none",
        }}
          id="mobile-ham"
        />

        {/* Content */}
        <main style={{ flex: 1 }}>{children}</main>
      </div>

      {/* Mobile hamburger button (CSS-driven) */}
      <style>{`
        @media (max-width: 1100px) {
          #mobile-topbar { display: flex !important; }
          .gfm-top { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
