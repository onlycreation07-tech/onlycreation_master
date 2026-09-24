import { Home, PlusSquare, MapPin, FolderOpen, User, ShieldCheck, Zap } from 'lucide-react';
import { View } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  const { isAdmin } = useAuth();
  
  const navItems: { id: string; icon: any; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'dispatch', icon: Zap, label: 'Dispatch' },
    { id: 'create', icon: PlusSquare, label: 'Create' },
    { id: 'studios', icon: MapPin, label: 'Studios' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];


  if (isAdmin) {
    navItems.push({ id: 'admin', icon: ShieldCheck, label: 'Master' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-sleek-zinc border-t border-white/5 py-4 px-8 flex justify-between items-center z-50 overflow-x-auto hide-scrollbar">
      <div className="flex justify-between items-center w-full min-w-[320px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as View)}
              className={`flex flex-col items-center gap-1 transition-colors flex-shrink-0 ${
                isActive ? 'text-sleek-violet' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <div className={`relative ${isActive ? 'drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]' : ''}`}>
                <Icon size={20} />
              </div>
              <span className="text-[9px] font-bold tracking-widest uppercase mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
