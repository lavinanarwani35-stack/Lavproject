export interface SpendingCategory {
  id: string;
  name: string;
  emoji: string;
  monthly: number;
  benchmarkMin: number; // % of income
  benchmarkMax: number; // % of income
  color: string;
}

export interface UserProfile {
  name: string;
  age: number;
  monthlyIncome: number;
  currentSavings: number;
  emergencyFund: number;
  monthlyDebtPayments: number;
  spending: SpendingCategory[];
  targetRetirementAge: number;
  expectedReturn: number; // annual %
  inflationRate: number;
}

export interface FinancialInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'danger' | 'success';
  title: string;
  description: string;
  impact: string;
  action: string;
  priority: number;
  savingsPotential: number;
  category?: string;
}

export interface FIREProjection {
  currentFIREAge: number;
  optimizedFIREAge: number;
  yearsEarlier: number;
  currentMonthlySavings: number;
  optimizedMonthlySavings: number;
  currentFireNumber: number;
  optimizedFireNumber: number;
  chartData: ProjectionDataPoint[];
}

export interface ProjectionDataPoint {
  age: number;
  current: number;
  optimized: number;
  fireTarget: number;
  optimizedTarget: number;
}

export interface HealthScore {
  overall: number;
  components: {
    savingsRate: ScoreComponent;
    emergencyFund: ScoreComponent;
    debtRatio: ScoreComponent;
    spendingBalance: ScoreComponent;
    fireProgress: ScoreComponent;
  };
}

export interface ScoreComponent {
  score: number;
  max: number;
  label: string;
}

export interface PurchaseAnalysis {
  monthlyPayment: number;
  totalMonthlyCost: number;
  incomePercent: number;
  totalOpportunityCost: number;
  downPaymentGrowth: number;
  fireDelayYears: number;
  score: number;
  verdict: 'consider' | 'wait' | 'avoid';
  reasons: string[];
  totalLoanCost: number;
}

export type ActiveView = 'overview' | 'spending' | 'fire' | 'decisions';
export type AppPage = 'landing' | 'onboarding' | 'app';
