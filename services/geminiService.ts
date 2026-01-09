
import { GoogleGenAI, Type } from "@google/genai";
import { CalculationInputs, AIAnalysis } from "../types";

export const getAIAnalysis = async (inputs: CalculationInputs): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `As a Senior FinTech Advisor for the Indian market, analyze this mutual fund investment scenario:
  Mode: ${inputs.mode}
  Amount: ₹${inputs.amount}
  Horizon: ${inputs.years} years
  Target CAGR: ${inputs.cagr}%
  Risk Profile: ${inputs.risk}
  Category Preference: ${inputs.category}

  Provide:
  1. A friendly explanation in "Hinglish" (Hindi + English) with a touch of Bengali warmth. Explain why returns are estimated in a range. Use analogies about market volatility.
  2. Top 3 specific, popular Indian mutual fund recommendations for Large Cap, Mid Cap, and Small Cap categories suitable for this specific user.
  3. Why these are suitable for their risk appetite.
  
  Format the output strictly as JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                cagr: { type: Type.STRING },
                risk: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["name", "type", "cagr", "risk", "explanation"]
            }
          }
        },
        required: ["explanation", "recommendations"]
      }
    }
  });

  try {
    const text = response.text.trim();
    return JSON.parse(text) as AIAnalysis;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("AI analysis failed to generate correctly.");
  }
};

export const analyzeScreenshot = async (base64Image: string, mimeType: string = "image/jpeg"): Promise<Partial<CalculationInputs>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = "Analyze this Mutual Fund screenshot from an app like Groww, Zerodha, or INDmoney. Extract: 1) Investment Amount, 2) Fund Name, 3) Portfolio/Fund CAGR. Return JSON with keys: amount (number), cagr (number), fundName (string). If a value is missing, return null for that key.";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, nullable: true },
            cagr: { type: Type.NUMBER, nullable: true },
            fundName: { type: Type.STRING, nullable: true }
          }
        }
      }
    });

    const text = response.text.trim();
    return JSON.parse(text);
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    // Provide a descriptive error if the API fails
    if (error.message?.includes("500") || error.message?.includes("xhr")) {
      throw new Error("Market data scanning service is currently busy. Please try a smaller screenshot or enter details manually.");
    }
    throw error;
  }
};
