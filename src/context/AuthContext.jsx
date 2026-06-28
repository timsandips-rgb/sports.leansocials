import { createContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { userRepository } from '../repositories/userRepository';
import { communityRepository } from '../repositories/communityRepository';
import { authService } from '../services/authService';
import { USER_STATUS } from '../utils/constants';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await userRepository.getById(firebaseUser.uid);
          if (profile && profile.status === USER_STATUS.APPROVED) {
            const comm = await communityRepository.getById(profile.communityId);
            setUser(profile);
            setCommunity(comm);
          } else {
            setUser(null);
            setCommunity(null);
          }
        } catch (e) {
          console.error('Auth state error:', e);
          setUser(null);
          setCommunity(null);
        }
      } else {
        setUser(null);
        setCommunity(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = useCallback(async (email, password, communityCode) => {
    const result = await authService.login(email, password, communityCode);
    setUser(result.user);
    setCommunity(result.community);
    return result;
  }, []);

  const logout = useCallback(async () => {
    if (user && community) {
      await authService.logout(user.userId, user.username, community.id);
    }
    setUser(null);
    setCommunity(null);
  }, [user, community]);

  const updateUser = useCallback((updates) => {
    setUser((u) => (u ? { ...u, ...updates } : u));
  }, []);

  const value = { user, community, loading, login, logout, updateUser, setUser, setCommunity };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
