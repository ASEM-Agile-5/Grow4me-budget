import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  TrendingUp,
  BarChart3,
  Menu,
  X,
  Sprout,
  FolderOpen,
  Package,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import { setCookie } from "@/services/services";
import { useBudgets, useSelectedBudget } from "@/hooks/use-budgets";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/budgets", label: "Budgets", icon: Wallet },
  { path: "/expenses", label: "Expenses", icon: Receipt },
  { path: "/inventory", label: "Inventory", icon: Package },
  { path: "/revenue", label: "Revenue", icon: TrendingUp },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: budgets = [] } = useBudgets();
  const { selectedBudgetId } = useSelectedBudget();
  const selectedBudget = budgets.find(
    (b: any) => b.id.toString() === selectedBudgetId?.toString(),
  );
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    setCookie("access_token", "", -1); // Clear the cookie
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col glass-sidebar transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 px-6">
          <div 
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
              theme === "dark" 
                ? "bg-gradient-to-br from-[#4e81f7] to-[#8c52ff] shadow-lg shadow-primary/20" 
                : "bg-sidebar-accent"
            }`}
          >
            <Sprout className={`h-5 w-5 ${theme === "dark" ? "text-black" : "text-sidebar-primary"}`} />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">
            FarmBudget
          </span>
          <button
            className="ml-auto lg:hidden text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            {selectedBudget ? (
              <>
                <p className="text-xs font-medium text-sidebar-foreground/80">
                  Active Budget
                </p>
                <p className="text-sm font-semibold text-sidebar-primary truncate">
                  {selectedBudget.name}
                </p>
                <p className="text-[10px] text-sidebar-foreground/60 mt-0.5">
                  {selectedBudget.project} · {selectedBudget.year}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-sidebar-foreground/60" />
                  <p className="text-xs font-medium text-sidebar-foreground/80">
                    No budget selected
                  </p>
                </div>
                <Link
                  to="/budgets"
                  className="text-xs text-sidebar-primary hover:underline mt-1 inline-block"
                >
                  Create or select one →
                </Link>
              </>
            )}
          </div>
          {budgets.length > 0 && (
            <p className="text-[10px] text-sidebar-foreground/50 mt-2 text-center">
              {budgets.length} budget{budgets.length !== 1 ? "s" : ""} total
            </p>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/50 backdrop-blur-xl px-4 lg:px-6">
          <button
            className="lg:hidden text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-4 border-l pl-4">
              <div className="hidden sm:flex flex-col items-end">
                <div className="text-sm font-medium">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </div>
              <div className="h-9 w-9 rounded-full finance-gradient flex items-center justify-center text-white text-xs font-semibold shadow-sm overflow-hidden border border-white/20">
                {user?.first_name?.[0] || ""}
                {user?.last_name?.[0] || "U"}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors group"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
