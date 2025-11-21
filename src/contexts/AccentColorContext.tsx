import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type AccentColor = 'default' | 'blue' | 'green' | 'purple' | 'red' | 'orange';

interface AccentColorContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const AccentColorContext = createContext<AccentColorContextType | undefined>(undefined);

const accentColorMap: Record<AccentColor, { h: number; s: number; l: number }> = {
  default: { h: 0, s: 0, l: 0 }, // Black
  blue: { h: 217, s: 91, l: 60 },
  green: { h: 142, s: 86, l: 28 },
  purple: { h: 262, s: 83, l: 58 },
  red: { h: 0, s: 84, l: 60 },
  orange: { h: 25, s: 95, l: 53 },
};

const darkAccentColorMap: Record<AccentColor, { h: number; s: number; l: number }> = {
  default: { h: 0, s: 0, l: 0 }, // Black
  blue: { h: 217, s: 70, l: 60 },
  green: { h: 142, s: 70, l: 45 },
  purple: { h: 262, s: 70, l: 60 },
  red: { h: 0, s: 62, l: 45 },
  orange: { h: 25, s: 70, l: 55 },
};

export const AccentColorProvider = ({ children }: { children: ReactNode }) => {
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('accent-color') as AccentColor;
    return saved && accentColorMap[saved] ? saved : 'default';
  });

  useEffect(() => {
    // Apply accent color to CSS variables
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const colorMap = isDark ? darkAccentColorMap : accentColorMap;
    const color = colorMap[accentColor];

    root.style.setProperty('--accent', `${color.h} ${color.s}% ${color.l}%`);
    
    // Update accent-foreground based on lightness
    const foregroundL = color.l > 50 ? 9 : 98;
    root.style.setProperty('--accent-foreground', `0 0% ${foregroundL}%`);
  }, [accentColor]);

  // Listen for theme changes to update accent color
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const root = document.documentElement;
      const isDark = root.classList.contains('dark');
      const colorMap = isDark ? darkAccentColorMap : accentColorMap;
      const color = colorMap[accentColor];

      root.style.setProperty('--accent', `${color.h} ${color.s}% ${color.l}%`);
      
      const foregroundL = color.l > 50 ? 9 : 98;
      root.style.setProperty('--accent-foreground', `0 0% ${foregroundL}%`);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [accentColor]);

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem('accent-color', color);
  };

  return (
    <AccentColorContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </AccentColorContext.Provider>
  );
};

export const useAccentColor = () => {
  const context = useContext(AccentColorContext);
  if (context === undefined) {
    throw new Error('useAccentColor must be used within an AccentColorProvider');
  }
  return context;
};

