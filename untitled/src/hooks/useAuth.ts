import { useState, useEffect } from 'react';

export interface UserProfile {
  email: string;
  username?: string;
  club?: string;
  coins: number;
  gems: number;
  banned?: boolean;
  role: 'admin' | 'user';
  createdAt: string;
  bio?: string;
  nationality?: string;
  photoURL?: string;
  subscription?: string;
  promoCode?: string;
}

export function useAuth() {
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authObj = (globalThis as any).auth;
    let unsubSnapshot: any = null;

    if (authObj && typeof authObj.onAuthStateChanged === 'function') {
      const unsubscribe = authObj.onAuthStateChanged((user: any) => {
        setAuthUser(user);
        if (user) {
          unsubSnapshot = (globalThis as any).onSnapshot({ path: `users/${user.uid}` }, (docSnap: any) => {
            if (docSnap.exists && docSnap.exists()) {
              setProfile(docSnap.data() as UserProfile);
            }
            setLoading(false);
          });
        } else {
          setProfile(null);
          setLoading(false);
          if (unsubSnapshot) {
            unsubSnapshot();
            unsubSnapshot = null;
          }
        }
      });
      return () => {
        unsubscribe();
        if (unsubSnapshot) unsubSnapshot();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    const authObj = (globalThis as any).auth;
    if (authObj && typeof authObj.signOut === 'function') {
      await authObj.signOut();
    }
  };

  const login = async (email: string) => {
    const authObj = (globalThis as any).auth;
    if (authObj && typeof authObj.signIn === 'function') {
      await authObj.signIn(email);
    }
  };

  const register = async (email: string, username: string, club: string) => {
    const authObj = (globalThis as any).auth;
    if (authObj && typeof authObj.signUp === 'function') {
      await authObj.signUp(email, username, club);
    }
  };

  return { user: authUser, profile, loading, logout, login, register };
}
