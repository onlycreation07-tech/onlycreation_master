import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isSuperAdmin: false,
});

const SUPER_ADMIN_EMAIL = 'onlycreation07@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const isSuper = user.email === SUPER_ADMIN_EMAIL;
        setIsSuperAdmin(isSuper);

        // Check if user is in admins collection
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          setIsAdmin(isSuper || adminDoc.exists());
          
          // Auto-bootstrap super admin if they log in for the first time
          if (isSuper && !adminDoc.exists()) {
            await setDoc(doc(db, 'admins', user.uid), {
              email: user.email,
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
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
