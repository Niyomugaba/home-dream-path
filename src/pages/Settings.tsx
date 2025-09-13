import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserSettings } from '@/hooks/useUserSettings';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Settings as SettingsIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { settings, updateSettings } = useUserSettings();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    default_income: 5833,
    default_expenses: {
      rent: 800,
      utilities: 200,
      food: 400,
      transportation: 300,
      insurance: 150,
      other: 650
    },
    default_debt: {
      car: 200,
      credit_card: 100,
      student_loan: 0,
      other: 0
    },
    savings_goals: {
      down_payment: 20000,
      emergency_fund: 12300,
      moving_setup: 7000,
      maintenance: 2000
    },
    mortgage_defaults: {
      down_percent: 0.1,
      loan_term: 30,
      hoa: 0,
      maintenance_rate: 0.01,
      pmi_rate: 0.005
    },
    selected_state: 'Ohio',
    credit_score_goal: 750
  });

  const [usStates, setUsStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        default_income: settings.default_income,
        default_expenses: settings.default_expenses,
        default_debt: settings.default_debt,
        savings_goals: settings.savings_goals,
        mortgage_defaults: settings.mortgage_defaults,
        selected_state: settings.selected_state,
        credit_score_goal: settings.credit_score_goal,
      });
    }
  }, [settings]);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const { data, error } = await supabase
        .from('us_states')
        .select('*')
        .order('state_name');

      if (error) throw error;
      setUsStates(data || []);
    } catch (error: any) {
      console.error('Error fetching states:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSettings(formData);
    } finally {
      setLoading(false);
    }
  };

  const updateFormField = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <Header />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Button>
          </Link>
          <h1 className="page-header flex-1">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Income Settings */}
          <div className="clay-card p-6 animate-fade-in">
            <h2 className="section-title">
              <SettingsIcon className="inline w-5 h-5 mr-2" />
              Default Income
            </h2>
            <div>
              <Label htmlFor="default_income">Monthly Income</Label>
              <Input
                id="default_income"
                type="number"
                value={formData.default_income}
                onChange={(e) => setFormData({...formData, default_income: Number(e.target.value)})}
                className="clay-input"
                min="0"
              />
            </div>
          </div>

          {/* Expense Categories */}
          <div className="clay-card p-6">
            <h2 className="section-title">Default Expense Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(formData.default_expenses).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={`expense_${key}`} className="text-sm capitalize">
                    {key.replace('_', ' ')}
                  </Label>
                  <Input
                    id={`expense_${key}`}
                    type="number"
                    value={value}
                    onChange={(e) => updateFormField('default_expenses', key, Number(e.target.value))}
                    className="clay-input"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Debt Categories */}
          <div className="clay-card p-6">
            <h2 className="section-title">Default Debt Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(formData.default_debt).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={`debt_${key}`} className="text-sm capitalize">
                    {key.replace('_', ' ')}
                  </Label>
                  <Input
                    id={`debt_${key}`}
                    type="number"
                    value={value}
                    onChange={(e) => updateFormField('default_debt', key, Number(e.target.value))}
                    className="clay-input"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Savings Goals */}
          <div className="clay-card p-6">
            <h2 className="section-title">Savings Goals</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(formData.savings_goals).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={`savings_${key}`} className="text-sm capitalize">
                    {key.replace('_', ' ')}
                  </Label>
                  <Input
                    id={`savings_${key}`}
                    type="number"
                    value={value}
                    onChange={(e) => updateFormField('savings_goals', key, Number(e.target.value))}
                    className="clay-input"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Location & Credit Score */}
          <div className="clay-card p-6">
            <h2 className="section-title">Location & Credit Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>State</Label>
                <Select value={formData.selected_state} onValueChange={(value) => setFormData({...formData, selected_state: value})}>
                  <SelectTrigger className="clay-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {usStates.map((state) => (
                      <SelectItem key={state.id} value={state.state_name}>
                        {state.state_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="credit_goal">Credit Score Goal</Label>
                <Input
                  id="credit_goal"
                  type="number"
                  value={formData.credit_score_goal}
                  onChange={(e) => setFormData({...formData, credit_score_goal: Number(e.target.value)})}
                  className="clay-input"
                  min="300"
                  max="850"
                />
              </div>
            </div>
          </div>

          {/* Mortgage Defaults */}
          <div className="clay-card p-6">
            <h2 className="section-title">Mortgage Calculation Defaults</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="down_percent">Down Payment %</Label>
                <Input
                  id="down_percent"
                  type="number"
                  value={formData.mortgage_defaults.down_percent * 100}
                  onChange={(e) => updateFormField('mortgage_defaults', 'down_percent', Number(e.target.value) / 100)}
                  className="clay-input"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="loan_term">Loan Term (years)</Label>
                <Input
                  id="loan_term"
                  type="number"
                  value={formData.mortgage_defaults.loan_term}
                  onChange={(e) => updateFormField('mortgage_defaults', 'loan_term', Number(e.target.value))}
                  className="clay-input"
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <Label htmlFor="hoa">Monthly HOA</Label>
                <Input
                  id="hoa"
                  type="number"
                  value={formData.mortgage_defaults.hoa}
                  onChange={(e) => updateFormField('mortgage_defaults', 'hoa', Number(e.target.value))}
                  className="clay-input"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="maintenance_rate">Maintenance Rate %</Label>
                <Input
                  id="maintenance_rate"
                  type="number"
                  value={formData.mortgage_defaults.maintenance_rate * 100}
                  onChange={(e) => updateFormField('mortgage_defaults', 'maintenance_rate', Number(e.target.value) / 100)}
                  className="clay-input"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="pmi_rate">PMI Rate %</Label>
                <Input
                  id="pmi_rate"
                  type="number"
                  value={formData.mortgage_defaults.pmi_rate * 100}
                  onChange={(e) => updateFormField('mortgage_defaults', 'pmi_rate', Number(e.target.value) / 100)}
                  className="clay-input"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            className="w-full clay-button"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;