import {
  User,
  login as authLogin,
  logout as authLogout,
  getUser,
  isTokenValid,
  refreshToken,
} from "@/lib/auth";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUserSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserSession = async () => {
    try {
      await refreshToken();
      const currentUser = await getUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to refresh user session:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    async function loadUser() {
      if (isTokenValid()) {
        try {
          const currentUser = await getUser();
          setUser(currentUser);
        } catch (error) {
          console.error("Failed to load user:", error);
          await refreshUserSession();
        }
      } else {
        await refreshUserSession();
      }
      setLoading(false);
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
    <AuthContext.Provider
      value={{ user, login, logout, loading, refreshUserSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
