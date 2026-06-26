import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('dineflow_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setRestaurant(data.restaurant);
    } catch {
      localStorage.removeItem('dineflow_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('dineflow_token', data.token);
    setUser(data.user);
    setRestaurant(data.restaurant);
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('dineflow_token', data.token);
    setUser(data.user);
    setRestaurant(data.restaurant);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('dineflow_token');
    setUser(null);
    setRestaurant(null);
  };

  return (
    <AuthContext.Provider value={{ user, restaurant, loading, login, register, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
