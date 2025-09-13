import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, TrendingUp, Save, Trash2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

interface CreditScoreEntry {
  id: string;
  score: number;
  date: string;
  notes?: string;
}

const CreditScoreTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [newScore, setNewScore] = useState(720);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [history, setHistory] = useState<CreditScoreEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('credit_score_history')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching credit history:', error);
    }
  };

  const addScore = async () => {
    if (!user || newScore < 300 || newScore > 850) {
      toast({
        title: "Invalid score",
        description: "Credit score must be between 300 and 850.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('credit_score_history')
        .insert({
          user_id: user.id,
          score: newScore,
          date,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Credit score updated",
        description: "Your credit score has been recorded.",
      });

      setNotes('');
      fetchHistory();
    } catch (error: any) {
      toast({
        title: "Error adding score",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('credit_score_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Entry deleted",
        description: "Credit score entry has been removed.",
      });

      fetchHistory();
    } catch (error: any) {
      toast({
        title: "Error deleting entry",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 740) return 'text-success';
    if (score >= 670) return 'text-primary';
    if (score >= 580) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 740) return 'Excellent';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  };

  // Chart data
  const chartData = {
    labels: history.slice().reverse().map(entry => new Date(entry.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Credit Score',
        data: history.slice().reverse().map(entry => entry.score),
        borderColor: 'hsl(213, 94%, 68%)',
        backgroundColor: 'hsl(213, 94%, 68%, 0.1)',
        fill: true,
        tension: 0.4,
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
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 300,
        max: 850,
        ticks: {
          stepSize: 50,
        }
      }
    },
  };

  const currentScore = history.length > 0 ? history[0].score : 720;

  return (
    <div className="space-y-6">
      {/* Current Score Display */}
      <div className="clay-card p-6 text-center">
        <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-muted-foreground">Current Credit Score</h3>
          <div className={`text-4xl font-bold ${getScoreColor(currentScore)}`}>
            {currentScore}
          </div>
          <div className="text-sm text-muted-foreground">
            {getScoreLabel(currentScore)} Credit
          </div>
          {history.length > 1 && (
            <div className="flex items-center justify-center mt-2">
              <TrendingUp className={`w-4 h-4 mr-1 ${
                currentScore >= history[1].score ? 'text-success' : 'text-destructive'
              }`} />
              <span className={`text-sm ${
                currentScore >= history[1].score ? 'text-success' : 'text-destructive'
              }`}>
                {currentScore >= history[1].score ? '+' : ''}{currentScore - history[1].score} points
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add Score Form */}
        <div className="clay-card p-6">
          <h3 className="section-title mb-4">Update Credit Score</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="score">Credit Score</Label>
              <Input
                id="score"
                type="number"
                value={newScore}
                onChange={(e) => setNewScore(Number(e.target.value))}
                className="clay-input"
                min="300"
                max="850"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Score must be between 300 and 850
              </p>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="clay-input"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="clay-input"
                rows={2}
                placeholder="What influenced this score change?"
              />
            </div>

            <Button 
              onClick={addScore} 
              className="w-full clay-button"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Add Score'}
            </Button>
          </div>
        </div>

        {/* Score Chart */}
        <div className="clay-card p-6">
          <h3 className="section-title mb-4">Score History</h3>
          {history.length > 0 ? (
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No score history yet. Add your first score to start tracking!
            </div>
          )}
        </div>
      </div>

      {/* Score History Table */}
      <div className="clay-card p-6">
        <h3 className="section-title mb-4">Credit Score History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Score</th>
                <th className="text-left py-2">Rating</th>
                <th className="text-left py-2">Change</th>
                <th className="text-left py-2">Notes</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => {
                const previousScore = history[index + 1]?.score;
                const change = previousScore ? entry.score - previousScore : 0;
                
                return (
                  <tr key={entry.id} className="border-b border-border">
                    <td className="py-3">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className={`py-3 font-medium ${getScoreColor(entry.score)}`}>
                      {entry.score}
                    </td>
                    <td className="py-3">{getScoreLabel(entry.score)}</td>
                    <td className="py-3">
                      {change !== 0 && (
                        <span className={change > 0 ? 'text-success' : 'text-destructive'}>
                          {change > 0 ? '+' : ''}{change}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {entry.notes || '—'}
                    </td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteEntry(entry.id)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No credit score history yet. Add your first score above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreditScoreTracker;