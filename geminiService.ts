import { GoogleGenAI, Modality, Type, FunctionDeclaration } from "@google/genai";
import { PlanTier, Language, ChatMessage } from "./types";

// Helper to convert file to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result?.toString().replace(/^data:(.*,)?/, "");
      if (encoded && (encoded.length % 4) > 0) {
        encoded += "=".repeat(4 - (encoded.length % 4));
      }
      resolve(encoded || "");
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateSpeech = async (text: string, plan: PlanTier): Promise<string | null> => {
  // Feature: Robotic Voice (Browser TTS) for Free Plan
  if (plan === PlanTier.FREE) {
    return null; 
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey });

  // Clean text for TTS
  const cleanText = text.replace(/[*#_`]/g, '').trim();
  const truncatedText = cleanText.length > 2000 ? cleanText.substring(0, 2000) + "..." : cleanText;

  // Voice Mapping: STRICTLY 'Kore' (The Human AI Voice)
  // This satisfies the "Voice Output (WaveNet)" quality requirement efficiently using Flash TTS.
  const geminiVoice = 'Kore'; 

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text: truncatedText }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: geminiVoice }, 
            },
        },
      },
    });
    
    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const data = part?.inlineData?.data;

    if (!data) throw new Error("No audio data returned from Gemini");
    return data;
  } catch (error) {
    console.error("TTS Generation Error:", error);
    throw error;
  }
};

// Define the Tool
const learningGapTool: FunctionDeclaration = {
  name: "addToLearningGaps",
  description: "Detects when a student is struggling with a specific concept or explicitly asks to remember a weak area.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING, description: "The specific concept the student is struggling with (e.g. 'Photosynthesis', 'Integration')" },
      subject: { type: Type.STRING, description: "The broader subject (e.g. 'Biology', 'Math')" }
    },
    required: ["topic", "subject"]
  }
};

