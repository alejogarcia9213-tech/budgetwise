import type { Profile } from "./store";
import { kvDel, kvGet, kvSet } from "./idb-storage";

export const SCHEMA_VERSION = 2;
export const UNDO_BACKUP_KEY = "budgetwise-preimport-backup";

export interface BackupFile {
  schemaVersion: number;
  exportedAt: string;
  app: "budget-wise";
  lang?: string;
  theme?: string;
  currency?: string;
  advancedView?: boolean;
  activeMonth?: string;
  activeProfileId?: string;
  profiles: Profile[];
  calc?: unknown;
}

export function buildBackup(input: {
  profiles: Profile[];
  lang?: string;
  theme?: string;
  currency?: string;
  advancedView?: boolean;
  activeMonth?: string;
  activeProfileId?: string;
  calc?: unknown;
}): BackupFile {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    app: "budget-wise",
    ...input,
  };
}

export function parseBackup(raw: string): { ok: true; data: BackupFile } | { ok: false; error: string } {
  try {
    const data = JSON.parse(raw) as BackupFile;
    if (!data || data.app !== "budget-wise") return { ok: false, error: "not-budget-wise" };
    if (!Array.isArray(data.profiles) || data.profiles.length === 0) {
      return { ok: false, error: "empty" };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "invalid" };
  }
}

export function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function csvEscape(value: string | number) {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export async function saveUndoBackup(json: string) {
  await kvSet(UNDO_BACKUP_KEY, json);
}

export async function loadUndoBackup(): Promise<string | null> {
  return kvGet(UNDO_BACKUP_KEY);
}

export async function clearUndoBackup() {
  await kvDel(UNDO_BACKUP_KEY);
}
