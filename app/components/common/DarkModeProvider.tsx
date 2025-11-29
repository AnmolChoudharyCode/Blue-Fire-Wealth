'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage for saved preference
    const saved = localStorage.getItem('darkMode');
    let initialDarkMode = false;
    
    if (saved !== null) {
      initialDarkMode = saved === 'true';
    } else {
      // Check system preference only if no saved preference
      initialDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    setIsDarkMode(initialDarkMode);
    
    // Apply dark class immediately
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('darkMode', String(isDarkMode));
      // Apply or remove dark class
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode, mounted]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      // Immediately update the DOM
      const html = document.documentElement;
      if (newValue) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
      // Update localStorage
      localStorage.setItem('darkMode', String(newValue));
      return newValue;
    });
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}

