import { Settings, CreditCard, Shield, LogOut, ChevronRight, Building2, Users, Star, Palette, RefreshCw } from 'lucide-react';
import { BrandProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../lib/firebase';

interface ProfileScreenProps {
  brandProfile: BrandProfile;
  onUpdateBrand: (profile: BrandProfile) => void;
  onNavigateToLiked: () => void;
}

export default function ProfileScreen({ brandProfile, onUpdateBrand, onNavigateToLiked }: ProfileScreenProps) {
  const { user, isSuperAdmin, isAdmin } = useAuth();

  const menuItems = [
    { icon: Building2, label: 'Saved Studios', detail: `${brandProfile.likedStudioIds?.length || 0} locations`, action: onNavigateToLiked },
    { icon: CreditCard, label: 'Billing & Subscriptions', detail: 'Pro Plan • $499/mo' },
    { icon: Users, label: 'Team Members', detail: '2 collaborators' },
    { icon: Shield, label: 'Security & Privacy', detail: 'Protected' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <header className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tighter text-white/90">Profile</h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Creator Hub</p>
        </div>
        <button className="p-3 transition-all active:scale-95 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/10">
          <Settings size={20} className="text-white/80" />
        </button>
      </header>

      {/* Identity Card */}
      <div className="bg-sleek-dark p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sleek-violet/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-sleek-violet/20 transition-all"></div>
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-sleek-violet/30 p-1 bg-gradient-to-tr from-sleek-violet/20 to-sleek-fuchsia/20">
              <img 
                src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full bg-sleek-black"
                referrerPolicy="no-referrer"
              />
            </div>
            {isAdmin && (
              <div className="absolute bottom-0 right-0 bg-sleek-violet text-white p-1.5 rounded-full border-2 border-sleek-black shadow-lg">
                <Shield size={10} className="fill-current" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight text-white/90">{user?.displayName || 'Creator'}</h2>
            <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mt-1 leading-none italic">
              {isSuperAdmin ? 'Master Founder' : isAdmin ? 'Admin' : 'Elite Producer'}
            </p>
          </div>
        </div>
      </div>

      {/* Brand Identity Memory Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between px-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Brand Memory</label>
          <span className="text-[8px] font-bold text-sleek-violet uppercase tracking-widest px-2 py-0.5 rounded bg-sleek-violet/10">Active Moat</span>
        </div>
        <div className="bg-sleek-dark p-6 rounded-[32px] border border-white/5 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Brand Identity</span>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <Building2 size={16} className="text-white/60" />
                </div>
                <input 
                  type="text" 
                  value={brandProfile.name}
                  onChange={(e) => onUpdateBrand({...brandProfile, name: e.target.value})}
                  className="bg-transparent text-sm font-bold text-white/90 focus:outline-none w-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Visual Tone</span>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(['modern', 'serif', 'brutalist', 'minimal'] as const).map((vibe) => (
                  <button
                    key={vibe}
                    onClick={() => onUpdateBrand({ ...brandProfile, fontVibe: vibe })}
                    className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                      brandProfile.fontVibe === vibe 
                        ? 'bg-sleek-violet/10 border-sleek-violet text-sleek-violet' 
                        : 'bg-white/5 border-white/5 text-white/40'
                    }`}
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => item.action && item.action()}
            className="flex items-center justify-between p-5 bg-sleek-dark border border-white/5 rounded-2xl hover:bg-white/5 transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors border border-white/5">
                <item.icon size={18} className="text-white/80" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white/90">{item.label}</p>
                {item.detail && <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{item.detail}</p>}
              </div>
            </div>
            <ChevronRight size={18} className="text-white/20 group-hover:text-white/50 transition-colors" />
          </button>
        ))}
      </div>

      <button 
        onClick={() => logout()}
        className="flex items-center justify-center gap-2 p-5 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition-all group mt-4 active:scale-95"
      >
        <LogOut size={18} />
        Sign Out Securely
      </button>

      <div className="text-center mt-4">
        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">OnlyCreation v1.1.0 - Cloud Enabled</p>
      </div>
    </div>
  );
}
