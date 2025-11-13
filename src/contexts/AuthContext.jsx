import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

// API base URL
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Set user's Gemini API key and detect tier
  const setGeminiApiKey = async (apiKey) => {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'No authenticated user' };
      }

      console.log('🔑 Setting Gemini API key...');

      const response = await fetch(`${API_BASE}/api/auth/set-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          geminiApiKey: apiKey
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ API key set successfully. Tier: ${data.tier}`);

        setHasApiKey(true);

        // Update tier based on detection from backend
        if (data.tier) {
          setUserTier(data.tier);
          console.log(`🎯 Tier auto-detected: ${data.tier.toUpperCase()}`);

          // Update Firestore with detected tier
          if (user?.uid) {
            try {
              await updateDoc(doc(db, 'users', user.uid), {
                tier: data.tier,
                lastApiKeyUpdate: new Date(),
              });
              console.log('📊 Firestore updated with detected tier');
            } catch (firestoreError) {
              console.warn('⚠️ Could not update Firestore:', firestoreError);
            }
          }
        }

        return {
          success: true,
          tier: data.tier,
          modelCount: data.modelCount
        };
      } else {
        const errorData = await response.json();
        console.error('❌ API key validation failed:', errorData.error);
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('❌ Set API key error:', error);
      return { success: false, error: 'Failed to set API key. Please check your connection.' };
    }
  };

  // Sign in with Google using popup (works better with React StrictMode)
  const signInWithGoogle = async () => {
    try {
      console.log('🚀 Starting Google sign-in with popup...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Popup sign-in successful:', result.user.email);
      // User is now authenticated, onAuthStateChanged will handle the rest
      return { success: true };
    } catch (error) {
      console.error('❌ Sign in error:', error.code, error.message);

      // Handle specific popup errors
      let errorMessage = 'Failed to sign in. Please try again.';

      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by your browser. Please allow popups for this site.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized. Please contact support.';
      }

      return { success: false, error: errorMessage };
    }
  };

  // Sign out from both Firebase and backend
  const signOut = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      await firebaseSignOut(auth);
      
      setUser(null);
      setUserTier(null);
      setUsageData(null);
      setAuthenticated(false);
      setHasApiKey(false);
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  };

  // Fetch user tier and usage data from Firestore
  const fetchUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserTier(data.tier || 'free');
        setUsageData({
          generationsToday: data.generationsToday || 0,
          totalGenerations: data.totalGenerations || 0,
          lastResetDate: data.lastResetDate?.toDate() || new Date(),
        });
      } else {
        const newUserData = {
          tier: 'free',
          generationsToday: 0,
          totalGenerations: 0,
          lastResetDate: new Date(),
          createdAt: new Date(),
        };
        await setDoc(doc(db, 'users', uid), newUserData);
        setUserTier('free');
        setUsageData({
          generationsToday: 0,
          totalGenerations: 0,
          lastResetDate: new Date(),
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserTier('free');
    }
  };

  // Reset daily usage if needed
  const checkAndResetDailyUsage = async (uid, lastResetDate) => {
    const now = new Date();
    const lastReset = lastResetDate?.toDate() || new Date(0);

    if (now.toDateString() !== lastReset.toDateString()) {
      try {
        await updateDoc(doc(db, 'users', uid), {
          generationsToday: 0,
          lastResetDate: now,
        });
        setUsageData(prev => ({
          ...prev,
          generationsToday: 0,
          lastResetDate: now,
        }));
      } catch (error) {
        console.error('Error resetting daily usage:', error);
      }
    }
  };

  // Check backend auth status
  const checkBackendAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/status`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthenticated(data.authenticated);
        setHasApiKey(!!data.user?.geminiApiKey);
        return data;
      }
      
      setAuthenticated(false);
      setHasApiKey(false);
      return null;
    } catch (error) {
      console.error('Backend auth check error:', error);
      setAuthenticated(false);
      setHasApiKey(false);
      return null;
    }
  };

  // Increment usage count
  const incrementUsage = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        generationsToday: increment(1),
        totalGenerations: increment(1),
      });

      setUsageData(prev => ({
        ...prev,
        generationsToday: prev.generationsToday + 1,
        totalGenerations: prev.totalGenerations + 1,
      }));

      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  // Check if user can generate (based on tier limits and API key)
  const canGenerate = () => {
    if (!user || !userTier || !usageData) return false;
    if (!authenticated || !hasApiKey) return false;

    const limits = {
      free: 5,      // 5 generations per day
      pro: 100,     // 100 generations per day
    };

    return usageData.generationsToday < limits[userTier];
  };

  // Get remaining generations for today
  const getRemainingGenerations = () => {
    if (!userTier || !usageData) return 0;
    if (!authenticated || !hasApiKey) return 0;

    const limits = {
      free: 5,
      pro: 100,
    };

    return Math.max(0, limits[userTier] - usageData.generationsToday);
  };

  // Auth state observer - simplified for popup flow
  useEffect(() => {
    let mounted = true;

    console.log('🔥 Auth Provider initialized');

    // Setup auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? firebaseUser.email : 'No user');

      if (!mounted) return;

      if (firebaseUser) {
        console.log('✅ User authenticated with Firebase:', firebaseUser.email);

        // Set user immediately
        setUser(firebaseUser);

        try {
          // Fetch user data from Firestore
          await fetchUserData(firebaseUser.uid);

          // Reset daily usage if needed
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            await checkAndResetDailyUsage(firebaseUser.uid, userDoc.data().lastResetDate);
          }

          // Create backend session
          try {
            const idToken = await getIdToken(firebaseUser, true);
            console.log('🔑 Got ID token, length:', idToken.length);

            const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ idToken }),
            });

            if (loginResponse.ok) {
              console.log('✅ Backend session created');
              const data = await loginResponse.json();
              if (mounted) {
                setAuthenticated(true);
                setHasApiKey(!!data.user?.geminiApiKey);
              }
            } else {
              console.error('❌ Backend login failed:', loginResponse.status);
              if (mounted) {
                setAuthenticated(false);
                setHasApiKey(false);
              }
            }
          } catch (backendError) {
            console.error('❌ Backend error:', backendError);
            if (mounted) {
              setAuthenticated(false);
              setHasApiKey(false);
            }
          }
        } catch (error) {
          console.error('❌ User data error:', error);
          if (mounted) {
            setAuthenticated(false);
            setHasApiKey(false);
          }
        }
      } else {
        console.log('👤 No user, clearing states');
        if (mounted) {
          setUser(null);
          setUserTier(null);
          setUsageData(null);
          setAuthenticated(false);
          setHasApiKey(false);
        }
      }

      if (mounted) {
        setLoading(false);
      }
    });

    // Clean up
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []); // Empty dependency array - run once only

  const value = {
    user,
    userTier,
    usageData,
    loading,
    authenticated,
    hasApiKey,
    signInWithGoogle,
    signOut,
    setGeminiApiKey,
    incrementUsage,
    canGenerate,
    getRemainingGenerations,
    checkBackendAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
