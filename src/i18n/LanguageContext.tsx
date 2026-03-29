import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import translations, { type TranslationKey, type Lang } from "./translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string | ((...args: never[]) => string);
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

/* eslint-disable react-refresh/only-export-components */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    return saved === "en" ? "en" : "zh";
  });

  const handleSetLang = useCallback((newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string | ((...args: never[]) => string) => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[lang] as string | ((...args: never[]) => string);
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
