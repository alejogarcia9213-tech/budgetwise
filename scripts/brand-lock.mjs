import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const BRAND_NAME = "Budget Wise";
export const BRAND_THEME = "#0A0B12";
export const BRAND_ICON_192 = "/icon-192.png";
export const BRAND_ICON_512 = "/icon-512.png";
export const BRAND_APPLE_ICON = "/apple-touch-icon.png";

export function renderBrandManifest() {
  return JSON.stringify(
    {
      name: BRAND_NAME,
      short_name: BRAND_NAME,
      id: "/",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: BRAND_THEME,
      theme_color: BRAND_THEME,
      icons: [
        { src: BRAND_ICON_192, sizes: "192x192", type: "image/png" },
        { src: BRAND_ICON_512, sizes: "512x512", type: "image/png" },
      ],
      // Long-press the home-screen icon → straight to logging a purchase.
      shortcuts: [
        { name: "Registrar gasto", short_name: "Gasto", url: "/capture", icons: [{ src: BRAND_ICON_192, sizes: "192x192" }] },
        { name: "Captura automática", short_name: "Auto", url: "/settings#auto-capture", icons: [{ src: BRAND_ICON_192, sizes: "192x192" }] },
      ],
      // Android: share a bank SMS / notification text → Budget Wise reads the amount.
      share_target: { action: "/capture", method: "GET", params: { title: "title", text: "text", url: "url" } },
    },
    null,
    2,
  );
}

/** @param {string} pathOnly */
export function isManifestPath(pathOnly) {
  return (
    pathOnly === "/__grok/manifest.webmanifest" ||
    pathOnly === "/__grok/manifest.json" ||
    pathOnly === "/manifest.webmanifest" ||
    pathOnly === "/manifest.json"
  );
}

/** Rewrite platform fallbacks so install name/icon stay Budget Wise. */
/** @param {string} html */
export function lockBudgetWiseHtml(html) {
  return String(html)
    .replaceAll('content="Grok App"', `content="${BRAND_NAME}"`)
    .replaceAll("content='Grok App'", `content='${BRAND_NAME}'`)
    .replace(/<title>\s*Grok App\s*<\/title>/i, `<title>${BRAND_NAME}</title>`)
    .replaceAll("/__grok/icon-180.png", BRAND_APPLE_ICON);
}

export function brandIconsExist(cwd = process.cwd()) {
  return (
    existsSync(join(cwd, "public/icon-192.png")) &&
    existsSync(join(cwd, "public/icon-512.png")) &&
    existsSync(join(cwd, "public/apple-touch-icon.png"))
  );
}

export function siteTitle(cwd = process.cwd()) {
  try {
    const raw = readFileSync(join(cwd, "src/lib/og/site.json"), "utf8");
    const parsed = JSON.parse(raw);
    return String(parsed?.title ?? "").trim();
  } catch {
    return "";
  }
}
