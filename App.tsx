import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import Toolbox from './components/Toolbox';
import Profile from './components/Profile';
import PlanSelection from './components/PlanSelection';
import LoginScreen from './components/LoginScreen';
import { PlanTier, UserState, ToolMode, ScheduleItem, ExamItem, LearningGap, ChatMessage } from './types';
import { updateReports } from './services/reportService';
import { generateResponse } from './services/geminiService';

const WELCOME_MESSAGES: Record<string, string> = {
  [ToolMode.GENERAL]: "Hello! I’m The Einstein - Your Personal AI Tutor. I provide expert-level answers to simplify your studies. I don't judge, I don't get angry, and you can ask me questions until you fully understand them.\n\nSimply type your question here! You can upload chapters or question papers, or send Voice Notes in any Indian language. Feel free to check the Tool Page or ask for video links and diagrams whenever you need them.\n\nTell me, what do you want me to explain now?",
  [ToolMode.LOGIC]: "Logic Lab. I break down complex problems. What are we solving?",
  [ToolMode.ENGLISH_TALKING]: "Hi! I'm your English conversation partner. What's on your mind?",
  [ToolMode.GRAMMAR]: "Grammar Coach active. Paste text to correct.",
  [ToolMode.MOCK_TEST]: "Exam Hall. Subject and chapter?",
  [ToolMode.NOTES]: "Notes Generator. Paste content or upload image.",
  [ToolMode.MEMORY]: "Memory Assistant. What do you need to memorize?",
  [ToolMode.ESSAY]: "Essay Architect. Topic?",
  [ToolMode.VIVA]: "Viva Drill. Adjust your tie. Topic?",
  [ToolMode.VISUALIZER]: "Visualizer. What concept is hard to picture?",
  [ToolMode.DEEP_THINK]: "Deep Think Core active. Solving step-by-step.",
  [ToolMode.LECTURE]: "Lecture Hall. What topic shall I teach?"
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showPlans, setShowPlans] = useState(false);
  const [currentTool, setCurrentTool] = useState<ToolMode>(ToolMode.GENERAL);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});
  const [user, setUser] = useState<UserState | null>(null);

  // --- Reset Logic (Daily & Monthly) ---
  const checkResets = (userData: UserState): UserState => {
      const now = new Date();
      const lastDaily = new Date(userData.lastDailyReset);
      const lastMonthly = new Date(userData.lastMonthlyReset);
      
      let updatedUser = { ...userData };
      let changed = false;

      // Daily Reset (Images & Messages)
      if (now.getDate() !== lastDaily.getDate() || now.getMonth() !== lastDaily.getMonth()) {
          updatedUser.dailyImageCount = 0;
          updatedUser.dailyMessageCount = 0;
          updatedUser.lastDailyReset = now.toISOString();
          changed = true;
      }

      // Monthly Reset (Video, Voice, PDF)
      if (now.getMonth() !== lastMonthly.getMonth()) {
          updatedUser.monthlyVideoCount = 0;
          updatedUser.monthlyVoiceChars = 0;
          updatedUser.monthlyVoiceInputMins = 0;
          updatedUser.monthlyPdfCount = 0;
          updatedUser.lastMonthlyReset = now.toISOString();
          changed = true;
      }

      // Subscription Expiry Check
      if (userData.plan !== PlanTier.FREE && userData.subscriptionEndDate) {
          if (now.getTime() > new Date(userData.subscriptionEndDate).getTime()) {
              alert("Subscription expired. Moving to Free plan.");
              updatedUser.plan = PlanTier.FREE;
              changed = true;
          }
      }

      return changed ? updatedUser : userData;
  };

  useEffect(() => {
    const storedPhone = localStorage.getItem('the_einstein_current_phone');
    if (storedPhone) {
        const savedUserStr = localStorage.getItem(`the_einstein_profile_${storedPhone}`);
        if (savedUserStr) {
            try {
                let savedUser = JSON.parse(savedUserStr);
                
                // Migrate old data fields if needed
                if (!savedUser.monthlyVideoCount) savedUser.monthlyVideoCount = 0;
                if (!savedUser.monthlyVoiceChars) savedUser.monthlyVoiceChars = 0;
                if (!savedUser.monthlyVoiceInputMins) savedUser.monthlyVoiceInputMins = 0;
                if (!savedUser.monthlyPdfCount) savedUser.monthlyPdfCount = 0;
                if (!savedUser.dailyImageCount) savedUser.dailyImageCount = 0;
                if (!savedUser.dailyMessageCount) savedUser.dailyMessageCount = 0;
                if (!savedUser.lastDailyReset) savedUser.lastDailyReset = new Date().toISOString();
                if (!savedUser.lastMonthlyReset) savedUser.lastMonthlyReset = new Date().toISOString();
                
                // Remove legacy voicePersona if exists
                if ('voicePersona' in savedUser) delete savedUser.voicePersona;

                savedUser = checkResets(savedUser);
                setUser(savedUser);
                
                if (savedUser.plan !== PlanTier.FREE) {
                    const savedHistory = localStorage.getItem(`the_einstein_history_${storedPhone}`);
                    if (savedHistory) setChatHistory(JSON.parse(savedHistory));
                }
            } catch (e) {
                console.error("Profile Error", e);
                localStorage.removeItem('the_einstein_current_phone');
            }
        }
    }
  }, []);

  useEffect(() => {
     if (user) {
        localStorage.setItem(`the_einstein_profile_${user.phoneNumber}`, JSON.stringify(user));
     }
  }, [user]);

  useEffect(() => {
    if (user) {
        if (user.plan !== PlanTier.FREE) {
            const t = setTimeout(() => {
                try { localStorage.setItem(`the_einstein_history_${user.phoneNumber}`, JSON.stringify(chatHistory)); } catch (e) {}
            }, 1000);
            return () => clearTimeout(t);
        } else {
             localStorage.removeItem(`the_einstein_history_${user.phoneNumber}`);
        }
    }
  }, [chatHistory, user]);

  useEffect(() => {
    if (user && user.plan !== PlanTier.FREE) {
       const newReports = updateReports(user.reports, user);
       if (newReports.length !== user.reports.length) {
          setUser(prev => prev ? ({ ...prev, reports: newReports }) : null);
       }
    }
  }, [user?.plan, user?.monthlyVoiceChars]);

  const handleLogin = (data: { name: string; phone: string; studentClass: string; school: string }) => {
     const phoneKey = data.phone;
     const now = new Date().toISOString();
     
     // Check if user exists
     const savedUserStr = localStorage.getItem(`the_einstein_profile_${phoneKey}`);
     
     if (savedUserStr) {
         let savedUser = JSON.parse(savedUserStr);
         savedUser = checkResets(savedUser);
         setUser(savedUser);
         if (savedUser.plan !== PlanTier.FREE) {
             const savedHistory = localStorage.getItem(`the_einstein_history_${phoneKey}`);
             if (savedHistory) setChatHistory(JSON.parse(savedHistory));
         }
     } else {
         const newUser: UserState = {
            phoneNumber: phoneKey,
            plan: PlanTier.FREE,
            monthlyVideoCount: 0,
            monthlyVoiceChars: 0,
            monthlyVoiceInputMins: 0,
            monthlyPdfCount: 0,
            dailyImageCount: 0,
            dailyMessageCount: 0,
            lastDailyReset: now,
            lastMonthlyReset: now,
            name: data.name,
            studentClass: data.studentClass,
            schoolName: data.school,
            reports: [],
            schedule: [], 
            exams: [],    
            learningGaps: [], 
            notificationsEnabled: true,
            language: 'English'
         };
         setUser(newUser);
     }
     localStorage.setItem('the_einstein_current_phone', phoneKey);
  };

  const handleLogout = () => {
    localStorage.removeItem('the_einstein_current_phone');
    setUser(null);
    setChatHistory({});
    setActiveTab('home');
  };

  const handlePlanSelect = (plan: PlanTier) => {
    if (!user) return;
    
    // 1. Update User State
    let updatedUser = { ...user };
    if (plan === PlanTier.FREE) {
        updatedUser = { ...updatedUser, plan: PlanTier.FREE, subscriptionStartDate: undefined, subscriptionEndDate: undefined };
    } else {
        const now = new Date();
        const end = new Date();
        end.setDate(now.getDate() + 30);
        updatedUser = { ...updatedUser, plan: plan, subscriptionStartDate: now.toISOString(), subscriptionEndDate: end.toISOString() };
    }
    setUser(updatedUser);
    setShowPlans(false);

    // 2. Trigger Welcome Message & Switch to Chat
    const welcomeMsg = WELCOME_MESSAGES[ToolMode.GENERAL];
    setChatHistory(prev => ({
        ...prev,
        [ToolMode.GENERAL]: [
            ...(prev[ToolMode.GENERAL] || []),
            { id: Date.now().toString(), role: 'model', text: welcomeMsg }
        ]
    }));
    setCurrentTool(ToolMode.GENERAL);
    setActiveTab('chat');
  };

  const handleUpdateUser = (updates: Partial<UserState>) => {
    setUser(prev => prev ? ({ ...prev, ...updates }) : null);
  };

  const incrementUsage = (type: 'voice_out' | 'voice_in' | 'image' | 'video' | 'pdf' | 'message', amount: number = 1) => {
    setUser(prev => {
      if (!prev) return null;
      const ns = { ...prev };
      if (type === 'voice_out') ns.monthlyVoiceChars += amount;
      if (type === 'voice_in') ns.monthlyVoiceInputMins += amount;
      if (type === 'image') ns.dailyImageCount += amount;
      if (type === 'video') ns.monthlyVideoCount += amount;
      if (type === 'pdf') ns.monthlyPdfCount += amount;
      if (type === 'message') ns.dailyMessageCount += amount;
      return ns;
    });
  };

  // Schedule/Exam/Gap Handlers
  const handleAddSchedule = (item: any) => setUser(prev => prev ? ({ ...prev, schedule: [...prev.schedule, { ...item, id: Date.now().toString(), completed: false }] }) : null);
  const handleEditSchedule = (id: string, item: any) => setUser(prev => prev ? ({ ...prev, schedule: prev.schedule.map(s => s.id === id ? { ...s, ...item } : s) }) : null);
  const handleToggleSchedule = (id: string) => setUser(prev => prev ? ({ ...prev, schedule: prev.schedule.map(s => s.id === id ? { ...s, completed: !s.completed } : s) }) : null);
  const handleDeleteSchedule = (id: string) => setUser(prev => prev ? ({ ...prev, schedule: prev.schedule.filter(s => s.id !== id) }) : null);
  const handleAddExam = (item: any) => setUser(prev => prev ? ({ ...prev, exams: [...prev.exams, { ...item, id: Date.now().toString() }] }) : null);
  const handleDeleteExam = (id: string) => setUser(prev => prev ? ({ ...prev, exams: prev.exams.filter(e => e.id !== id) }) : null);
  const handleAddGap = (item: any) => setUser(prev => prev ? ({ ...prev, learningGaps: [...prev.learningGaps, { ...item, id: Date.now().toString() }] }) : null);
  const handleDeleteGap = (id: string) => setUser(prev => prev ? ({ ...prev, learningGaps: prev.learningGaps.filter(g => g.id !== id) }) : null);

  const handleToolSelect = (tool: ToolMode) => {
    setCurrentTool(tool);
    setChatHistory(prev => {
        if (!prev[tool] || prev[tool].length === 0) {
            return { ...prev, [tool]: [{ id: 'intro-' + Date.now(), role: 'model', text: WELCOME_MESSAGES[tool] }] };
        }
        return prev;
    });
    setActiveTab('chat');
  };

  const handleSolveGap = async (gap: LearningGap) => {
      if (!user) return;
      setActiveTab('chat');
      setCurrentTool(ToolMode.GENERAL);
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: `Teach me "${gap.topic}" in "${gap.subject}" from basics.` };
      setChatHistory(prev => ({ ...prev, [ToolMode.GENERAL]: [...(prev[ToolMode.GENERAL] || []), userMsg] }));

      try {
          const aiRes = await generateResponse(
              userMsg.text, null, user.plan, false, user.language, 
              "You are a patient tutor closing a learning gap.", 
              [...chatHistory[ToolMode.GENERAL] || [], userMsg]
          );
          setChatHistory(prev => ({ ...prev, [ToolMode.GENERAL]: [...(prev[ToolMode.GENERAL] || []), { id: (Date.now()+1).toString(), role: 'model', text: aiRes.text }] }));
      } catch (e) { console.error(e); }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Dashboard plan={user!.plan} userState={user!} onUpgrade={() => setShowPlans(true)} onAddSchedule={handleAddSchedule} onEditSchedule={handleEditSchedule} onToggleSchedule={handleToggleSchedule} onDeleteSchedule={handleDeleteSchedule} onAddExam={handleAddExam} onDeleteExam={handleDeleteExam} onAddGap={handleAddGap} onDeleteGap={handleDeleteGap} onSolveGap={handleSolveGap} />;
      case 'chat': return <ChatInterface plan={user!.plan} toolMode={currentTool} language={user!.language} messages={chatHistory[currentTool] || []} setMessages={(msgs) => setChatHistory(prev => ({...prev, [currentTool]: typeof msgs === 'function' ? msgs(prev[currentTool] || []) : msgs}))} onLimitReached={() => setShowPlans(true)} incrementUsage={incrementUsage} usage={{ videoMonth: user!.monthlyVideoCount, imageDaily: user!.dailyImageCount, voiceInMonth: user!.monthlyVoiceInputMins, voiceOutMonth: user!.monthlyVoiceChars, pdfMonth: user!.monthlyPdfCount, messageDaily: user!.dailyMessageCount }} onBackToTools={() => setActiveTab('toolbox')} onAutoGapDetected={(gap) => { if (!user!.learningGaps.some(g => g.topic === gap.topic)) handleAddGap(gap); }} />;
      case 'toolbox': return <Toolbox plan={user!.plan} onSelectTool={handleToolSelect} onUpgrade={() => setShowPlans(true)} />;
      case 'profile': return <Profile user={user!} onUpgrade={() => setShowPlans(true)} onUpdateUser={handleUpdateUser} onLogout={handleLogout} onDownloadReport={(id) => {const r=user!.reports.find(x=>x.id===id); if(r) alert(r.summary);}} onNavigateToSchedule={() => setActiveTab('home')} />;
      default: return null;
    }
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <>
      <Layout activeTab={activeTab} onTabChange={(tab) => { if (tab === 'chat') handleToolSelect(ToolMode.GENERAL); setActiveTab(tab); }}>
        {renderContent()}
      </Layout>
      {showPlans && <PlanSelection currentPlan={user.plan} onSelectPlan={handlePlanSelect} onClose={() => setShowPlans(false)} />}
    </>
  );
};

export default App;