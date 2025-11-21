import { GoogleGenAI } from "@google/genai";
import { TuningTip } from "../types";

// Initialize Gemini Client
// NOTE: In a real production app, calls should often go through a backend proxy to secure the key.
// For this specific client-side implementation, we use process.env.API_KEY as instructed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGuitarAdvice = async (topic: string): Promise<TuningTip> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are a world-class professional guitar technician (luthier).
      Provide a very short, concise, and helpful tip about: "${topic}".
      Keep it under 40 words. Be encouraging.
      Format the response as a JSON object with "title" and "content".
      Example: {"title": "Stretch your strings", "content": "New strings slip easily. Gently pull them away from the fretboard to stretch them out for better tuning stability."}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as TuningTip;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      title: "Connection Error",
      content: "Could not reach the digital luthier. Try again later."
    };
  }
};
