import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// These are drop-in replacements for next/link, next/navigation's
// useRouter/usePathname/redirect — they automatically handle the
// locale prefix (e.g. /en/admin vs /ar/admin) so existing code that
// switches to these imports doesn't need to manage locale strings by hand.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
