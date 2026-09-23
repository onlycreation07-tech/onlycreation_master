import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, signInAnonymouslyAuth } from '../lib/firebase';

export interface FastAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  isPartner?: boolean;
  partnerRole?: string | null;
}

interface AuthContextType {
  user: User | FastAuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  partnerRole: string | null;
  loginWithFastAuth: (options?: { 
    name?: string; 
    email?: string; 
    role?: string; 
    isPartner?: boolean; 
    phone?: string 
  }) => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isSuperAdmin: false,
  partnerRole: null,
  loginWithFastAuth: async () => {},
  logoutUser: async () => {},
});

const SUPER_ADMIN_EMAIL = 'onlycreation07@gmail.com';
const LOCAL_AUTH_STORAGE_KEY = 'onlycreation_fast_auth_user_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | FastAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [partnerRole, setPartnerRole] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage for persistent fast auth / partner sessions
    const savedFastAuth = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
    if (savedFastAuth) {
      try {
        const parsed = JSON.parse(savedFastAuth);
        setUser(parsed);
        if (parsed.partnerRole) setPartnerRole(parsed.partnerRole);
        if (parsed.email === SUPER_ADMIN_EMAIL) {
          setIsSuperAdmin(true);
          setIsAdmin(true);
        }
      } catch (e) {
        console.warn("Failed to parse cached auth session:", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        const isSuper = fbUser.email === SUPER_ADMIN_EMAIL;
        setIsSuperAdmin(isSuper);

        // Check if user is in admins collection
        try {
          const adminDoc = await getDoc(doc(db, 'admins', fbUser.uid));
          setIsAdmin(isSuper || adminDoc.exists());
          
          // Auto-bootstrap super admin if they log in for the first time
          if (isSuper && !adminDoc.exists()) {
            await setDoc(doc(db, 'admins', fbUser.uid), {
              email: fbUser.email,
              role: 'superadmin',
              addedAt: new Date().toISOString()
            });
            setIsAdmin(true);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(isSuper); // Fallback to email check if DB fails
        }
      } else {
        // If no firebase user, but we have a saved fast auth, keep it
        const saved = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
        if (!saved) {
          setUser(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setPartnerRole(null);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithFastAuth = async (options?: { 
    name?: string; 
    email?: string; 
    role?: string; 
    isPartner?: boolean; 
    phone?: string 
  }) => {
    const isPartner = options?.isPartner ?? false;
    const role = options?.role || (isPartner ? 'reel_creator' : 'client');
    const name = options?.name || (isPartner ? 'Creator Partner' : 'Production Client');
    const email = options?.email || (isPartner ? 'partner@onlycreation.io' : 'client@onlycreation.io');
    const phone = options?.phone || '+91 98765 43210';
    
    let fbUid = `fast_${Date.now()}`;
    try {
      const cred = await signInAnonymouslyAuth(name);
      if (cred?.user?.uid) {
        fbUid = cred.user.uid;
      }
    } catch (e) {
      console.warn("Anonymous sign-in bypass fallback active:", e);
    }

    const fastUser: FastAuthUser = {
      uid: fbUid,
      email,
      displayName: name,
      photoURL: isPartner 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      phoneNumber: phone,
      isPartner,
      partnerRole: role,
    };

    localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(fastUser));
    setUser(fastUser);
    setPartnerRole(role);
    if (email === SUPER_ADMIN_EMAIL) {
      setIsSuperAdmin(true);
      setIsAdmin(true);
    }
  };

  const logoutUser = async () => {
    localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
    setUser(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setPartnerRole(null);
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Sign out err:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin, 
      isSuperAdmin, 
      partnerRole, 
      loginWithFastAuth, 
      logoutUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

