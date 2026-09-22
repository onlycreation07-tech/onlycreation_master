import { GoogleGenAI, Type } from "@google/genai";
import { AdCreative, BrandProfile } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const geminiService = {
  async generateAd(
    prompt: string, 
    brand?: BrandProfile, 
    options?: { style?: string; aspectRatio?: '1:1' | '9:16' | '16:9' }
  ): Promise<AdCreative> {
    const brandContext = brand ? 
      `For Brand: "${brand.name}" in the "${brand.industry}" industry. 
       Target Audience: ${brand.targetAudience}. 
       Tone: ${brand.tone}. 
       Visual Vibe: ${brand.fontVibe || 'modern'}. 
       Primary Color: ${brand.primaryColor}.` : '';

    const stylePrompt = options?.style ? `Visual Style Direction: ${options.style}.` : '';
    const ratioPrompt = options?.aspectRatio ? `Format: ${options.aspectRatio} aspect ratio.` : '';

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Act as an award-winning creative advertising director & executive producer. ${brandContext} ${stylePrompt} ${ratioPrompt}
        Generate a comprehensive, production-ready ad concept based on this user prompt: "${prompt}".
        
        Provide:
        1. Compelling Ad Copy (headline, catchy body, hook, call to action)
        2. Visual prompt for image generation
        3. A short-form video script with shot descriptions, camera movement, and audio cues
        4. A "Production Brief": High-end technical guide for photographers/videographers detailing lighting gear (key, fill, backlight, gels), recommended lenses (e.g., 35mm f/1.4, anamorphic), color grading palette, props, and audio design.
        
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

      const data = JSON.parse(response.text || '{}');
      
      // Attempt image generation with the enhanced visual prompt
      let generatedImgUrl = '';
      try {
        generatedImgUrl = await this.generateImage(data.visualPrompt || prompt, options?.aspectRatio || '1:1', options?.style);
      } catch (err) {
        console.warn("Falling back to curated imagery:", err);
      }

      const imageUrls = [
        generatedImgUrl || `https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1080&auto=format&fit=crop`,
      ];

      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt,
        copy: data.copy || 'Experience creative distinction tailored for modern storytellers.',
        imageUrls,
        videoScript: data.videoScript || '[0:00-0:05] Dynamic macro dolly shot.\n[0:05-0:15] Voiceover introduction.\n[0:15-0:30] Call to action punchy lockup.',
        productionBrief: data.productionBrief || 'Lighting: 3-point softbox setup with 45° rim light. Camera: 4K 60fps with 50mm prime lens. Sound: Deep atmospheric ambient synths.',
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating ad:", error);
      // Resilient fallback with styled creative
      return {
        id: Math.random().toString(36).substring(2, 9),
        prompt,
        copy: `Elevate your aesthetic with ${brand?.name || 'OnlyCreation'}. Crafted for visionary creators who refuse to blend in.`,
        imageUrls: [`https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1080&auto=format&fit=crop`],
        videoScript: `Scene 1: Rapid whip pan across urban neon architecture.\nScene 2: Creator unboxes the project asset with crisp ambient audio.\nScene 3: Bold typography title card transition.`,
        productionBrief: `Equipment: Arri Alexa / Sony FX3 with anamorphic lenses. Lighting: High-contrast cyan/magenta rim lighting. Color grade: Kodak 5219 film emulation.`,
        status: 'draft',
        createdAt: new Date().toISOString()
      };
    }
  },
  
  async generateImage(
    prompt: string, 
    aspectRatio: '1:1' | '9:16' | '16:9' = '1:1',
    style?: string
  ): Promise<string> {
    try {
      const enhancedPrompt = `${prompt}. Professional production photography, ${style || 'cinematic lighting, crisp 8k hyper-detailed aesthetic'}.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio,
          }
        }
      });
      
      let imageUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
      return imageUrl || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop`;
    } catch (error) {
      console.error("Error generating image:", error);
      return `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop`;
    }
  },

  async analyzeProjectHealth(params: {
    title: string;
    stage: string;
    milestonesTotal: number;
    milestonesCompleted: number;
    deliverablesTotal: number;
  }): Promise<{ healthScore: number; riskLevel: 'low' | 'medium' | 'high'; insights: string[]; recommendations: string[] }> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Act as an AI Project Health & Quality Monitor for high-end video/commercial production.
        Analyze this project status:
        - Project: "${params.title}"
        - Current Stage: "${params.stage}"
        - Milestones: ${params.milestonesCompleted}/${params.milestonesTotal} completed
        - Deliverables Uploaded: ${params.deliverablesTotal}
        
        Evaluate delivery risk, operational bottlenecks, and give 2 clear insights and 2 actionable recommendations.
        Format response as JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healthScore: { type: Type.INTEGER, description: "Score between 0 and 100" },
              riskLevel: { type: Type.STRING, enum: ["low", "medium", "high"] },
              insights: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["healthScore", "riskLevel", "insights", "recommendations"]
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        healthScore: parsed.healthScore ?? 88,
        riskLevel: parsed.riskLevel ?? 'low',
        insights: parsed.insights ?? ['Milestones pacing aligns with pre-production schedule.'],
        recommendations: parsed.recommendations ?? ['Schedule technical rehearsal 24 hours prior to shoot day.']
      };
    } catch (e) {
      console.warn("AI Project health analysis fallback:", e);
      const ratio = params.milestonesTotal > 0 ? (params.milestonesCompleted / params.milestonesTotal) : 0.8;
      const score = Math.round(ratio * 40 + 55);
      return {
        healthScore: Math.min(score, 98),
        riskLevel: score > 75 ? 'low' : score > 50 ? 'medium' : 'high',
        insights: [
          `Active pipeline in ${params.stage.replace('_', ' ')} phase.`,
          `${params.milestonesCompleted} of ${params.milestonesTotal} milestones cleared.`
        ],
        recommendations: [
          'Verify equipment readiness with assigned studio or creator crew.',
          'Review raw draft cuts before final color master export.'
        ]
      };
    }
  }
};
