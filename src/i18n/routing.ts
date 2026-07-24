import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // The two supported languages for the whole platform
  locales: ["en", "ar"],

  // English is the default — used when no locale prefix matches
  defaultLocale: "en",
});
