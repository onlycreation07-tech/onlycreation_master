import { AdCreative } from '../../types';
import { Calendar, Image as ImageIcon, Send, Clock, Trash2, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectsScreenProps {
  creatives: AdCreative[];
}

export default function ProjectsScreen({ creatives }: ProjectsScreenProps) {
  return (
    <div className="flex flex-col gap-6 pb-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tighter text-white/90">Projects</h1>
        <p className="text-white/40 text-sm font-medium">Review and manage your creative history.</p>
      </header>

      {creatives.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24 text-center">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center">
            <Clock className="text-zinc-700" size={40} />
          </div>
          <div className="max-w-[240px]">
            <h3 className="text-lg font-bold mb-2">No projects yet</h3>
            <p className="text-zinc-500 text-sm">Once you start generating ads, they’ll appear here for easy access.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex gap-4 border-b border-white/5 pb-2 overflow-x-auto hide-scrollbar">
            <button className="text-[10px] font-bold uppercase tracking-widest text-white border-b-2 border-sleek-violet pb-2 px-2 whitespace-nowrap">Generated</button>
            <button className="text-[10px] font-bold uppercase tracking-widest text-white/40 pb-2 px-2 whitespace-nowrap">Studio Bookings</button>
            <button className="text-[10px] font-bold uppercase tracking-widest text-white/40 pb-2 px-2 whitespace-nowrap">Exports</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {creatives.map((creative, idx) => (
              <motion.div
                key={creative.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative flex flex-col gap-2 cursor-pointer"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-sleek-dark border border-white/5 shadow-xl">
                  <img
                    src={creative.imageUrls[0]}
                    alt={creative.prompt}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-sleek-violet/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                      <ExternalLink size={20} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="px-1">
                  <h4 className="font-bold text-sm truncate leading-tight text-white/80">{creative.prompt}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em]">
                      {new Date(creative.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-zinc-900/50 p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
        <h3 className="text-lg font-bold tracking-tight">Need help producing?</h3>
        <p className="text-zinc-500 text-sm">Connect with a production manager to finalize your scripts, casting, and booking logistics.</p>
        <button className="bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2">
          <Send size={16} />
          Talk to a Specialist
        </button>
      </div>
    </div>
  );
}
