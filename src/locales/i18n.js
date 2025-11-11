import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Import translations
import enTranslations from "./en.json";
import viTranslations from "./vi.json";

const resources = {
  vi: {
    translation: viTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "vi",
    debug: process.env.NODE_ENV === "development",

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false, // React đã tự động escape
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
