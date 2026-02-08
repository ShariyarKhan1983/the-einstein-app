import React, { useState } from 'react';
import { PlanTier, UserState, Language } from '../types';
import { User, ChevronRight, LogOut, Calendar, Globe, Bell, Edit2, Check, X, Clock, ShieldCheck } from 'lucide-react';
import LegalModal from './LegalModal';

interface Props {
  user: UserState;
  onUpgrade: () => void;
  onUpdateUser: (updates: Partial<UserState>) => void;
  onLogout: () => void;
  onDownloadReport: (id: string) => void;
  onNavigateToSchedule: () => void;
}

const Profile: React.FC<Props> = ({ user, onUpgrade, onUpdateUser, onLogout, onDownloadReport, onNavigateToSchedule }) => {
  const isFree = user.plan === PlanTier.FREE;
  const isUltra = user.plan === PlanTier.ULTRA;
  const isPro = user.plan === PlanTier.PRO;
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: user.name, studentClass: user.studentClass, schoolName: user.schoolName });
  const [showLegal, setShowLegal] = useState(false);

  // Limits
  const imgLimit = isFree ? 3 : (isUltra ? 100 : 50);
  const videoLimit = 20;
  const pdfLimit = isPro ? 5 : (isUltra ? 999 : 0);
  const voiceInLimit = isPro ? 900 : (isUltra ? 9999 : 10);
  const msgLimit = 20; // Free Plan Only

  const languages: Language[] = ['English', 'Hinglish', 'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'];

  return (
    <div className="pb-24 px-4 pt-0 bg-slate-50 min-h-screen relative">
      <div className={`-mx-4 px-6 pt-12 pb-8 rounded-b-3xl ${isUltra ? 'bg-emerald-900' : 'bg-emerald-800'} text-white text-center relative`}>
        {!isEditing && (
          <button onClick={() => { setEditForm({ name: user.name, studentClass: user.studentClass, schoolName: user.schoolName }); setIsEditing(true); }} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <Edit2 size={16} className="text-white" />
          </button>
        )}
        <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center relative">
          <User size={40} className="text-slate-800" />
          <div className="absolute -bottom-2 px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500 text-white">{user.plan}</div>
        </div>

        {isEditing ? (
          <div className="space-y-2 mb-4 max-w-[240px] mx-auto">
             <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="block w-full text-center text-slate-900 rounded-lg py-1 px-2 font-bold outline-none" />
             <div className="flex justify-center gap-2 mt-2">
                <button onClick={() => setIsEditing(false)} className="bg-white/20 p-1 rounded-full"><X size={20}/></button>
                <button onClick={() => { onUpdateUser(editForm); setIsEditing(false); }} className="bg-emerald-500 p-1 rounded-full"><Check size={20}/></button>
             </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-emerald-200 text-sm">{user.studentClass}</p>
          </>
        )}
        
        {!isFree && user.subscriptionEndDate && (
            <div className="mt-2 text-xs bg-white/10 inline-block px-3 py-1 rounded-full text-emerald-100 flex items-center justify-center gap-1 mx-auto w-fit">
                <Clock size={10} /> Exp: {new Date(user.subscriptionEndDate).toLocaleDateString()}
            </div>
        )}
      </div>

      {/* Usage Stats */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mt-4 mx-2 space-y-4">
        <h3 className="font-bold text-slate-800">Monthly Usage</h3>
        
        {/* Messages (Free Only) */}
        {isFree && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2 text-slate-700">Messages (Daily)</span>
                <span className="text-slate-500">{user.dailyMessageCount} / {msgLimit}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full" style={{ width: `${Math.min((user.dailyMessageCount/msgLimit)*100, 100)}%` }}></div>
              </div>
            </div>
        )}

        {/* Images */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-2 text-slate-700">Images (Daily)</span>
            <span className="text-slate-500">{user.dailyImageCount} / {imgLimit}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((user.dailyImageCount/imgLimit)*100, 100)}%` }}></div>
          </div>
        </div>

        {/* Video */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-2 text-slate-700">Video Analysis</span>
            <span className="text-slate-500">{user.monthlyVideoCount} / {isUltra ? videoLimit : 'Lock'}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(isUltra ? (user.monthlyVideoCount/videoLimit)*100 : 0, 100)}%` }}></div>
          </div>
        </div>
        
        {/* Voice Input */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-2 text-slate-700">Voice Input (Mins)</span>
            <span className="text-slate-500">{Math.floor(user.monthlyVoiceInputMins)} / {isUltra ? '∞' : voiceInLimit}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min((user.monthlyVoiceInputMins/voiceInLimit)*100, 100)}%` }}></div>
          </div>
        </div>

        {/* PDF */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-2 text-slate-700">PDF Uploads</span>
            <span className="text-slate-500">{user.monthlyPdfCount} / {isUltra ? '∞' : (isPro ? pdfLimit : 'Lock')}</span>
          </div>
           <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min((user.monthlyPdfCount/pdfLimit)*100, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="mt-6 mx-2 bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <h3 className="px-5 pt-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Settings</h3>
          
          {/* Timetable */}
          <button onClick={onNavigateToSchedule} className="w-full flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
               <div className="bg-indigo-50 p-2 rounded-full"><Calendar size={18} className="text-indigo-600"/></div>
               <span className="text-slate-700 font-medium">Timetable</span>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </button>

          {/* Notifications */}
           <div className="w-full flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
               <div className="bg-amber-50 p-2 rounded-full"><Bell size={18} className="text-amber-600"/></div>
               <span className="text-slate-700 font-medium">Notifications</span>
            </div>
            <button 
                onClick={() => onUpdateUser({ notificationsEnabled: !user.notificationsEnabled })}
                className={`w-12 h-6 rounded-full relative transition-colors ${user.notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${user.notificationsEnabled ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          {/* Language */}
          <div className="w-full flex items-center justify-between p-4 border-b border-slate-100 relative group hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
               <div className="bg-rose-50 p-2 rounded-full"><Globe size={18} className="text-rose-600"/></div>
               <span className="text-slate-700 font-medium">Language</span>
            </div>
            <div className="flex items-center gap-2">
                 <span className="text-sm text-slate-500 font-medium">{user.language}</span>
                 <ChevronRight size={18} className="text-slate-300" />
            </div>
            <select 
                value={user.language}
                onChange={(e) => onUpdateUser({ language: e.target.value as Language })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
                {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                ))}
            </select>
          </div>

          {/* Legal / Terms */}
          <button onClick={() => setShowLegal(true)} className="w-full flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
             <div className="flex items-center gap-3">
               <div className="bg-slate-50 p-2 rounded-full"><ShieldCheck size={18} className="text-slate-500"/></div>
               <span className="text-slate-700 font-medium">Legal & Privacy</span>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </button>

          {/* Logout / Reset */}
          <button onClick={onLogout} className="w-full flex items-center justify-between p-4 hover:bg-rose-50 group transition-colors">
             <div className="flex items-center gap-3">
               <div className="bg-slate-100 group-hover:bg-rose-100 p-2 rounded-full transition-colors"><LogOut size={18} className="text-slate-600 group-hover:text-rose-500"/></div>
               <span className="text-slate-700 font-medium group-hover:text-rose-600">Logout</span>
            </div>
          </button>
      </div>

      <LegalModal isOpen={showLegal} onClose={() => setShowLegal(false)} />
    </div>
  );
};

export default Profile;