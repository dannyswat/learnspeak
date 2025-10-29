
import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/auth';
import { authService } from '../services/authService';
import { AuthContext } from './AuthContext';

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = authService.getStoredUser();
    const token = authService.getToken();
    
    if (storedUser && token) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    authService.saveAuth({ user, token });
  };

  const logout = () => {
    setUser(null);
    authService.clearAuth();
  };

  const updateUserProfile = (updatedUser: User) => {
    setUser(updatedUser);
    // Update stored user in localStorage
    const token = authService.getToken();
    if (token) {
      authService.saveAuth({ user: updatedUser, token });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;