import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('edufind_token');
      const cachedUser = localStorage.getItem('edufind_user');

      if (token && cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
          // Refresh user data from backend
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('edufind_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('edufind_token', access_token);
    localStorage.setItem('edufind_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role = 'student', college_id = null) => {
    const res = await api.post('/auth/register', { name, email, password, role, college_id });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('edufind_token', access_token);
    localStorage.setItem('edufind_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('edufind_token');
    localStorage.removeItem('edufind_user');
    setUser(null);
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isCollegeAdmin = user?.role === 'college_admin';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isSuperAdmin, isCollegeAdmin, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
