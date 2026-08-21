import { GoogleGenAI, Type } from "@google/genai";
import { AdCreative, BrandProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async generateAd(prompt: string, brand?: BrandProfile): Promise<AdCreative> {
    const brandContext = brand ? 
      `For Brand: "${brand.name}" in the "${brand.industry}" industry. 
       Target Audience: ${brand.targetAudience}. 
       Tone: ${brand.tone}. 
       Primary Color: ${brand.primaryColor}.` : '';

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as a world-class ad creative director. ${brandContext}
        Generate a complete ad concept based on this user prompt: "${prompt}".
        
        Provide:
        1. Compelling Ad Copy (max 100 words)
        2. Visual description for a high-end image
        3. A short-form video script (30-60s)
        4. A "Production Brief": Technical instructions for a photographer/videographer including lighting setup, camera angles, and key props.
        
        Format your response in a clean JSON structure.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              copy: { type: Type.STRING },
              visualPrompt: { type: Type.STRING },
              videoScript: { type: Type.STRING },
              productionBrief: { type: Type.STRING },
            },
            required: ["copy", "visualPrompt", "videoScript", "productionBrief"],
          },
        },
      });

      const data = JSON.parse(response.text);
      
      const imageUrls = [
        `https://picsum.photos/seed/${encodeURIComponent(prompt.slice(0, 10) + (brand?.name || ""))}/1080/1080`,
      ];

      return {
        id: Math.random().toString(36).substr(2, 9),
        prompt,
        copy: data.copy,
        imageUrls,
        videoScript: data.videoScript,
        productionBrief: data.productionBrief,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating ad:", error);
      throw error;
    }
  },
  
  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          }
        }
      });
      
      let imageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
      return imageUrl || `https://picsum.photos/seed/${Math.random()}/1080/1080`;
    } catch (error) {
      console.error("Error generating image:", error);
      return `https://picsum.photos/seed/${Math.random()}/1080/1080`;
    }
  }
};
