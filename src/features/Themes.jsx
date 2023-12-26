import React, { createContext, useEffect, useState } from "react";

export const Themes = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Themes.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </Themes.Provider>
  );
};
