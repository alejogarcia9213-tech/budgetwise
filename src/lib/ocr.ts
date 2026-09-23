import { kvGet, kvSet } from "./idb-storage";

type WorkerLike = {
  recognize: (image: Blob) => Promise<{ data: { text: string } }>;
  setParameters: (p: Record<string, string>) => Promise<unknown>;
  terminate: () => Promise<void>;
};

const g = globalThis as typeof globalThis & { __bwOcrWorker?: Promise<WorkerLike> };
let progressCb: ((pct: number, stage?: string) => void) | undefined;

async function fileKey(file: Blob): Promise<string> {
  const f = file as File;
  const head = new Uint8Array(await file.slice(0, 8192).arrayBuffer());
  let h = file.size >>> 0;
  for (let i = 0; i < head.length; i++) h = (Math.imul(h, 31) + head[i]!) >>> 0;
  const name = "name" in f ? f.name : "";
  const modified = "lastModified" in f ? String(f.lastModified) : "";
  return `ocr-v2:${file.size}:${name}:${modified}:${h.toString(16)}`;
}

async function getWorker(onProgress?: (pct: number, stage?: string) => void): Promise<WorkerLike> {
  progressCb = onProgress;
  if (!g.__bwOcrWorker) {
    g.__bwOcrWorker = (async () => {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng+spa+deu", 1, {
        logger: (m: { status?: string; progress?: number }) => {
          const p = typeof m.progress === "number" ? m.progress : 0;
          if (m.status === "loading language traineddata") progressCb?.(Math.round(p * 35), "load");
          else if (m.status === "initializing api") progressCb?.(35 + Math.round(p * 10), "load");
          else if (m.status === "recognizing text") progressCb?.(45 + Math.round(p * 55), "read");
        },
      });
      await worker.setParameters({
        tessedit_pageseg_mode: "6",
      } as never);
      return worker as unknown as WorkerLike;
    })().catch((err) => {
      g.__bwOcrWorker = undefined;
      throw err;
    });
  }
  return g.__bwOcrWorker;
}

async function preprocess(file: Blob): Promise<Blob> {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return file;
  try {
    const img = await createImageBitmap(file);
    const max = 1400;
    const scale = Math.min(max / Math.max(img.width, img.height), 1.6);
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h);
    const d = data.data;
    for (let i = 0; i < d.length; i += 4) {
      let y = 0.299 * d[i]! + 0.587 * d[i + 1]! + 0.114 * d[i + 2]!;
      y = (y - 128) * 1.7 + 128;
      y = y < 30 ? 0 : y > 210 ? 255 : y;
      d[i] = d[i + 1] = d[i + 2] = y;
    }
    ctx.putImageData(data, 0, 0);
    img.close();
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    return blob ?? file;
  } catch {
    return file;
  }
}

/** Reads text from a receipt photo. Cached. Failures return "" so the rest of the app stays up. */
export async function ocrImage(
  file: Blob,
  onProgress?: (pct: number, stage?: string) => void,
): Promise<string> {
  try {
    const key = await fileKey(file);
    const cached = await kvGet(key);
    if (cached) {
      onProgress?.(100, "cache");
      return cached;
    }
    const prepared = await preprocess(file);
    const worker = await getWorker(onProgress);
    const { data } = await worker.recognize(prepared);
    const text = String(data.text ?? "").trim();
    if (text) void kvSet(key, text);
    return text;
  } catch {
    return "";
  }
}
