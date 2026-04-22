import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider, useUser } from "@/contexts/UserContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Budgets from "./pages/Budgets";
import BudgetDetail from "./pages/BudgetDetail";
import Expenses from "./pages/Expenses";
import Inventory from "./pages/Inventory";
import RevenuePage from "./pages/RevenuePage";
import Reports from "./pages/Reports";
import CreateBudget from "./pages/CreateBudget";
import Tasks from "./pages/Tasks";
import Farms from "./pages/Farms";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { useEffect } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, refetchUser } = useUser();

  useEffect(() => { refetchUser(); }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--gfm-ink-50)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, border: "3px solid var(--gfm-green-100)", borderTopColor: "var(--gfm-green-500)", borderRadius: 999, animation: "gfm-spin 0.7s linear infinite" }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--gfm-ink-500)" }}>Loading your farm…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <AppLayout>{children}</AppLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/"                element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/budgets"         element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
            <Route path="/budgets/create"  element={<ProtectedRoute><CreateBudget /></ProtectedRoute>} />
            <Route path="/budgets/:budgetId" element={<ProtectedRoute><BudgetDetail /></ProtectedRoute>} />
            <Route path="/expenses"        element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path="/inventory"       element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/revenue"         element={<ProtectedRoute><RevenuePage /></ProtectedRoute>} />
            <Route path="/reports"         element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/tasks"           element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/farms"           element={<ProtectedRoute><Farms /></ProtectedRoute>} />
            <Route path="/settings"        element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
