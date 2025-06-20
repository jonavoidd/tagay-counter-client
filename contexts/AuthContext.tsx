import { createContext, useContext, useEffect, useState } from "react";
import { useStorageState } from "@/hooks/useStorageState";

interface Session {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface AuthContextType {
  session?: Session | null;
  loading: boolean;
  signIn: (session: Session) => void;
  signOut: () => void;
}

const SESSION_KEY = "user_session";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthProvider />");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [[loadingStorage, storedSession], setStoredSession] =
    useStorageState(SESSION_KEY);

  const [session, setSession] = useState<Session | null>(null);

  // parse stored session on first load
  useEffect(() => {
    if (!loadingStorage) {
      try {
        setSession(storedSession ? JSON.parse(storedSession) : null);
      } catch (error) {
        console.warn(`failed to parse session: ${error}`);
        setSession(null);
      }
    }
  }, [loadingStorage, storedSession]);

  const signIn = (newSession: Session) => {
    setStoredSession(JSON.stringify(newSession));
    setSession(newSession);
  };

  const signOut = () => {
    setStoredSession(null);
    setSession(null);
  };

  const authValue = {
    session,
    loading: loadingStorage,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};
