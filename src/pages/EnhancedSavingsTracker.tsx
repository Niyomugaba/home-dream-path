import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { useUserSettings } from '@/hooks/useUserSettings';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import TransactionForm from '@/components/transactions/TransactionForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  PiggyBank, 
  Save, 
  Trash2,
  Plus,
  Minus,
  TrendingUp
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Transaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
}

interface SavingsEntry {
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

const EnhancedSavingsTracker = () => {
  const { user } = useAuth();
  const { savingsData, refreshData } = useUserData();
  const { settings } = useUserSettings();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsHistory, setSavingsHistory] = useState<SavingsEntry[]>([]);
  const [currentBalances, setCurrentBalances] = useState({
    down_payment: 1200,
    emergency_fund: 300,
    moving_setup: 200,
    maintenance: 100
  });

  const savingsGoals = settings?.savings_goals || {
    down_payment: 20000,
    emergency_fund: 12300,
    moving_setup: 7000,
    maintenance: 2000
  };

  const totalGoal = Object.values(savingsGoals as Record<string, number>).reduce((sum: number, val: number) => sum + val, 0);

  useEffect(() => {
    fetchTransactions();
    fetchSavingsHistory();
    if (savingsData) {
      setCurrentBalances({
        down_payment: savingsData.down_payment,
        emergency_fund: savingsData.emergency_fund,
        moving_setup: savingsData.moving_setup,
        maintenance: savingsData.maintenance
      });
    }
  }, [savingsData]);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['savings_contribution', 'savings_withdrawal'])
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching savings transactions:', error);
    }
  };

  const fetchSavingsHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('savings')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setSavingsHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching savings history:', error);
    }
  };

  const updateSavingsSnapshot = async () => {
    if (!user) return;

    const totalSavings = Object.values(currentBalances).reduce((sum: number, val: number) => sum + val, 0);
    const percentToGoal = totalSavings / totalGoal;

    try {
      const { error } = await supabase
        .from('savings')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          down_payment: currentBalances.down_payment,
          emergency_fund: currentBalances.emergency_fund,
          moving_setup: currentBalances.moving_setup,
          maintenance: currentBalances.maintenance,
          total_savings: totalSavings,
          goal: totalGoal as number,
          percent_to_goal: percentToGoal,
          months_left: 24,
        });

      if (error) throw error;

      toast({
        title: "Savings snapshot updated",
        description: "Your current savings have been recorded.",
      });

      fetchSavingsHistory();
      refreshData();
    } catch (error: any) {
      toast({
        title: "Error updating savings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Transaction deleted",
        description: "Savings transaction has been removed.",
      });

      fetchTransactions();
    } catch (error: any) {
      toast({
        title: "Error deleting transaction",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSavingsEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('savings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Entry deleted",
        description: "Savings entry has been removed.",
      });

      fetchSavingsHistory();
    } catch (error: any) {
      toast({
        title: "Error deleting entry",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Calculate balances based on transactions
  const calculateCurrentBalances = () => {
    const balances = { ...currentBalances };
    
    transactions.forEach(transaction => {
      const category = transaction.category as keyof typeof balances;
      if (balances.hasOwnProperty(category)) {
        if (transaction.type === 'savings_contribution') {
          balances[category] += transaction.amount;
        } else if (transaction.type === 'savings_withdrawal') {
          balances[category] -= transaction.amount;
        }
      }
    });

    return balances;
  };

  const totalSavings = Object.values(currentBalances).reduce((sum: number, val: number) => sum + val, 0);
  const progressPercentage = (totalSavings / (totalGoal as number)) * 100;

  // Chart data - show savings growth over time
  const chartData = {
    labels: savingsHistory.slice().reverse().map(entry => new Date(entry.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Total Savings',
        data: savingsHistory.slice().reverse().map(entry => entry.total_savings),
        borderColor: 'hsl(213, 94%, 68%)',
        backgroundColor: 'hsl(213, 94%, 68%, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Goal',
        data: savingsHistory.slice().reverse().map(() => totalGoal as number),
        borderColor: 'hsl(142, 76%, 45%)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
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
          <h1 className="page-header flex-1">Enhanced Savings Tracker</h1>
        </div>

        {/* Current Savings Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          {Object.entries(currentBalances).map(([key, value], index) => {
            const goal = savingsGoals[key as keyof typeof savingsGoals];
            const percentage = (value / goal) * 100;
            const labels = {
              down_payment: 'Down Payment',
              emergency_fund: 'Emergency Fund', 
              moving_setup: 'Moving/Setup',
              maintenance: 'Maintenance'
            };

            const cardColors = ['gradient-card-blue', 'gradient-card-green', 'gradient-card-orange', 'gradient-card-teal'];
            const iconColors = ['text-white', 'text-white', 'text-white', 'text-white'];
            
            return (
              <div key={key} className={`clay-card ${cardColors[index]} text-white p-6 text-center animate-fade-in`}>
                <PiggyBank className={`w-8 h-8 ${iconColors[index]} mx-auto mb-3`} />
                <div className="text-sm font-medium mb-2 opacity-90">{labels[key as keyof typeof labels]}</div>
                <div className="text-2xl font-bold mb-2">${value.toLocaleString()}</div>
                <div className="text-xs opacity-75 mb-3">
                  {percentage.toFixed(1)}% of ${goal.toLocaleString()}
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className="bg-white rounded-full h-3 transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Savings Transaction Forms */}
          <div className="clay-card p-6 animate-fade-in">
            <Tabs defaultValue="contribution" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="contribution">Add Money</TabsTrigger>
                <TabsTrigger value="withdrawal">Withdraw</TabsTrigger>
              </TabsList>
              
              <TabsContent value="contribution" className="mt-4">
                <TransactionForm 
                  type="savings_contribution" 
                  onSuccess={fetchTransactions}
                />
              </TabsContent>
              
              <TabsContent value="withdrawal" className="mt-4">
                <TransactionForm 
                  type="savings_withdrawal" 
                  onSuccess={fetchTransactions}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t">
              <Button 
                onClick={updateSavingsSnapshot} 
                className="w-full clay-button"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Current Snapshot
              </Button>
            </div>
          </div>

          {/* Savings Growth Chart */}
          <div className="clay-card p-6">
            <h3 className="section-title mb-4">Savings Growth Over Time</h3>
            {savingsHistory.length > 0 ? (
              <div className="h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No savings history yet. Start tracking your progress!
              </div>
            )}
          </div>
        </div>

        {/* Recent Savings Transactions */}
        <div className="clay-card p-6">
          <h3 className="section-title">Recent Savings Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Category</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 15).map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border">
                    <td className="py-3">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center w-fit ${
                        transaction.type === 'savings_contribution' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                      }`}>
                        {transaction.type === 'savings_contribution' ? 
                          <><Plus className="w-3 h-3 mr-1" />Add</> : 
                          <><Minus className="w-3 h-3 mr-1" />Withdraw</>
                        }
                      </span>
                    </td>
                    <td className="py-3 capitalize">{transaction.category.replace('_', ' ')}</td>
                    <td className={`py-3 font-medium ${
                      transaction.type === 'savings_contribution' ? 'text-success' : 'text-warning'
                    }`}>
                      {transaction.type === 'savings_contribution' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {transaction.description || '—'}
                    </td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No savings transactions yet. Add your first transaction above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Savings History */}
        <div className="clay-card p-6">
          <h3 className="section-title">Savings Snapshots</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Down Payment</th>
                  <th className="text-left py-2">Emergency Fund</th>
                  <th className="text-left py-2">Moving/Setup</th>
                  <th className="text-left py-2">Maintenance</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Progress</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savingsHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-border">
                    <td className="py-3">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="py-3">${entry.down_payment.toLocaleString()}</td>
                    <td className="py-3">${entry.emergency_fund.toLocaleString()}</td>
                    <td className="py-3">${entry.moving_setup.toLocaleString()}</td>
                    <td className="py-3">${entry.maintenance.toLocaleString()}</td>
                    <td className="py-3 font-medium">${entry.total_savings.toLocaleString()}</td>
                    <td className="py-3">{(entry.percent_to_goal * 100).toFixed(1)}%</td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSavingsEntry(entry.id)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {savingsHistory.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      No savings snapshots yet. Save your first snapshot above!
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

export default EnhancedSavingsTracker;