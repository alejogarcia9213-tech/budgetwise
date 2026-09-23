import { isManifestPath, renderBrandManifest } from "../../scripts/brand-lock.mjs";

export default async function brandLockMiddleware(
  event: { url: URL; req: { method: string } },
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET") return next();
  if (!isManifestPath(event.url.pathname)) return next();
  return new Response(renderBrandManifest(), {
    headers: {
      "content-type": "application/manifest+json; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}
