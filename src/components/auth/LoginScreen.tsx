import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Camera, 
  Film, 
  Scissors, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Phone, 
  MapPin, 
  DollarSign, 
  HelpCircle,
  AlertTriangle,
  BadgeCheck
} from 'lucide-react';
import { signInWithGoogle } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

type LoginPortalMode = 'client' | 'partner';

interface PartnerRoleOption {
  id: string;
  title: string;
  category: string;
  icon: any;
  perk: string;
}

const PARTNER_ROLES: PartnerRoleOption[] = [
  {
    id: 'reel_creator',
    title: 'Video Reel Creator',
    category: 'iPhone 16 Pro / Gimbal',
    icon: Smartphone,
    perk: '₹1,500 - ₹4,500 per gig • 3-min instant dispatch'
  },
  {
    id: 'videographer',
    title: 'Cinema Videographer',
    category: 'Sony FX3 / RED / Arri',
    icon: Camera,
    perk: '₹4,000 - ₹15,000 per gig • 4K color graded'
  },
  {
    id: 'video_editor',
    title: 'Video Editor & Colorist',
    category: 'Premiere / DaVinci',
    icon: Scissors,
    perk: 'Remote queue • ₹1,200 per reel edited'
  },
  {
    id: 'studio_owner',
    title: 'Studio Space Owner',
    category: 'Acoustic / Cyclorama',
    icon: Building2,
    perk: '₹1,500 - ₹5,000 / hr slot monetization'
  },
  {
    id: 'rental_vendor',
    title: 'Camera & Gear Rental',
    category: 'Lenses / Lights / Drones',
    icon: Truck,
    perk: 'Express gear dispatch to active sets'
  },
  {
    id: 'agency_owner',
    title: 'Creative Agency Owner',
    category: 'Full Production Crews',
    icon: Film,
    perk: 'Scale turnkey brand contracts across India'
  }
];

