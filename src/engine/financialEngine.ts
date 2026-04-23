import {
  UserProfile,
  FinancialInsight,
  FIREProjection,
  HealthScore,
  PurchaseAnalysis,
} from '../types';

export function getTotalMonthlySpending(profile: UserProfile): number {
  return profile.spending.reduce((sum, cat) => sum + cat.monthly, 0);
}

export function getMonthlySavings(profile: UserProfile): number {
  return (
    profile.monthlyIncome -
    getTotalMonthlySpending(profile) -
    profile.monthlyDebtPayments
  );
}

export function getSavingsRate(profile: UserProfile): number {
  return (getMonthlySavings(profile) / profile.monthlyIncome) * 100;
}

export function getFIRENumber(profile: UserProfile): number {
  return getTotalMonthlySpending(profile) * 12 * 25;
}

export function projectPortfolio(
  currentSavings: number,
  monthlySavings: number,
  annualReturnPct: number,
  months: number
): number {
  if (months === 0) return currentSavings;
  const r = Math.pow(1 + annualReturnPct / 100, 1 / 12) - 1;
  const fvCurrent = currentSavings * Math.pow(1 + r, months);
  if (r === 0) return fvCurrent + monthlySavings * months;
  const fvContributions = (monthlySavings * (Math.pow(1 + r, months) - 1)) / r;
  return fvCurrent + fvContributions;
}

export function findYearsToFIRE(
  currentSavings: number,
  monthlySavings: number,
  annualReturnPct: number,
  fireNumber: number
): number {
  if (currentSavings >= fireNumber) return 0;
  if (monthlySavings <= 0) return 999;

  for (let months = 1; months <= 1200; months++) {
    const portfolio = projectPortfolio(
      currentSavings,
      monthlySavings,
      annualReturnPct,
      months
    );
    if (portfolio >= fireNumber) return months / 12;
  }
  return 999;
}

export function calculateHealthScore(profile: UserProfile): HealthScore {
  const savingsRate = getSavingsRate(profile);
  const totalSpending = getTotalMonthlySpending(profile);
  const monthsEF = profile.emergencyFund / totalSpending;
  const debtRatio = (profile.monthlyDebtPayments / profile.monthlyIncome) * 100;

  let savingsScore = 0;
  if (savingsRate >= 25) savingsScore = 30;
  else if (savingsRate >= 20) savingsScore = 25;
  else if (savingsRate >= 15) savingsScore = 20;
  else if (savingsRate >= 10) savingsScore = 13;
  else if (savingsRate >= 5) savingsScore = 7;

  let emergencyScore = 0;
  if (monthsEF >= 6) emergencyScore = 25;
  else if (monthsEF >= 3) emergencyScore = 16;
  else if (monthsEF >= 1) emergencyScore = 8;

  let debtScore = 0;
  if (debtRatio === 0) debtScore = 20;
  else if (debtRatio <= 10) debtScore = 16;
  else if (debtRatio <= 20) debtScore = 10;
  else if (debtRatio <= 30) debtScore = 5;

  const overspentCount = profile.spending.filter(
    (cat) => (cat.monthly / profile.monthlyIncome) * 100 > cat.benchmarkMax
  ).length;
  const spendingScore = Math.max(0, 15 - overspentCount * 3);

  let fireScore = 0;
  if (savingsRate >= 40) fireScore = 10;
  else if (savingsRate >= 30) fireScore = 8;
  else if (savingsRate >= 20) fireScore = 6;
  else if (savingsRate >= 10) fireScore = 3;

  return {
    overall: savingsScore + emergencyScore + debtScore + spendingScore + fireScore,
    components: {
      savingsRate: { score: savingsScore, max: 30, label: 'Savings Rate' },
      emergencyFund: { score: emergencyScore, max: 25, label: 'Emergency Fund' },
      debtRatio: { score: debtScore, max: 20, label: 'Debt Load' },
      spendingBalance: { score: spendingScore, max: 15, label: 'Spending Discipline' },
      fireProgress: { score: fireScore, max: 10, label: 'FIRE Progress' },
    },
  };
}

