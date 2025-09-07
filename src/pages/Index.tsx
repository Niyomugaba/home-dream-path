import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { PiggyBank, Calculator, TrendingUp, Target, Home, CreditCard } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { userData, getCurrentSavings, loading } = useUserData();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="clay-card p-8 animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-4"></div>
            <div className="h-4 bg-muted rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSavings = getCurrentSavings();
  const savingsPercent = currentSavings ? (currentSavings.percent_to_goal * 100) : 3.8;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <Header userName={userData?.name} />
        
        {/* Progress Bar Section */}
        <div className="clay-card p-6 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Progress to Homeownership Goal
            </h2>
            <p className="text-muted-foreground">
              ${currentSavings?.total_savings.toLocaleString() || "1,800"} of ${currentSavings?.goal.toLocaleString() || "47,300"} saved
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <Progress value={savingsPercent} className="h-4 mb-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{savingsPercent.toFixed(1)}% Complete</span>
              <span>{currentSavings?.months_left || 24} months left</span>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="clay-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-primary" />
                Total Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${currentSavings?.total_savings.toLocaleString() || "1,800"}
              </div>
            </CardContent>
          </Card>

          <Card className="clay-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-chart-2" />
                Months Left
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">
                {currentSavings?.months_left || 24}
              </div>
            </CardContent>
          </Card>

          <Card className="clay-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Home className="h-4 w-4 text-chart-3" />
                Affordable Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">
                $190,000
              </div>
            </CardContent>
          </Card>

          <Card className="clay-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4 text-chart-4" />
                Monthly Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-4">
                $1,628
              </div>
            </CardContent>
          </Card>

          <Card className="clay-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-chart-5" />
                DTI Ratio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-5">
                30.8%
              </div>
            </CardContent>
          </Card>

          <Card className="clay-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Credit Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {userData?.credit_score || 720}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Button 
            onClick={() => navigate("/budget")}
            className="clay-button p-6 h-auto flex flex-col items-center gap-2 text-primary-foreground"
          >
            <Calculator className="h-6 w-6" />
            <span className="font-medium">Budget Tracker</span>
          </Button>

          <Button 
            onClick={() => navigate("/savings")}
            className="clay-button p-6 h-auto flex flex-col items-center gap-2 text-primary-foreground"
          >
            <PiggyBank className="h-6 w-6" />
            <span className="font-medium">Savings Tracker</span>
          </Button>

          <Button 
            onClick={() => navigate("/mortgage")}
            className="clay-button p-6 h-auto flex flex-col items-center gap-2 text-primary-foreground"
          >
            <Home className="h-6 w-6" />
            <span className="font-medium">Mortgage Calculator</span>
          </Button>

          <Button 
            onClick={() => navigate("/milestones")}
            className="clay-button p-6 h-auto flex flex-col items-center gap-2 text-primary-foreground"
          >
            <Target className="h-6 w-6" />
            <span className="font-medium">Milestones & Market</span>
          </Button>
        </div>

        {/* Alerts Section */}
        <Card className="clay-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Upcoming Milestones
            </CardTitle>
            <CardDescription>
              Track your progress toward important goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Reach $10,000 saved</p>
                  <p className="text-sm text-muted-foreground">Target: March 2026</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
