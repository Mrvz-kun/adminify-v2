'use client';
import { useState, useEffect } from 'react';

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
    window.location.href = '/login';
  };

  return { user, logout };
}
