/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { View, AdCreative, BrandProfile } from './types';
import BottomNav from './components/layout/BottomNav';
import HomeScreen from './components/home/HomeScreen';
import CreateScreen from './components/create/CreateScreen';
import StudiosScreen from './components/studios/StudiosScreen';
import ProjectsScreen from './components/projects/ProjectsScreen';
import ProfileScreen from './components/profile/ProfileScreen';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginScreen from './components/auth/LoginScreen';
import BillboardRequestScreen from './components/billboards/BillboardRequestScreen';
import CreatorDispatchScreen from './components/dispatch/CreatorDispatchScreen';
import PartnerPortal from './components/partner/PartnerPortal';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { validateConnection } from './lib/firebase';
import { dbService } from './services/dbService';
import { RefreshCw } from 'lucide-react';


function AppContent() {
  const { user, loading, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [creatives, setCreatives] = useState<AdCreative[]>([]);
  const [activeCreative, setActiveCreative] = useState<AdCreative | null>(null);
  const [studioCategory, setStudioCategory] = useState<'all' | 'photography' | 'video' | 'music' | 'podcast' | 'billboard' | 'liked'>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfile>({
    name: 'Your Brand',
    industry: 'Lifestyle',
    targetAudience: 'General',
    tone: 'Professional',
    primaryColor: '#7C3AED',
    fontVibe: 'minimal',
  });

  useEffect(() => {
    validateConnection();
  }, []);

  useEffect(() => {
    if ((user as any)?.isPartner) {
      setCurrentView('partner');
    }
  }, [user]);

  const handleCreativeGenerated = (creative: AdCreative) => {
    setCreatives([creative, ...creatives]);
    setActiveCreative(creative);
  };

  const handleProduceAd = (creative: AdCreative) => {
    setActiveCreative(creative);
    setCurrentView('studios');
  };

  const handleConvertToProject = async (creative: AdCreative) => {
    try {
      const title = creative.prompt 
        ? creative.prompt.slice(0, 42).trim() + (creative.prompt.length > 42 ? '...' : '') 
        : 'AI Commercial Concept';

      const newProjectId = await dbService.createProject({
        userId: user?.uid || 'guest_user',
        title,
        brandName: brandProfile.name || 'Brand Studio',
        stage: 'ideation',
        budget: 25000,
        creativePrompt: creative.videoScript 
          ? `${creative.prompt}\n\n[VIRAL SCRIPT]:\n${creative.videoScript}` 
          : creative.prompt,
        assignedCreator: {
          name: 'Assigning Creator...',
          role: 'Lead Cinematographer & Editor',
          handle: '@onlycreation.ops'
        },
        milestones: [
          { id: `m_${Date.now()}_1`, title: 'Concept & Script Breakdown Approved', completed: true },
          { id: `m_${Date.now()}_2`, title: 'Production Crew & Studio Booking', completed: false, dueDate: 'In 2 days' },
          { id: `m_${Date.now()}_3`, title: 'Principal Photography & 4K Capture', completed: false, dueDate: 'In 4 days' },
          { id: `m_${Date.now()}_4`, title: 'DaVinci Color & Sound Master Pass', completed: false, dueDate: 'In 6 days' },
          { id: `m_${Date.now()}_5`, title: 'Final Client Sign-off & 4K Delivery', completed: false, dueDate: 'In 7 days' }
        ],
        deliverables: (creative.imageUrls && creative.imageUrls.length > 0) ? [
          {
            id: `del_${Date.now()}`,
            name: 'Concept_Visual_Storyframe.jpg',
            url: creative.imageUrls[0],
            type: 'image',
            uploadedAt: 'Today',
            size: '3.4 MB'
          }
        ] : [],
        aiHealthScore: 98,
        aiRiskAnalysis: 'Fresh concept generated via OnlyCreation AI engine. On track for production.'
      });

      setSelectedProjectId(newProjectId);
      setCurrentView('projects');
    } catch (e) {
      console.warn("Could not save project to Firestore:", e);
      setCurrentView('projects');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sleek-black flex items-center justify-center">
        <RefreshCw className="animate-spin text-sleek-violet" size={40} />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // If partner portal is active, render dedicated full-width partner interface
  if (currentView === 'partner') {
    return (
      <div className="min-h-screen bg-sleek-black text-white font-sans selection:bg-sleek-violet selection:text-white">
        <PartnerPortal onSwitchToClientMode={() => setCurrentView('home')} />
      </div>
    );
  }

  const handleToggleLike = (studioId: string) => {
    const currentLikes = brandProfile.likedStudioIds || [];
    const isLiked = currentLikes.includes(studioId);
    const newLikes = isLiked
      ? currentLikes.filter(id => id !== studioId)
      : [...currentLikes, studioId];
    
    const updatedProfile = { ...brandProfile, likedStudioIds: newLikes };
    setBrandProfile(updatedProfile);
    
    // Persist to Firestore if user is authenticated
    if (user) {
      dbService.saveBrand(user.uid, updatedProfile as any).catch(err => {
        console.error("Failed to persist likes:", err);
      });
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeScreen 
            onUseTemplate={(p) => setCurrentView('create')} 
            onExploreBillboards={() => setCurrentView('billboards')}
            onLaunchDispatch={() => setCurrentView('dispatch')}
            onNavigateToStudios={() => setCurrentView('studios')}
            onNavigateToProfile={() => setCurrentView('profile')}
            onNavigateToPartner={() => setCurrentView('partner')}
            brandName={brandProfile.name} 
          />
        );
      case 'dispatch':
        return (
          <CreatorDispatchScreen 
            brandProfile={brandProfile} 
            onBackToHome={() => setCurrentView('home')} 
          />
        );
      case 'create':
        return (
          <CreateScreen 
            onGenerated={handleCreativeGenerated} 
            onProduce={handleProduceAd} 
            onLaunchDispatch={() => setCurrentView('dispatch')}
            onConvertToProject={handleConvertToProject}
            brandProfile={brandProfile}
          />
        );
      case 'studios':
        return (
          <StudiosScreen 
            activeCreative={activeCreative} 
            brandProfile={brandProfile} 
            onToggleLike={handleToggleLike}
            initialCategory={studioCategory}
            onExploreCreate={() => setCurrentView('create')}
            onViewProjects={() => setCurrentView('projects')}
          />
        );
      case 'projects':
        return (
          <ProjectsScreen 
            creatives={creatives} 
            onOpenCreate={() => setCurrentView('create')}
            onDispatchCreator={() => setCurrentView('dispatch')}
            initialProjectId={selectedProjectId}
          />
        );
      case 'profile':
        return (
          <ProfileScreen 
            brandProfile={brandProfile} 
            onUpdateBrand={setBrandProfile} 
            onNavigateToLiked={() => {
              setStudioCategory('liked');
              setCurrentView('studios');
            }}
            onNavigateToProjects={() => setCurrentView('projects')}
            onNavigateToPartner={() => setCurrentView('partner')}
          />
        );
      case 'partner':
        return (
          <PartnerPortal 
            onSwitchToClientMode={() => setCurrentView('home')} 
          />
        );
      case 'billboards':
        return <BillboardRequestScreen onBack={() => setCurrentView('home')} />;
      case 'admin':
        return isAdmin ? <AdminDashboard /> : (
          <HomeScreen 
            onUseTemplate={(p) => setCurrentView('create')} 
            onExploreBillboards={() => setCurrentView('billboards')}
            brandName={brandProfile.name} 
          />
        );
      default:
        return (
          <HomeScreen 
            onUseTemplate={(p) => setCurrentView('create')} 
            onExploreBillboards={() => setCurrentView('billboards')}
            brandName={brandProfile.name} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-sleek-black text-white font-sans selection:bg-sleek-violet selection:text-white">
      <main className="pb-24 pt-4 px-4 max-w-md mx-auto h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full overflow-y-auto hide-scrollbar"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

