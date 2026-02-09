import React, { useState, useRef, useEffect } from 'react';
import { PlanTier, ChatMessage, ToolMode, Language, LearningGap } from './types';
import { Send, Plus, Image as ImageIcon, Mic, FileText, Video, X, Zap, StopCircle, Volume2, Square, User, Loader2, ArrowLeft, ExternalLink, Search, Brain } from 'lucide-react';
import { generateResponse, generateSpeech, fileToBase64 } from './geminiService';

interface Props {
  plan: PlanTier;
  toolMode: ToolMode;
  language: Language;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onLimitReached: () => void;
  incrementUsage: (type: 'voice_out' | 'voice_in' | 'image' | 'video' | 'pdf' | 'message', amount?: number) => void;
  usage: { videoMonth: number; imageDaily: number; voiceInMonth: number; voiceOutMonth: number; pdfMonth: number; messageDaily: number };
  onBackToTools?: () => void;
  onAutoGapDetected?: (gap: Omit<LearningGap, 'id'>) => void;
}

interface Attachment {
  file: File;
  type: 'image' | 'video' | 'audio' | 'document';
}

const TOOL_CONFIG: Record<ToolMode, { title: string; instruction: string; color: string }> = {
  [ToolMode.GENERAL]: { title: "General", color: "bg-slate-800", instruction: `You are The Einstein. STUDENT FIRST: Ask user to answer first.` },
  [ToolMode.LOGIC]: { title: "Logic Lab", color: "bg-emerald-700", instruction: "Break down into detailed logical steps." },
  [ToolMode.ENGLISH_TALKING]: { title: "English Partner", color: "bg-indigo-700", instruction: "Chat naturally in English." },
  [ToolMode.GRAMMAR]: { title: "Grammar", color: "bg-blue-700", instruction: "Correct text and explain rules." },
  [ToolMode.MOCK_TEST]: { title: "Mock Test", color: "bg-pink-700", instruction: "Ask one question, grade answer, then next." },
  [ToolMode.NOTES]: { title: "Notes", color: "bg-amber-700", instruction: "Create bullet point notes." },
  [ToolMode.MEMORY]: { title: "Memory", color: "bg-green-700", instruction: "Create mnemonics." },
  [ToolMode.ESSAY]: { title: "Essay", color: "bg-purple-700", instruction: "Create essay outline." },
  [ToolMode.VIVA]: { title: "Viva Drill", color: "bg-orange-700", instruction: "Ask viva questions." },
  [ToolMode.VISUALIZER]: { title: "Visualizer", color: "bg-sky-700", instruction: "Use real-world analogies." },
  [ToolMode.DEEP_THINK]: { title: "Deep Think", color: "bg-violet-800", instruction: "Use Chain of Thought reasoning." },
  [ToolMode.LECTURE]: { title: "Lecture Hall", color: "bg-red-800", instruction: "Give a detailed lecture." }
};