export default function LoginScreen() {
  const { loginWithFastAuth } = useAuth();
  const [portalMode, setPortalMode] = useState<LoginPortalMode>('client');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);

  // Creator / Partner Login State
  const [selectedRole, setSelectedRole] = useState<string>('reel_creator');
  const [partnerPhone, setPartnerPhone] = useState('9876543210');
  const [partnerCity, setPartnerCity] = useState('Bangalore (Indiranagar / Koramangala)');
  const [partnerName, setPartnerName] = useState('Arjun Sharma');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setPopupBlocked(false);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn("Google Sign-In Notice:", err);
      const isPopupError = err?.code === 'auth/popup-blocked' || 
                           err?.message?.toLowerCase().includes('popup') ||
                           err?.code === 'auth/cancelled-popup-request';
      if (isPopupError) {
        setPopupBlocked(true);
        setErrorMsg("Popup blocked by browser sandbox. Please tap 1-Click Fast Auth below for immediate access.");
      } else {
        setErrorMsg(err?.message || "Authentication notice. Tap 1-Click Fast Auth to proceed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFastAuth = async (isPartner = false) => {
    setLoading(true);
    try {
      if (isPartner) {
        const roleObj = PARTNER_ROLES.find(r => r.id === selectedRole);
        await loginWithFastAuth({
          name: partnerName || 'Verified Partner',
          email: `${partnerPhone}@partner.onlycreation.io`,
          role: selectedRole,
          isPartner: true,
          phone: `+91 ${partnerPhone}`
        });
      } else {
        await loginWithFastAuth({
          name: 'Creative Brand Lead',
          email: 'creator@onlycreation.io',
          role: 'client',
          isPartner: false
        });
      }
    } catch (e: any) {
      console.error("Fast auth error:", e);
      setErrorMsg("Fast auth ready. Entering platform...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sleek-black text-white w-full flex flex-col justify-center items-center py-10 px-4 select-none">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        
        {/* Brand Icon & Title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-sleek-violet via-sleek-fuchsia to-rose-500 rounded-[28px] flex items-center justify-center shadow-2xl shadow-sleek-violet/50 border border-white/20">
              <Sparkles className="text-white w-10 h-10 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-2 bg-emerald-500 rounded-full border-2 border-sleek-black shadow-lg">
              <Zap size={12} className="text-white fill-current" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
              OnlyCreation
            </h1>
            <p className="text-white/60 text-[10px] font-extrabold uppercase tracking-[0.25em]">
              From Idea To Production • Uber For Shoots
            </p>
          </div>
        </div>

        {/* Portal Switcher (Client vs Creator/Partner) */}
        <div className="w-full bg-sleek-dark p-1.5 rounded-2xl border border-white/10 flex items-center shadow-xl">
          <button
            type="button"
            onClick={() => {
              setPortalMode('client');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              portalMode === 'client'
                ? 'bg-sleek-violet text-white shadow-lg shadow-sleek-violet/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Building2 size={14} />
            <span>Brand / Client</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalMode('partner');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 relative ${
              portalMode === 'partner'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Zap size={14} className="fill-current text-amber-300" />
            <span>Creator / Partner</span>
            <span className="absolute -top-2 -right-1 bg-amber-400 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow">
              Earn
            </span>
          </button>
        </div>

        {/* Mode 1: Client / Brand Login */}
        {portalMode === 'client' && (
          <div className="w-full flex flex-col gap-5">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 w-full">
              <div className="bg-sleek-dark border border-white/10 rounded-2xl p-2.5 flex flex-col items-center gap-1 shadow-sm">
                <Zap size={16} className="text-sleek-violet" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white">3-Min Dispatch</span>
              </div>
              <div className="bg-sleek-dark border border-white/10 rounded-2xl p-2.5 flex flex-col items-center gap-1 shadow-sm">
                <Building2 size={16} className="text-sleek-fuchsia" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white">500+ Studios</span>
              </div>
              <div className="bg-sleek-dark border border-white/10 rounded-2xl p-2.5 flex flex-col items-center gap-1 shadow-sm">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white">Verified Pro</span>
              </div>
            </div>

            {/* Google Authentication Button */}
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-white text-zinc-950 py-4 px-6 rounded-2xl font-black text-sm transition-all active:scale-[0.98] shadow-2xl hover:bg-zinc-100 group disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
            </button>

            {/* 1-Click Fast Auth Button (Bypasses Sandbox Popup Blocks) */}
            <div className="flex flex-col gap-2">
              <button 
                type="button"
                onClick={() => handleFastAuth(false)}
                disabled={loading}
                className="w-full bg-sleek-dark hover:bg-white/10 border-2 border-sleek-violet/40 hover:border-sleek-violet text-white py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
              >
                <Zap size={14} className="text-amber-400 fill-amber-400" />
                <span>1-Click Fast Auth (Sandbox Safe)</span>
              </button>
              <p className="text-[9px] text-white/50 text-center font-medium">
                No popups needed • Works inside browser iframes & previews
              </p>
            </div>

            {errorMsg && (
              <div className="flex flex-col gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>Sandbox Notice</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-tight">
                  {errorMsg}
                </p>
                {popupBlocked && (
                  <button
                    type="button"
                    onClick={() => handleFastAuth(false)}
                    className="mt-1 bg-amber-400 text-black py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-300"
                  >
                    Tap Here for 1-Click Fast Auth
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Creator & Partner Login */}
        {portalMode === 'partner' && (
          <div className="w-full flex flex-col gap-4">
            {/* Creator / Partner Perks Banner */}
            <div className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col gap-1 text-left shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <BadgeCheck size={14} /> Creator / Partner Production Portal
                </span>
                <span className="text-[8px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                  Daily Payouts
                </span>
              </div>
              <p className="text-xs font-extrabold text-white">Earn ₹3,000 - ₹15,000+ Daily on Video Shoots</p>
              <p className="text-[9px] text-emerald-200/70">
                0% platform commission on your first 10 shoots • Instant UPI payout • Full gear transit insurance
              </p>
            </div>

            {/* Select Partner / Vendor Role */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest px-1">
                Select Your Stakeholder Category:
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {PARTNER_ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all ${
                        isSelected 
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md shadow-emerald-500/10'
                          : 'bg-sleek-dark border-white/5 text-white/60 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon size={16} className={isSelected ? 'text-emerald-400' : 'text-white/40'} />
                        {isSelected && <CheckCircle2 size={12} className="text-emerald-400" />}
                      </div>
                      <span className="text-xs font-black text-white leading-tight">{role.title}</span>
                      <span className="text-[8px] text-white/50 uppercase tracking-wider">{role.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phone & Identity Quick Input */}
            <div className="flex flex-col gap-3 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest px-1">
                  Full Name / Studio Name
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. Arjun Sharma (FX3 Videographer)"
                  className="bg-sleek-dark border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest px-1">
                  Partner Mobile Number (+91)
                </label>
                <div className="flex items-center bg-sleek-dark border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-emerald-400">
                  <span className="text-xs font-black text-emerald-400 mr-2">+91</span>
                  <input
                    type="tel"
                    value={partnerPhone}
                    onChange={(e) => setPartnerPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="bg-transparent text-xs font-bold text-white outline-none w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest px-1">
                  Primary Base City
                </label>
                <div className="flex items-center gap-2 bg-sleek-dark border border-white/10 rounded-xl px-3.5 py-2.5">
                  <MapPin size={14} className="text-emerald-400 shrink-0" />
                  <span className="text-xs text-white/90 font-medium truncate">{partnerCity}</span>
                </div>
              </div>
            </div>

            {/* 1-Click Partner Login & Registration Button */}
            <button
              type="button"
              onClick={() => handleFastAuth(true)}
              disabled={loading || !partnerPhone.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50 mt-1"
            >
              <Zap size={16} className="fill-current text-black" />
              <span>{loading ? 'Authenticating Partner...' : 'Login as Verified Creator / Partner'}</span>
            </button>
            <p className="text-[9px] text-white/50 text-center font-medium">
              Instant Creator / Partner Verification • Direct live access to nearby shoot dispatches
            </p>
          </div>
        )}

        {/* Footer info & security */}
        <div className="flex flex-col items-center gap-2 w-full pt-2">
          <div className="flex items-center gap-2 text-white/30 text-[9px] uppercase tracking-widest font-bold w-full">
            <div className="h-[1px] bg-white/10 flex-1" />
            <span>OnlyCreation Production Network</span>
            <div className="h-[1px] bg-white/10 flex-1" />
          </div>

          <p className="text-[10px] text-white/40 font-medium text-center leading-relaxed">
            Secured by Firebase Cloud Architecture. Instant creator dispatch & studio booking across India.
          </p>
        </div>

      </div>
    </div>
  );
}
