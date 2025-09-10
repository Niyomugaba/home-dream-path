import { Link } from 'react-router-dom';
import { useUserData } from '@/hooks/useUserData';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  PiggyBank, 
  Calculator, 
  TrendingUp, 
  Target,
  DollarSign,
  CreditCard,
  Home,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { 
    userData, 
    savingsData, 
    budgetData, 
    mortgageData, 
    milestones, 
    loading 
  } = useUserData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-6">
        <Header />
        <div className="max-w-7xl mx-auto">
          <div className="clay-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = savingsData?.percent_to_goal ? 
    Math.min(savingsData.percent_to_goal * 100, 100) : 0;

  // Prepare pie chart data
  const chartData = {
    labels: ['Down Payment', 'Emergency Fund', 'Moving/Setup', 'Maintenance'],
    datasets: [
      {
        data: [
          savingsData?.down_payment || 0,
          savingsData?.emergency_fund || 0,
          savingsData?.moving_setup || 0,
          savingsData?.maintenance || 0,
        ],
        backgroundColor: [
          'hsl(213, 94%, 68%)',  // Primary blue
          'hsl(213, 100%, 85%)', // Light blue  
          'hsl(210, 40%, 95%)',  // Very light blue
          'hsl(213, 50%, 30%)',  // Dark blue
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            family: 'Roboto',
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: $${context.parsed.toLocaleString()}`;
          }
        }
      }
    },
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <Header />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Progress Section */}
        <div className="clay-card p-6 animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Progress to Goal
            </h2>
            <p className="text-muted-foreground">
              ${savingsData?.total_savings?.toLocaleString() || 0} of ${savingsData?.goal?.toLocaleString() || 47300}
            </p>
          </div>
          
          <div className="max-w-md mx-auto mb-4">
            <Progress 
              value={progressPercentage} 
              className="h-6 progress-bar"
            />
          </div>
          
          <div className="text-center">
            <span className="text-3xl font-bold text-primary animate-bounce-gentle">
              {progressPercentage.toFixed(1)}%
            </span>
            <p className="text-sm text-muted-foreground mt-1">
              {savingsData?.months_left || 24} months remaining
            </p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="metric-card">
            <PiggyBank className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="metric-value">
              ${savingsData?.total_savings?.toLocaleString() || 0}
            </div>
            <div className="metric-label">Total Savings</div>
          </div>
          
          <div className="metric-card">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="metric-value">
              {savingsData?.months_left || 24}
            </div>
            <div className="metric-label">Months Left</div>
          </div>
          
          <div className="metric-card">
            <Home className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="metric-value">
              ${mortgageData?.affordable_price?.toLocaleString() || 190000}
            </div>
            <div className="metric-label">Affordable Price</div>
          </div>
          
          <div className="metric-card">
            <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="metric-value">
              ${mortgageData?.monthly_payment?.toLocaleString() || 1628}
            </div>
            <div className="metric-label">Monthly Payment</div>
          </div>
          
          <div className="metric-card">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="metric-value">
              {mortgageData?.dti ? (mortgageData.dti * 100).toFixed(1) : 30.8}%
            </div>
            <div className="metric-label">DTI Ratio</div>
          </div>
          
          <div className="metric-card">
            <CreditCard className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="metric-value">
              {userData?.credit_score || 720}
            </div>
            <div className="metric-label">Credit Score</div>
          </div>
        </div>

        {/* Charts and Alerts Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Savings Breakdown Chart */}
          <div className="clay-card p-6">
            <h3 className="section-title text-center mb-4">Savings Breakdown</h3>
            <div className="h-64">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div className="clay-card p-6">
            <h3 className="section-title mb-4">Upcoming Milestones</h3>
            <div className="space-y-3">
              {milestones.length > 0 ? (
                milestones.slice(0, 5).map((milestone) => (
                  <div 
                    key={milestone.id} 
                    className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg"
                  >
                    <AlertTriangle className={`w-5 h-5 ${
                      milestone.status === 'Pending' ? 'text-warning' : 'text-success'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{milestone.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(milestone.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      milestone.status === 'Pending' 
                        ? 'bg-warning/20 text-warning' 
                        : 'bg-success/20 text-success'
                    }`}>
                      {milestone.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No milestones set yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/budget">
            <Button className="w-full clay-button h-16 flex-col space-y-2">
              <Calculator className="w-6 h-6" />
              <span>Budget Tracker</span>
            </Button>
          </Link>
          
          <Link to="/savings">
            <Button className="w-full clay-button h-16 flex-col space-y-2">
              <PiggyBank className="w-6 h-6" />
              <span>Savings Tracker</span>
            </Button>
          </Link>
          
          <Link to="/mortgage">
            <Button className="w-full clay-button h-16 flex-col space-y-2">
              <Home className="w-6 h-6" />
              <span>Mortgage Calculator</span>
            </Button>
          </Link>
          
          <Link to="/milestones">
            <Button className="w-full clay-button h-16 flex-col space-y-2">
              <Target className="w-6 h-6" />
              <span>Milestones & Market</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;