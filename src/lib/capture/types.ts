import type { CategoryId } from "@/lib/types";

export type SuggestionStatus = "pending" | "accepted" | "dismissed" | "merged" | "expired";
export type CaptureEventKind = "purchase" | "refund" | "reversal" | "declined" | "unknown";
export type CaptureSource = "android_notification" | "ios_shortcut" | "android_automation" | "share" | "link";
export type WalletChannel = "google_wallet" | "apple_pay" | "bank_app" | "unknown";

export interface CapturedPurchaseSuggestion {
  id: string;
  status: SuggestionStatus;
  eventKind: CaptureEventKind;
  source: CaptureSource;
  sourceAppPackage: string;
  sourceAppLabel?: string;
  walletChannel: WalletChannel;
  merchantOriginal: string;
  merchantNormalized: string;
  amountMinor: number | null;
  currencyCode: string;
  occurredAt: string;
  detectedAt: string;
  categoryId: CategoryId | null;
  categoryConfidence: number;
  paymentMethodId: string | null;
  paymentMethodConfidence: number;
  cardLastFour: string | null;
  fingerprint: string;
  parserVersion: string;
  matchedTransactionId?: string;
}

export interface MerchantCategoryRule {
  merchant: string;
  categoryId: CategoryId;
}

export interface WalletMethodMap {
  sourceApp: string;
  lastFour?: string;
  methodId: string;
}

export interface NotificationCandidate {
  packageName: string;
  appLabel?: string;
  title: string;
  text: string;
  postedAt: number;
  key?: string;
}

export interface DirectCapture {
  merchant: string;
  amount: number;
  currency?: string;
  card?: string | null;
  source: CaptureSource;
  occurredAt?: number;
}
