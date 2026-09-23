import { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  Video, 
  Camera, 
  Download, 
  Copy, 
  Zap, 
  Sliders, 
  FolderPlus,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../../services/geminiService';
import { AdCreative, BrandProfile } from '../../types';

interface CreateScreenProps {
  onGenerated: (creative: AdCreative) => void;
  onProduce: (creative: AdCreative) => void;
  onConvertToProject?: (creative: AdCreative) => void;
  onLaunchDispatch?: () => void;
  brandProfile: BrandProfile;
}

const INSPIRATION_TAGS = [
  'Bangalore Tech Noir',
  'Quiet Luxury Fragrance',
  'Indiranagar Coffee Culture',
  'Streetwear Drop 2026',
  'Retro 90s VHS Camcorder',
  'Neon Rooftop Cypher'
];

const STYLES = [
  { id: 'cinematic', label: 'Cinematic 35mm', desc: 'Arri Alexa film tones & deep shadows' },
  { id: 'vhs_retro', label: 'Retro 90s VHS', desc: 'Grain, timestamp & scanline nostalgia' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', desc: 'High-contrast cyan & magenta rim light' },
  { id: 'vogue', label: 'Vogue Minimalist', desc: 'Clean editorial high-fashion typography' },
  { id: 'streetwear', label: 'Streetwear Pop', desc: 'Bold saturated Gen-Z vibrant aesthetic' },
];

const AI_ENGINES = [
  { id: 'chatgpt_dalle', label: 'ChatGPT / DALL-E 3', badge: 'Ultra Photoreal' },
  { id: 'flux_cinema', label: 'Flux Cinema 8K', badge: 'High Fashion' },
  { id: 'imagen_pro', label: 'Google Imagen 3', badge: 'Studio Lighting' },
];

const RATIOS: Array<{ id: '1:1' | '9:16' | '16:9'; label: string; icon: string }> = [
  { id: '9:16', label: '9:16 Reels / TikTok', icon: 'vertical' },
  { id: '1:1', label: '1:1 Square Feed', icon: 'square' },
  { id: '16:9', label: '16:9 Widescreen', icon: 'landscape' },
];

export default function CreateScreen({ 
  onGenerated, 
  onProduce, 
  onConvertToProject,
  onLaunchDispatch,
  brandProfile 
}: CreateScreenProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [selectedEngine, setSelectedEngine] = useState<'chatgpt_dalle' | 'flux_cinema' | 'imagen_pro'>('chatgpt_dalle');
  const [selectedRatio, setSelectedRatio] = useState<'1:1' | '9:16' | '16:9'>('9:16');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [creative, setCreative] = useState<AdCreative | null>(null);
  const [referenceImg, setReferenceImg] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleGenerate = async (customPrompt?: string) => {
    const targetPrompt = customPrompt || prompt;
    if (!targetPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const styleObj = STYLES.find(s => s.id === selectedStyle);
      const result = await geminiService.generateAd(targetPrompt, brandProfile, {
        style: styleObj?.label,
        aspectRatio: selectedRatio,
        engine: selectedEngine
      } as any);
      setCreative(result);
      setSelectedImageIndex(0);
      onGenerated(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = (text: string, sectionId: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleExportBrief = () => {
    if (!creative) return;
    const content = `# ONLY CREATION — PRODUCTION BRIEF
Brand: ${brandProfile.name} (${brandProfile.industry})
Date: ${new Date(creative.createdAt).toLocaleString()}
Prompt: ${creative.prompt}

---
## 1. AD COPY
${creative.copy}

---
## 2. SHORT-FORM VIDEO SCRIPT
${creative.videoScript}

---
## 3. TECHNICAL PRODUCTION SPECIFICATIONS
${creative.productionBrief}

Generated with OnlyCreation AI Studio Intelligence.
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OnlyCreation_Brief_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 h-full">
      <header className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tighter text-white/90">Create</h1>
          <div className="px-3 py-1 bg-sleek-violet/10 border border-sleek-violet/20 rounded-full flex items-center gap-1.5">
            <Sparkles size={12} className="text-sleek-violet animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-sleek-violet">Gemini 2.5 Pro Gen</span>
          </div>
        </div>
        <p className="text-white/40 text-sm">Turn visionary concepts into production-ready ad creatives.</p>
      </header>

      {/* Quick Inspiration Pills */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Curated Directorial Presets</label>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {INSPIRATION_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setPrompt(tag);
                handleGenerate(tag);
              }}
              className="px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-sleek-violet/50 transition-all active:scale-95"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Style & Aspect Ratio Controls */}
        <div className="bg-sleek-dark p-4 rounded-3xl border border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <Sliders size={12} className="text-sleek-violet" /> Visual Aesthetic
            </span>
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              {RATIOS.map(ratio => (
                <button
                  key={ratio.id}
                  onClick={() => setSelectedRatio(ratio.id)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-all ${
                    selectedRatio === ratio.id 
                      ? 'bg-sleek-violet text-white shadow-md' 
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {ratio.id}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  selectedStyle === style.id
                    ? 'bg-sleek-violet/20 border-sleek-violet text-white shadow-md shadow-sleek-violet/10'
                    : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                <p className="text-xs font-bold text-white leading-tight">{style.label}</p>
                <p className="text-[8px] text-white/40 leading-snug mt-0.5 line-clamp-1">{style.desc}</p>
              </button>
            ))}
          </div>

          {/* AI Image Generation Engine Selector */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" /> AI Image Generation Engine
              </span>
              <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">
                Active: {AI_ENGINES.find(e => e.id === selectedEngine)?.label}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {AI_ENGINES.map((eng) => (
                <button
                  key={eng.id}
                  type="button"
                  onClick={() => setSelectedEngine(eng.id as any)}
                  className={`py-2 px-2 rounded-xl text-center border transition-all ${
                    selectedEngine === eng.id
                      ? 'bg-gradient-to-r from-sleek-violet/30 to-sleek-fuchsia/30 border-sleek-violet text-white font-extrabold shadow-sm'
                      : 'bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <p className="text-[10px] font-bold truncate">{eng.label}</p>
                  <p className="text-[7px] text-white/40 uppercase tracking-tighter">{eng.badge}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prompt Input Box */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Campaign Vision & Angle</label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your brand campaign (e.g. Minimalist streetwear drop featuring retro 90s film aesthetic in Bangalore indiranagar)..."
              className="w-full bg-sleek-dark border border-white/10 rounded-2xl p-4 pr-12 min-h-[120px] focus:outline-none focus:ring-1 focus:ring-sleek-violet/50 transition-all text-sm text-white/90 placeholder:text-white/20 resize-none shadow-sm"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !prompt.trim()}
              className={`absolute bottom-4 right-4 p-3 rounded-xl transition-all ${
                isGenerating || !prompt.trim() 
                  ? 'bg-zinc-800 text-zinc-600' 
                  : 'bg-gradient-to-r from-sleek-violet to-sleek-fuchsia text-white hover:scale-105 active:scale-95 shadow-lg shadow-sleek-violet/30'
              }`}
              title="Generate Creative Concept"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </div>

        {/* Assets & Reference Upload */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Style Reference / Brand Assets</label>
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 bg-sleek-dark border border-dashed border-white/15 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:border-sleek-violet/50 transition-all cursor-pointer">
              <Upload size={14} className="text-sleek-violet" />
              <span>{referenceImg ? 'Change Reference File' : 'Upload Logo / Moodboard'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setReferenceImg(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>

            {referenceImg && (
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-sleek-violet/40 relative group shrink-0">
                <img src={referenceImg} alt="Moodboard" className="w-full h-full object-cover" />
                <button
                  onClick={() => setReferenceImg(null)}
                  className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                >
                  Remove
                </button>
              </div>
            )}
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
            className="flex-1 flex flex-col items-center justify-center gap-4 py-16 text-center"
          >
            <div className="relative w-16 h-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-t-sleek-violet border-white/10 rounded-full"
              />
              <Sparkles className="absolute inset-0 m-auto text-sleek-violet" size={24} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-white font-bold text-sm">Generating Production Masterpiece...</p>
              <p className="text-white/40 text-xs">Directing lighting, script cue points & visual brief</p>
            </div>
          </motion.div>
        ) : creative ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-sleek-dark border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-950/70 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">Master Creative Concept</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-sleek-violet bg-sleek-violet/10 px-2.5 py-1 rounded-full border border-sleek-violet/20">
                  Ready for Production
                </span>
              </div>
              
              {/* Generated Image Preview with chosen ratio */}
              <div className={`bg-black relative overflow-hidden group ${
                selectedRatio === '9:16' ? 'aspect-[9/16] max-h-[460px]' : selectedRatio === '16:9' ? 'aspect-video' : 'aspect-square'
              }`}>
                <img
                  src={creative.imageUrls[selectedImageIndex] || creative.imageUrls[0]}
                  alt="Generated creative"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {creative.imageUrls && creative.imageUrls.length > 1 && (
                  <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
                    {creative.imageUrls.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all relative ${
                          selectedImageIndex === idx ? 'border-sleek-violet scale-105 shadow-md shadow-sleek-violet/40' : 'border-white/20 opacity-60 hover:opacity-90'
                        }`}
                      >
                        <img src={img} alt={`Shot ${idx+1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0.5 right-1 text-[7px] font-black text-white bg-black/80 px-1 rounded">
                          {idx === 0 ? 'Hero' : 'B-Roll'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <a 
                    href={creative.imageUrls[selectedImageIndex] || creative.imageUrls[0]}
                    download={`OnlyCreation_Creative_${Date.now()}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-black/60 backdrop-blur-md p-2.5 rounded-xl text-white/80 hover:text-white transition-all border border-white/10 flex items-center gap-1 text-[10px] font-bold"
                    title="Open / Download 4K Image"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">4K Still</span>
                  </a>
                  <button 
                    onClick={() => handleGenerate()}
                    className="bg-black/60 backdrop-blur-md p-2.5 rounded-xl text-white/80 hover:text-white transition-all border border-white/10"
                    title="Regenerate Variation"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button 
                    onClick={handleExportBrief}
                    className="bg-black/60 backdrop-blur-md p-2.5 rounded-xl text-white/80 hover:text-white transition-all border border-white/10"
                    title="Download Production Brief"
                  >
                    <FileText size={14} />
                  </button>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-6">
                {/* Copy Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      <FileText size={12} className="text-sleek-violet" />
                      AI Copywriting
                    </div>
                    <button 
                      onClick={() => handleCopyText(creative.copy, 'copy')}
                      className="text-[9px] font-extrabold uppercase text-white/50 hover:text-white flex items-center gap-1"
                    >
                      {copiedSection === 'copy' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedSection === 'copy' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-base text-zinc-200 leading-relaxed italic border-l-2 border-sleek-violet pl-4 py-1 font-serif">
                    "{creative.copy}"
                  </p>
                </div>

                {/* Video Script Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      <Video size={12} className="text-sleek-fuchsia" />
                      Short-Form Video Script & Angles
                    </div>
                    <button 
                      onClick={() => handleCopyText(creative.videoScript, 'script')}
                      className="text-[9px] font-extrabold uppercase text-white/50 hover:text-white flex items-center gap-1"
                    >
                      {copiedSection === 'script' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedSection === 'script' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 whitespace-pre-line text-xs text-zinc-300 font-mono leading-relaxed">
                    {creative.videoScript}
                  </div>
                </div>

                {/* Technical Production Brief */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      <Camera size={12} className="text-sleek-violet" />
                      Technical Production Brief (Lenses & Lighting)
                    </div>
                    <button 
                      onClick={() => handleCopyText(creative.productionBrief || '', 'brief')}
                      className="text-[9px] font-extrabold uppercase text-white/50 hover:text-white flex items-center gap-1"
                    >
                      {copiedSection === 'brief' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedSection === 'brief' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {creative.productionBrief}
                    </p>
                  </div>
                </div>

                {/* Direct Action Pipeline Buttons */}
                <div className="flex flex-col gap-3 pt-6 border-t border-white/5 mt-2">
                  {onConvertToProject && (
                    <button
                      onClick={() => onConvertToProject(creative)}
                      className="w-full bg-gradient-to-r from-sleek-violet via-purple-600 to-sleek-fuchsia text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-sleek-violet/25 hover:brightness-110 transition-all active:scale-[0.98]"
                    >
                      <FolderPlus size={16} />
                      Launch as Managed Project (Track Milestones)
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onProduce(creative)}
                      className="bg-white text-black py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all active:scale-[0.98]"
                    >
                      Book Studio <ChevronRight size={14} />
                    </button>

                    {onLaunchDispatch && (
                      <button
                        onClick={onLaunchDispatch}
                        className="bg-white/10 text-white border border-white/15 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/15 transition-all active:scale-[0.98]"
                      >
                        <Zap size={14} className="text-emerald-400 fill-emerald-400" /> Dispatch Creator
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={handleExportBrief}
                      className="flex-1 bg-white/5 text-white/70 py-3 rounded-xl font-extrabold text-[10px] border border-white/10 uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download size={12} /> Export Brief (.MD)
                    </button>
                    <button 
                      onClick={() => handleGenerate()}
                      className="flex-1 bg-white/5 text-white/70 py-3 rounded-xl font-extrabold text-[10px] border border-white/10 uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw size={12} /> New Variation
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
              <p className="text-[11px] text-emerald-400 font-medium leading-tight">
                This creative has been automatically benchmarked for high retention, commercial engagement, and production feasibility.
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
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5 shadow-2xl">
              <Sparkles className="text-sleek-violet" size={36} />
            </div>
            <div className="max-w-[260px]">
              <h3 className="text-lg font-bold text-white mb-1.5">Direct Your Next Visual</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Choose a style, pick an aspect ratio, and let OnlyCreation AI architect the complete script and camera plan.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
