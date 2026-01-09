
export enum InvestmentMode {
  SIP = 'SIP',
  LUMPSUM = 'LUMPSUM'
}

export enum RiskAppetite {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum FundCategory {
  EQUITY = 'EQUITY',
  HYBRID = 'HYBRID',
  DEBT = 'DEBT'
}

export interface CalculationInputs {
  mode: InvestmentMode;
  fundName: string;
  amount: number;
  years: number;
  cagr: number;
  risk: RiskAppetite;
  category: FundCategory;
}

export interface ProjectionPoint {
  year: number;
  investment: number;
  expectedValue: number;
  worstCase: number;
  bestCase: number;
}

export interface CalculationResult {
  totalInvestment: number;
  estimatedReturn: number;
  worstCaseReturn: number;
  bestCaseReturn: number;
  projections: ProjectionPoint[];
}

export interface Recommendation {
  name: string;
  type: string;
  cagr: string;
  risk: string;
  explanation: string;
}

export interface AIAnalysis {
  explanation: string;
  recommendations: Recommendation[];
}
