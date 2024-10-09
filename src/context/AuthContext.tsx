import React, { createContext, useState, useContext, useEffect } from 'react';
import { initDB, getUser, createSession, getUserByToken, removeSession } from '../utils/db';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'worker';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeDB = async () => {
      await initDB();
      // We don't check for stored token here as it's now managed in SQLite
    };
    initializeDB();
  }, []);

  const login = async (username: string, password: string) => {
    const user = getUser(username, password);
    if (user) {
      const newToken = createSession(user.id);
      setUser(user);
      setToken(newToken);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    if (token) {
      removeSession(token);
    }
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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