import React, { useState } from 'react';
import { X, Shield, FileText, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LegalModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'disclaimer'>('terms');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 text-lg">Legal Information</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'terms' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
          >
            Terms
          </button>
          <button 
             onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'privacy' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
          >
            Privacy
          </button>
          <button 
             onClick={() => setActiveTab('disclaimer')}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'disclaimer' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
          >
            Disclaimer
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-600 leading-relaxed space-y-4">
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                 <FileText size={18} /> <span>Terms of Service</span>
              </div>
              <p><strong>1. Acceptance of Terms:</strong> By accessing and using The Einstein ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.</p>
              <p><strong>2. Usage License:</strong> Permission is granted to temporarily use the Service for personal, non-commercial educational transitory viewing only.</p>
              <p><strong>3. User Accounts:</strong> You are responsible for maintaining the confidentiality of your account and device access. The Service is designed for students; users under 13 should use the Service with parental supervision.</p>
              <p><strong>4. Subscription Plans:</strong> Features available to you depend on your selected Plan Tier (Free, Pro, or Ultra). Usage limits are strictly enforced. We reserve the right to modify plan features or pricing with notice.</p>
              <p><strong>5. Termination:</strong> We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                 <Shield size={18} /> <span>Privacy Policy</span>
              </div>
              <p><strong>1. Data Collection:</strong> We collect minimal data necessary for the Service to function, including your name, grade, and learning history. Inputs (text, audio, images) are processed via Google Gemini API.</p>
              <p><strong>2. Local Storage:</strong> To maximize privacy, your profile, schedule, and chat history are stored locally on your device's browser storage ("LocalStorage"). Deleting your browser cache will erase this data.</p>
              <p><strong>3. Third-Party Processing:</strong> AI processing is provided by Google Cloud. By using the Service, you acknowledge that your inputs are sent to Google for processing in accordance with their API data policies.</p>
              <p><strong>4. No Data Selling:</strong> We do not sell, trade, or rent your personal identification information to others.</p>
            </div>
          )}

          {activeTab === 'disclaimer' && (
             <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600 font-bold">
                 <AlertTriangle size={18} /> <span>AI Disclaimer</span>
              </div>
              <p className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800 font-medium">
                The Einstein is an AI-powered educational assistant. While we strive for high accuracy, artificial intelligence can make mistakes.
              </p>
              <p><strong>1. Educational Aid Only:</strong> This tool is intended to supplement, not replace, formal education, textbooks, or teachers. Always verify critical information from official academic sources.</p>
              <p><strong>2. Accuracy of Responses:</strong> The AI may occasionally generate incorrect information, "hallucinate" facts, or produce biased content. The developers are not liable for any academic loss or errors resulting from reliance on the AI.</p>
              <p><strong>3. No Professional Advice:</strong> The Service does not provide medical, legal, or psychological advice.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
           <button onClick={onClose} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors">
             I Understand
           </button>
        </div>

      </div>
    </div>
  );
};

export default LegalModal;