import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;
  private modelId = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt,
        config: {
          systemInstruction: "You are the 'Digital Sahayak' (Assistant) for the Shri Venkateswara Swamy Temple in Pendurthi. You are knowledgeable about Hindu traditions, temple history, pooja timings, and booking procedures. Be polite, spiritual, and concise. Use Namaste. Provide answers in plain text.",
        }
      });
      return response.text || "Namaste, I am currently meditating. Please try again later.";
    } catch (error) {
      console.error('AI Error:', error);
      return "Namaste, I am having trouble connecting to the divine network. Please check your connection.";
    }
  }
}