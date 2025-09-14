import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ui/protected-route";
import AuthPage from "@/components/auth/AuthPage";
import Dashboard from "@/pages/Dashboard";
import EnhancedBudgetTracker from "@/pages/EnhancedBudgetTracker";
import EnhancedSavingsTracker from "@/pages/EnhancedSavingsTracker";
import MortgageCalculator from "@/pages/MortgageCalculator";
import EnhancedMilestonesMarket from "@/pages/EnhancedMilestonesMarket";
import Settings from "@/pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/budget" 
              element={
                <ProtectedRoute>
                  <EnhancedBudgetTracker />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/savings" 
              element={
                <ProtectedRoute>
                  <EnhancedSavingsTracker />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mortgage" 
              element={
                <ProtectedRoute>
                  <MortgageCalculator />
                </ProtectedRoute>
              } 
            />
            <Route path="/milestones" element={
              <ProtectedRoute>
                <EnhancedMilestonesMarket />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
