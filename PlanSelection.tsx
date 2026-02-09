import React, { useState } from 'react';
import { PlanTier } from './types';
import { Check, X, Zap, Star, User, Loader2, BookOpen, Mic, Eye, Brain, Video, Volume2, Lock, FileText } from 'lucide-react';

interface Props {
  currentPlan: PlanTier;
  onSelectPlan: (plan: PlanTier) => void;
  onClose: () => void;
}

const PlanSelection: React.FC<Props> = ({ currentPlan, onSelectPlan, onClose }) => {
  const [processingPlan, setProcessingPlan] = useState<PlanTier | null>(null);

  const handleUpgradeClick = (plan: PlanTier) => {
    if (plan === PlanTier.FREE) {
        onSelectPlan(plan);
        return;
    }
    setProcessingPlan(plan);
    setTimeout(() => {
        onSelectPlan(plan);
        setProcessingPlan(null);
    }, 2000); 
  };

  return (
    <div className="fixed inset-0 bg-slate-100 z-50 overflow-y-auto pb-20">
      
      {processingPlan && (
         <div className="fixed inset-0 bg-black/60 z-[60] flex flex-col items-center justify-center text-white backdrop-blur-sm">
             <Loader2 size={48} className="animate-spin mb-4 text-emerald-400" />
             <h3 className="text-xl font-bold">Processing...</h3>
         </div>
      )}

      <div className="bg-emerald-900 p-6 text-center shadow-lg sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-amber-400">Unlock Genius Mode</h1>
        <p className="text-emerald-200 text-sm">Choose the best brain for you</p>
        <button onClick={onClose} className="absolute top-4 right-4 text-emerald-100 hover:text-white"><X size={24} /></button>
      </div>

      <div className="p-4 space-y-8 max-w-2xl mx-auto mt-4">
        
        {/* === BASIC PLAN === */}
        <div className={`bg-white rounded-2xl shadow-sm border-2 ${currentPlan === PlanTier.FREE ? 'border-slate-400' : 'border-transparent'} p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-slate-200 p-2 rounded-full"><User size={20} className="text-slate-600"/></div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Basic</h2>
                <p className="text-xs text-slate-500 uppercase font-bold">The Trial</p>
            </div>
          </div>
          <div className="text-slate-800 font-bold text-3xl mb-4">Free</div>
          
          <div className="space-y-3 text-sm text-slate-700">
             <p className="flex items-center gap-2"><span className="text-xl">🎙️</span> Robotic Voice</p>
             <p className="flex items-center gap-2"><span className="text-xl">📷</span> 3 images/day</p>
             <p className="flex items-center gap-2"><span className="text-xl">💬</span> <strong>20 msgs</strong> / day</p>
             <p className="flex items-center gap-2"><X size={16} className="text-rose-500"/> No Chat History</p>
          </div>
          
          {currentPlan !== PlanTier.FREE && (
             <button onClick={() => handleUpgradeClick(PlanTier.FREE)} className="w-full mt-6 py-3 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50">Downgrade</button>
          )}
        </div>

        {/* === PRO PLAN === */}
        <div className={`bg-white rounded-3xl shadow-xl border-4 ${currentPlan === PlanTier.PRO ? 'border-amber-500' : 'border-amber-400'} p-0 relative overflow-hidden transform transition-all`}>
          {currentPlan === PlanTier.PRO && <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-1 text-sm font-bold rounded-bl-xl z-20">Current Plan</div>}
          
          {/* Header */}
          <div className="bg-amber-50 p-6 border-b border-amber-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-100 p-3 rounded-full"><Star size={24} className="text-amber-600"/></div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide">PRO</h2>
                    <p className="text-amber-600 font-bold text-sm">(The Serious Student)</p>
                </div>
              </div>
              <p className="text-slate-600 font-medium text-sm">The complete experience. 80% of students need this.</p>
              <div className="text-amber-600 font-extrabold text-3xl mt-4">₹1,000 <span className="text-sm text-slate-400 font-normal">/ Month</span></div>
          </div>

          <div className="p-6 space-y-6">
              
              {/* Features List */}
              <div className="space-y-4">
                 <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <h3 className="font-bold text-emerald-800 text-sm mb-1 flex items-center gap-2"><BookOpen size={16}/> The Digital Diary: <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 rounded-full">ACTIVE</span></h3>
                    <ul className="text-xs text-emerald-700 ml-6 list-disc">
                        <li><strong>Time-Table:</strong> Zil knows your subjects.</li>
                        <li><strong>Daily Log:</strong> Keeps a record of learning.</li>
                    </ul>
                 </div>

                 <div className="text-sm text-slate-700 space-y-2">
                    <p className="font-bold border-b border-slate-100 pb-1">Text & Chat Features</p>
                    <p className="flex items-center gap-2"><Check size={16} className="text-amber-500"/> AI Chat: Unlimited Messages</p>

                    <p className="font-bold border-b border-slate-100 pb-1 pt-2">Voice Features</p>
                    <p className="flex items-center gap-2"><Check size={16} className="text-amber-500"/> Input: 900 Mins/Month (~30m/day)</p>
                    <p className="flex items-center gap-2"><Check size={16} className="text-amber-500"/> Output: 900 Mins/Month</p>

                    <p className="font-bold border-b border-slate-100 pb-1 pt-2">Usage Limits (Power Pack)</p>
                    <p className="flex items-center gap-2"><Check size={16} className="text-amber-500"/> Vision: 1,500 Images/Month (50/day)</p>
                    <p className="flex items-center gap-2"><Check size={16} className="text-amber-500"/> PDF: 5 Files/Month (20 pgs/file)</p>
                 </div>
              </div>

              {/* Toolbox */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Zap size={18} className="text-amber-500"/> The Toolbox (UNLOCKED)</h3>
                 <div className="grid grid-cols-1 gap-2 text-xs">
                    {[
                        "General AI Tutor: Ask anything instantly",
                        "Step-by-Step Logic: Explains logically",
                        "Learn English Talking: Practice conversation",
                        "English Vinglish: Grammar correction",
                        "Mock Test Examiner: Generate quizzes",
                        "Kitaab-to-Notes: Summarize to bullets",
                        "Yaad Karao: Mnemonics & rhymes",
                        "Essay Architect: Structured outlines",
                        "Viva Drill: Oral exam roleplay",
                        "Concept Visualizer: Real-world analogies"
                    ].map((tool, i) => (
                        <div key={i} className="flex items-start gap-2">
                             <div className="min-w-[4px] h-4 bg-emerald-500 rounded-full mt-0.5"></div>
                             <span className="text-slate-600">{tool}</span>
                        </div>
                    ))}
                 </div>
                 <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest mt-4">ADS: NONE</p>
              </div>

              {/* Verdict Table */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <h3 className="text-center font-bold text-amber-800 mb-2 text-sm">🎯 Verdict: Perfect for Commerce & Arts</h3>
                  <p className="text-xs text-center text-amber-700 mb-3">Students who need explanations, theory, and business logic.</p>
                  
                  <div className="space-y-2">
                      {[
                          { class: "Class 5 - 10", sub: "All Subjects", ver: "✅ Perfect" },
                          { class: "11-12 Commerce", sub: "Business, Eco, Eng", ver: "✅ Perfect" },
                          { class: "11-12 Arts", sub: "Hist, Pol Sci, Psych", ver: "✅ Perfect" },
                          { class: "B.Com / B.B.A", sub: "Marketing, HR, Law", ver: "✅ Perfect" },
                          { class: "B.A.", sub: "Eng Lit, History", ver: "✅ Perfect" },
                      ].map((row, i) => (
                          <div key={i} className="flex justify-between text-[10px] border-b border-amber-200 pb-1 last:border-0">
                              <span className="font-bold text-slate-700 w-1/3">{row.class}</span>
                              <span className="text-slate-500 w-1/3 text-center">{row.sub}</span>
                              <span className="text-emerald-600 font-bold w-1/3 text-right">{row.ver}</span>
                          </div>
                      ))}
                  </div>
              </div>

          </div>

          {currentPlan !== PlanTier.PRO && (
             <div className="p-6 pt-0">
                <button onClick={() => handleUpgradeClick(PlanTier.PRO)} className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-lg shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-[1.02]">
                    {currentPlan === PlanTier.ULTRA ? "Switch to Pro" : "Upgrade to Pro"}
                </button>
             </div>
          )}
        </div>

        {/* === ULTRA PLAN === */}
        <div className={`bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 rounded-3xl shadow-2xl border-4 ${currentPlan === PlanTier.ULTRA ? 'border-amber-400' : 'border-emerald-800'} p-0 text-white transform transition-all hover:scale-[1.01] relative overflow-hidden`}>
          {currentPlan === PlanTier.ULTRA && <div className="absolute top-0 right-0 bg-amber-400 text-slate-900 px-4 py-1 text-sm font-bold rounded-bl-xl z-20">Current</div>}
          
          <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-amber-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

          <div className="p-8 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-amber-500 p-3 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"><Zap size={28} className="text-white"/></div>
                <div>
                    <h2 className="text-3xl font-black text-amber-400 tracking-wide">ULTRA</h2>
                    <p className="text-emerald-200 text-sm font-medium">The Advanced Brain & Academic Manager</p>
                </div>
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">₹2,000</span>
                  <span className="text-slate-400 font-normal">/ month</span>
              </div>
          </div>

          <div className="p-6 space-y-8 relative z-10">

             {/* PART 1 */}
             <div>
                <h3 className="text-amber-400 font-bold text-sm tracking-widest uppercase mb-4 border-b border-white/10 pb-2">📦 PART 1: THE FOUNDATION</h3>
                <ul className="space-y-4 text-sm text-emerald-100">
                    <li className="flex gap-3">
                        <Volume2 size={18} className="text-amber-400 shrink-0"/>
                        <div><strong className="text-white block">The Human AI Voice</strong><span className="text-slate-300 text-xs">Natural, realistic human tone.</span></div>
                    </li>
                    <li className="flex gap-3">
                        <Brain size={18} className="text-amber-400 shrink-0"/>
                        <div><strong className="text-white block">Adaptive Teaching Style (EQ)</strong><span className="text-slate-300 text-xs">Detects struggle and switches methods.</span></div>
                    </li>
                    <li className="flex gap-3">
                        <Lock size={18} className="text-amber-400 shrink-0"/>
                        <div><strong className="text-white block">Curriculum Lock</strong><span className="text-slate-300 text-xs">Strictly exam-oriented.</span></div>
                    </li>
                    <li className="flex gap-3">
                        <Zap size={18} className="text-amber-400 shrink-0"/>
                        <div><strong className="text-white block">Master’s Toolbox (Unlocked)</strong><span className="text-slate-300 text-xs">Full access to all tools.</span></div>
                    </li>
                </ul>
             </div>

             {/* PART 2 */}
             <div>
                <h3 className="text-amber-400 font-bold text-sm tracking-widest uppercase mb-4 border-b border-white/10 pb-2">🎥 PART 2: EXCLUSIVE INPUTS</h3>
                <ul className="space-y-4 text-sm text-emerald-100">
                    <li className="flex gap-3">
                        <Video size={18} className="text-amber-400 shrink-0"/>
                        <div><strong className="text-white block">Video Analysis (Advanced)</strong><span className="text-slate-300 text-xs">Upload 30 min video. AI re-explains it.</span></div>
                    </li>
                    <li className="flex gap-3">
                        <Eye size={18} className="text-amber-400 shrink-0"/>
                        <div><strong className="text-white block">Unlimited Vision Scanner</strong><span className="text-slate-300 text-xs">Scan 100+ pages. AI explains every page.</span></div>
                    </li>
                    <li className="flex gap-3">
                        <FileText size={18} className="text-amber-400 shrink-0"/>
                        <div><strong className="text-white block">Unlimited PDF Upload</strong><span className="text-slate-300 text-xs">Upload full textbooks.</span></div>
                    </li>
                </ul>
             </div>

             {/* PART 3 */}
             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-amber-400 font-bold text-sm tracking-widest uppercase mb-2">🧠 PART 3: DEEP REASONING</h3>
                <p className="text-xs text-emerald-300 mb-3 font-medium">For complex problems (Physics, Organic Chem, Math).</p>
                <p className="text-white text-sm">The AI does not just guess; it reasons step-by-step.</p>
             </div>

             {/* Usage Limits */}
             <div className="text-sm text-emerald-100 space-y-2 border-t border-white/10 pt-4">
                 <p className="font-bold text-amber-400 mb-2">Ultra Limits:</p>
                 <p>• Voice Input: <strong>3,600 Mins</strong> / Month (~2 hrs/day)</p>
                 <p>• Voice Output: <strong>40 Hours</strong> / Month</p>
                 <p>• AI Chat: Unlimited</p>
             </div>

             {/* Verdict Table */}
             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-center font-bold text-amber-400 mb-2 text-sm">🎯 Verdict: BECOME A GENIUS</h3>
                  <p className="text-xs text-center text-slate-300 mb-3">Future Engineers, Doctors, Coders, Scientists.</p>
                  
                  <div className="space-y-2">
                      {[
                          { class: "11-12 Science", sub: "PCM / PCB (JEE/NEET)", ver: "✅ Perfect" },
                          { class: "B.C.A / B.Sc IT", sub: "Coding, Data Struct", ver: "✅ Perfect" },
                          { class: "B.Tech", sub: "Thermo, Circuits", ver: "✅ Perfect" },
                          { class: "CA / CS", sub: "Adv. Tax, Auditing", ver: "✅ Perfect" },
                      ].map((row, i) => (
                          <div key={i} className="flex justify-between text-[10px] border-b border-white/10 pb-1 last:border-0">
                              <span className="font-bold text-white w-1/3">{row.class}</span>
                              <span className="text-slate-400 w-1/3 text-center">{row.sub}</span>
                              <span className="text-emerald-400 font-bold w-1/3 text-right">{row.ver}</span>
                          </div>
                      ))}
                  </div>
              </div>

          </div>

          {currentPlan !== PlanTier.ULTRA && (
             <div className="p-8 pt-0">
               <button onClick={() => handleUpgradeClick(PlanTier.ULTRA)} className="w-full py-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-black text-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                 <Zap size={24} fill="currentColor" /> BECOME A GENIUS
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;
