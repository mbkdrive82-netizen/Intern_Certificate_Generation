import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to verify stored user token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.success) {
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      return userData;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const getDefaultRoute = (role) => {
    switch (role) {
      case 'SM_GROUPS_ADMIN':
        return '/admin/dashboard';
      case 'TNSKILLS_ADMIN':
        return '/tnskills/dashboard';
      case 'COLLEGE_ADMIN':
        return '/college/dashboard';
      case 'STUDENT':
        return '/student/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        getDefaultRoute,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