export function calculateFIREProjection(profile: UserProfile): FIREProjection {
  const totalSpending = getTotalMonthlySpending(profile);
  const monthlySavings = getMonthlySavings(profile);
  const fireNumber = getFIRENumber(profile);

  const optimizedMonthly = profile.spending.map((cat) =>
    Math.min(cat.monthly, (profile.monthlyIncome * cat.benchmarkMax) / 100)
  );
  const optimizedTotalSpending = optimizedMonthly.reduce((a, b) => a + b, 0);
  const optimizedMonthlySavings =
    profile.monthlyIncome - optimizedTotalSpending - profile.monthlyDebtPayments;
  const optimizedFireNumber = optimizedTotalSpending * 12 * 25;

  const currentYears = findYearsToFIRE(
    profile.currentSavings,
    monthlySavings,
    profile.expectedReturn,
    fireNumber
  );
  const optimizedYears = findYearsToFIRE(
    profile.currentSavings,
    optimizedMonthlySavings,
    profile.expectedReturn,
    optimizedFireNumber
  );

  const currentFIREAge = profile.age + currentYears;
  const optimizedFIREAge = profile.age + optimizedYears;
  const maxYears = Math.min(Math.max(currentYears, optimizedYears) + 3, 40);

  const chartData = [];
  for (let year = 0; year <= maxYears; year++) {
    chartData.push({
      age: profile.age + year,
      current: Math.round(
        projectPortfolio(
          profile.currentSavings,
          monthlySavings,
          profile.expectedReturn,
          year * 12
        )
      ),
      optimized: Math.round(
        projectPortfolio(
          profile.currentSavings,
          optimizedMonthlySavings,
          profile.expectedReturn,
          year * 12
        )
      ),
      fireTarget: Math.round(fireNumber),
      optimizedTarget: Math.round(optimizedFireNumber),
    });
  }

  return {
    currentFIREAge,
    optimizedFIREAge,
    yearsEarlier: currentFIREAge - optimizedFIREAge,
    currentMonthlySavings: monthlySavings,
    optimizedMonthlySavings,
    currentFireNumber: fireNumber,
    optimizedFireNumber,
    chartData,
  };
}

