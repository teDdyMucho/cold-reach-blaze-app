import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, AuthState } from '@/types';

interface AuthContextType {
  authState: AuthState;
  setUser: (user: User | null) => void;
  user: User | null;
}

const initialAuthState: AuthState = {
  user: null,
  loading: true,
  error: null
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setAuthState({
              user: {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                settings: userData.settings,
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt
              },
              loading: false,
              error: null
            });
          } else {
            // User exists in Firebase Auth but not in Firestore
            setAuthState({
              user: {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
              },
              loading: false,
              error: null
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setAuthState({
            user: null,
            loading: false,
            error: 'Failed to load user data'
          });
        }
      } else {
        // User is signed out
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const setUser = (user: User | null) => {
    setAuthState({
      user,
      loading: false,
      error: null
    });
  };

  return (
    <AuthContext.Provider value={{ 
      authState, 
      setUser,
      user: authState.user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
