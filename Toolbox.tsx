import React from 'react';
import { BookOpen, Edit3, FileText, Brain, Mic, Eye, List, MessageCircle, GraduationCap } from 'lucide-react';
import { PlanTier, ToolMode } from './types';

interface Props {
  plan: PlanTier;
  onSelectTool: (tool: ToolMode) => void;
  onUpgrade: () => void;
}

const Toolbox: React.FC<Props> = ({ plan, onSelectTool, onUpgrade }) => {
  const isFree = plan === PlanTier.FREE;

  const tools = [
    { id: ToolMode.GENERAL, name: 'General AI Tutor', desc: "Ask anything, get help instantly", icon: MessageCircle, color: 'bg-slate-100 text-slate-700', locked: false },
    { id: ToolMode.LOGIC, name: 'Step-by-Step Logic', desc: "Explains concepts logically", icon: List, color: 'bg-emerald-100 text-emerald-700', locked: isFree },
    { id: ToolMode.ENGLISH_TALKING, name: 'Learn English Talking', desc: "Practice conversation (Pro+)", icon: Mic, color: 'bg-indigo-100 text-indigo-700', locked: isFree },
    { id: ToolMode.GRAMMAR, name: 'English Vinglish', desc: "Grammar correction", icon: Edit3, color: 'bg-blue-100 text-blue-700', locked: isFree },
    { id: ToolMode.LECTURE, name: 'Lecture Hall', desc: "Deep dive topic explanations", icon: GraduationCap, color: 'bg-red-100 text-red-700', locked: isFree },
    { id: ToolMode.MOCK_TEST, name: 'Mock Test Examiner', desc: "Generate quizzes", icon: FileText, color: 'bg-pink-100 text-pink-700', locked: isFree },
    { id: ToolMode.NOTES, name: 'Kitaab-to-Notes', desc: "Summarize to bullet points", icon: BookOpen, color: 'bg-amber-100 text-amber-700', locked: isFree },
    { id: ToolMode.MEMORY, name: 'Yaad Karao', desc: "Mnemonics & rhymes", icon: Brain, color: 'bg-green-100 text-green-700', locked: isFree },
    { id: ToolMode.ESSAY, name: 'Essay Architect', desc: "Generate structured outlines", icon: Edit3, color: 'bg-purple-100 text-purple-700', locked: isFree },
    { id: ToolMode.VIVA, name: 'Viva Drill', desc: "Oral exam roleplay", icon: Mic, color: 'bg-orange-100 text-orange-700', locked: isFree },
    { id: ToolMode.VISUALIZER, name: 'Concept Visualizer', desc: "Real-world analogies", icon: Eye, color: 'bg-sky-100 text-sky-700', locked: isFree },
  ];

  return (
    <div className="pb-24 px-4 pt-6 bg-slate-50 min-h-screen">
      <div className="text-center mb-8">
        <div className="inline-block p-4 rounded-full bg-amber-100 mb-3">
            <div className="w-8 h-8 flex items-center justify-center text-amber-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Master's Toolbox</h1>
        <p className="text-slate-500">Choose a specialized tutoring mode</p>
      </div>

      <div className="space-y-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => tool.locked ? onUpgrade() : onSelectTool(tool.id)}
            className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden active:scale-[0.98] duration-100"
          >
            <div className={`p-3 rounded-xl ${tool.color}`}>
              <tool.icon size={24} />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-bold text-slate-800">{tool.name}</h3>
              <p className="text-sm text-slate-500">{tool.desc}</p>
            </div>
            
            <div className="bg-slate-100 rounded-full p-2 text-slate-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>

            {tool.locked && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-end px-4">
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  PRO
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Toolbox;