export function generateInsights(profile: UserProfile): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const totalSpending = getTotalMonthlySpending(profile);
  const savingsRate = getSavingsRate(profile);
  const monthsEF = profile.emergencyFund / totalSpending;

  profile.spending.forEach((cat) => {
    const pct = (cat.monthly / profile.monthlyIncome) * 100;
    if (pct > cat.benchmarkMax) {
      const overspendPct = ((pct - cat.benchmarkMax) / cat.benchmarkMax) * 100;
      const maxAmount = (profile.monthlyIncome * cat.benchmarkMax) / 100;
      const overspendAmount = cat.monthly - maxAmount;

      insights.push({
        id: `overspend-${cat.id}`,
        type: overspendPct > 30 ? 'danger' : 'warning',
        title: `${cat.emoji} You're overspending on ${cat.name} by ${overspendPct.toFixed(0)}%`,
        description: `$${cat.monthly.toLocaleString()}/mo — benchmark for your income is max $${Math.round(maxAmount).toLocaleString()}/mo (${cat.benchmarkMax}% of income).`,
        impact: `+$${Math.round(overspendAmount).toLocaleString()}/month freed if cut to benchmark`,
        action: `Reduce ${cat.name} spending to $${Math.round(maxAmount).toLocaleString()}/month`,
        priority: overspendPct > 30 ? 1 : 2,
        savingsPotential: overspendAmount,
        category: cat.id,
      });
    }
  });

  if (monthsEF < 6) {
    const targetFund = totalSpending * 6;
    const shortfall = targetFund - profile.emergencyFund;
    insights.push({
      id: 'emergency-fund',
      type: monthsEF < 2 ? 'danger' : 'warning',
      title: '🚨 Emergency fund covers only ' + monthsEF.toFixed(1) + ' months',
      description: `You have $${profile.emergencyFund.toLocaleString()} saved. A 6-month buffer requires $${Math.round(targetFund).toLocaleString()}. One job loss or medical bill could derail everything.`,
      impact: `$${Math.round(shortfall).toLocaleString()} shortfall — you're financially exposed`,
      action: 'Pause extra investing until emergency fund hits 6 months',
      priority: monthsEF < 2 ? 0 : 3,
      savingsPotential: 0,
    });
  }

  const projection = calculateFIREProjection(profile);
  if (projection.yearsEarlier > 0.5) {
    const extraSavings = Math.round(
      projection.optimizedMonthlySavings - projection.currentMonthlySavings
    );
    insights.push({
      id: 'fire-opportunity',
      type: 'opportunity',
      title: `🔥 Retire ${projection.yearsEarlier.toFixed(1)} years earlier`,
      description: `Move overspend in flagged categories to investments. That's $${extraSavings.toLocaleString()}/month more invested — compounded over time, it moves your FIRE date from age ${projection.currentFIREAge.toFixed(0)} to ${projection.optimizedFIREAge.toFixed(0)}.`,
      impact: `FIRE at ${projection.optimizedFIREAge.toFixed(0)} instead of ${projection.currentFIREAge.toFixed(0)}`,
      action: 'Redirect spending overage to index fund investments',
      priority: 1,
      savingsPotential: extraSavings,
    });
  }

  if (savingsRate < 20) {
    insights.push({
      id: 'savings-rate',
      type: 'warning',
      title: `📉 Savings rate of ${savingsRate.toFixed(1)}% is below FIRE threshold`,
      description: `FIRE seekers typically need 25–50%+ savings rate. At ${savingsRate.toFixed(1)}%, your wealth-building speed is limited. Every extra percent moves your retirement date forward by weeks.`,
      impact: 'Each 5% savings rate increase = ~2 fewer years to FIRE',
      action: 'Target 25% savings rate as your next milestone',
      priority: 3,
      savingsPotential: 0,
    });
  }

  const subscriptionCat = profile.spending.find((c) => c.id === 'subscriptions');
  if (subscriptionCat && subscriptionCat.monthly > 200) {
    insights.push({
      id: 'subscriptions',
      type: 'opportunity',
      title: `📱 Subscription audit could save $${Math.max(0, subscriptionCat.monthly - 150).toLocaleString()}/month`,
      description: `You're paying $${subscriptionCat.monthly}/month across services. Most households have 3–5 forgotten subscriptions. A 30-minute audit typically frees $80–150/month.`,
      impact: `$${Math.max(0, subscriptionCat.monthly - 150).toLocaleString()}/month savings potential`,
      action: 'List every subscription, cancel anything unused for 2+ months',
      priority: 4,
      savingsPotential: Math.max(0, subscriptionCat.monthly - 150),
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}

export function analyzePurchase(
  itemName: string,
  price: number,
  downPayment: number,
  loanRate: number,
  loanTermMonths: number,
  monthlyInsurance: number,
  monthlyMaintenance: number,
  monthlyFuel: number,
  profile: UserProfile
): PurchaseAnalysis {
  const loanAmount = price - downPayment;
  const monthlyRate = loanRate / 100 / 12;

  let monthlyPayment = 0;
  if (loanAmount > 0 && monthlyRate > 0) {
    monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths))) /
      (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
  } else if (loanAmount > 0) {
    monthlyPayment = loanAmount / loanTermMonths;
  }

  const totalMonthlyCost =
    monthlyPayment + monthlyInsurance + monthlyMaintenance + monthlyFuel;
  const incomePercent = (totalMonthlyCost / profile.monthlyIncome) * 100;

  const downPaymentGrowth = projectPortfolio(
    downPayment,
    0,
    profile.expectedReturn,
    30 * 12
  );
  const paymentsGrowth = projectPortfolio(
    0,
    totalMonthlyCost,
    profile.expectedReturn,
    loanTermMonths
  );
  const totalOpportunityCost = downPaymentGrowth + paymentsGrowth;

  const currentProjection = calculateFIREProjection(profile);
  const modifiedTotalSpending = getTotalMonthlySpending(profile) + totalMonthlyCost;
  const modifiedSavings = getMonthlySavings(profile) - totalMonthlyCost;
  const modifiedFireNumber = modifiedTotalSpending * 12 * 25;
  const modifiedYears = findYearsToFIRE(
    Math.max(0, profile.currentSavings - downPayment),
    Math.max(0, modifiedSavings),
    profile.expectedReturn,
    modifiedFireNumber
  );
  const modifiedFIREAge = profile.age + modifiedYears;
  const fireDelayYears = modifiedFIREAge - currentProjection.currentFIREAge;

  const isSafe =
    profile.emergencyFund - downPayment >= getTotalMonthlySpending(profile) * 3;

  let score = 100;
  if (incomePercent > 20) score -= 35;
  else if (incomePercent > 15) score -= 20;
  else if (incomePercent > 10) score -= 8;
  if (fireDelayYears > 5) score -= 30;
  else if (fireDelayYears > 3) score -= 20;
  else if (fireDelayYears > 1) score -= 10;
  if (!isSafe) score -= 20;
  if (modifiedSavings < 500) score -= 15;
  score = Math.max(0, Math.min(100, score));

  const verdict: 'consider' | 'wait' | 'avoid' =
    score >= 70 ? 'consider' : score >= 45 ? 'wait' : 'avoid';

  const reasons: string[] = [];
  if (incomePercent > 15) {
    reasons.push(
      `Monthly cost is ${incomePercent.toFixed(0)}% of take-home pay — above the 15% guideline for major purchases`
    );
  }
  if (fireDelayYears > 0.5) {
    reasons.push(
      `This delays your FIRE date by ${fireDelayYears.toFixed(1)} year${fireDelayYears > 1.5 ? 's' : ''} (age ${currentProjection.currentFIREAge.toFixed(0)} → ${modifiedFIREAge.toFixed(0)})`
    );
  }
  if (!isSafe) {
    reasons.push(
      `Down payment would leave emergency fund below 3-month safety threshold`
    );
  }
  reasons.push(
    `Opportunity cost: $${Math.round(totalOpportunityCost).toLocaleString()} if this money were invested over 30 years instead`
  );
  if (score >= 70) {
    reasons.push('Monthly cost fits within your income constraints');
  }

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalMonthlyCost: Math.round(totalMonthlyCost),
    incomePercent,
    totalOpportunityCost: Math.round(totalOpportunityCost),
    downPaymentGrowth: Math.round(downPaymentGrowth),
    fireDelayYears,
    score,
    verdict,
    reasons,
    totalLoanCost: Math.round(monthlyPayment * loanTermMonths + downPayment),
  };
}
