
import { CalculationInputs, CalculationResult, ProjectionPoint, RiskAppetite, InvestmentMode } from '../types';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getVolatilityFactor = (risk: RiskAppetite): number => {
  switch (risk) {
    case RiskAppetite.LOW: return 0.02;
    case RiskAppetite.MEDIUM: return 0.05;
    case RiskAppetite.HIGH: return 0.09;
    default: return 0.05;
  }
};

export const calculateReturns = (inputs: CalculationInputs): CalculationResult => {
  const { mode, amount, years, cagr, risk } = inputs;
  const vol = getVolatilityFactor(risk);
  const projections: ProjectionPoint[] = [];
  
  let totalInvestment = 0;
  
  for (let y = 0; y <= years; y++) {
    let expectedValue = 0;
    let worstCaseValue = 0;
    let bestCaseValue = 0;
    
    const r = cagr / 100;
    const rWorst = (cagr / 100) - vol;
    const rBest = (cagr / 100) + vol;

    if (mode === InvestmentMode.LUMPSUM) {
      totalInvestment = amount;
      expectedValue = amount * Math.pow(1 + r, y);
      worstCaseValue = amount * Math.pow(1 + rWorst, y);
      bestCaseValue = amount * Math.pow(1 + rBest, y);
    } else {
      // SIP Formula: FV = P × [((1+i)^n - 1) / i] × (1+i)
      // where i is monthly rate, n is total months
      const i = r / 12;
      const iWorst = rWorst / 12;
      const iBest = rBest / 12;
      const n = y * 12;
      
      totalInvestment = amount * (y * 12);
      
      if (y === 0) {
        expectedValue = 0;
        worstCaseValue = 0;
        bestCaseValue = 0;
        totalInvestment = 0;
      } else {
        expectedValue = amount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        worstCaseValue = amount * ((Math.pow(1 + iWorst, n) - 1) / iWorst) * (1 + iWorst);
        bestCaseValue = amount * ((Math.pow(1 + iBest, n) - 1) / iBest) * (1 + iBest);
      }
    }

    projections.push({
      year: y,
      investment: totalInvestment,
      expectedValue: Math.round(expectedValue),
      worstCase: Math.round(worstCaseValue),
      bestCase: Math.round(bestCaseValue)
    });
  }

  const final = projections[projections.length - 1];
  
  return {
    totalInvestment: final.investment,
    estimatedReturn: final.expectedValue,
    worstCaseReturn: final.worstCase,
    bestCaseReturn: final.bestCase,
    projections
  };
};
