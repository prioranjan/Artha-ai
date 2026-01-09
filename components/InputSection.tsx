
import React from 'react';
import { InvestmentMode, RiskAppetite, FundCategory, CalculationInputs } from '../types';

interface Props {
  inputs: CalculationInputs;
  setInputs: React.Dispatch<React.SetStateAction<CalculationInputs>>;
}

const InputSection: React.FC<Props> = ({ inputs, setInputs }) => {
  const handleChange = (key: keyof CalculationInputs, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
      <div className="flex p-1 bg-slate-950 rounded-lg">
        <button
          onClick={() => handleChange('mode', InvestmentMode.SIP)}
          className={`flex-1 py-2 rounded-md transition-all ${inputs.mode === InvestmentMode.SIP ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          SIP
        </button>
        <button
          onClick={() => handleChange('mode', InvestmentMode.LUMPSUM)}
          className={`flex-1 py-2 rounded-md transition-all ${inputs.mode === InvestmentMode.LUMPSUM ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          One-Time
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Fund Name</label>
        <input
          type="text"
          placeholder="e.g. Quant Small Cap Fund"
          value={inputs.fundName}
          onChange={(e) => handleChange('fundName', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          {inputs.mode === InvestmentMode.SIP ? 'Monthly Investment' : 'One-Time Investment'} (₹)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="500"
            max="100000"
            step="500"
            value={inputs.amount}
            onChange={(e) => handleChange('amount', Number(e.target.value))}
            className="flex-1 accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="min-w-[80px] text-right font-bold text-emerald-400">
            ₹{inputs.amount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Time Period (Years)</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="30"
            value={inputs.years}
            onChange={(e) => handleChange('years', Number(e.target.value))}
            className="flex-1 accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="min-w-[80px] text-right font-bold text-emerald-400">{inputs.years} Yrs</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Expected CAGR (%)</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="5"
            max="25"
            step="0.5"
            value={inputs.cagr}
            onChange={(e) => handleChange('cagr', Number(e.target.value))}
            className="flex-1 accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="min-w-[80px] text-right font-bold text-emerald-400">{inputs.cagr}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Risk Appetite</label>
          <select
            value={inputs.risk}
            onChange={(e) => handleChange('risk', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={RiskAppetite.LOW}>Low</option>
            <option value={RiskAppetite.MEDIUM}>Medium</option>
            <option value={RiskAppetite.HIGH}>High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
          <select
            value={inputs.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={FundCategory.EQUITY}>Equity</option>
            <option value={FundCategory.HYBRID}>Hybrid</option>
            <option value={FundCategory.DEBT}>Debt</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default InputSection;
