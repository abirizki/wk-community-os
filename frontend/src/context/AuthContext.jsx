import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate session on initial load
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await api.get('/auth/me');
        if (response?.user) {
          setUser(response.user);
          setIsAuthenticated(true);
        }
      } catch (e) {
        // Not logged in or session expired
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = useCallback(async (usernameOrNik, password) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { username: usernameOrNik, password });
      
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectProfile = useCallback(async (nik) => {
    try {
      const response = await api.post('/auth/select-profile', { nik });
      if (response.success && response.active_persona) {
        setUser(prev => ({
          ...prev,
          active_nik: response.active_persona.nik,
          active_nama: response.active_persona.nama,
          active_hubungan: response.active_persona.hubungan
        }));
      }
      return response;
    } catch (e) {
      console.error('Failed to switch family profile:', e);
      throw e;
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
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      logout,
      selectProfile
    }}>
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
