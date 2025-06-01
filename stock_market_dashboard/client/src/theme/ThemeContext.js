import React, { createContext, useContext, useEffect } from 'react';
import { defaultTheme } from './defaultTheme';

const ThemeContext = createContext(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children, theme = defaultTheme }) => {
  useEffect(() => {
    // Apply the theme to the document root
    const root = document.documentElement;
    for (const key in theme) {
      if (Object.prototype.hasOwnProperty.call(theme, key)) {
        root.style.setProperty(key, theme[key]);
      }
    }
    // Optional: Clean up if the theme changes or component unmounts,
    // though for a global theme, this might not be strictly necessary
    // if themes are only swapped and not removed entirely.
    // return () => {
    //   for (const key in theme) {
    //     if (Object.prototype.hasOwnProperty.call(theme, key)) {
    //       root.style.removeProperty(key);
    //     }
    //   }
    // };
  }, [theme]); // Re-apply if the theme object itself changes

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}; 