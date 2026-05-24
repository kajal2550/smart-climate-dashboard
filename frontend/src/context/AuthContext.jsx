import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Persist user + theme in localStorage
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cw_user')) || null; } catch { return null; }
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('cw_theme') || 'light');

  // Apply theme to <html> so CSS vars can respond
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cw_theme', theme);
  }, [theme]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('cw_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cw_user');
  };

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <AuthContext.Provider value={{ user, login, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
