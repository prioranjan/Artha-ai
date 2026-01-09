
import React, { useState, useEffect } from 'react';
import { CalculationInputs, InvestmentMode, RiskAppetite, FundCategory, CalculationResult, AIAnalysis } from './types';
import { calculateReturns, formatCurrency } from './utils/calculations';
import { getAIAnalysis, analyzeScreenshot } from './services/geminiService';
import { resizeImage } from './utils/image';
import InputSection from './components/InputSection';
import Charts from './components/Charts';
import { TrendingUp, Camera, Sparkles, AlertCircle, RefreshCw, CheckCircle2, IndianRupee } from 'lucide-react';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculationInputs>({
    mode: InvestmentMode.SIP,
    fundName: '',
    amount: 5000,
    years: 10,
    cagr: 12,
    risk: RiskAppetite.MEDIUM,
    category: FundCategory.EQUITY
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrSuccess, setOcrSuccess] = useState<boolean>(false);

  useEffect(() => {
    const res = calculateReturns(inputs);
    setResult(res);
  }, [inputs]);

  const handleAiUpdate = async () => {
    setIsAiLoading(true);
    try {
      const analysis = await getAIAnalysis(inputs);
      setAiAnalysis(analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    setOcrError(null);
    setOcrSuccess(false);

    try {
      const { base64, mimeType } = await resizeImage(file, 1024);
      const data = await analyzeScreenshot(base64, mimeType);
      
      if (data.amount || data.cagr || data.fundName) {
        setInputs(prev => ({
          ...prev,
          fundName: data.fundName || prev.fundName,
          amount: data.amount || prev.amount,
          cagr: data.cagr || prev.cagr
        }));
        setOcrSuccess(true);
        setTimeout(() => setOcrSuccess(false), 3000);
      } else {
        setOcrError("Details not found. Try a clearer shot of NAV/Gains.");
      }
    } catch (err: any) {
      console.error("OCR Flow Error:", err);
      setOcrError(err.message || "Failed to scan screenshot.");
    } finally {
      setIsOcrLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24 selection:bg-emerald-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">ArthaAI</h1>
            <p className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold mt-1">MF Wealth Engine</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative">
            <input type="file" id="screenshot-upload" className="hidden" accept="image/*" onChange={handleFileUpload} />
            <label
              htmlFor="screenshot-upload"
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 transition-all rounded-full text-xs font-medium cursor-pointer border ${isOcrLoading ? 'bg-slate-700 border-slate-600' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'}`}
            >
              {isOcrLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <Camera className="w-4 h-4 text-emerald-400" />
              )}
              <span className="hidden sm:inline">{isOcrLoading ? 'Scanning...' : 'Scan NAV'}</span>
            </label>
          </div>
        </div>
      </header>

      {/* Dynamic Feedback Overlay */}
      {(ocrError || ocrSuccess) && (
        <div className="fixed top-20 right-6 left-6 z-[60] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          {ocrError && <div className="max-w-md mx-auto p-3 bg-red-900/80 border border-red-500/50 backdrop-blur-md rounded-xl text-xs text-red-100 flex items-center gap-2 shadow-2xl"><AlertCircle className="w-4 h-4" /> {ocrError}</div>}
          {ocrSuccess && <div className="max-w-md mx-auto p-3 bg-emerald-900/80 border border-emerald-500/50 backdrop-blur-md rounded-xl text-xs text-emerald-100 flex items-center gap-2 shadow-2xl"><CheckCircle2 className="w-4 h-4" /> Portfolio data synced!</div>}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-12 gap-8">
        <section className="lg:col-span-4 space-y-6">
          <InputSection inputs={inputs} setInputs={setInputs} />
          
          <div className="p-6 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl shadow-2xl shadow-emerald-950/40 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
              <IndianRupee className="w-32 h-32" />
            </div>
            <p className="text-xs font-bold text-emerald-100/70 mb-1 uppercase tracking-wider">Maturity Estimation</p>
            <h2 className="text-4xl font-black text-white mb-4 drop-shadow-md">
              {result ? formatCurrency(result.estimatedReturn) : '₹0'}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold bg-black/20 w-fit px-2 py-1 rounded-md backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3 h-3 text-emerald-200" />
              <span className="text-emerald-50 text-opacity-90 tracking-tighter">AI-POWERED PROJECTION</span>
            </div>
          </div>

          <button
            onClick={handleAiUpdate}
            disabled={isAiLoading}
            className="w-full py-4 px-6 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-2xl transition-all active:scale-[0.97] shadow-xl flex items-center justify-center gap-3"
          >
            {isAiLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-emerald-600" />
            )}
            ANALYZE WITH AI
          </button>
        </section>

        <section className="lg:col-span-8 space-y-8">
          {result && <Charts result={result} />}

          {/* AI Content Section */}
          <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800/50 backdrop-blur-sm relative overflow-hidden ring-1 ring-slate-800">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-2 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
              Smart Recommendation Engine
            </h3>
            
            <p className="text-slate-300 leading-relaxed italic text-lg mb-8 font-medium">
              {aiAnalysis?.explanation || "Market ka haal hamesha badalta rehta hai, isliye humne aapko ek estimated range di hai. Low risks ke saath consistent growth khub bhalo approach hai."}
            </p>

            {aiAnalysis ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="grid md:grid-cols-3 gap-5">
                  {aiAnalysis.recommendations.map((rec, i) => (
                    <div key={i} className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl hover:border-emerald-500/40 transition-all hover:translate-y-[-4px] group shadow-lg">
                      <div className="text-[10px] font-black text-emerald-500 mb-2 group-hover:tracking-widest transition-all uppercase">{rec.type}</div>
                      <div className="font-bold text-slate-100 text-base mb-3 leading-tight">{rec.name}</div>
                      <div className="flex justify-between items-end mb-4">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Target CAGR</div>
                        <div className="text-emerald-400 font-black text-lg">{rec.cagr}</div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal border-t border-slate-800 pt-3">{rec.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-600 text-center">
                <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">Click "Analyze with AI" to see tailored <br/> India-specific fund recommendations.</p>
              </div>
            )}
          </div>

          <footer className="p-6 bg-slate-950/40 rounded-2xl border border-slate-900 flex gap-4 items-start">
            <AlertCircle className="w-5 h-5 text-slate-600 shrink-0 mt-1" />
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Regulatory Disclaimer</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Mutual fund investments are subject to market risks. Please read all scheme related documents carefully before investing. 
                Values shown are simulated projections and do not guarantee future returns. ArthaAI uses LLM-based logic for estimations.
              </p>
            </div>
          </footer>
        </section>
      </main>

      {/* Mobile Fixed CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 flex gap-4 z-50">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/30 text-sm tracking-tight transition-transform active:scale-95"
        >
          RE-CALCULATE
        </button>
        <button 
          onClick={handleAiUpdate}
          disabled={isAiLoading}
          className="flex-1 py-4 bg-slate-100 hover:bg-white text-slate-950 font-black rounded-2xl flex justify-center items-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
        >
          {isAiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          AI ADVICE
        </button>
      </div>
    </div>
  );
};

export default App;
