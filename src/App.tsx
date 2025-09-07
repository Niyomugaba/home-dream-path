import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ui/protected-route";
import Index from "./pages/Index";
import AuthPage from "@/components/auth/AuthPage";
import BudgetTracker from "./pages/BudgetTracker";
import SavingsTracker from "./pages/SavingsTracker";
import MortgageCalculator from "./pages/MortgageCalculator";
import MilestonesMarket from "./pages/MilestonesMarket";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/budget" element={
              <ProtectedRoute>
                <BudgetTracker />
              </ProtectedRoute>
            } />
            <Route path="/savings" element={
              <ProtectedRoute>
                <SavingsTracker />
              </ProtectedRoute>
            } />
            <Route path="/mortgage" element={
              <ProtectedRoute>
                <MortgageCalculator />
              </ProtectedRoute>
            } />
            <Route path="/milestones" element={
              <ProtectedRoute>
                <MilestonesMarket />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
