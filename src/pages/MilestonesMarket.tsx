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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  Save,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';

interface Milestone {
  id: string;
  date: string;
  description: string;
  status: string;
  alert: boolean;
}

interface MarketEntry {
  id: string;
  date: string;
  state: string;
  home_price: number;
  tax_rate: number;
  insurance_rate: number;
  price_growth: number;
  interest_rate: number;
}

const MilestonesMarket = () => {
  const { user } = useAuth();
  const { milestones, marketData, refreshData } = useUserData();
  const { toast } = useToast();
  
  // Milestone form state
  const [milestoneDate, setMilestoneDate] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [milestoneAlert, setMilestoneAlert] = useState(true);
  
  // Market form state
  const [homePrice, setHomePrice] = useState(200000);
  const [interestRate, setInterestRate] = useState(0.065);
  const [priceGrowth, setPriceGrowth] = useState(0.04);
  const [selectedState, setSelectedState] = useState('Ohio');
  
  const [loading, setLoading] = useState(false);
  const [marketHistory, setMarketHistory] = useState<MarketEntry[]>([]);

  useEffect(() => {
    if (marketData) {
      setHomePrice(marketData.home_price);
      setInterestRate(marketData.interest_rate);
      setPriceGrowth(marketData.price_growth);
      setSelectedState(marketData.state);
    }
    fetchMarketHistory();
  }, [marketData]);

  const fetchMarketHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('market')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setMarketHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching market history:', error);
    }
  };

  const handleAddMilestone = async () => {
    if (!user || !milestoneDate || !milestoneDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in all milestone fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('milestone')
        .insert({
          user_id: user.id,
          date: milestoneDate,
          description: milestoneDescription,
          status: 'Pending',
          alert: milestoneAlert,
        });

      if (error) throw error;

      toast({
        title: "Milestone added",
        description: "Your milestone has been added successfully.",
      });

      // Reset form
      setMilestoneDate('');
      setMilestoneDescription('');
      setMilestoneAlert(true);

      refreshData();
    } catch (error: any) {
      toast({
        title: "Error adding milestone",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMarket = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const stateRates = {
        'Ohio': { tax_rate: 0.015, insurance_rate: 0.005 },
        'Texas': { tax_rate: 0.018, insurance_rate: 0.005 },
        'California': { tax_rate: 0.007, insurance_rate: 0.005 },
        'Florida': { tax_rate: 0.010, insurance_rate: 0.008 },
        'New York': { tax_rate: 0.020, insurance_rate: 0.004 },
      };

      const { tax_rate, insurance_rate } = stateRates[selectedState as keyof typeof stateRates];

      const { error } = await supabase
        .from('market')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          state: selectedState,
          home_price: homePrice,
          tax_rate,
          insurance_rate,
          price_growth: priceGrowth,
          interest_rate: interestRate,
        });

      if (error) throw error;

      toast({
        title: "Market data updated",
        description: "Market information has been saved.",
      });

      refreshData();
      fetchMarketHistory();
    } catch (error: any) {
      toast({
        title: "Error updating market data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMilestoneStatus = async (milestoneId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    
    try {
      const { error } = await supabase
        .from('milestone')
        .update({ status: newStatus })
        .eq('id', milestoneId);

      if (error) throw error;

      toast({
        title: "Milestone updated",
        description: `Milestone marked as ${newStatus.toLowerCase()}.`,
      });

      refreshData();
    } catch (error: any) {
      toast({
        title: "Error updating milestone",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('milestone')
        .delete()
        .eq('id', milestoneId);

      if (error) throw error;

      toast({
        title: "Milestone deleted",
        description: "The milestone has been removed.",
      });

      refreshData();
    } catch (error: any) {
      toast({
        title: "Error deleting milestone",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMarketEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('market')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: "Market entry deleted",
        description: "The market entry has been removed.",
      });

      fetchMarketHistory();
      refreshData();
    } catch (error: any) {
      toast({
        title: "Error deleting entry",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Calculate projected home price
  const currentDate = new Date();
  const targetDate = new Date('2027-09-01'); // September 2027
  const monthsToTarget = Math.ceil((targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const projectedPrice = homePrice * Math.pow(1 + priceGrowth/12, monthsToTarget);

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
          <h1 className="page-header flex-1">Milestones & Market</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Milestones Section */}
          <div className="space-y-4">
            {/* Add Milestone Form */}
            <div className="clay-card p-6 animate-fade-in">
              <h2 className="section-title">
                <Target className="inline w-5 h-5 mr-2" />
                Add Milestone
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="milestoneDate">Target Date</Label>
                  <Input
                    id="milestoneDate"
                    type="date"
                    value={milestoneDate}
                    onChange={(e) => setMilestoneDate(e.target.value)}
                    className="clay-input"
                  />
                </div>

                <div>
                  <Label htmlFor="milestoneDescription">Description</Label>
                  <Textarea
                    id="milestoneDescription"
                    value={milestoneDescription}
                    onChange={(e) => setMilestoneDescription(e.target.value)}
                    className="clay-input"
                    placeholder="e.g., Reach $10,000 in savings"
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="milestoneAlert"
                    checked={milestoneAlert}
                    onCheckedChange={(checked) => setMilestoneAlert(checked as boolean)}
                  />
                  <Label htmlFor="milestoneAlert" className="text-sm">
                    Enable alert notifications
                  </Label>
                </div>

                <Button 
                  onClick={handleAddMilestone} 
                  className="w-full clay-button"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              </div>
            </div>

            {/* Milestones List */}
            <div className="clay-card p-6">
              <h3 className="section-title mb-4">Your Milestones</h3>
              <div className="space-y-3">
                {milestones.length > 0 ? (
                  milestones.map((milestone) => {
                    const isOverdue = new Date(milestone.date) < new Date() && milestone.status === 'Pending';
                    
                    return (
                      <div 
                        key={milestone.id} 
                        className={`p-3 rounded-lg border ${
                          milestone.status === 'Completed' 
                            ? 'bg-success/10 border-success/20' 
                            : isOverdue 
                            ? 'bg-destructive/10 border-destructive/20'
                            : 'bg-secondary/50 border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleMilestoneStatus(milestone.id, milestone.status)}
                              className="p-1"
                            >
                              {milestone.status === 'Completed' ? (
                                <CheckCircle className="w-5 h-5 text-success" />
                              ) : (
                                <Target className="w-5 h-5 text-muted-foreground" />
                              )}
                            </Button>
                            <div>
                              <p className="font-medium text-sm">{milestone.description}</p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(milestone.date).toLocaleDateString()}</span>
                                {milestone.alert && (
                                  <AlertTriangle className="w-3 h-3 text-warning" />
                                )}
                                {isOverdue && (
                                  <span className="text-destructive font-medium">Overdue</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No milestones set yet. Add your first milestone above!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Market Data Section */}
          <div className="space-y-4">
            {/* Market Update Form */}
            <div className="clay-card p-6">
              <h2 className="section-title">
                <TrendingUp className="inline w-5 h-5 mr-2" />
                Market Updates
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="homePrice">Average Home Price</Label>
                  <Input
                    id="homePrice"
                    type="number"
                    value={homePrice}
                    onChange={(e) => setHomePrice(Number(e.target.value))}
                    className="clay-input"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    value={interestRate * 100}
                    onChange={(e) => setInterestRate(Number(e.target.value) / 100)}
                    className="clay-input"
                    min="0"
                    max="20"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="priceGrowth">Annual Price Growth (%)</Label>
                  <Input
                    id="priceGrowth"
                    type="number"
                    value={priceGrowth * 100}
                    onChange={(e) => setPriceGrowth(Number(e.target.value) / 100)}
                    className="clay-input"
                    min="0"
                    max="20"
                    step="0.1"
                  />
                </div>

                <div>
                  <Label>State/Region</Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="clay-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ohio">Ohio</SelectItem>
                      <SelectItem value="Texas">Texas</SelectItem>
                      <SelectItem value="California">California</SelectItem>
                      <SelectItem value="Florida">Florida</SelectItem>
                      <SelectItem value="New York">New York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Market Projections */}
                <div className="bg-secondary/30 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">Market Projections</h4>
                  <div className="flex justify-between text-sm">
                    <span>Current Avg Price:</span>
                    <span>${homePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Projected Sep 2027:</span>
                    <span className={projectedPrice > homePrice ? 'text-warning' : 'text-success'}>
                      ${projectedPrice.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Price Increase:</span>
                    <span className="text-warning">
                      +${(projectedPrice - homePrice).toLocaleString(undefined, {maximumFractionDigits: 0})} 
                      ({(((projectedPrice - homePrice) / homePrice) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={handleUpdateMarket} 
                  className="w-full clay-button"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Updating...' : 'Update Market Data'}
                </Button>
              </div>
            </div>

            {/* Market Alerts */}
            <div className="clay-card p-6">
              <h3 className="section-title mb-4">Market Alerts</h3>
              <div className="space-y-2">
                {interestRate > 0.075 && (
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium">High Interest Rates</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Interest rates above 7.5% may affect affordability
                    </p>
                  </div>
                )}
                {priceGrowth > 0.06 && (
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium">Rapid Price Growth</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Home prices growing faster than 6% annually
                    </p>
                  </div>
                )}
                {projectedPrice > homePrice * 1.15 && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium">Price Alert</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Projected price increase of {(((projectedPrice - homePrice) / homePrice) * 100).toFixed(1)}% by 2027
                    </p>
                  </div>
                )}
                {interestRate <= 0.065 && priceGrowth <= 0.04 && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium">Favorable Market</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Good conditions for home buying
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Market History */}
        <div className="clay-card p-6">
          <h3 className="section-title">Market History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">State</th>
                  <th className="text-left py-2">Home Price</th>
                  <th className="text-left py-2">Interest Rate</th>
                  <th className="text-left py-2">Price Growth</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {marketHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-border">
                    <td className="py-3">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="py-3">{entry.state}</td>
                    <td className="py-3">${entry.home_price.toLocaleString()}</td>
                    <td className="py-3">{(entry.interest_rate * 100).toFixed(2)}%</td>
                    <td className="py-3">{(entry.price_growth * 100).toFixed(1)}%</td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMarketEntry(entry.id)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {marketHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No market data yet. Add your first market update above!
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

export default MilestonesMarket;