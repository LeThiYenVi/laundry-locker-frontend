import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

const LOCALES = ["en", "vi", "ja"] as const;

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, setLocale } = useI18n();

  function setPathLocale(newLocale: string) {
    // strip existing /en|/vi|/ja prefix
    const pathname = location.pathname;
    const stripped = pathname.replace(/^\/(en|vi|ja)(?=\/|$)/i, "");
    const newPath = `/${newLocale}${stripped}`;
    navigate(newPath + location.search + location.hash, { replace: true });
    setLocale(newLocale);
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setPathLocale(l)}
          className={`px-2 py-1 rounded-md text-sm ${l === locale ? "bg-white/10 font-semibold" : "hover:bg-white/5"}`}
          aria-pressed={l === locale}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
