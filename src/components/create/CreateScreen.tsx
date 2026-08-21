import { useState } from 'react';
import { Sparkles, Send, Upload, RefreshCw, CheckCircle2, ChevronRight, FileText, Video, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../../services/geminiService';
import { AdCreative, BrandProfile } from '../../types';

interface CreateScreenProps {
  onGenerated: (creative: AdCreative) => void;
  onProduce: (creative: AdCreative) => void;
  brandProfile: BrandProfile;
}

export default function CreateScreen({ onGenerated, onProduce, brandProfile }: CreateScreenProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [creative, setCreative] = useState<AdCreative | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await geminiService.generateAd(prompt, brandProfile);
      setCreative(result);
      onGenerated(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 h-full">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tighter text-white/90">Create</h1>
        <p className="text-white/40 text-sm">Turn your vision into ad-ready creatives.</p>
      </header>

      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Prompt Input</label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your brand or campaign idea..."
              className="w-full bg-sleek-dark border border-white/10 rounded-2xl p-4 pr-12 min-h-[140px] focus:outline-none focus:ring-1 focus:ring-sleek-violet/50 transition-all text-sm text-white/80 resize-none shadow-sm"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`absolute bottom-4 right-4 p-2 rounded-xl transition-all ${
                isGenerating || !prompt.trim() 
                  ? 'bg-zinc-800 text-zinc-600' 
                  : 'bg-white text-black hover:scale-105 active:scale-95'
              }`}
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Assets</label>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 bg-sleek-dark border border-white/10 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors">
              <Upload size={14} />
              Upload
            </button>
            <div className="flex-1 aspect-video bg-white/5 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-[10px] font-bold text-zinc-600 uppercase">
              Brand_Logos.zip
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 py-12"
          >
            <div className="relative w-16 h-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-t-white border-white/10 rounded-full"
              />
              <Sparkles className="absolute inset-0 m-auto text-white" size={24} />
            </div>
            <p className="text-zinc-500 font-medium animate-pulse">Generating your masterpiece...</p>
          </motion.div>
        ) : creative ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-sleek-dark border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-sleek-black/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Ad Visual A</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-sleek-violet">Studio Ready</span>
              </div>
              
              <div className="aspect-square bg-sleek-black relative overflow-hidden">
                <img
                  src={creative.imageUrls[0]}
                  alt="Generated creative"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 z-10">
                  <button className="bg-black/60 backdrop-blur-md p-2.5 rounded-xl text-white/80 hover:text-white transition-all border border-white/10">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    <FileText size={12} className="text-sleek-violet" />
                    AI Generated Copy
                  </div>
                  <p className="text-lg text-zinc-300 leading-relaxed italic border-l-2 border-sleek-violet/30 pl-4 py-1">
                    "{creative.copy}"
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    <Camera size={12} className="text-sleek-violet" />
                    Technical Production Brief
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {creative.productionBrief}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-6 border-t border-white/5 mt-2">
                  <button
                    onClick={() => onProduce(creative)}
                    className="w-full bg-gradient-to-r from-sleek-violet to-sleek-fuchsia text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-sleek-violet/20 hover:brightness-110 transition-all active:scale-[0.98]"
                  >
                    Produce this Ad
                    <ChevronRight size={20} />
                  </button>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white/5 text-white/60 py-3 rounded-xl font-bold text-[10px] border border-white/10 uppercase tracking-widest hover:bg-white/10 transition-all">
                      Regenerate
                    </button>
                    <button className="flex-1 bg-white/5 text-white/60 py-3 rounded-xl font-bold text-[10px] border border-white/10 uppercase tracking-widest hover:bg-white/10 transition-all">
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <CheckCircle2 className="text-emerald-500" size={20} />
              <p className="text-[11px] text-emerald-400 font-medium leading-tight">
                This creative has been automatically benchmarked against top-performing Gen Z ads.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 py-12 text-center"
          >
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center">
              <Sparkles className="text-zinc-700" size={40} />
            </div>
            <div className="max-w-[240px]">
              <h3 className="text-lg font-bold mb-2">Start your engine</h3>
              <p className="text-zinc-500 text-sm">Describe what you want to create and let AI handle the heavy lifting.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
