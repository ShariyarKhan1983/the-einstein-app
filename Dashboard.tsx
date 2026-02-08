import React, { useState } from 'react';
import { CheckCircle, HelpCircle, Calendar, Plus, ChevronRight, X, Trash2, Clock, Edit2, BookOpen, ArrowRight } from 'lucide-react';
import { PlanTier, UserState, ScheduleItem, ExamItem, LearningGap } from '../types';

interface Props {
  plan: PlanTier;
  userState: UserState;
  onUpgrade: () => void;
  // Handlers
  onAddSchedule: (item: Omit<ScheduleItem, 'id' | 'completed'>) => void;
  onEditSchedule: (id: string, item: Partial<ScheduleItem>) => void;
  onToggleSchedule: (id: string) => void;
  onDeleteSchedule: (id: string) => void;
  onAddExam: (item: Omit<ExamItem, 'id'>) => void;
  onDeleteExam: (id: string) => void;
  onAddGap: (item: Omit<LearningGap, 'id'>) => void;
  onDeleteGap: (id: string) => void;
  onSolveGap: (gap: LearningGap) => void; // New Handler
}

const Dashboard: React.FC<Props> = ({ 
  plan, 
  userState, 
  onUpgrade,
  onAddSchedule,
  onEditSchedule,
  onToggleSchedule,
  onDeleteSchedule,
  onAddExam,
  onDeleteExam,
  onAddGap,
  onDeleteGap,
  onSolveGap
}) => {
  // Modal States
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showGapModal, setShowGapModal] = useState(false);
  
  // Daily Check-in State
  const [checkInState, setCheckInState] = useState<'idle' | 'cleared' | 'trouble'>('idle');
  const [troubleInput, setTroubleInput] = useState({ topic: '', subject: '' });

  // Form States
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ subject: '', time: '', location: '', color: 'indigo' });
  const [newExam, setNewExam] = useState({ title: '', date: '' });
  const [newGap, setNewGap] = useState({ topic: '', subject: '' });

  const getGreeting = () => {
     const hour = new Date().getHours();
     if (hour < 12) return "Good Morning!";
     if (hour < 18) return "Good Afternoon!";
     return "Good Evening!";
  };

  // Helper to find nearest exam
  const getNearestExam = () => {
    if (userState.exams.length === 0) return null;
    const today = new Date();
    const sorted = [...userState.exams]
      .map(e => ({ ...e, diff: new Date(e.date).getTime() - today.getTime() }))
      .filter(e => e.diff > -86400000) // Keep exams from today onwards (allow slight overlap for "today")
      .sort((a, b) => a.diff - b.diff);
    return sorted.length > 0 ? sorted[0] : null;
  };

  const nearestExam = getNearestExam();
  const daysLeft = nearestExam ? Math.ceil(nearestExam.diff / (1000 * 60 * 60 * 24)) : 0;

  // Schedule Logic
  const openAddSchedule = () => {
    setEditingScheduleId(null);
    setScheduleForm({ subject: '', time: '', location: '', color: 'indigo' });
    setShowScheduleModal(true);
  };

  const openEditSchedule = (item: ScheduleItem) => {
    setEditingScheduleId(item.id);
    setScheduleForm({ subject: item.subject, time: item.time, location: item.location, color: item.color });
    setShowScheduleModal(true);
  };

  const submitSchedule = () => {
    if (scheduleForm.subject && scheduleForm.time) {
      if (editingScheduleId) {
        onEditSchedule(editingScheduleId, scheduleForm as any);
      } else {
        onAddSchedule(scheduleForm as any);
      }
      setShowScheduleModal(false);
      setEditingScheduleId(null);
      setScheduleForm({ subject: '', time: '', location: '', color: 'indigo' });
    }
  };

  const submitExam = () => {
    if (newExam.title && newExam.date) {
      onAddExam(newExam);
      setShowExamModal(false);
      setNewExam({ title: '', date: '' });
    }
  };

  const submitGap = () => {
    if (newGap.topic && newGap.subject) {
      onAddGap(newGap);
      setShowGapModal(false);
      setNewGap({ topic: '', subject: '' });
    }
  };

  // Daily Check-in Logic
  const handleCheckIn = (status: 'cleared' | 'trouble') => {
    setCheckInState(status);
  };

  const submitTrouble = () => {
    if (troubleInput.topic) {
        onAddGap({
            topic: troubleInput.topic,
            subject: troubleInput.subject || 'General'
        });
        setCheckInState('cleared'); // Move to cleared state after adding
        setTroubleInput({ topic: '', subject: '' });
    }
  };

  return (
    <div className="pb-24 px-4 pt-6 bg-slate-50 min-h-screen relative">
      <div className="flex items-center gap-2 mb-6 justify-between">
         <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-emerald-900 rounded-lg flex items-center justify-center text-amber-400 font-bold text-lg shadow-sm">
                E
             </div>
             <div>
                <h2 className="text-xs text-slate-500 uppercase font-bold tracking-wider">The Einstein</h2>
                <p className="text-xs text-slate-400">Your Personal AI Tutor</p>
             </div>
         </div>
         {plan === PlanTier.FREE && (
            <button onClick={onUpgrade} className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-amber-600 transition-colors">
                Upgrade
            </button>
         )}
      </div>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">{getGreeting()}</h1>
      <p className="text-slate-500 mb-6">Ready to learn something amazing today?</p>

      {/* Daily Check-in */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-amber-400 mb-6 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2 text-amber-500 font-bold">
           <div className="animate-spin-slow">☀️</div> 
           <span>Daily Check-In</span>
        </div>

        {checkInState === 'idle' && (
            <>
                <p className="text-slate-600 text-sm mb-4">How was your learning today? Did you understand all your classes?</p>
                <div className="flex gap-3">
                <button onClick={() => handleCheckIn('cleared')} className="flex-1 py-2 px-4 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors">
                    <CheckCircle size={16} /> All clear!
                </button>
                <button onClick={() => handleCheckIn('trouble')} className="flex-1 py-2 px-4 rounded-lg bg-rose-50 text-rose-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors">
                    <HelpCircle size={16} /> Had trouble
                </button>
                </div>
            </>
        )}

        {checkInState === 'cleared' && (
            <div className="text-center py-2 animate-in fade-in slide-in-from-bottom-2">
                <h3 className="text-emerald-600 font-bold text-lg mb-1">Fantastic Work! 🎉</h3>
                <p className="text-slate-500 text-xs">Consistentcy is key. See you tomorrow!</p>
                <button onClick={() => setCheckInState('idle')} className="text-slate-400 text-xs mt-3 underline">Reset</button>
            </div>
        )}

        {checkInState === 'trouble' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
                <p className="text-slate-700 text-sm font-bold mb-2">What did you find difficult?</p>
                <input 
                    type="text" 
                    placeholder="e.g. Thermodynamics, Calculus..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm mb-2 outline-none focus:border-rose-400"
                    value={troubleInput.topic}
                    onChange={(e) => setTroubleInput({ ...troubleInput, topic: e.target.value })}
                />
                <input 
                    type="text" 
                    placeholder="Subject (Optional)" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm mb-3 outline-none focus:border-rose-400"
                    value={troubleInput.subject}
                    onChange={(e) => setTroubleInput({ ...troubleInput, subject: e.target.value })}
                />
                <div className="flex gap-2">
                    <button onClick={() => setCheckInState('idle')} className="flex-1 py-2 text-slate-500 text-xs font-bold">Cancel</button>
                    <button onClick={submitTrouble} className="flex-1 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600">Add to Gaps</button>
                </div>
            </div>
        )}
      </div>

      {/* Today's Schedule */}
      <div className="flex items-center justify-between mb-3">
         <h3 className="font-bold text-slate-800">Today's Schedule</h3>
         <button onClick={openAddSchedule} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200">
            <Plus size={18} className="text-slate-600" />
         </button>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
         {userState.schedule.map((item) => {
            const colors = {
                indigo: 'bg-indigo-100 text-indigo-600',
                rose: 'bg-rose-100 text-rose-600',
                teal: 'bg-teal-100 text-teal-600',
                amber: 'bg-amber-100 text-amber-600'
            };
            const theme = colors[item.color] || colors.indigo;

            return (
              <div key={item.id} className={`min-w-[150px] bg-white p-4 rounded-2xl shadow-sm border relative group transition-all ${item.completed ? 'border-emerald-400 opacity-75' : 'border-slate-100'}`}>
                  <button 
                    onClick={() => onToggleSchedule(item.id)}
                    className={`absolute top-3 right-3 transition-colors ${item.completed ? 'text-emerald-500' : 'text-slate-200 hover:text-emerald-300'}`}
                  >
                    <CheckCircle size={18} />
                  </button>
                  
                  {/* Edit & Delete Controls */}
                  <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => openEditSchedule(item)}
                        className="text-slate-400 hover:text-indigo-500"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button 
                        onClick={() => onDeleteSchedule(item.id)}
                        className="text-slate-400 hover:text-rose-500"
                    >
                        <Trash2 size={14} />
                    </button>
                  </div>

                  <div className={`w-10 h-10 ${theme} rounded-lg flex items-center justify-center mb-3`}>
                    <Clock size={20} />
                  </div>
                  <h4 className={`font-bold text-slate-700 ${item.completed ? 'line-through decoration-emerald-500' : ''}`}>{item.subject}</h4>
                  <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                  <p className="text-xs text-slate-400">{item.location}</p>
              </div>
            );
         })}
         
         {/* Add Button Card */}
         <button 
            onClick={openAddSchedule}
            className="min-w-[60px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors"
         >
             <Plus size={24} />
         </button>
      </div>

      {/* Exam Countdown */}
      <div className="flex items-center justify-between mb-3 mt-2">
         <h3 className="font-bold text-slate-800">Exam Countdown</h3>
         <button onClick={() => setShowExamModal(true)} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200">
            <Plus size={18} className="text-slate-600" />
         </button>
      </div>

      <div className="bg-emerald-900 rounded-2xl p-5 text-white flex justify-between items-center relative overflow-hidden group">
         <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-800 rounded-full blur-2xl -mr-10 -mt-10"></div>
         
         {nearestExam ? (
            <>
                <div className="z-10">
                    <p className="text-emerald-300 text-xs font-bold uppercase mb-1">Upcoming Exam</p>
                    <h3 className="text-xl font-bold">{nearestExam.title}</h3>
                    <p className="text-emerald-200 text-sm mt-1">{new Date(nearestExam.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="z-10 flex flex-col items-end">
                    <div className="bg-white/10 backdrop-blur-md rounded-full w-20 h-20 flex flex-col items-center justify-center border border-emerald-700 mb-2">
                        <span className="text-2xl font-bold text-white">{daysLeft}</span>
                        <span className="text-[10px] text-emerald-200">days left</span>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteExam(nearestExam.id); }}
                        className="text-emerald-400 hover:text-rose-400 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={12}/> Remove
                    </button>
                </div>
            </>
         ) : (
            <div className="z-10 flex flex-col items-center justify-center w-full py-4 text-emerald-300 cursor-pointer" onClick={() => setShowExamModal(true)}>
                <Calendar size={32} className="mb-2 opacity-50"/>
                <p className="font-bold">No exams added</p>
                <p className="text-xs">Tap to add an exam date</p>
            </div>
         )}
      </div>

      {/* Learning Gaps */}
      <div className="flex items-center justify-between mb-3 mt-6">
         <h3 className="font-bold text-slate-800">Learning Gaps</h3>
         <div className="flex items-center gap-2">
            <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">{userState.learningGaps.length}</span>
            <button onClick={() => setShowGapModal(true)} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200">
                <Plus size={18} className="text-slate-600" />
            </button>
         </div>
      </div>
      
      {userState.learningGaps.length > 0 ? (
        <div className="space-y-3">
            {userState.learningGaps.map(gap => (
                <div 
                  key={gap.id} 
                  className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between border-l-4 border-rose-400 group cursor-pointer hover:bg-rose-50/50 transition-colors"
                  onClick={() => onSolveGap(gap)}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-400"><X size={16}/></div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">{gap.topic}</h4>
                            <p className="text-xs text-slate-500">{gap.subject}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-full">
                           <BookOpen size={12}/> Study Now
                        </span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteGap(gap.id); }}
                            className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-all"
                            title="Mark as Mastered"
                        >
                            <CheckCircle size={20} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">Great job! No learning gaps recorded.</p>
        </div>
      )}


      {/* --- MODALS --- */}
      
      {/* Add/Edit Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">{editingScheduleId ? 'Edit Class' : 'Add Class'}</h3>
                <input 
                    type="text" placeholder="Subject (e.g. Math)" 
                    className="w-full bg-slate-50 p-3 rounded-xl mb-3 border-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={scheduleForm.subject} onChange={e => setScheduleForm({...scheduleForm, subject: e.target.value})}
                />
                <input 
                    type="time" 
                    className="w-full bg-slate-50 p-3 rounded-xl mb-3 border-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={scheduleForm.time} onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})}
                />
                <input 
                    type="text" placeholder="Location (e.g. Room 101)" 
                    className="w-full bg-slate-50 p-3 rounded-xl mb-4 border-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={scheduleForm.location} onChange={e => setScheduleForm({...scheduleForm, location: e.target.value})}
                />
                
                <div className="flex gap-2 mb-6">
                    {['indigo', 'rose', 'teal', 'amber'].map(c => (
                        <button 
                            key={c}
                            onClick={() => setScheduleForm({...scheduleForm, color: c as any})}
                            className={`w-8 h-8 rounded-full bg-${c}-400 ${scheduleForm.color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                        />
                    ))}
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setShowScheduleModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button onClick={submitSchedule} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700">
                        {editingScheduleId ? 'Save Changes' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Add Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Add Exam</h3>
                <input 
                    type="text" placeholder="Exam Name (e.g. Finals)" 
                    className="w-full bg-slate-50 p-3 rounded-xl mb-3 border-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})}
                />
                <input 
                    type="date" 
                    className="w-full bg-slate-50 p-3 rounded-xl mb-6 border-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newExam.date} onChange={e => setNewExam({...newExam, date: e.target.value})}
                />
                <div className="flex gap-3">
                    <button onClick={() => setShowExamModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button onClick={submitExam} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700">Add</button>
                </div>
            </div>
        </div>
      )}

      {/* Add Gap Modal */}
      {showGapModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Add Learning Gap</h3>
                <p className="text-sm text-slate-500 mb-4">What topic are you finding difficult?</p>
                <input 
                    type="text" placeholder="Topic (e.g. Thermodynamics)" 
                    className="w-full bg-slate-50 p-3 rounded-xl mb-3 border-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newGap.topic} onChange={e => setNewGap({...newGap, topic: e.target.value})}
                />
                <input 
                    type="text" placeholder="Subject (e.g. Physics)" 
                    className="w-full bg-slate-50 p-3 rounded-xl mb-6 border-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newGap.subject} onChange={e => setNewGap({...newGap, subject: e.target.value})}
                />
                <div className="flex gap-3">
                    <button onClick={() => setShowGapModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button onClick={submitGap} className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl shadow-lg hover:bg-rose-600">Add Gap</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;