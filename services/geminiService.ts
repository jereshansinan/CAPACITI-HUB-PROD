
import { GoogleGenAI, Type } from "@google/genai";
import { CertificateData, CandidateMetric, FeedbackEntry } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- 1. AI Policy Navigator (Language / RAG Simulation) ---

const POLICY_SYSTEM_INSTRUCTION = `
You are the AI Policy Navigator for CAPACITI. Your goal is to assist employees and managers with HR policies, onboarding, and compliance.
Use the following context as your "Knowledge Base":

[CAPACITI KNOWLEDGE BASE]
1. LEAVE POLICY: Employees accrue 1.25 days of leave per month. Sick leave requires a medical certificate if absent for more than 2 days. 
2. REMOTE WORK: Remote work is permitted for Tech Champions and Senior Managers on Tuesdays and Thursdays. Candidates must be on-site.
3. ONBOARDING: Day 1 includes IT setup and HR orientation. Day 2-5 involves technical bootcamps.
4. EXPENSES: All travel expenses must be pre-approved by a Manager. Receipts must be uploaded within 48 hours.
5. CODE OF CONDUCT: Respect, Integrity, and Innovation are our core values. Harassment of any kind is zero-tolerance.
6. IT SUPPORT: Submit tickets via the portal. Severity 1 issues are resolved in 4 hours.

If the user asks something not in this list, politely explain you only have access to core HR policies. Keep answers concise and helpful.
`;

export const getPolicyResponse = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: POLICY_SYSTEM_INSTRUCTION,
      },
      history: history.map(h => ({ role: h.role, parts: h.parts })),
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Policy Chat Error:", error);
    return "I'm having trouble connecting to the policy database. Please try again later.";
  }
};

// --- 2. Certification Verifier (Vision / OCR) ---

export const verifyCertificate = async (base64Image: string, mimeType: string): Promise<CertificateData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: `Analyze this image strictly. It must be a legitimate academic, course completion, or professional certificate.
            
            1. Look for: Issuer Name, Candidate Name, Date, Signatures, Seals/Logos.
            2. If it is a generic image, a random screenshot, a meme, or unrelated document, set verificationStatus to 'REJECTED' and give a reason (e.g. "Image does not resemble a certificate").
            3. If it looks authentic, set verificationStatus to 'VERIFIED'.
            4. Extract the data if available.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING, nullable: true },
            courseName: { type: Type.STRING, nullable: true },
            issueDate: { type: Type.STRING, nullable: true },
            issuer: { type: Type.STRING, nullable: true },
            verificationStatus: { type: Type.STRING, enum: ['VERIFIED', 'REJECTED', 'PENDING'] },
            confidenceScore: { type: Type.NUMBER, description: "A number between 0 and 100 representing confidence in extraction" },
            reason: { type: Type.STRING, description: "A short explanation of why it was verified or rejected." }
          },
          required: ["verificationStatus", "confidenceScore", "reason"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CertificateData;
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Certificate Verification Error:", error);
    return {
      candidateName: null,
      courseName: null,
      issueDate: null,
      issuer: null,
      verificationStatus: 'REJECTED',
      confidenceScore: 0,
      reason: "AI Service Error: Could not process image."
    };
  }
};

// --- 3. Progress & Risk Analyzer (Data Analysis) ---

export const analyzeCandidateRisk = async (candidates: CandidateMetric[]): Promise<CandidateMetric[]> => {
  try {
    // We send the raw data to Gemini to perform predictive analysis
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following candidate performance data. 
      Calculate a 'riskScore' (0-100, where 100 is high risk of dropping out) based on low attendance, low technical scores, or low soft skills. 
      Assign a 'riskLevel' (Low, Medium, High).
      Provide a short 'aiAnalysis' sentence explaining the reason.
      
      Input Data:
      ${JSON.stringify(candidates)}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    riskScore: { type: Type.NUMBER },
                    riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                    aiAnalysis: { type: Type.STRING }
                }
            }
        }
      }
    });

    if (response.text) {
      const analysisResults = JSON.parse(response.text);
      
      // Merge AI results back into original data
      return candidates.map(c => {
        const result = analysisResults.find((r: any) => r.id === c.id);
        if (result) {
            return { ...c, ...result };
        }
        return c;
      });
    }
    return candidates;

  } catch (error) {
    console.error("Risk Analysis Error:", error);
    return candidates;
  }
};

// --- 4. Student Feedback Analyzer (Sentiment & Topic) ---

export const analyzeStudentFeedback = async (
  content: string, 
  category: string
): Promise<Partial<FeedbackEntry>> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this student feedback about ${category}.
      Feedback: "${content}"
      
      Tasks:
      1. Determine Sentiment (Positive, Neutral, Negative).
      2. Extract up to 3 key topics (e.g., "Pacing", "Instructor", "Material").
      3. Summarize the feedback in one short sentence.
      4. Rate Urgency (High if it mentions harassment, severe blockers, or mental health; Medium for confusion/complaints; Low for praise/suggestions).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] },
            topics: { type: Type.ARRAY, items: { type: Type.STRING } },
            aiSummary: { type: Type.STRING },
            urgency: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
          },
          required: ["sentiment", "topics", "aiSummary", "urgency"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No analysis returned");
  } catch (error) {
    console.error("Feedback Analysis Error:", error);
    return {
      sentiment: 'Neutral',
      topics: ['General'],
      aiSummary: 'Could not analyze content.',
      urgency: 'Low'
    };
  }
};
