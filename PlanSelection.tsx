import React, { useState } from 'react';
import { PlanTier } from '../types';
import { Check, X, Zap, Star, User, Loader2, CreditCard, BookOpen, Mic, Eye, Brain, Edit3, List, MessageCircle, FileText, Volume2, Lock, Video } from 'lucide-react';

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
        {/* Basic Plan */}
        <div className={`bg-white rounded-2xl shadow-sm border-2 ${currentPlan === PlanTier.FREE ? 'border-slate-400' : 'border-transparent'} p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-slate-200 p-2 rounded-full"><User size={20} className="text-slate-600"/></div>
            <h2 className="text-xl font-bold text-slate-800">Basic</h2>
          </div>
          <p className="text-slate-500 mb-4 text-sm">The Trial</p>
          <div className="text-slate-800 font-bold text-xl mb-4">Free</div>
          
          <div className="space-y-2 text-sm text-slate-700">
             <p className="flex items-center gap-2"><span className="text-slate-400">🎙️</span> Robotic Voice</p>
             <p className="flex items-center gap-2"><span className="text-slate-400">📷</span> 3 images/day</p>
             <p className="flex items-center gap-2"><span className="text-slate-400">💬</span> <strong>20 msgs</strong> / day</p>
             <p className="flex items-center gap-2"><X size={16} className="text-slate-400"/> No Chat History</p>
          </div>
          
          {currentPlan !== PlanTier.FREE && (
             <button onClick={() => handleUpgradeClick(PlanTier.FREE)} className="w-full mt-6 py-3 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50">Downgrade</button>
          )}
        </div>

        {/* Pro Plan (The Serious Student) */}
        <div className={`bg-white rounded-3xl shadow-xl border-4 ${currentPlan === PlanTier.PRO ? 'border-amber-500' : 'border-amber-400'} p-0 relative overflow-hidden transform transition-all`}>
          {currentPlan === PlanTier.PRO && <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-1 text-sm font-bold rounded-bl-xl z-20">Current Plan</div>}
          
          {/* Header */}
          <div className="bg-amber-50 p-6 border-b border-amber-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-100 p-3 rounded-full"><Star size={24} className="text-amber-600"/></div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide">PRO <span className="text-amber-600 text-lg font-bold normal-case">(The Serious Student)</span></h2>
                </div>
              </div>
              <p className="text-slate-600 font-medium text-sm">The complete experience. 80% of students need this.</p>
              <div className="text-amber-600 font-extrabold text-3xl mt-4">₹1,000 <span className="text-sm text-slate-400 font-normal">/ Month</span></div>
          </div>

          <div className="p-6 space-y-6">
             
             {/* Digital Diary */}
             <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2"><BookOpen size={18}/> The Digital Diary: <span className="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full">ACTIVE</span></h3>
                <ul className="space-y-2 text-sm text-slate-700 ml-1">
                    <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 mt-0.5"/> <span><strong>Time-Table:</strong> Zil knows your subjects.</span></li>
                    <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 mt-0.5"/> <span><strong>Daily Log:</strong> Asks "What did you learn today?" and keeps a record.</span></li>
                </ul>
             </div>

             {/* Voice Features */}
             <div>
                <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">Voice Features</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2"><Check size={16} className="text-indigo-500 mt-0.5"/> <span><strong>Voice Input:</strong> 900 Minutes / Month (~30 mins/day).</span></li>
                    <li className="flex items-start gap-2"><Check size={16} className="text-indigo-500 mt-0.5"/> <span><strong>Voice Output:</strong> Natural Human Voice (WaveNet).</span></li>
                </ul>
             </div>

             {/* Usage Limits */}
             <div>
                <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">Usage Limits (The Power Pack)</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2"><Check size={16} className="text-amber-500 mt-0.5"/> <span><strong>Vision:</strong> 1,500 Images / Month (50/Day).</span></li>
                    <li className="flex items-start gap-2"><Check size={16} className="text-amber-500 mt-0.5"/> <span><strong>PDF Upload:</strong> 5 Files / Month (Max 20 pages/file).</span></li>
                    <li className="flex items-start gap-2"><Check size={16} className="text-amber-500 mt-0.5"/> <span><strong>App Work:</strong> Unlimited (Timetable, Logs, Notifications).</span></li>
                </ul>
             </div>

             {/* The Toolbox */}
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Zap size={18} className="text-amber-500"/> The Toolbox (UNLOCKED)</h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                    {[
                        { name: "General AI Tutor", desc: "Ask anything, get help instantly" },
                        { name: "Step-by-Step Logic", desc: "Explains concepts logically" },
                        { name: "Learn English Talking", desc: "Practice conversation (Pro+)" },
                        { name: "English Vinglish", desc: "Grammar correction" },
                        { name: "Mock Test Examiner", desc: "Generate quizzes" },
                        { name: "Kitaab-to-Notes", desc: "Summarize to bullet points" },
                        { name: "Yaad Karao", desc: "Mnemonics & rhymes" },
                        { name: "Essay Architect", desc: "Generate structured outlines" },
                        { name: "Viva Drill", desc: "Oral exam roleplay" },
                        { name: "Concept Visualizer", desc: "Real-world analogies" },
                    ].map((tool, i) => (
                        <div key={i} className="flex items-start gap-2">
                             <div className="min-w-[4px] h-4 bg-emerald-500 rounded-full mt-1"></div>
                             <div>
                                 <span className="font-bold text-slate-800">{tool.name}</span>
                                 <p className="text-xs text-slate-500">{tool.desc}</p>
                             </div>
                        </div>
                    ))}
                </div>
             </div>

             <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">ADS: NONE</p>

          </div>

          {currentPlan !== PlanTier.PRO && (
             <div className="p-6 pt-0">
                <button onClick={() => handleUpgradeClick(PlanTier.PRO)} className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-lg shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-[1.02]">
                    {currentPlan === PlanTier.ULTRA ? "Switch to Pro" : "Upgrade to Pro"}
                </button>
             </div>
          )}
        </div>

        {/* Ultra Plan (Larger Than Life) */}
        <div className={`bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 rounded-3xl shadow-2xl border-4 ${currentPlan === PlanTier.ULTRA ? 'border-amber-400' : 'border-emerald-800'} p-0 text-white transform transition-all hover:scale-[1.01] relative overflow-hidden`}>
          {currentPlan === PlanTier.ULTRA && <div className="absolute top-0 right-0 bg-amber-400 text-slate-900 px-4 py-1 text-sm font-bold rounded-bl-xl z-20">Current</div>}
          
          {/* Decorative Glow */}
          <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-amber-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

          {/* Header */}
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
                <h3 className="text-amber-400 font-bold text-sm tracking-widest uppercase mb-4 border-b border-white/10 pb-2">📦 PART 1: THE FOUNDATION <span className="text-emerald-400 text-[10px] normal-case tracking-normal ml-1">(Premium Teaching Core)</span></h3>
                <p className="text-xs text-slate-400 mb-4 italic">The most advanced teaching experience available.</p>
                <ul className="space-y-4 text-sm text-emerald-100">
                    <li className="flex gap-3">
                        <Volume2 size={18} className="text-amber-400 shrink-0 mt-0.5"/>
                        <div>
                            <strong className="text-white block">The Human AI Voice (WaveNet)</strong>
                            <span className="text-slate-300 text-xs">Learning feels natural, not robotic. The AI speaks with a clear, realistic human tone.</span>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <Brain size={18} className="text-amber-400 shrink-0 mt-0.5"/>
                        <div>
                            <strong className="text-white block">Adaptive Teaching Style (EQ)</strong>
                            <span className="text-slate-300 text-xs">Detects struggle and switches methods—from definitions to real-world examples instantly.</span>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <BookOpen size={18} className="text-amber-400 shrink-0 mt-0.5"/>
                        <div>
                            <strong className="text-white block">Unlimited Syllabus Memory</strong>
                            <span className="text-slate-300 text-xs">Upload textbooks & PDFs. The AI reads your exact book and teaches strictly from your curriculum.</span>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <Lock size={18} className="text-amber-400 shrink-0 mt-0.5"/>
                        <div>
                            <strong className="text-white block">Curriculum Lock</strong>
                            <span className="text-slate-300 text-xs">Ensures exam-oriented preparation. Never teaches out-of-syllabus unless asked.</span>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <Zap size={18} className="text-amber-400 shrink-0 mt-0.5"/>
                        <div>
                            <strong className="text-white block">The Master’s Toolbox (Unlocked)</strong>
                            <span className="text-slate-300 text-xs">Full access to Logic Solvers, Grammar Correction, and Note Generators.</span>
                        </div>
                    </li>
                </ul>
             </div>

             {/* PART 2 */}
             <div>
                <h3 className="text-amber-400 font-bold text-sm tracking-widest uppercase mb-4 border-b border-white/10 pb-2">🎥 PART 2: EXCLUSIVE INPUTS <span className="text-emerald-400 text-[10px] normal-case tracking-normal ml-1">(Video & Vision)</span></h3>
                <p className="text-xs text-slate-400 mb-4 italic">Use any study material—Text, Audio, or Video.</p>
                <ul className="space-y-4 text-sm text-emerald-100">
                    <li className="flex gap-3">
                        <div className="bg-amber-500/20 p-1 rounded text-amber-400"><Video size={16}/></div>
                        <div>
                            <strong className="text-white block">Video Analysis <span className="text-amber-400 text-[10px] uppercase">(The Killer Feature)</span></strong>
                            <span className="text-slate-300 text-xs">Upload a video (up to 30 mins) of a class or experiment. The AI watches and re-explains it simply.</span>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <div className="bg-amber-500/20 p-1 rounded text-amber-400"><Eye size={16}/></div>
                        <div>
                            <strong className="text-white block">Unlimited Vision Scanner</strong>
                            <span className="text-slate-300 text-xs">Scan entire question papers (100+ pages). AI reads and solves every page.</span>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <div className="bg-amber-500/20 p-1 rounded text-amber-400"><Mic size={16}/></div>
                        <div>
                            <strong className="text-white block">Unlimited Voice Notes</strong>
                            <span className="text-slate-300 text-xs">Record long audio questions or lectures. AI listens and summarizes key points.</span>
                        </div>
                    </li>
                </ul>
             </div>

             {/* PART 3 */}
             <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-amber-400 font-bold text-sm tracking-widest uppercase mb-2">🧠 PART 3: THE DEEP THINK CORE</h3>
                <p className="text-xs text-emerald-300 mb-3 font-medium">For complex problems where standard AI fails.</p>
                <ul className="space-y-3 text-sm text-emerald-100">
                    <li className="flex gap-3 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2"></div>
                        <div>
                            <strong className="text-white">Deep Think Mode:</strong> <span className="text-slate-300 text-xs">Advanced reasoning for Class 11-12 Physics, Organic Chemistry, & Math derivations.</span>
                        </div>
                    </li>
                    <li className="flex gap-3 items-start">
                         <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2"></div>
                         <div>
                            <strong className="text-white">Chain of Thought Validation:</strong> <span className="text-slate-300 text-xs">The AI does not just guess; it reasons.</span>
                        </div>
                    </li>
                </ul>
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