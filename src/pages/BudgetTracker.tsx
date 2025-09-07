import { Header } from "@/components/layout/Header";

const BudgetTracker = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <Header />
        <div className="clay-card p-6">
          <h2 className="text-xl font-bold mb-4">Budget Tracker</h2>
          <p className="text-muted-foreground">Budget tracking functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;