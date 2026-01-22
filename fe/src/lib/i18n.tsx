import React, { createContext, useContext, useMemo, useState } from "react";
import en from "../../messages/en.json";
import vi from "../../messages/vi.json";
import ja from "../../messages/ja.json";

type Messages = Record<string, any>;

const LOCALES: Record<string, Messages> = {
  en,
  vi,
  ja,
};

function getStoredLocale(): string | null {
  try {
    return localStorage.getItem("locale");
  } catch (e) {
    return null;
  }
}

function getNavigatorLocale(): string {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language || (navigator as any).userLanguage || "en";
  return lang.split("-")[0];
}

export function detectLocaleFromPath(): string | null {
  try {
    if (typeof window === "undefined" || !window.location) return null;
    const p = window.location.pathname || "";
    const m = p.match(/^\/(en|vi|ja)(?:\/|$)/i);
    return m ? m[1].toLowerCase() : null;
  } catch (e) {
    return null;
  }
}

export function withLocale(path: string): string {
  try {
    if (!path.startsWith("/")) path = "/" + path;
    // if path already contains locale prefix, return as-is
    if (/^\/(en|vi|ja)(?:\/|$)/i.test(path)) return path;
    const locale = detectLocaleFromPath() || getLocale();
    // ensure single slash between locale and path
    if (path === "/") return `/${locale}`;
    return `/${locale}${path}`;
  } catch (e) {
    return path;
  }
}

export function getLocale(): string {
  const pathLocale = detectLocaleFromPath();
  if (pathLocale && pathLocale in LOCALES) return pathLocale;

  const stored = getStoredLocale();
  if (stored && stored in LOCALES) return stored;

  const candidate = getNavigatorLocale();
  return candidate in LOCALES ? candidate : "en";
}

export function setLocale(locale: string) {
  if (!(locale in LOCALES)) return;
  try {
    localStorage.setItem("locale", locale);
  } catch (e) {
    // ignore
  }
}

export function t(key: string, locale?: string): string {
  const loc = locale || getLocale();
  const messages = LOCALES[loc] || LOCALES.en;
  const parts = key.split(".");
  let cur: any = messages;
  for (const p of parts) {
    if (!cur || typeof cur !== "object") return key;
    cur = cur[p];
  }
  return typeof cur === "string" ? cur : key;
}

type I18nContextValue = {
  locale: string;
  setLocale: (l: string) => void;
  t: (k: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>(getLocale());

  const setLocaleAndStore = (l: string) => {
    if (!(l in LOCALES)) return;
    setLocale(l);
    setLocaleState(l);
  };

  const value = useMemo(() => ({ locale, setLocale: setLocaleAndStore, t: (k: string) => t(k, locale) }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // fallback to non-react usage
    return { locale: getLocale(), setLocale, t: (k: string) => t(k, getLocale()) };
  }
  return ctx;
}

export default {
  t,
  getLocale,
  setLocale,
  useI18n,
  I18nProvider,
};