export const generateResponse = async (
  prompt: string,
  attachment: { base64: string; mimeType: string } | null,
  plan: PlanTier,
  isDeepThink: boolean,
  language: Language,
  systemInstruction?: string,
  history: ChatMessage[] = []
): Promise<{ text: string; detectedGap?: { topic: string; subject: string } }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });

  // --- MODEL SELECTION STRATEGY (PROFIT PLAN) ---
  // PRO Plan: Restricted to ₹40 variable cost. MUST use Flash.
  // ULTRA Plan: Uses Pro for intelligence, but Flash for heavy inputs (Audio/Video).
  
  let modelName = 'gemini-3-flash-preview'; 

  if (plan === PlanTier.ULTRA) {
      // Ultra Strategy: 
      // Heavy Inputs (Video & Audio) -> Flash (Cost efficiency for unlimited usage - "15 hours is cheap")
      // High IQ (Text & Image) -> Pro (Premium Intelligence)
      if (attachment && (attachment.mimeType.startsWith('video/') || attachment.mimeType.startsWith('audio/'))) {
          modelName = 'gemini-3-flash-preview';
      } else {
          modelName = 'gemini-3-pro-preview';
      }
  } else if (plan === PlanTier.PRO) {
      // Pro Strategy: STRICTLY Flash
      // Covers: "Gemini 1.5 Flash for vision" & "Input processing (Flash) for 900 mins audio"
      modelName = 'gemini-3-flash-preview'; 
  }
  
  // Construct Contents (History + Current)
  const contents: any[] = [];

  if (plan !== PlanTier.FREE) {
      // Clean History Logic
      const seenIds = new Set();
      const cleanHistory = history.filter(msg => {
          const isError = msg.text.includes("Sorry, I encountered") || msg.text.includes("I apologize");
          const isEmpty = !msg.text || msg.text.trim() === "";
          const isDuplicate = seenIds.has(msg.id);
          if (isError || isEmpty || isDuplicate) return false;
          seenIds.add(msg.id);
          return true;
      });

      cleanHistory.forEach(msg => {
          if (!msg.text) return;
          const parts: any[] = [{ text: msg.text }];
          
          // Attach image only if it's recent context
          if (msg.image && msg === cleanHistory[cleanHistory.length - 1]) {
             parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: msg.image } });
          }

          contents.push({ role: msg.role, parts: parts });
      });
  }

  // Current User Message
  const currentParts: any[] = [];
  if (attachment) {
    currentParts.push({
      inlineData: {
        data: attachment.base64,
        mimeType: attachment.mimeType
      }
    });
  }
  currentParts.push({ text: prompt });
  contents.push({ role: 'user', parts: currentParts });

  // Instructions
  let baseInstruction = systemInstruction || "You are The Einstein - Your Personal AI Tutor.";
  
  // Identity Rule
  baseInstruction += " IDENTITY RULE: If asked who made you, reply: 'I was made by The Einstein Team—a world-class alliance of engineers, scientists, and educators crafting the ultimate AI experience.'";

  // Interaction Protocol
  baseInstruction += `
  INTERACTION PROTOCOL:
  1. STUDENT FIRST: Ask the user to attempt the answer first.
  2. RECTIFICATION: Then explain the correct concept.
  3. EXCEPTION: Greetings or "make a schedule" can be answered directly.
  
  GAP DETECTION:
  If user struggles, use 'addToLearningGaps'.
  `;

  // --- PLAN SPECIFIC BEHAVIORS ---
  if (plan === PlanTier.ULTRA) {
      // PART 1 & 3: Curriculum Lock & Adaptive EQ
      baseInstruction += `
      
      ⭐⭐ ULTRA MODE ACTIVE ⭐⭐
      
      [CURRICULUM LOCK - STRICT]
      - You are strictly an exam-oriented tutor.
      - Never teach out-of-syllabus topics unless explicitly asked.
      - If the user provides a textbook or chapter (via PDF/Image), teach ONLY from that context.
      - Ensure preparation is 100% exam-oriented.

      [ADAPTIVE TEACHING - EQ]
      - Detect if the user is struggling.
      - If they don't understand, AUTOMATICALLY switch teaching methods (e.g., from definition to real-world analogy).
      - Do not just repeat yourself; explain differently.
      
      [CHAIN OF THOUGHT]
      - Validate your logic step-by-step before answering complex Physics/Math problems.
      `;
  } else if (plan === PlanTier.PRO) {
      baseInstruction += ` EQ ENGINE ENABLED: Detect frustration and be encouraging.`;
  } else {
      baseInstruction += ` GUEST MODE: No history. Keep answers simple.`;
  }

  const langInstruction = language !== 'English' ? ` ALWAYS reply in ${language} (or mixed with English).` : "";

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: baseInstruction + langInstruction,
        tools: [
            { googleSearch: {} },
            { functionDeclarations: [learningGapTool] }
        ],
        // Deep Think only for Ultra (Expensive)
        thinkingConfig: (plan === PlanTier.ULTRA && isDeepThink && !attachment?.mimeType.startsWith('video/')) ? { thinkingBudget: 2048 } : undefined,
        maxOutputTokens: 4000 
      }
    });

    let finalText = response.text || "I apologize, I couldn't generate a response.";
    let detectedGap = undefined;

    // Check Function Calls
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
        const gapCall = functionCalls.find(fc => fc.name === 'addToLearningGaps');
        if (gapCall) {
            detectedGap = gapCall.args as { topic: string; subject: string };
            if (!finalText) {
                finalText = `I've noticed you're finding '${detectedGap.topic}' difficult. Added to Gaps. Let's practice.`;
            }
        }
    }

    // Grounding
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
        const links = chunks.map((c: any) => c.web?.uri).filter((u: any) => u && !u.includes('youtube'));
        const uniqueLinks = [...new Set(links)];
        if (uniqueLinks.length > 0) {
            finalText += "\n\n**📚 Sources:**\n" + uniqueLinks.map(l => `• ${l}`).join('\n');
        }
    }

    return { text: finalText, detectedGap };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "I'm having trouble connecting to my brain. Please try again." };
  }
};
