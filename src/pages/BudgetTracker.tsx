import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Calculator, 
  Save, 
  Trash2,
  Edit,
  TrendingUp 
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BudgetEntry {
  id: string;
  date: string;
  income: number;
  expenses: any;
  debt: any;
  savings_rate: number;
  disposable_income: number;
}

const BudgetTracker = () => {
  const { user } = useAuth();
  const { budgetData, refreshData } = useUserData();
  const { toast } = useToast();
  
  const [income, setIncome] = useState(5833);
  const [expenses, setExpenses] = useState({
    rent: 800,
    utilities: 200,
    food: 400,
    other: 650
  });
  const [debt, setDebt] = useState({
    car: 200,
    credit_card: 100
  });
  const [loading, setLoading] = useState(false);
  const [budgetHistory, setBudgetHistory] = useState<BudgetEntry[]>([]);

  useEffect(() => {
    if (budgetData) {
      setIncome(budgetData.income);
      setExpenses(budgetData.expenses);
      setDebt(budgetData.debt);
    }
    fetchBudgetHistory();
  }, [budgetData]);

  const fetchBudgetHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('budget')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setBudgetHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching budget history:', error);
    }
  };

  const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + Number(val), 0);
  const totalDebt = Object.values(debt).reduce((sum, val) => sum + Number(val), 0);
  const disposableIncome = income - totalExpenses - totalDebt;
  const savingsRate = income > 0 ? (disposableIncome * 0.3) / income : 0;

  const handleSaveBudget = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('budget')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          income,
          expenses,
          debt,
          savings_rate: savingsRate,
          disposable_income: disposableIncome,
        });

      if (error) throw error;

      toast({
        title: "Budget saved successfully",
        description: "Your budget has been updated.",
      });

      refreshData();
      fetchBudgetHistory();
    } catch (error: any) {
      toast({
        title: "Error saving budget",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budget')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Entry deleted",
        description: "Budget entry has been removed.",
      });

      fetchBudgetHistory();
      refreshData();
    } catch (error: any) {
      toast({
        title: "Error deleting entry",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Chart data
  const chartData = {
    labels: ['Income', 'Expenses', 'Debt', 'Available'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [income, totalExpenses, totalDebt, disposableIncome],
        backgroundColor: [
          'hsl(213, 94%, 68%)',   // Primary blue
          'hsl(0, 84%, 60%)',     // Red
          'hsl(38, 92%, 50%)',    // Orange  
          'hsl(142, 76%, 36%)',   // Green
        ],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <Header />
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Button>
          </Link>
          <h1 className="page-header flex-1">Budget Tracker</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Budget Form */}
          <div className="clay-card p-6 animate-fade-in">
            <h2 className="section-title">
              <Calculator className="inline w-5 h-5 mr-2" />
              Monthly Budget
            </h2>
            
            <div className="space-y-4">
              {/* Income */}
              <div>
                <Label htmlFor="income">Monthly Income</Label>
                <Input
                  id="income"
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="clay-input"
                  min="0"
                />
              </div>

              {/* Expenses */}
              <div>
                <Label>Monthly Expenses</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <Label htmlFor="rent" className="text-sm">Rent</Label>
                    <Input
                      id="rent"
                      type="number"
                      value={expenses.rent}
                      onChange={(e) => setExpenses({...expenses, rent: Number(e.target.value)})}
                      className="clay-input"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="utilities" className="text-sm">Utilities</Label>
                    <Input
                      id="utilities"
                      type="number"
                      value={expenses.utilities}
                      onChange={(e) => setExpenses({...expenses, utilities: Number(e.target.value)})}
                      className="clay-input"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="food" className="text-sm">Food</Label>
                    <Input
                      id="food"
                      type="number"
                      value={expenses.food}
                      onChange={(e) => setExpenses({...expenses, food: Number(e.target.value)})}
                      className="clay-input"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="other" className="text-sm">Other</Label>
                    <Input
                      id="other"
                      type="number"
                      value={expenses.other}
                      onChange={(e) => setExpenses({...expenses, other: Number(e.target.value)})}
                      className="clay-input"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Debt */}
              <div>
                <Label>Monthly Debt Payments</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <Label htmlFor="car" className="text-sm">Car Payment</Label>
                    <Input
                      id="car"
                      type="number"
                      value={debt.car}
                      onChange={(e) => setDebt({...debt, car: Number(e.target.value)})}
                      className="clay-input"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="credit_card" className="text-sm">Credit Card</Label>
                    <Input
                      id="credit_card"
                      type="number"
                      value={debt.credit_card}
                      onChange={(e) => setDebt({...debt, credit_card: Number(e.target.value)})}
                      className="clay-input"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-secondary/30 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Expenses:</span>
                  <span className="text-destructive">${totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Debt Payments:</span>
                  <span className="text-warning">${totalDebt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Disposable Income:</span>
                  <span className="text-success">${disposableIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Savings Rate (30%):</span>
                  <span className="text-primary">{(savingsRate * 100).toFixed(1)}%</span>
                </div>
              </div>

              <Button 
                onClick={handleSaveBudget} 
                className="w-full clay-button"
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Budget'}
              </Button>
            </div>
          </div>

          {/* Chart */}
          <div className="clay-card p-6">
            <h3 className="section-title mb-4">Budget Visualization</h3>
            <div className="h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Budget History */}
        <div className="clay-card p-6">
          <h3 className="section-title">Budget History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Income</th>
                  <th className="text-left py-2">Expenses</th>
                  <th className="text-left py-2">Debt</th>
                  <th className="text-left py-2">Disposable</th>
                  <th className="text-left py-2">Savings Rate</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgetHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-border">
                    <td className="py-3">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="py-3">${entry.income.toLocaleString()}</td>
                    <td className="py-3">
                      ${Object.values(entry.expenses).reduce((sum: number, val: number) => sum + val, 0).toLocaleString()}
                    </td>
                    <td className="py-3">
                      ${Object.values(entry.debt).reduce((sum: number, val: number) => sum + val, 0).toLocaleString()}
                    </td>
                    <td className="py-3">${entry.disposable_income.toLocaleString()}</td>
                    <td className="py-3">{(entry.savings_rate * 100).toFixed(1)}%</td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {budgetHistory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No budget entries yet. Create your first budget above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;