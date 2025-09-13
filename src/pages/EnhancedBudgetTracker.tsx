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
  Calculator, 
  Save, 
  Trash2,
  Plus,
  TrendingUp,
  DollarSign
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

interface Transaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
}

const EnhancedBudgetTracker = () => {
  const { user } = useAuth();
  const { budgetData, refreshData } = useUserData();
  const { settings } = useUserSettings();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
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
        description: "Transaction has been removed.",
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

  // Calculate current period totals
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const currentMonthTransactions = transactions.filter(t => 
    t.date.startsWith(currentMonth)
  );

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyDebtPayments = currentMonthTransactions
    .filter(t => t.type === 'debt_payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const disposableIncome = monthlyIncome - monthlyExpenses - monthlyDebtPayments;
  const savingsRate = monthlyIncome > 0 ? (disposableIncome * 0.3) / monthlyIncome : 0;

  // Group transactions by category for visualization
  const incomeByCategory = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const expensesByCategory = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Chart data
  const chartData = {
    labels: ['Income', 'Expenses', 'Debt', 'Available'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [monthlyIncome, monthlyExpenses, monthlyDebtPayments, Math.max(0, disposableIncome)],
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
          <h1 className="page-header flex-1">Enhanced Budget Tracker</h1>
        </div>

        {/* Current Month Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="metric-card">
            <DollarSign className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="metric-value">${monthlyIncome.toLocaleString()}</div>
            <div className="metric-label">This Month Income</div>
          </div>
          <div className="metric-card">
            <TrendingUp className="w-6 h-6 text-destructive mx-auto mb-2" />
            <div className="metric-value">${monthlyExpenses.toLocaleString()}</div>
            <div className="metric-label">This Month Expenses</div>
          </div>
          <div className="metric-card">
            <Calculator className="w-6 h-6 text-warning mx-auto mb-2" />
            <div className="metric-value">${monthlyDebtPayments.toLocaleString()}</div>
            <div className="metric-label">Debt Payments</div>
          </div>
          <div className="metric-card">
            <Plus className="w-6 h-6 text-success mx-auto mb-2" />
            <div className="metric-value">${Math.max(0, disposableIncome).toLocaleString()}</div>
            <div className="metric-label">Available</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Transaction Forms */}
          <div className="clay-card p-6 animate-fade-in">
            <Tabs defaultValue="income" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expense">Expense</TabsTrigger>
                <TabsTrigger value="debt">Debt</TabsTrigger>
              </TabsList>
              
              <TabsContent value="income" className="mt-4">
                <TransactionForm 
                  type="income" 
                  onSuccess={fetchTransactions}
                />
              </TabsContent>
              
              <TabsContent value="expense" className="mt-4">
                <TransactionForm 
                  type="expense" 
                  onSuccess={fetchTransactions}
                />
              </TabsContent>
              
              <TabsContent value="debt" className="mt-4">
                <TransactionForm 
                  type="debt_payment" 
                  onSuccess={fetchTransactions}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Chart */}
          <div className="clay-card p-6">
            <h3 className="section-title mb-4">This Month Overview</h3>
            <div className="h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="clay-card p-6">
          <h3 className="section-title">Recent Transactions</h3>
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
                {transactions.slice(0, 20).map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border">
                    <td className="py-3">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.type === 'income' ? 'bg-success/20 text-success' :
                        transaction.type === 'expense' ? 'bg-destructive/20 text-destructive' :
                        'bg-warning/20 text-warning'
                      }`}>
                        {transaction.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 capitalize">{transaction.category.replace('_', ' ')}</td>
                    <td className={`py-3 font-medium ${
                      transaction.type === 'income' ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
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
                      No transactions yet. Add your first transaction above!
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

export default EnhancedBudgetTracker;