const ChatInterface: React.FC<Props> = ({ plan, toolMode, language, messages, setMessages, onLimitReached, incrementUsage, usage, onBackToTools, onAutoGapDetected }) => {
  const [input, setInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioChunksRef = useRef<Blob[]>([]);
  const [lastDetectedGap, setLastDetectedGap] = useState<string | null>(null);
  const [isDeepThink, setIsDeepThink] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const isUltra = plan === PlanTier.ULTRA;
  const config = TOOL_CONFIG[toolMode] || TOOL_CONFIG[ToolMode.GENERAL];

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]); 
  useEffect(() => { return () => { stopAudio(); }; }, []);
  useEffect(() => { if (lastDetectedGap) setTimeout(() => setLastDetectedGap(null), 5000); }, [lastDetectedGap]);

  const stopAudio = () => {
      if (audioSource) { try { audioSource.stop(); } catch (e) {} setAudioSource(null); }
      window.speechSynthesis.cancel();
      setPlayingMsgId(null);
      setIsAudioLoading(false);
  };

  const playAudio = async (msgId: string, text: string) => {
      if (playingMsgId === msgId && !isAudioLoading) { stopAudio(); return; }
      stopAudio(); 
      setPlayingMsgId(msgId);
      setIsAudioLoading(true);

      // --- VOICE OUTPUT LIMIT CHECK ---
      // Pro: 200,000 chars. Ultra: 800,000.
      const limit = plan === PlanTier.PRO ? 200000 : (plan === PlanTier.ULTRA ? 800000 : 0);
      if (plan !== PlanTier.FREE && usage.voiceOutMonth + text.length > limit) {
          alert(`Voice Output Limit Reached (${limit/1000}k chars). Upgrade for more.`);
          setPlayingMsgId(null);
          setIsAudioLoading(false);
          return;
      }

      try {
          // Only Pro/Ultra use Gemini TTS. Service will determine voice (Kore).
          const base64PCM = await generateSpeech(text, plan);
          
          if (!base64PCM) {
             const utterance = new SpeechSynthesisUtterance(text);
             window.speechSynthesis.speak(utterance);
             utterance.onend = () => { setPlayingMsgId(null); setIsAudioLoading(false); };
             setIsAudioLoading(false);
             return;
          }

          // Track usage (Characters)
          incrementUsage('voice_out', text.length);

          const binaryString = window.atob(base64PCM);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          setAudioCtx(ctx);
          const dataInt16 = new Int16Array(bytes.buffer);
          const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
          const channelData = buffer.getChannelData(0);
          for (let i = 0; i < dataInt16.length; i++) { channelData[i] = dataInt16[i] / 32768.0; }
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.onended = () => { setPlayingMsgId(null); setAudioSource(null); setIsAudioLoading(false); };
          source.start();
          setAudioSource(source);
          setIsAudioLoading(false);
      } catch (err) {
          console.error(err);
          setPlayingMsgId(null);
          setIsAudioLoading(false);
      }
  };

  const checkLimits = (type: 'image' | 'video' | 'pdf'): boolean => {
      if (plan === PlanTier.FREE) {
          if (type === 'image' && usage.imageDaily >= 3) { onLimitReached(); return false; }
          if (type === 'video' || type === 'pdf') { onLimitReached(); return false; }
      }
      if (plan === PlanTier.PRO) {
          if (type === 'image' && usage.imageDaily >= 50) { onLimitReached(); return false; }
          if (type === 'video') { onLimitReached(); return false; } // Pro cant video
          if (type === 'pdf' && usage.pdfMonth >= 5) { alert("Monthly PDF Limit (5) Reached."); return false; }
      }
      if (plan === PlanTier.ULTRA) {
          if (type === 'image' && usage.imageDaily >= 100) { alert("Daily image limit (100) reached."); return false; }
          if (type === 'video' && usage.videoMonth >= 20) { alert("Monthly video analysis limit (20) reached."); return false; }
          // Ultra PDF is unlimited
      }
      return true;
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || isLoading) return;

    // --- CHECK FREE PLAN MESSAGE LIMIT (20/day) ---
    if (plan === PlanTier.FREE && usage.messageDaily >= 20) {
        onLimitReached();
        return;
    }

    if (attachment?.type === 'image' && !checkLimits('image')) return;
    if (attachment?.type === 'video' && !checkLimits('video')) return;
    if (attachment?.type === 'document' && !checkLimits('pdf')) return;

    const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    let apiAttachment: { base64: string, mimeType: string } | null = null;

    if (attachment) {
      if (attachment.type === 'image') incrementUsage('image');
      if (attachment.type === 'video') incrementUsage('video');
      if (attachment.type === 'document') incrementUsage('pdf');
      
      const b64 = await fileToBase64(attachment.file);
      apiAttachment = { base64: b64, mimeType: attachment.file.type };
      if (attachment.type === 'image') newUserMsg.image = b64;
      if (attachment.type === 'video') newUserMsg.video = URL.createObjectURL(attachment.file);
      if (attachment.type === 'document') newUserMsg.document = { name: attachment.file.name, type: attachment.file.type };
    }

    incrementUsage('message');
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);
    stopAudio(); 

    let instruction = config.instruction;
    if (isDeepThink) instruction = TOOL_CONFIG[ToolMode.DEEP_THINK].instruction;

    try {
      const result = await generateResponse(newUserMsg.text, apiAttachment, plan, isDeepThink, language, instruction, messages);
      if (result.detectedGap) { onAutoGapDetected?.(result.detectedGap); setLastDetectedGap(result.detectedGap.topic); }
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: result.text }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: "Error connecting to server." }]);
    } finally { setIsLoading(false); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: Attachment['type']) => {
    if (e.target.files && e.target.files[0]) {
      // Map Attachment type to Limit check type
      let limitType: 'image' | 'video' | 'pdf' | null = null;
      if (type === 'image') limitType = 'image';
      if (type === 'video') limitType = 'video';
      if (type === 'document') limitType = 'pdf';

      if (limitType && !checkLimits(limitType)) {
         e.target.value = ''; // Reset input
         return;
      }
      
      setAttachment({ file: e.target.files[0], type });
      setMenuOpen(false);
      e.target.value = ''; // Reset input
    }
  };

  // Recording Logic
  const startRecording = async () => {
      // Check Voice Input Limits (Pro: 900 mins)
      if (plan === PlanTier.PRO && usage.voiceInMonth >= 900) {
          alert("Monthly Voice Input Limit (900 mins) Reached.");
          return;
      }

      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];
          startTimeRef.current = Date.now();
          
          mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
          mediaRecorder.onstop = () => {
             const durationMins = (Date.now() - startTimeRef.current) / 60000;
             incrementUsage('voice_in', durationMins); // Track minutes

             const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
             setAttachment({ file: new File([audioBlob], "voice.webm", { type: 'audio/webm' }), type: 'audio' });
          };
          mediaRecorder.start();
          setIsRecording(true);
          setMenuOpen(false);
      } catch (e) { alert("Mic Error"); }
  };
  const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

  return (
    <div className="flex flex-col h-full bg-slate-100 relative">
      {/* Branding Header */}
      <div className={`shadow-md p-3 text-center sticky top-0 z-30 flex items-center justify-between text-white ${config.color}`}>
         <div className="flex items-center">
             {toolMode !== ToolMode.GENERAL && <button onClick={onBackToTools} className="p-2 mr-2"><ArrowLeft size={20} /></button>}
         </div>
         <div className="flex flex-col items-center flex-1">
            <h1 className="font-bold text-lg">The Einstein</h1>
            <p className="text-[10px] opacity-90">{isUltra ? `Ultra Mode (Kore)` : config.title}</p>
         </div>
         <div className="w-10"></div> 
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4 bg-slate-100">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-4 shadow-sm relative ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-2xl rounded-tr-none' : 'bg-white text-slate-800 rounded-2xl rounded-tl-none'}`}>
              <div className="flex items-center gap-2 mb-2">
                 {msg.role === 'model' && (
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold ${config.color}`}>TE</div>
                 )}
                 <button onClick={() => playAudio(msg.id, msg.text)} className={`p-1.5 rounded-full transition-colors flex items-center gap-1 ${playingMsgId === msg.id ? 'bg-emerald-100 text-emerald-600' : 'text-slate-400 hover:bg-slate-100'}`}>
                   {playingMsgId === msg.id && isAudioLoading ? <Loader2 size={14} className="animate-spin" /> : playingMsgId === msg.id ? <Square size={12} fill="currentColor"/> : <Volume2 size={16} />}
                 </button>
              </div>
              {msg.image && <img src={`data:image/jpeg;base64,${msg.image}`} className="rounded-lg mb-2 max-h-48" />}
              {msg.video && <div className="mb-2 bg-black rounded-lg p-2 text-center text-xs text-white">Video Analysis</div>}
              {msg.document && <div className="mb-2 bg-slate-100 rounded-lg p-2 text-xs text-slate-600 border">📄 {msg.document.name}</div>}
              <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && <div className="p-4 text-slate-400 text-xs">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 border-t border-slate-200 sticky bottom-0 z-20">
        {attachment && (
          <div className="flex items-center gap-3 mb-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
             <div className="text-xs font-bold text-slate-700">{attachment.file.name}</div>
             <button onClick={() => setAttachment(null)}><X size={16}/></button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><Plus size={24}/></button>
            {menuOpen && (
              <div className="absolute bottom-14 left-0 bg-white rounded-xl shadow-xl border p-2 w-48 z-30">
                 <button onClick={() => fileInputRef.current?.click()} className="flex gap-3 w-full p-3 hover:bg-slate-50 text-sm"><ImageIcon size={18}/> Image</button>
                 <button onClick={startRecording} className="flex gap-3 w-full p-3 hover:bg-slate-50 text-sm"><Mic size={18}/> Voice Note</button>
                 <button onClick={() => docInputRef.current?.click()} className="flex gap-3 w-full p-3 hover:bg-slate-50 text-sm"><FileText size={18}/> PDF</button>
                 <button onClick={() => isUltra ? videoInputRef.current?.click() : onLimitReached()} className={`flex gap-3 w-full p-3 text-sm ${!isUltra && 'opacity-50'}`}><Video size={18}/> Video {isUltra ? '' : '🔒'}</button>
              </div>
            )}
          </div>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={isRecording ? "Recording..." : "Ask..."} className="flex-1 bg-slate-100 rounded-full px-4 py-3 outline-none text-slate-700"/>
          {isUltra && <button onClick={() => setIsDeepThink(!isDeepThink)} className={`p-2 rounded-full ${isDeepThink ? 'bg-purple-600 text-white' : 'text-slate-400'}`}><Zap size={20}/></button>}
          {isRecording ? <button onClick={stopRecording} className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center"><StopCircle size={20}/></button> : 
          <button onClick={handleSend} disabled={isLoading} className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center"><Send size={18}/></button>}
        </div>
      </div>
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'image')}/>
      <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, 'video')}/>
      <input type="file" ref={docInputRef} accept=".pdf,.doc" className="hidden" onChange={(e) => handleFileSelect(e, 'document')}/>
    </div>
  );
};

export default ChatInterface;
