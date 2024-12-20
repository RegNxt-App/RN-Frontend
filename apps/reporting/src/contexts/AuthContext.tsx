import {createContext, useContext, useEffect, useState} from 'react';

import {
  User,
  login as authLogin,
  logout as authLogout,
  getUser,
  isTokenValid,
  refreshToken,
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUserSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserSession = async () => {
    try {
      if (!isTokenValid()) {
        await refreshToken();
      }
      const currentUser = await getUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh user session:', error);
      setUser(null);
    }
  };
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    if (user) {
      refreshInterval = setInterval(refreshUserSession, 840000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [user]);

  useEffect(() => {
    async function loadUser() {
      try {
        if (isTokenValid()) {
          const currentUser = await getUser();
          setUser(currentUser);
        } else {
          await refreshUserSession();
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const user = await authLogin(email, password);
    setUser(user);
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{user, login, logout, loading, refreshUserSession}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
