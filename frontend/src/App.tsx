import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider, useUser } from "@/contexts/UserContext";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import Budgets from "./pages/Budgets";
import BudgetDetail from "./pages/BudgetDetail";
import Expenses from "./pages/Expenses";
import Inventory from "./pages/Inventory";
import RevenuePage from "./pages/RevenuePage";
import Reports from "./pages/Reports";
import CreateBudget from "./pages/CreateBudget";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { useEffect } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, refetchUser } = useUser();

  useEffect(() => {
    refetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
          <p className="text-sm font-medium text-muted-foreground">Loading your farm...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

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
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budgets"
              element={
                <ProtectedRoute>
                  <Budgets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budgets/create"
              element={
                <ProtectedRoute>
                  <CreateBudget />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budgets/:budgetId"
              element={
                <ProtectedRoute>
                  <BudgetDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/revenue"
              element={
                <ProtectedRoute>
                  <RevenuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
