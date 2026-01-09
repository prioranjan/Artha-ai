
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { CalculationResult } from '../types';
import { formatCurrency } from '../utils/calculations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement
);

interface Props {
  result: CalculationResult;
}

const Charts: React.FC<Props> = ({ result }) => {
  const lineData = {
    labels: result.projections.map((p) => `Y${p.year}`),
    datasets: [
      {
        fill: true,
        label: 'Best Case',
        data: result.projections.map((p) => p.bestCase),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        fill: false,
        label: 'Expected',
        data: result.projections.map((p) => p.expectedValue),
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.4,
      },
      {
        fill: true,
        label: 'Worst Case',
        data: result.projections.map((p) => p.worstCase),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const pieData = {
    labels: ['Investment', 'Gains'],
    datasets: [
      {
        data: [result.totalInvestment, Math.max(0, result.estimatedReturn - result.totalInvestment)],
        backgroundColor: ['#1e293b', '#10b981'],
        borderColor: ['#334155', '#10b981'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Worst Case', 'Average', 'Best Case'],
    datasets: [
      {
        label: 'Maturity Amount',
        data: [result.worstCaseReturn, result.estimatedReturn, result.bestCaseReturn],
        backgroundColor: [
          'rgba(239, 68, 68, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: { color: '#94a3b8', font: { size: 10 } },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: '#1e293b',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${formatCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { display: false } },
      y: { ticks: { color: '#64748b', font: { size: 10 }, callback: (v: any) => `₹${(v/100000).toFixed(1)}L` }, grid: { color: '#1e293b' } },
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Maturity Scenarios (Bar)</h3>
        <div className="h-[250px]">
          <Bar options={commonOptions} data={barData} />
        </div>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Compounding Growth (Line)</h3>
        <div className="h-[250px]">
          <Line options={commonOptions} data={lineData} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 w-full">Investment vs Profit</h3>
          <div className="h-[200px] w-full flex items-center justify-center">
            <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-slate-200 mb-6">Maturity Summary</h3>
          <div className="space-y-4">
            <div className="group transition-all">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-1">Total Invested</div>
              <div className="text-xl font-bold text-slate-300">{formatCurrency(result.totalInvestment)}</div>
            </div>
            <div className="h-px bg-slate-800 w-full my-2"></div>
            <div className="group transition-all">
              <div className="flex justify-between text-[10px] text-emerald-500 uppercase font-bold mb-1">Estimated Gains</div>
              <div className="text-xl font-bold text-emerald-400">{formatCurrency(result.estimatedReturn - result.totalInvestment)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
