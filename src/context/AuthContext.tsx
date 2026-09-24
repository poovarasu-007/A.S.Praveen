import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { db, DEFAULT_BUSINESS_SETTINGS } from '../db/db';
import { verifyPassword, hashPassword } from '../utils/security';

export interface CreateUserParams {
  username: string;
  passwordPlain: string;
  name: string;
  role?: UserRole;
  phone?: string;
  autoLogin?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, passwordPlain: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  createUser: (params: CreateUserParams) => Promise<{ success: boolean; message?: string; user?: User }>;
  resetPassword: (username: string, newPasswordPlain: string, securityVerification: string) => Promise<{ success: boolean; message?: string }>;
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

  const createUser = async ({
    username,
    passwordPlain,
    name,
    role = 'OPERATOR',
    phone,
    autoLogin = false
  }: CreateUserParams) => {
    try {
      const cleanUsername = username.trim().toLowerCase();
      const cleanName = name.trim();

      if (!cleanUsername || !passwordPlain || !cleanName) {
        return { success: false, message: 'Please provide full name, username, and password.' };
      }

      if (cleanUsername.length < 3) {
        return { success: false, message: 'Username must be at least 3 characters long.' };
      }

      if (passwordPlain.length < 4) {
        return { success: false, message: 'Password must be at least 4 characters long.' };
      }

      const existing = await db.users.where('username').equalsIgnoreCase(cleanUsername).first();
      if (existing) {
        return { success: false, message: 'A user with this username already exists.' };
      }

      const passwordHash = await hashPassword(passwordPlain);
      const now = new Date().toISOString();
      const newUser: User = {
        id: `usr_${Date.now()}`,
        username: cleanUsername,
        passwordHash,
        role,
        name: cleanName,
        phone: phone?.trim() || undefined,
        active: true,
        createdAt: now
      };

      await db.users.add(newUser);

      await db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: now,
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
        user: currentUser?.username || newUser.username,
        role: newUser.role,
        action: 'Created User Account',
        recordType: 'USER',
        recordId: newUser.id,
        details: `Created user account ${newUser.username} (${newUser.role})`
      });

      if (autoLogin) {
        setCurrentUser(newUser);
        localStorage.setItem(AUTH_STORAGE_KEY, newUser.id);
      }

      return { success: true, message: 'Account created successfully!', user: newUser };
    } catch (err: any) {
      console.error('Error creating user:', err);
      return { success: false, message: err?.message || 'Failed to create user account.' };
    }
  };

  const resetPassword = async (
    username: string,
    newPasswordPlain: string,
    securityVerification: string
  ) => {
    try {
      const cleanUsername = username.trim().toLowerCase();
      if (!cleanUsername) {
        return { success: false, message: 'Please enter your username.' };
      }

      if (!newPasswordPlain || newPasswordPlain.length < 4) {
        return { success: false, message: 'New password must be at least 4 characters long.' };
      }

      const user = await db.users.where('username').equalsIgnoreCase(cleanUsername).first();
      if (!user) {
        return { success: false, message: 'No account found matching this username.' };
      }

      // Fetch store settings for offline verification
      const currentSettings = await db.settings.get('main_settings');
      const validPhone1 = (currentSettings?.mobile1 || DEFAULT_BUSINESS_SETTINGS.mobile1).replace(/\D/g, '');
      const validPhone2 = (currentSettings?.mobile2 || DEFAULT_BUSINESS_SETTINGS.mobile2).replace(/\D/g, '');
      const cleanInput = securityVerification.trim().toLowerCase().replace(/\s+/g, '');
      const cleanDigits = securityVerification.replace(/\D/g, '');

      // Verification succeeds if matching registered shop phone, user phone, or master key
      const isMobileMatch = (cleanDigits.length >= 4) && (
        (validPhone1 && (validPhone1 === cleanDigits || validPhone1.endsWith(cleanDigits))) ||
        (validPhone2 && (validPhone2 === cleanDigits || validPhone2.endsWith(cleanDigits))) ||
        (user.phone && user.phone.replace(/\D/g, '') === cleanDigits)
      );
      const isMasterKeyMatch = ['asp@2024', 'asp2024', 'aspraveen', 'admin123'].includes(cleanInput);

      if (!isMobileMatch && !isMasterKeyMatch) {
        return {
          success: false,
          message: 'Verification failed. Please enter the registered shop mobile number (8825633575) or master recovery key.'
        };
      }

      const newHash = await hashPassword(newPasswordPlain);
      await db.users.update(user.id, { passwordHash: newHash });

      const now = new Date().toISOString();
      await db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: now,
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
        user: user.username,
        role: user.role,
        action: 'Reset Password',
        recordType: 'AUTH',
        recordId: user.id,
        details: `Password reset successfully for ${user.username}`
      });

      return { success: true, message: 'Password reset successfully! Please sign in with your new password.' };
    } catch (err: any) {
      console.error('Password reset error:', err);
      return { success: false, message: err?.message || 'Failed to reset password.' };
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, isAdmin, login, logout, createUser, resetPassword }}>
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
