import assert from "node:assert/strict";
import test from "node:test";
import {
  BRAND_NAME,
  brandIconsExist,
  isManifestPath,
  lockBudgetWiseHtml,
  renderBrandManifest,
  siteTitle,
} from "./brand-lock.mjs";

test("site.json and disk icons are Budget Wise", () => {
  assert.equal(siteTitle(), BRAND_NAME);
  assert.equal(brandIconsExist(), true);
});

test("brand manifest never says Grok App", () => {
  const manifest = JSON.parse(renderBrandManifest());
  assert.equal(manifest.name, BRAND_NAME);
  assert.equal(manifest.short_name, BRAND_NAME);
  assert.equal(manifest.icons[0].src, "/icon-192.png");
  assert.equal(manifest.icons[1].src, "/icon-512.png");
  assert.doesNotMatch(JSON.stringify(manifest), /Grok App/);
  assert.doesNotMatch(JSON.stringify(manifest), /__grok\/icon/);
});

test("html lock rewrites platform fallbacks", () => {
  const out = lockBudgetWiseHtml(
    `<html><head><title>Grok App</title><meta name="apple-mobile-web-app-title" content="Grok App"><link rel="apple-touch-icon" href="/__grok/icon-180.png"></head></html>`,
  );
  assert.match(out, /<title>Budget Wise<\/title>/);
  assert.match(out, /content="Budget Wise"/);
  assert.match(out, /href="\/apple-touch-icon\.png"/);
  assert.doesNotMatch(out, /Grok App/);
  assert.doesNotMatch(out, /__grok\/icon-180/);
});

test("manifest paths include platform and public aliases", () => {
  assert.equal(isManifestPath("/__grok/manifest.webmanifest"), true);
  assert.equal(isManifestPath("/manifest.webmanifest"), true);
  assert.equal(isManifestPath("/index.html"), false);
});
