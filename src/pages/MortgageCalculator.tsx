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
  Home, 
  Calculator, 
  Save,
  Trash2,
  DollarSign
} from 'lucide-react';

interface MortgageEntry {
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

const stateRates = {
  'Ohio': { tax_rate: 0.015, insurance_rate: 0.005 },
  'Texas': { tax_rate: 0.018, insurance_rate: 0.005 },
  'California': { tax_rate: 0.007, insurance_rate: 0.005 },
  'Florida': { tax_rate: 0.010, insurance_rate: 0.008 },
  'New York': { tax_rate: 0.020, insurance_rate: 0.004 },
};

const MortgageCalculator = () => {
  const { user } = useAuth();
  const { mortgageData, userData, refreshData } = useUserData();
  const { toast } = useToast();
  
  const [homePrice, setHomePrice] = useState(200000);
  const [downPercent, setDownPercent] = useState(0.1);
  const [loanTerm, setLoanTerm] = useState(30);
  const [interestRate, setInterestRate] = useState(0.065);
  const [selectedState, setSelectedState] = useState('Ohio');
  const [hoa, setHoa] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mortgageHistory, setMortgageHistory] = useState<MortgageEntry[]>([]);

  useEffect(() => {
    if (mortgageData) {
      setHomePrice(mortgageData.home_price);
      setDownPercent(mortgageData.down_percent);
      setLoanTerm(mortgageData.loan_term);
      setInterestRate(mortgageData.rate);
      setHoa(mortgageData.hoa);
    }
    fetchMortgageHistory();
  }, [mortgageData]);

