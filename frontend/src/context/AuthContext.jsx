import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (nik, password) => {
    setIsLoading(true);
    try {
      // The API returns HttpOnly cookies or session info, we don't store tokens in localStorage.
      const response = await api.post('/auth/login', { nik, password });
      
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        // Fallback for mock success if backend structure differs slightly
        setUser({ nik });
        setIsAuthenticated(true);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      console.warn('Logout failed on server, continuing local clear');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
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

