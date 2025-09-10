import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  PiggyBank, 
  Save, 
  Trash2,
  TrendingUp,
  Plus,
  Minus
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

const SavingsTracker = () => {
  const { user } = useAuth();
  const { savingsData, refreshData } = useUserData();
  const { toast } = useToast();
  
  const [savingsAmounts, setSavingsAmounts] = useState({
    down_payment: 1200,
    emergency_fund: 300,
    moving_setup: 200,
    maintenance: 100
  });
  const [contributionType, setContributionType] = useState('monthly');
  const [contributionAmounts, setContributionAmounts] = useState({
    down_payment: 0,
    emergency_fund: 0,
    moving_setup: 0,
    maintenance: 0
  });
  const [loading, setLoading] = useState(false);
  const [savingsHistory, setSavingsHistory] = useState<SavingsEntry[]>([]);

  const savingsGoals = {
    down_payment: 20000,
    emergency_fund: 12300,
    moving_setup: 7000,
    maintenance: 2000
  };

  const totalGoal = Object.values(savingsGoals).reduce((sum, val) => sum + val, 0);

  useEffect(() => {
    if (savingsData) {
      setSavingsAmounts({
        down_payment: savingsData.down_payment,
        emergency_fund: savingsData.emergency_fund,
        moving_setup: savingsData.moving_setup,
        maintenance: savingsData.maintenance
      });
    }
    fetchSavingsHistory();
  }, [savingsData]);

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

  const calculateNewAmounts = () => {
    const multiplier = contributionType === 'weekly' ? 4.33 : 
                     contributionType === 'monthly' ? 1 : 
                     contributionType === 'one_time' ? 1 : 1;

    const newAmounts = { ...savingsAmounts };
    Object.keys(contributionAmounts).forEach(key => {
      const contribution = contributionAmounts[key as keyof typeof contributionAmounts];
      const adjustedContribution = contributionType === 'reduction' ? -contribution : contribution * multiplier;
      newAmounts[key as keyof typeof newAmounts] = Math.max(0, newAmounts[key as keyof typeof newAmounts] + adjustedContribution);
    });

    return newAmounts;
  };

  const newAmounts = calculateNewAmounts();
  const totalSavings = Object.values(newAmounts).reduce((sum, val) => sum + val, 0);
  const percentToGoal = totalSavings / totalGoal;
  const monthlyContribution = Object.values(contributionAmounts).reduce((sum, val) => sum + val, 0);
  const monthsLeft = monthlyContribution > 0 ? Math.ceil((totalGoal - totalSavings) / monthlyContribution) : 0;

  const handleUpdateSavings = async () => {
    if (!user) return;

    // Validate no negative amounts
    const hasNegative = Object.values(newAmounts).some(val => val < 0);
    if (hasNegative) {
      toast({
        title: "Invalid amount",
        description: "Savings amounts cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('savings')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          down_payment: newAmounts.down_payment,
          emergency_fund: newAmounts.emergency_fund,
          moving_setup: newAmounts.moving_setup,
          maintenance: newAmounts.maintenance,
          total_savings: totalSavings,
          goal: totalGoal,
          percent_to_goal: percentToGoal,
          months_left: monthsLeft,
        });

      if (error) throw error;

      toast({
        title: "Savings updated successfully",
        description: "Your savings have been updated.",
      });

      // Reset contribution amounts
      setContributionAmounts({
        down_payment: 0,
        emergency_fund: 0,
        moving_setup: 0,
        maintenance: 0
      });

      refreshData();
      fetchSavingsHistory();
    } catch (error: any) {
      toast({
        title: "Error updating savings",
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
        .from('savings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Entry deleted",
        description: "Savings entry has been removed.",
      });

      fetchSavingsHistory();
      refreshData();
    } catch (error: any) {
      toast({
        title: "Error deleting entry",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
        data: savingsHistory.slice().reverse().map(() => totalGoal),
        borderColor: 'hsl(142, 76%, 36%)',
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
          <h1 className="page-header flex-1">Savings Tracker</h1>
        </div>

        {/* Current Savings Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          {Object.entries(savingsAmounts).map(([key, value]) => {
            const goal = savingsGoals[key as keyof typeof savingsGoals];
            const percentage = (value / goal) * 100;
            const labels = {
              down_payment: 'Down Payment',
              emergency_fund: 'Emergency Fund', 
              moving_setup: 'Moving/Setup',
              maintenance: 'Maintenance'
            };
            
            return (
              <div key={key} className="metric-card">
                <PiggyBank className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="metric-label mb-1">{labels[key as keyof typeof labels]}</div>
                <div className="metric-value">${value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  {percentage.toFixed(1)}% of ${goal.toLocaleString()}
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                  <div 
                    className="progress-fill h-2" 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Savings Adjustment Form */}
          <div className="clay-card p-6 animate-fade-in">
            <h2 className="section-title">
              <Plus className="inline w-5 h-5 mr-2" />
              Update Savings
            </h2>
            
            <div className="space-y-4">
              {/* Contribution Type */}
              <div>
                <Label>Contribution Type</Label>
                <Select value={contributionType} onValueChange={setContributionType}>
                  <SelectTrigger className="clay-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="one_time">One-time</SelectItem>
                    <SelectItem value="reduction">Reduction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contribution Amounts */}
              <div className="space-y-3">
                {Object.entries(contributionAmounts).map(([key, value]) => {
                  const labels = {
                    down_payment: 'Down Payment',
                    emergency_fund: 'Emergency Fund',
                    moving_setup: 'Moving/Setup',
                    maintenance: 'Maintenance'
                  };

                  return (
                    <div key={key}>
                      <Label htmlFor={key} className="text-sm">
                        {labels[key as keyof typeof labels]} 
                        {contributionType === 'reduction' ? ' Reduction' : ' Contribution'}
                      </Label>
                      <Input
                        id={key}
                        type="number"
                        value={value}
                        onChange={(e) => setContributionAmounts({
                          ...contributionAmounts,
                          [key]: Number(e.target.value)
                        })}
                        className="clay-input"
                        min="0"
                        placeholder={`Amount to ${contributionType === 'reduction' ? 'reduce' : 'add'}`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Preview */}
              <div className="bg-secondary/30 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">New Amounts Preview:</h4>
                {Object.entries(newAmounts).map(([key, value]) => {
                  const current = savingsAmounts[key as keyof typeof savingsAmounts];
                  const change = value - current;
                  const labels = {
                    down_payment: 'Down Payment',
                    emergency_fund: 'Emergency Fund',
                    moving_setup: 'Moving/Setup',
                    maintenance: 'Maintenance'
                  };

                  return (
                    <div key={key} className="flex justify-between text-sm">
                      <span>{labels[key as keyof typeof labels]}:</span>
                      <span className={change !== 0 ? (change > 0 ? 'text-success' : 'text-destructive') : ''}>
                        ${value.toLocaleString()} 
                        {change !== 0 && (
                          <span className="ml-1">
                            ({change > 0 ? '+' : ''}${change.toLocaleString()})
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Savings:</span>
                    <span className="text-primary">${totalSavings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Progress to Goal:</span>
                    <span>{(percentToGoal * 100).toFixed(1)}%</span>
                  </div>
                  {contributionType === 'monthly' && monthlyContribution > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Estimated Completion:</span>
                      <span>{monthsLeft} months</span>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={handleUpdateSavings} 
                className="w-full clay-button"
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Updating...' : 'Update Savings'}
              </Button>
            </div>
          </div>

          {/* Savings Growth Chart */}
          <div className="clay-card p-6">
            <h3 className="section-title mb-4">Savings Growth</h3>
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

        {/* Savings History */}
        <div className="clay-card p-6">
          <h3 className="section-title">Savings History</h3>
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
                        onClick={() => handleDeleteEntry(entry.id)}
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
                      No savings entries yet. Make your first contribution above!
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

export default SavingsTracker;