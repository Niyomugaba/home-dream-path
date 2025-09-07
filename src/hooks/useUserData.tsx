import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface UserData {
  id: string;
  name: string;
  income: number;
  expenses: number;
  debt: number;
  credit_score: number;
  state: string;
}

interface SavingsData {
  id: string;
  date: string;
  down_payment: number;
  emergency_fund: number;
  moving_setup: number;
  maintenance: number;
  total_savings: number;
  goal: number;
  percent_to_goal: number;
  months_left: number;
}

interface BudgetData {
  id: string;
  date: string;
  income: number;
  expenses: Record<string, number>;
  debt: Record<string, number>;
  savings_rate: number;
  disposable_income: number;
}

interface MortgageData {
  id: string;
  date: string;
  home_price: number;
  down_percent: number;
  loan_term: number;
  rate: number;
  tax_rate: number;
  insurance_rate: number;
  pmi_rate: number;
  maintenance_rate: number;
  hoa: number;
  monthly_payment: number;
  affordable_price: number;
  dti: number;
}

interface MarketData {
  id: string;
  date: string;
  state: string;
  home_price: number;
  tax_rate: number;
  insurance_rate: number;
  price_growth: number;
  interest_rate: number;
}

interface MilestoneData {
  id: string;
  date: string;
  description: string;
  status: string;
  alert: boolean;
}

export const useUserData = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [savingsData, setSavingsData] = useState<SavingsData[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [mortgageData, setMortgageData] = useState<MortgageData[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [milestoneData, setMilestoneData] = useState<MilestoneData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // For now, we'll use placeholder data since the types haven't been regenerated
      // This will be fixed once the Supabase types are updated
      const mockUserData: UserData = {
        id: user.id,
        name: "You & Wife",
        income: 5833,
        expenses: 2050,
        debt: 300,
        credit_score: 720,
        state: "Ohio"
      };

      const mockSavingsData: SavingsData[] = [{
        id: "1",
        date: "2025-09-07",
        down_payment: 1200,
        emergency_fund: 300,
        moving_setup: 200,
        maintenance: 100,
        total_savings: 1800,
        goal: 47300,
        percent_to_goal: 0.038,
        months_left: 24
      }];

      setUserData(mockUserData);
      setSavingsData(mockSavingsData);
      setBudgetData([]);
      setMortgageData([]);
      setMarketData([]);
      setMilestoneData([]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const getCurrentSavings = () => savingsData[0] || null;
  const getCurrentBudget = () => budgetData[0] || null;
  const getCurrentMortgage = () => mortgageData[0] || null;
  const getCurrentMarket = () => marketData[0] || null;

  const refetchData = () => {
    fetchUserData();
  };

  return {
    userData,
    savingsData,
    budgetData,
    mortgageData,
    marketData,
    milestoneData,
    getCurrentSavings,
    getCurrentBudget,
    getCurrentMortgage,
    getCurrentMarket,
    loading,
    refetchData,
  };
};