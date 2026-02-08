import React, { useState } from 'react';
import { User, Phone, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import LegalModal from './LegalModal';

interface Props {
  onLogin: (data: { name: string; phone: string; studentClass: string; school: string }) => void;
}

const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    studentClass: '',
    school: ''
  });
  const [showLegal, setShowLegal] = useState(false);

  const isValid = formData.name.length > 2 && formData.phone.length >= 10 && formData.studentClass.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onLogin(formData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-amber-500 rounded-full blur-[100px] opacity-20"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-emerald-900 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl font-bold text-amber-400">E</span>
           </div>
           <h1 className="text-2xl font-bold text-slate-900">The Einstein</h1>
           <p className="text-slate-500 text-sm mt-1">Your Personal AI Tutor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Full Name</label>
              <div className="relative">
                 <User className="absolute left-3 top-3 text-slate-400" size={20} />
                 <input 
                   type="text" 
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                   placeholder="Student Name"
                   required
                 />
              </div>
           </div>

           <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Phone Number</label>
              <div className="relative">
                 <Phone className="absolute left-3 top-3 text-slate-400" size={20} />
                 <input 
                   type="tel" 
                   value={formData.phone}
                   onChange={e => setFormData({...formData, phone: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                   placeholder="Mobile Number"
                   required
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Class</label>
                 <div className="relative">
                    <BookOpen className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      value={formData.studentClass}
                      onChange={e => setFormData({...formData, studentClass: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                      placeholder="Grade 10"
                      required
                    />
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">School</label>
                 <div className="relative">
                    <input 
                      type="text" 
                      value={formData.school}
                      onChange={e => setFormData({...formData, school: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800"
                      placeholder="Optional"
                    />
                 </div>
              </div>
           </div>

           <div className="pt-4">
              <button 
                type="submit" 
                disabled={!isValid}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all ${isValid ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                Start Learning <ArrowRight size={20} />
              </button>
           </div>
        </form>

        <div className="mt-6 text-center">
            <button onClick={() => setShowLegal(true)} className="text-[10px] text-slate-400 hover:text-emerald-600 transition-colors">
                By continuing, you agree to our <span className="underline">Terms & Privacy Policy</span>
            </button>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-300 mt-2">
                <ShieldCheck size={14} />
                <span>Secure Client-Side Encryption</span>
            </div>
        </div>
      </div>

      <LegalModal isOpen={showLegal} onClose={() => setShowLegal(false)} />
    </div>
  );
};

export default LoginScreen;