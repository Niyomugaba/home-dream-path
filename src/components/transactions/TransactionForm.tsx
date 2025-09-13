import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionFormProps {
  type: 'income' | 'expense' | 'savings_contribution' | 'savings_withdrawal' | 'debt_payment';
  onSuccess?: () => void;
  defaultCategory?: string;
}

const TransactionForm = ({ type, onSuccess, defaultCategory }: TransactionFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    category: defaultCategory || '',
    amount: 0,
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [loading, setLoading] = useState(false);

  const categoryOptions = {
    income: ['Salary', 'Freelance', 'Bonus', 'Investment', 'Gift', 'Tax Refund', 'Other'],
    expense: ['Rent', 'Utilities', 'Food', 'Transportation', 'Insurance', 'Healthcare', 'Entertainment', 'Shopping', 'Other'],
    savings_contribution: ['Down Payment', 'Emergency Fund', 'Moving/Setup', 'Maintenance', 'General'],
    savings_withdrawal: ['Down Payment', 'Emergency Fund', 'Moving/Setup', 'Maintenance', 'General'],
    debt_payment: ['Car', 'Credit Card', 'Student Loan', 'Mortgage', 'Personal Loan', 'Other']
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.category || formData.amount <= 0) {
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
        .from('transactions')
        .insert({
          user_id: user.id,
          type,
          category: formData.category,
          amount: formData.amount,
          description: formData.description || null,
          date: formData.date,
        });

      if (error) throw error;

      toast({
        title: "Transaction added",
        description: `${type.replace('_', ' ')} recorded successfully.`,
      });

      // Reset form
      setFormData({
        category: defaultCategory || '',
        amount: 0,
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error adding transaction",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const typeLabels = {
    income: 'Income',
    expense: 'Expense',
    savings_contribution: 'Savings Contribution',
    savings_withdrawal: 'Savings Withdrawal',
    debt_payment: 'Debt Payment'
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-medium text-foreground mb-3">
        <Plus className="inline w-4 h-4 mr-1" />
        Add {typeLabels[type]}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger className="clay-input">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions[type].map((cat) => (
                <SelectItem key={cat} value={cat.toLowerCase().replace(' ', '_')}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount || ''}
            onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
            className="clay-input"
            min="0.01"
            step="0.01"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          className="clay-input"
        />
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="clay-input"
          rows={2}
          placeholder="Add notes about this transaction..."
        />
      </div>

      <Button 
        type="submit" 
        className="w-full clay-button"
        disabled={loading || !formData.category || formData.amount <= 0}
      >
        <Save className="w-4 h-4 mr-2" />
        {loading ? 'Adding...' : `Add ${typeLabels[type]}`}
      </Button>
    </form>
  );
};

export default TransactionForm;