  const fetchMortgageHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mortgage')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setMortgageHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching mortgage history:', error);
    }
  };

  // Mortgage calculations
  const loanAmount = homePrice * (1 - downPercent);
  const monthlyRate = interestRate / 12;
  const numPayments = loanTerm * 12;
  
  const principalAndInterest = monthlyRate > 0 ? 
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1) : loanAmount / numPayments;

  const { tax_rate, insurance_rate } = stateRates[selectedState as keyof typeof stateRates];
  
  const monthlyTaxes = (homePrice * tax_rate) / 12;
  const monthlyInsurance = (homePrice * insurance_rate) / 12;
  const monthlyPMI = downPercent < 0.2 ? (loanAmount * 0.005) / 12 : 0;
  const monthlyMaintenance = (homePrice * 0.01) / 12;
  
  const totalMonthlyPayment = principalAndInterest + monthlyTaxes + monthlyInsurance + monthlyPMI + monthlyMaintenance + hoa;
  
  const monthlyIncome = userData?.income || 5833;
  const affordablePayment = monthlyIncome * 0.28;
  const affordablePrice = affordablePayment > 0 ? 
    (affordablePayment * (Math.pow(1 + monthlyRate, numPayments) - 1)) / 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) : 0;
  
  const debtToIncome = totalMonthlyPayment / monthlyIncome;

  const handleCalculate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('mortgage')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          home_price: homePrice,
          down_percent: downPercent,
          loan_term: loanTerm,
          rate: interestRate,
          tax_rate,
          insurance_rate,
          pmi_rate: downPercent < 0.2 ? 0.005 : 0,
          maintenance_rate: 0.01,
          hoa,
          monthly_payment: totalMonthlyPayment,
          affordable_price: affordablePrice,
          dti: debtToIncome,
        });

      if (error) throw error;

      toast({
        title: "Calculation saved",
        description: "Your mortgage calculation has been saved.",
      });

      refreshData();
      fetchMortgageHistory();
    } catch (error: any) {
      toast({
        title: "Error saving calculation",
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
        .from('mortgage')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Entry deleted",
        description: "Mortgage calculation has been removed.",
      });

      fetchMortgageHistory();
      refreshData();
    } catch (error: any) {
      toast({
        title: "Error deleting entry",
        description: error.message,
        variant: "destructive",
      });
    }
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
          <h1 className="page-header flex-1">Mortgage Calculator</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calculator Form */}
          <div className="clay-card p-6 animate-fade-in">
            <h2 className="section-title">
              <Calculator className="inline w-5 h-5 mr-2" />
              Mortgage Details
            </h2>
            
            <div className="space-y-4">
              {/* Home Price */}
              <div>
                <Label htmlFor="homePrice">Home Price</Label>
                <Input
                  id="homePrice"
                  type="number"
                  value={homePrice}
                  onChange={(e) => setHomePrice(Number(e.target.value))}
                  className="clay-input"
                  min="0"
                />
              </div>

              {/* Down Payment Percentage */}
              <div>
                <Label htmlFor="downPercent">Down Payment (%)</Label>
                <Input
                  id="downPercent"
                  type="number"
                  value={downPercent * 100}
                  onChange={(e) => setDownPercent(Number(e.target.value) / 100)}
                  className="clay-input"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  ${(homePrice * downPercent).toLocaleString()} down payment
                </p>
              </div>

              {/* Loan Term */}
              <div>
                <Label htmlFor="loanTerm">Loan Term (years)</Label>
                <Select value={loanTerm.toString()} onValueChange={(value) => setLoanTerm(Number(value))}>
                  <SelectTrigger className="clay-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 years</SelectItem>
                    <SelectItem value="20">20 years</SelectItem>
                    <SelectItem value="25">25 years</SelectItem>
                    <SelectItem value="30">30 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interest Rate */}
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

              {/* State Selection */}
              <div>
                <Label>State</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="clay-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(stateRates).map(state => (
                      <SelectItem key={state} value={state}>
                        {state} (Tax: {stateRates[state as keyof typeof stateRates].tax_rate * 100}%, 
                        Ins: {stateRates[state as keyof typeof stateRates].insurance_rate * 100}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* HOA */}
              <div>
                <Label htmlFor="hoa">Monthly HOA</Label>
                <Input
                  id="hoa"
                  type="number"
                  value={hoa}
                  onChange={(e) => setHoa(Number(e.target.value))}
                  className="clay-input"
                  min="0"
                />
              </div>

              <Button 
                onClick={handleCalculate} 
                className="w-full clay-button"
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Calculating...' : 'Calculate & Save'}
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="clay-card p-6">
            <h3 className="section-title mb-4">Monthly Payment Breakdown</h3>
            
            <div className="space-y-4">
              {/* Payment Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Principal & Interest:</span>
                  <span className="font-medium">${principalAndInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div className="flex justify-between">
                  <span>Property Taxes:</span>
                  <span className="font-medium">${monthlyTaxes.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insurance:</span>
                  <span className="font-medium">${monthlyInsurance.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                {monthlyPMI > 0 && (
                  <div className="flex justify-between">
                    <span>PMI:</span>
                    <span className="font-medium">${monthlyPMI.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Maintenance (1%):</span>
                  <span className="font-medium">${monthlyMaintenance.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                {hoa > 0 && (
                  <div className="flex justify-between">
                    <span>HOA:</span>
                    <span className="font-medium">${hoa.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Monthly Payment:</span>
                  <span className="text-primary">${totalMonthlyPayment.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
              </div>

              {/* Affordability Analysis */}
              <div className="bg-secondary/30 p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Affordability Analysis</h4>
                <div className="flex justify-between text-sm">
                  <span>Monthly Income:</span>
                  <span>${monthlyIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Debt-to-Income Ratio:</span>
                  <span className={debtToIncome > 0.28 ? 'text-destructive' : 'text-success'}>
                    {(debtToIncome * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Recommended Max Payment:</span>
                  <span>${affordablePayment.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Affordable Home Price:</span>
                  <span className="text-success">${affordablePrice.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
              </div>

              {/* Loan Summary */}
              <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Loan Summary</h4>
                <div className="flex justify-between text-sm">
                  <span>Loan Amount:</span>
                  <span>${loanAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Down Payment:</span>
                  <span>${(homePrice * downPercent).toLocaleString(undefined, {maximumFractionDigits: 0})} ({(downPercent * 100).toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Interest Paid:</span>
                  <span>${((principalAndInterest * numPayments) - loanAmount).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mortgage History */}
        <div className="clay-card p-6">
          <h3 className="section-title">Calculation History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Home Price</th>
                  <th className="text-left py-2">Down %</th>
                  <th className="text-left py-2">Rate</th>
                  <th className="text-left py-2">Monthly Payment</th>
                  <th className="text-left py-2">DTI</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mortgageHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-border">
                    <td className="py-3">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="py-3">${entry.home_price.toLocaleString()}</td>
                    <td className="py-3">{(entry.down_percent * 100).toFixed(1)}%</td>
                    <td className="py-3">{(entry.rate * 100).toFixed(2)}%</td>
                    <td className="py-3">${entry.monthly_payment.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                    <td className="py-3">
                      <span className={entry.dti > 0.28 ? 'text-destructive' : 'text-success'}>
                        {(entry.dti * 100).toFixed(1)}%
                      </span>
                    </td>
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
                {mortgageHistory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No calculations yet. Run your first mortgage calculation above!
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

export default MortgageCalculator;