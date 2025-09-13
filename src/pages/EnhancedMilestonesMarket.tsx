import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { useUserSettings } from '@/hooks/useUserSettings';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import CreditScoreTracker from '@/components/credit/CreditScoreTracker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Target, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Home,
  Save,
  Trash2,
  MapPin
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

interface USState {
  id: string;
  state_name: string;
  state_code: string;
  avg_property_tax_rate: number;
  avg_insurance_rate: number;
  avg_home_price: number;
  avg_interest_rate: number;
  price_growth_rate: number;
}

const EnhancedMilestonesMarket = () => {
  const { user } = useAuth();
  const { milestones, marketData, refreshData } = useUserData();
  const { settings } = useUserSettings();
  const { toast } = useToast();

  const [newMilestone, setNewMilestone] = useState({
    description: '',
    date: '',
    status: 'Pending',
    alert: true
  });

  const [marketForm, setMarketForm] = useState({
    home_price: 200000,
    tax_rate: 0.015,
    insurance_rate: 0.005,
    price_growth: 0.04,
    interest_rate: 0.065,
    state: settings?.selected_state || 'Ohio'
  });

  const [marketHistory, setMarketHistory] = useState<MarketEntry[]>([]);
  const [usStates, setUsStates] = useState<USState[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMarketHistory();
    fetchUSStates();
    if (marketData) {
      setMarketForm({
        home_price: marketData.home_price,
        tax_rate: marketData.tax_rate,
        insurance_rate: marketData.insurance_rate,
        price_growth: marketData.price_growth,
        interest_rate: marketData.interest_rate,
        state: marketData.state
      });
    }
  }, [marketData, settings]);

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

  const fetchUSStates = async () => {
    try {
      const { data, error } = await supabase
        .from('us_states')
        .select('*')
        .order('state_name');

      if (error) throw error;
      setUsStates(data || []);
    } catch (error: any) {
      console.error('Error fetching US states:', error);
    }
  };

  const handleAddMilestone = async () => {
    if (!user || !newMilestone.description || !newMilestone.date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
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
          description: newMilestone.description,
          date: newMilestone.date,
          status: newMilestone.status,
          alert: newMilestone.alert,
        });

      if (error) throw error;

      toast({
        title: "Milestone added",
        description: "Your new milestone has been created.",
      });

      setNewMilestone({
        description: '',
        date: '',
        status: 'Pending',
        alert: true
      });

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

  const toggleMilestoneStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    
    try {
      const { error } = await supabase
        .from('milestone')
        .update({ status: newStatus })
        .eq('id', id);

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

  const deleteMilestone = async (id: string) => {
    try {
      const { error } = await supabase
        .from('milestone')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Milestone deleted",
        description: "Milestone has been removed.",
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

  const updateMarketData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('market')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          state: marketForm.state,
          home_price: marketForm.home_price,
          tax_rate: marketForm.tax_rate,
          insurance_rate: marketForm.insurance_rate,
          price_growth: marketForm.price_growth,
          interest_rate: marketForm.interest_rate,
        });

      if (error) throw error;

      toast({
        title: "Market data updated",
        description: "Your market information has been saved.",
      });

      fetchMarketHistory();
      refreshData();
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

  const deleteMarketEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('market')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Entry deleted",
        description: "Market entry has been removed.",
      });

      fetchMarketHistory();
    } catch (error: any) {
      toast({
        title: "Error deleting entry",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStateChange = (stateName: string) => {
    const selectedState = usStates.find(s => s.state_name === stateName);
    if (selectedState) {
      setMarketForm({
        ...marketForm,
        state: stateName,
        home_price: selectedState.avg_home_price,
        tax_rate: selectedState.avg_property_tax_rate,
        insurance_rate: selectedState.avg_insurance_rate,
        price_growth: selectedState.price_growth_rate,
        interest_rate: selectedState.avg_interest_rate
      });
    }
  };

  // Calculate projected home price
  const projectedPrice = marketForm.home_price * (1 + marketForm.price_growth);
  
  // Market alerts based on thresholds
  const marketAlerts = [
    {
      condition: marketForm.price_growth > 0.06,
      message: "High price growth rate - consider buying soon",
      type: "warning"
    },
    {
      condition: marketForm.interest_rate > 0.07,
      message: "Interest rates are elevated - monitor for decreases",
      type: "info"
    },
    {
      condition: marketForm.tax_rate > 0.02,
      message: "High property tax rate in this area",
      type: "warning"
    }
  ];

  const activeAlerts = marketAlerts.filter(alert => alert.condition);

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
          <h1 className="page-header flex-1">Milestones, Market & Credit</h1>
        </div>

        <Tabs defaultValue="milestones" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="market">Market Data</TabsTrigger>
            <TabsTrigger value="credit">Credit Score</TabsTrigger>
          </TabsList>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Add Milestone Form */}
              <div className="clay-card p-6 animate-fade-in">
                <h2 className="section-title">
                  <Target className="inline w-5 h-5 mr-2" />
                  Add New Milestone
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="milestone_desc">Description *</Label>
                    <Input
                      id="milestone_desc"
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                      className="clay-input"
                      placeholder="e.g., Save $10,000, Improve credit score to 740"
                    />
                  </div>

                  <div>
                    <Label htmlFor="milestone_date">Target Date *</Label>
                    <Input
                      id="milestone_date"
                      type="date"
                      value={newMilestone.date}
                      onChange={(e) => setNewMilestone({...newMilestone, date: e.target.value})}
                      className="clay-input"
                    />
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select value={newMilestone.status} onValueChange={(value) => setNewMilestone({...newMilestone, status: value})}>
                      <SelectTrigger className="clay-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="alert"
                      checked={newMilestone.alert}
                      onChange={(e) => setNewMilestone({...newMilestone, alert: e.target.checked})}
                      className="clay-checkbox"
                    />
                    <Label htmlFor="alert">Enable alerts for this milestone</Label>
                  </div>

                  <Button 
                    onClick={handleAddMilestone} 
                    className="w-full clay-button"
                    disabled={loading || !newMilestone.description || !newMilestone.date}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Adding...' : 'Add Milestone'}
                  </Button>
                </div>
              </div>

              {/* Current Milestones */}
              <div className="clay-card p-6">
                <h3 className="section-title mb-4">Your Milestones</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {milestones.length > 0 ? (
                    milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <button
                              onClick={() => toggleMilestoneStatus(milestone.id, milestone.status)}
                              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                milestone.status === 'Completed' 
                                  ? 'bg-success text-success-foreground' 
                                  : 'border-2 border-muted-foreground'
                              }`}
                            >
                              {milestone.status === 'Completed' && <CheckCircle className="w-3 h-3" />}
                            </button>
                            <p className={`font-medium text-sm ${
                              milestone.status === 'Completed' ? 'line-through text-muted-foreground' : ''
                            }`}>
                              {milestone.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Due: {new Date(milestone.date).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded-full ${
                              milestone.status === 'Completed' ? 'bg-success/20 text-success' :
                              milestone.status === 'In Progress' ? 'bg-primary/20 text-primary' :
                              'bg-warning/20 text-warning'
                            }`}>
                              {milestone.status}
                            </span>
                            {milestone.alert && (
                              <AlertTriangle className="w-3 h-3 text-warning" />
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMilestone(milestone.id)}
                          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No milestones yet. Add your first milestone above!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Market Data Tab */}
          <TabsContent value="market" className="space-y-6">
            {/* Market Alerts */}
            {activeAlerts.length > 0 && (
              <div className="clay-card p-4">
                <h3 className="section-title mb-3">Market Alerts</h3>
                <div className="space-y-2">
                  {activeAlerts.map((alert, index) => (
                    <div key={index} className={`flex items-center space-x-2 p-2 rounded-lg ${
                      alert.type === 'warning' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{alert.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Market Data Form */}
              <div className="clay-card p-6">
                <h2 className="section-title">
                  <Home className="inline w-5 h-5 mr-2" />
                  Market Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label>State</Label>
                    <Select value={marketForm.state} onValueChange={handleStateChange}>
                      <SelectTrigger className="clay-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {usStates.map((state) => (
                          <SelectItem key={state.id} value={state.state_name}>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-3 h-3" />
                              <span>{state.state_name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="home_price">Home Price</Label>
                      <Input
                        id="home_price"
                        type="number"
                        value={marketForm.home_price}
                        onChange={(e) => setMarketForm({...marketForm, home_price: Number(e.target.value)})}
                        className="clay-input"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="interest_rate">Interest Rate %</Label>
                      <Input
                        id="interest_rate"
                        type="number"
                        value={marketForm.interest_rate * 100}
                        onChange={(e) => setMarketForm({...marketForm, interest_rate: Number(e.target.value) / 100})}
                        className="clay-input"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price_growth">Price Growth %</Label>
                      <Input
                        id="price_growth"
                        type="number"
                        value={marketForm.price_growth * 100}
                        onChange={(e) => setMarketForm({...marketForm, price_growth: Number(e.target.value) / 100})}
                        className="clay-input"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax_rate">Property Tax %</Label>
                      <Input
                        id="tax_rate"
                        type="number"
                        value={marketForm.tax_rate * 100}
                        onChange={(e) => setMarketForm({...marketForm, tax_rate: Number(e.target.value) / 100})}
                        className="clay-input"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="insurance_rate">Insurance Rate %</Label>
                    <Input
                      id="insurance_rate"
                      type="number"
                      value={marketForm.insurance_rate * 100}
                      onChange={(e) => setMarketForm({...marketForm, insurance_rate: Number(e.target.value) / 100})}
                      className="clay-input"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <Button 
                    onClick={updateMarketData} 
                    className="w-full clay-button"
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Market Data'}
                  </Button>
                </div>
              </div>

              {/* Market Projections */}
              <div className="clay-card p-6">
                <h3 className="section-title mb-4">Market Projections</h3>
                <div className="space-y-4">
                  <div className="metric-card">
                    <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="metric-value">${projectedPrice.toLocaleString()}</div>
                    <div className="metric-label">Projected Price (Next Year)</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Current Home Price:</span>
                      <span>${marketForm.home_price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Annual Growth:</span>
                      <span className="text-success">+{(marketForm.price_growth * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Interest Rate:</span>
                      <span>{(marketForm.interest_rate * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Property Tax:</span>
                      <span>{(marketForm.tax_rate * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Insurance:</span>
                      <span>{(marketForm.insurance_rate * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market History */}
            <div className="clay-card p-6">
              <h3 className="section-title">Market Data History</h3>
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
                            onClick={() => deleteMarketEntry(entry.id)}
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
                          No market data history yet. Save your first market data above!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Credit Score Tab */}
          <TabsContent value="credit">
            <CreditScoreTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedMilestonesMarket;