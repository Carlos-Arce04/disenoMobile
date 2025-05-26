// ThemeContext.js (ahora maneja también idioma)
import React, { createContext, useState } from 'react';

export const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {},
  language: 'es',
  toggleLanguage: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('es');

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleLanguage = () => setLanguage(prev => (prev === 'es' ? 'en' : 'es'));

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, language, toggleLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
};