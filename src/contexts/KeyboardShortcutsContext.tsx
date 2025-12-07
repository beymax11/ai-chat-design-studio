import React, { createContext, useContext, useState, useCallback } from 'react';

interface KeyboardShortcutsContextType {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isProjectsOpen: boolean;
  setIsProjectsOpen: (open: boolean) => void;
  isKeyboardShortcutsOpen: boolean;
  setIsKeyboardShortcutsOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        isSearchOpen,
        setIsSearchOpen,
        isProjectsOpen,
        setIsProjectsOpen,
        isKeyboardShortcutsOpen,
        setIsKeyboardShortcutsOpen,
        isSettingsOpen,
        setIsSettingsOpen,
      }}
    >
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
};

