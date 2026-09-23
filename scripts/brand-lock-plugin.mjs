/**
 * Always-on Budget Wise identity. Registered before grok-pwa so a platform
 * fallback cannot serve "Grok App" or the default Grok icon.
 */
import { isManifestPath, lockBudgetWiseHtml, renderBrandManifest } from "./brand-lock.mjs";

function sendManifest(res) {
  const body = Buffer.from(renderBrandManifest(), "utf8");
  res.statusCode = 200;
  res.setHeader("content-type", "application/manifest+json; charset=utf-8");
  res.setHeader("cache-control", "no-cache");
  res.setHeader("content-length", String(body.byteLength));
  res.end(body);
}

function serveManifest(middlewares) {
  middlewares.use((req, res, next) => {
    if ((req.method ?? "GET").toUpperCase() !== "GET") {
      next();
      return;
    }
    const pathOnly = (req.url ?? "").split("?", 1)[0] ?? "";
    if (!isManifestPath(pathOnly)) {
      next();
      return;
    }
    sendManifest(res);
  });
}

function rewriteHtml(middlewares) {
  middlewares.use((req, res, next) => {
    const method = (req.method ?? "GET").toUpperCase();
    if (method !== "GET" || !String(req.headers.accept ?? "").includes("text/html")) {
      next();
      return;
    }
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);
    let mode = null;
    const chunks = [];

    const decide = () => {
      if (mode) return mode;
      const isHtml = String(res.getHeader("content-type") ?? "").includes("text/html");
      const encoded = Boolean(res.getHeader("content-encoding"));
      mode = isHtml && !encoded ? "rewrite" : "passthrough";
      if (mode === "rewrite" && !res.headersSent) res.removeHeader("content-length");
      return mode;
    };

    res.write = (chunk, encoding, cb) => {
      if (decide() === "passthrough") return originalWrite(chunk, encoding, cb);
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      if (typeof encoding === "function") encoding();
      else if (typeof cb === "function") cb();
      return true;
    };
    res.end = (chunk, encoding, cb) => {
      const done = typeof encoding === "function" ? encoding : cb;
      if (decide() === "passthrough") return originalEnd(chunk, encoding, cb);
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      const html = lockBudgetWiseHtml(Buffer.concat(chunks).toString("utf8"));
      const body = Buffer.from(html, "utf8");
      if (!res.headersSent) res.setHeader("content-length", String(body.byteLength));
      originalWrite(body);
      return originalEnd(undefined, undefined, done);
    };
    next();
  });
}

export function budgetWiseBrandPlugin() {
  return {
    name: "budget-wise-brand-lock",
    transformIndexHtml(html) {
      return lockBudgetWiseHtml(html);
    },
    configureServer(server) {
      rewriteHtml(server.middlewares);
      serveManifest(server.middlewares);
    },
    configurePreviewServer(server) {
      serveManifest(server.middlewares);
      return () => rewriteHtml(server.middlewares);
    },
  };
}
