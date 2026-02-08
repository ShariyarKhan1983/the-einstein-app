import React from 'react';
import { Home, MessageCircle, LayoutGrid, User } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<Props> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="bg-slate-50 h-screen w-full max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {children}
      </div>
      
      {/* Bottom Nav */}
      <div className="bg-white border-t border-slate-100 flex justify-around items-center py-3 sticky bottom-0 z-40 pb-5">
        <button 
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium w-16 ${activeTab === 'home' ? 'text-emerald-800' : 'text-slate-400'}`}
        >
          <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2}/>
          HOME
        </button>
        <button 
          onClick={() => onTabChange('chat')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium w-16 ${activeTab === 'chat' ? 'text-emerald-800' : 'text-slate-400'}`}
        >
          <MessageCircle size={24} strokeWidth={activeTab === 'chat' ? 2.5 : 2}/>
          CHAT
        </button>
        
        <button 
          onClick={() => onTabChange('toolbox')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium w-16 ${activeTab === 'toolbox' ? 'text-emerald-800' : 'text-slate-400'}`}
        >
          <LayoutGrid size={24} strokeWidth={activeTab === 'toolbox' ? 2.5 : 2}/>
          TOOLS
        </button>
        <button 
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium w-16 ${activeTab === 'profile' ? 'text-emerald-800' : 'text-slate-400'}`}
        >
          <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2}/>
          PROFILE
        </button>
      </div>
    </div>
  );
};

export default Layout;