import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { db } from '../db/db';
import { verifyPassword } from '../utils/security';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, passwordPlain: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'as_praveen_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const savedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
        if (savedUserId) {
          const user = await db.users.get(savedUserId);
          if (user && user.active) {
            setCurrentUser(user);
          } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (username: string, passwordPlain: string) => {
    try {
      const user = await db.users.where('username').equalsIgnoreCase(username.trim()).first();
      if (!user) {
        return { success: false, message: 'Invalid username or user does not exist' };
      }

      if (!user.active) {
        return { success: false, message: 'User account is deactivated. Contact Admin.' };
      }

      const isMatch = await verifyPassword(passwordPlain, user.passwordHash);
      if (!isMatch) {
        return { success: false, message: 'Invalid password. Please try again.' };
      }

      setCurrentUser(user);
      localStorage.setItem(AUTH_STORAGE_KEY, user.id);

      // Record audit log for login
      await db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
        user: user.username,
        role: user.role,
        action: 'User Logged In',
        recordType: 'AUTH',
        details: `Successful login for ${user.name} (${user.role})`
      });

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'An error occurred during authentication' };
    }
  };

  const logout = () => {
    if (currentUser) {
      db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
        user: currentUser.username,
        role: currentUser.role,
        action: 'User Logged Out',
        recordType: 'AUTH',
        details: `Logout for ${currentUser.name}`
      }).catch(console.error);
    }
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
