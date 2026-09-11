"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/config";

const OPTIONS: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "am", label: "አማርኛ" },
];

export default function LanguageSwitcher({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { locale, setLocale, t } = useLanguage();
  const dark = variant === "dark";

  return (
    <div role="group" aria-label={t("sidebar.language")}>
      <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
        <Globe size={12} style={{ color: dark ? "#fb923c" : "#c2410c", flexShrink: 0 }} />
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: dark ? "#fb923c" : "#c2410c" }}>
          {t("sidebar.language")}
        </p>
      </div>
      <div className="flex rounded-lg p-0.5 gap-0.5"
        style={dark
          ? { background: "#0c0a09", border: "1px solid #44403c" }
          : { background: "#f5f5f4", border: "1px solid #e7e5e4" }
        }>
        {OPTIONS.map(opt => (
          <button
            key={opt.code}
            onClick={() => setLocale(opt.code)}
            aria-pressed={locale === opt.code}
            className="flex-1 text-xs px-2.5 py-1.5 rounded-md transition-colors font-medium"
            style={locale === opt.code
              ? { background: "#c2410c", color: "#fff" }
              : { color: dark ? "#d6d3d1" : "#78716c" }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
