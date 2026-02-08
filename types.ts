export enum PlanTier {
  FREE = 'free',
  PRO = 'pro',
  ULTRA = 'ultra'
}

export interface ScheduleItem {
  id: string;
  subject: string;
  time: string;
  location: string;
  completed: boolean;
  color: 'indigo' | 'rose' | 'teal' | 'amber';
}

export interface ExamItem {
  id: string;
  title: string;
  date: string; // ISO Date string YYYY-MM-DD
}

export interface LearningGap {
  id: string;
  topic: string;
  subject: string;
}

export type Language = 'English' | 'Hinglish' | 'Hindi' | 'Bengali' | 'Marathi' | 'Telugu' | 'Tamil' | 'Gujarati' | 'Kannada' | 'Malayalam' | 'Punjabi';

export interface UserState {
  phoneNumber: string; // Unique ID
  plan: PlanTier;
  
  // Subscription Tracking
  subscriptionStartDate?: string; // ISO Date
  subscriptionEndDate?: string;   // ISO Date
  
  // Usage Tracking (Strict Limits)
  monthlyVideoCount: number;      // Resets Monthly
  monthlyVoiceChars: number;      // Resets Monthly (TTS Characters)
  monthlyVoiceInputMins: number;  // Resets Monthly (User speaking time)
  monthlyPdfCount: number;        // Resets Monthly (Docs uploaded)
  dailyImageCount: number;        // Resets Daily
  dailyMessageCount: number;      // Resets Daily (Free Plan Limit)
  
  lastDailyReset: string;         // ISO Date
  lastMonthlyReset: string;       // ISO Date

  name: string;
  studentClass: string;
  schoolName: string;
  reports: WeeklyReport[];
  
  // New Interactive Fields
  schedule: ScheduleItem[];
  exams: ExamItem[];
  learningGaps: LearningGap[];
  
  // Settings
  notificationsEnabled: boolean;
  language: Language;
}

export interface WeeklyReport {
  id: string;
  date: string; // ISO Date
  score: number;
  summary: string;
  weakness: string;
  strength: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
  video?: string; // base64 or url
  audio?: string; // base64 or url
  document?: { name: string; type: string }; // For PDF/Docs
  isThinking?: boolean;
}

export enum ToolMode {
  GENERAL = 'general',
  LOGIC = 'logic',
  GRAMMAR = 'grammar',
  MOCK_TEST = 'mock_test',
  NOTES = 'notes',
  MEMORY = 'memory',
  ESSAY = 'essay',
  VIVA = 'viva',
  VISUALIZER = 'visualizer',
  ENGLISH_TALKING = 'english_talking',
  DEEP_THINK = 'deep_think',
  LECTURE = 'lecture'
}