import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Loader2, Wifi, WifiOff, Volume2, AlertCircle, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { PlanTier, ChatMessage, Language } from './types';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { fileToBase64 } from './geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanTier;
  language: Language;
  addMessage: (msg: ChatMessage) => void;
  messages: ChatMessage[]; // Full history
}

const VoiceOverlay: React.FC<Props> = ({ isOpen, onClose, plan, language, addMessage, messages }) => {
  const [state, setState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [liveTranscript, setLiveTranscript] = useState("Tap mic to start conversational mode");
  const [showHistory, setShowHistory] = useState(true);
  
  // Refs for Audio Contexts and Stream Logic
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Audio Queue
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Connection Ref (to avoid closures stale state)
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  // Transcript Accumulators for Chat History
  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Setup Audio Contexts on open
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = outputAudioCtxRef.current.createGain();
      outputNodeRef.current.connect(outputAudioCtxRef.current.destination);
    } else {
      disconnectSession();
    }
    return () => disconnectSession();
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, liveTranscript]);

  const disconnectSession = () => {
     // Close Audio Input
     if (inputSourceRef.current) inputSourceRef.current.disconnect();
     if (processorRef.current) processorRef.current.disconnect();
     if (inputAudioCtxRef.current) inputAudioCtxRef.current.close();
     
     // Close Audio Output
     if (outputAudioCtxRef.current) outputAudioCtxRef.current.close();
     
     // Close Session (we can't explicitly close the promise, but we stop sending data)
     sessionPromiseRef.current = null;
     
     setState('idle');
     setLiveTranscript("Tap mic to start conversational mode");
     
     // Reset Refs
     inputAudioCtxRef.current = null;
     outputAudioCtxRef.current = null;
     sourcesRef.current.clear();
     nextStartTimeRef.current = 0;
  };

  const startSession = async () => {
    setState('connecting');
    setLiveTranscript("Connecting with The Einstein Team...");

    try {
      const apiKey = import.meta.env.VITE_API_KEY
      if (!apiKey) {
        setLiveTranscript("Error: API Key is missing in environment variables.");
        setState('error');
        return;
      }
      
      const ai = new GoogleGenAI({ apiKey });

      // Build context from recent messages
      const recentHistory = messages.slice(-5).map(m => 
          `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text} ${m.document ? `[Uploaded Doc: ${m.document.name}]` : ''} ${m.image ? '[Uploaded Image]' : ''}`
      ).join('\n');

      // 1. Setup Input Audio Stream (Microphone)
      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true, 
            noiseSuppression: true,
            autoGainControl: true
          } 
      });

      // 2. Connect to Live API
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            },
            inputAudioTranscription: {}, 
            outputAudioTranscription: {},
            systemInstruction: `You are The Einstein - Your Personal AI Tutor.
            
            IDENTITY RULE: If asked who made/created/developed you, reply EXACTLY: 'I was made by The Einstein Team—a world-class alliance of engineers, scientists, and educators crafting the ultimate AI experience.'
            
            INTERACTION STYLE:
            - DO NOT answer questions directly. Ask the student to try answering first.
            - Once they speak their answer, correct them and explain.
            - Keep responses concise and conversational.
            
            CONTEXT FROM CHAT:
            ${recentHistory}
            
            INSTRUCTIONS:
            - Use ${language} language (or mixed with English).
            - The user can see the chat history, so you can refer to uploaded documents or images from the chat history.`
        },
        callbacks: {
            onopen: () => {
               setState('connected');
               setLiveTranscript("Listening...");
               
               // Start Streaming Audio
               if (!inputAudioCtxRef.current) return;
               inputSourceRef.current = inputAudioCtxRef.current.createMediaStreamSource(stream);
               processorRef.current = inputAudioCtxRef.current.createScriptProcessor(4096, 1, 1);
               
               processorRef.current.onaudioprocess = (e) => {
                   const inputData = e.inputBuffer.getChannelData(0);
                   
                   // NOISE GATE: Calculate RMS
                   let sum = 0;
                   for (let i = 0; i < inputData.length; i++) {
                       sum += inputData[i] * inputData[i];
                   }
                   const rms = Math.sqrt(sum / inputData.length);

                   // Threshold to ignore quiet background noise (0.01 - 0.02 is usually good)
                   if (rms < 0.015) {
                       return;
                   }

                   const pcmBlob = createPcmBlob(inputData);
                   
                   // Send to Gemini
                   sessionPromise.then(session => {
                       session.sendRealtimeInput({ media: pcmBlob });
                   });
               };
               
               inputSourceRef.current.connect(processorRef.current);
               processorRef.current.connect(inputAudioCtxRef.current.destination);
            },
            onmessage: async (msg: LiveServerMessage) => {
                // Handle Audio Output
                const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData && outputAudioCtxRef.current) {
                    playAudioChunk(audioData);
                }

                // Handle Transcriptions
                if (msg.serverContent?.inputTranscription) {
                    const text = msg.serverContent.inputTranscription.text;
                    if (text) {
                        currentInputTransRef.current += text;
                        setLiveTranscript("You: " + currentInputTransRef.current);
                    }
                }
                if (msg.serverContent?.outputTranscription) {
                     const text = msg.serverContent.outputTranscription.text;
                     if (text) {
                        currentOutputTransRef.current += text;
                        setLiveTranscript(currentOutputTransRef.current);
                     }
                }

                // Handle Turn Complete (Save to History)
                if (msg.serverContent?.turnComplete) {
                     if (currentInputTransRef.current.trim()) {
                         addMessage({ id: Date.now().toString(), role: 'user', text: currentInputTransRef.current });
                         currentInputTransRef.current = '';
                     }
                     if (currentOutputTransRef.current.trim()) {
                         addMessage({ id: (Date.now()+1).toString(), role: 'model', text: currentOutputTransRef.current });
                         currentOutputTransRef.current = '';
                     }
                     setLiveTranscript("Listening...");
                }

                // Handle Interruption
                if (msg.serverContent?.interrupted) {
                    stopAllAudio();
                    setLiveTranscript("Listening...");
                    if (currentOutputTransRef.current.trim()) {
                         addMessage({ id: Date.now().toString(), role: 'model', text: currentOutputTransRef.current + "..." });
                         currentOutputTransRef.current = '';
                    }
                }
            },
            onclose: () => {
                if (state === 'connected') setState('idle');
            },
            onerror: (err) => {
                console.error("Live API Error:", err);
                setLiveTranscript("Connection Error. Please check API Key and Network.");
                setState('error');
            }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error("Setup Error:", err);
      setLiveTranscript("Failed to initialize audio.");
      setState('error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && sessionPromiseRef.current) {
        const file = e.target.files[0];
        const base64 = await fileToBase64(file);
        
        // Send to Live API
        sessionPromiseRef.current.then(session => {
            session.sendRealtimeInput({
                media: {
                    mimeType: file.type,
                    data: base64
                }
            });
        });

        // Add to local history for visuals
        addMessage({
            id: Date.now().toString(),
            role: 'user',
            text: "Sent an image for analysis",
            image: base64
        });

        setLiveTranscript("Image sent! Ask me about it.");
    }
  };

  // --- Audio Helpers ---

  const createPcmBlob = (data: Float32Array) => {
      const l = data.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
      }
      let binary = '';
      const len = int16.buffer.byteLength;
      const bytes = new Uint8Array(int16.buffer);
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64 = btoa(binary);
      return { data: b64, mimeType: 'audio/pcm;rate=16000' };
  };

  const playAudioChunk = async (base64: string) => {
      if (!outputAudioCtxRef.current || !outputNodeRef.current) return;
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
      const dataInt16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(dataInt16.length);
      for(let i=0; i<dataInt16.length; i++) { float32[i] = dataInt16[i] / 32768.0; }
      const buffer = outputAudioCtxRef.current.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(float32, 0);
      const source = outputAudioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(outputNodeRef.current);
      const currentTime = outputAudioCtxRef.current.currentTime;
      if (nextStartTimeRef.current < currentTime) { nextStartTimeRef.current = currentTime; }
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
      sourcesRef.current.add(source);
      source.onended = () => { sourcesRef.current.delete(source); };
  };

  const stopAllAudio = () => {
      sourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
      sourcesRef.current.clear();
      if (outputAudioCtxRef.current) { nextStartTimeRef.current = outputAudioCtxRef.current.currentTime; }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-emerald-950 z-[60] flex flex-col items-center justify-between p-4 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="w-full flex justify-between items-start z-10">
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${state === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-emerald-100 font-bold text-xs tracking-widest uppercase">
                {state === 'connected' ? 'Live Connected' : 'Offline'}
            </span>
         </div>
         <div className="flex items-center gap-3">
             <button onClick={() => setShowHistory(!showHistory)} className={`p-2 rounded-full transition-colors ${showHistory ? 'bg-emerald-800 text-white' : 'bg-white/10 text-emerald-200'}`}>
                <MessageSquare size={20} />
             </button>
             <button onClick={onClose} className="bg-white/10 p-2 rounded-full text-white hover:bg-white/20 transition-colors">
                <X size={24} />
             </button>
         </div>
      </div>

      {/* Main Area with Background Chat */}
      <div className="flex-1 w-full max-w-md relative flex flex-col justify-end overflow-hidden mb-6">
          
          {/* Chat History Overlay */}
          <div className={`absolute inset-0 overflow-y-auto no-scrollbar transition-opacity duration-300 ${showHistory ? 'opacity-100' : 'opacity-0'}`} ref={scrollRef}>
             <div className="flex flex-col gap-3 pb-32 pt-10 px-2">
                 {messages.map(msg => (
                     <div key={msg.id} className={`p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-emerald-900/40 text-emerald-100 ml-auto' : 'bg-white/10 text-white mr-auto'}`}>
                         {msg.image && <img src={`data:image/jpeg;base64,${msg.image}`} className="h-20 rounded mb-2 opacity-80" />}
                         {msg.document && <div className="text-xs bg-white/20 p-1 rounded mb-1">📄 {msg.document.name}</div>}
                         {msg.text}
                     </div>
                 ))}
             </div>
          </div>

          {/* Controls */}
          <div className="relative z-20 flex flex-col items-center gap-6">
               {/* Transcript Bubble (Live) */}
               <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center w-full min-h-[80px] flex items-center justify-center shadow-lg">
                    <p className="text-emerald-50 text-sm font-medium animate-pulse">
                        {liveTranscript}
                    </p>
               </div>

               {/* Mic & Visuals */}
               <div className="flex items-center gap-6">
                   {state === 'connected' && (
                       <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                           <ImageIcon size={24} />
                       </button>
                   )}
                   
                   <button 
                    onClick={state === 'idle' || state === 'error' ? startSession : disconnectSession}
                    className={`w-24 h-24 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-transform active:scale-95 ${
                        state === 'connected' ? 'bg-emerald-500 hover:bg-red-500' : 'bg-amber-500 hover:bg-amber-400'
                    }`}
                   >
                    {state === 'idle' && <Mic size={40} className="text-white"/>}
                    {state === 'connecting' && <Loader2 size={40} className="text-white animate-spin"/>}
                    {state === 'connected' && <div className="flex gap-1 h-8 items-end">
                        <div className="w-1.5 bg-white rounded-full h-4 animate-[bounce_1s_infinite]"></div>
                        <div className="w-1.5 bg-white rounded-full h-8 animate-[bounce_1s_infinite_0.1s]"></div>
                        <div className="w-1.5 bg-white rounded-full h-6 animate-[bounce_1s_infinite_0.2s]"></div>
                    </div>}
                   </button>

                   {/* Hidden File Input */}
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload} 
                   />
               </div>
          </div>
      </div>

    </div>
  );
};

export default VoiceOverlay;
