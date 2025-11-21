import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LanguageCode = 
  | 'auto-detect' 
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' 
  | 'ar' | 'hi' | 'ru' | 'nl' | 'pl' | 'tr' | 'vi' | 'th' | 'id' | 'tl';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'auto-detect', name: 'Auto-detect', nativeName: 'Auto-detect' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino' },
];

interface TranslationContextType {
  targetLanguage: LanguageCode;
  setTargetLanguage: (lang: LanguageCode) => void;
  translateText: (text: string, targetLang?: LanguageCode) => Promise<string>;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const TRANSLATION_STORAGE_KEY = 'chatbox-target-language';

// Translation API using MyMemory Translation API (free, no API key required)
export const translateText = async (text: string, targetLang: LanguageCode): Promise<string> => {
  if (targetLang === 'auto-detect' || !text.trim()) {
    return text;
  }

  try {
    // Map language codes to MyMemory API format
    const langMap: Record<string, string> = {
      'en': 'en',
      'es': 'es',
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
      'pt': 'pt',
      'zh': 'zh',
      'ja': 'ja',
      'ko': 'ko',
      'ar': 'ar',
      'hi': 'hi',
      'ru': 'ru',
      'nl': 'nl',
      'pl': 'pl',
      'tr': 'tr',
      'vi': 'vi',
      'th': 'th',
      'id': 'id',
      'tl': 'tl',
    };

    const targetLangCode = langMap[targetLang] || 'en';
    
    // Try to detect source language automatically, or use 'auto'
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLangCode}`
    );

    if (!response.ok) {
      throw new Error('Translation API error');
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }

    throw new Error('Translation failed');
  } catch (error) {
    console.error('Translation error:', error);
    // Fallback: return original text if translation fails
    return text;
  }
};

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [targetLanguage, setTargetLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(TRANSLATION_STORAGE_KEY) as LanguageCode;
      return saved && SUPPORTED_LANGUAGES.some(lang => lang.code === saved) ? saved : 'auto-detect';
    }
    return 'auto-detect';
  });

  const [isTranslating, setIsTranslating] = useState(false);

  const setTargetLanguage = (lang: LanguageCode) => {
    setTargetLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TRANSLATION_STORAGE_KEY, lang);
    }
  };

  const translateTextHandler = async (text: string, targetLang?: LanguageCode): Promise<string> => {
    const langToUse = targetLang || targetLanguage;
    
    if (langToUse === 'auto-detect') {
      return text;
    }

    setIsTranslating(true);
    try {
      const translated = await translateText(text, langToUse);
      return translated;
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <TranslationContext.Provider
      value={{
        targetLanguage,
        setTargetLanguage,
        translateText: translateTextHandler,
        isTranslating,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

