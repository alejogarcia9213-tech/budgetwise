import assert from "node:assert/strict";
import { test } from "node:test";
import { calculate, futureValue, solvePmt, solveRate, solveTime } from "./compound.ts";
import { planPaydown } from "./debt.ts";
import { nextMonthKey, prevMonthKey, shiftMonth } from "./dates.ts";
import {
  displayItemsFor,
  extrasFor,
  findMergeableItem,
  findMergeableTx,
  installmentOf,
  isLargeActive,
  isRecurringDue,
  monthSnapshot,
  pendingAutos,
  targetOf,
} from "./budget.ts";
import { monthKeyFromSheetName, toNumber } from "./sheet-import.ts";
import { evalAmountExpr } from "./expr.ts";
import { parseReceiptText } from "./receipt.ts";
import { detectEventKind, fingerprintOf, normalizeMerchant, parseNotification } from "./capture/parser.ts";
import { currencyFromLocale, detectVisitorLocale, langFromLocale } from "./locale-detect.ts";
import { computeHealth } from "./ratios.ts";
import { pickTip, answerBudgetQuestion } from "./tips.ts";
import type { Profile } from "./types.ts";

test("zero-rate investment is principal plus contributions", () => {
  const fv = futureValue({
    principal: 1000,
    pmt: 100,
    annualRatePct: 0,
    years: 1,
    periodsPerYear: 12,
    timing: "end",
  });
  assert.equal(Math.round(fv), 2200);
});

test("end-of-period compound matches closed form", () => {
  const r = 0.1 / 12;
  const n = 12;
  const expected = 1000 * (1 + r) ** n + 100 * (((1 + r) ** n - 1) / r);
  const fv = futureValue({
    principal: 1000,
    pmt: 100,
    annualRatePct: 10,
    years: 1,
    periodsPerYear: 12,
    timing: "end",
  });
  assert.ok(Math.abs(fv - expected) < 0.01);
});

test("beginning-of-period is larger than end", () => {
  const end = futureValue({
    principal: 0,
    pmt: 100,
    annualRatePct: 10,
    years: 1,
    periodsPerYear: 12,
    timing: "end",
  });
  const begin = futureValue({
    principal: 0,
    pmt: 100,
    annualRatePct: 10,
    years: 1,
    periodsPerYear: 12,
    timing: "begin",
  });
  assert.ok(begin > end);
});

test("required contribution solves to the goal", () => {
  const pmt = solvePmt({
    principal: 0,
    goal: 1200,
    annualRatePct: 0,
    years: 1,
    periodsPerYear: 12,
    timing: "end",
  });
  assert.equal(Math.round(pmt), 100);
});

test("required duration is reachable", () => {
  const t = solveTime({
    principal: 0,
    pmt: 100,
    goal: 1200,
    annualRatePct: 0,
    periodsPerYear: 12,
    timing: "end",
  });
  assert.equal(t.reachable, true);
  assert.equal(t.periods, 12);
});

test("required rate is finite when reachable", () => {
  const rate = solveRate({
    principal: 1000,
    pmt: 0,
    goal: 1100,
    years: 1,
    periodsPerYear: 1,
    timing: "end",
  });
  assert.ok(Math.abs(rate - 10) < 0.05);
});

test("calculate save mode never returns NaN", () => {
  const out = calculate({
    mode: "save",
    goal: 0,
    principal: 0,
    pmt: 0,
    annualRatePct: 0,
    years: 10,
    freq: "monthly",
    timing: "end",
  });
  assert.equal(out.ok, true);
  if (out.ok) assert.equal(Number.isFinite(out.finalBalance), true);
});

test("month navigation wraps the year", () => {
  assert.equal(nextMonthKey("2026-08"), "2026-09");
  assert.equal(nextMonthKey("2026-12"), "2027-01");
  assert.equal(prevMonthKey("2026-01"), "2025-12");
  assert.equal(shiftMonth("2026-08", 12), "2027-08");
});

test("avalanche pays highest APR first", () => {
  const plan = planPaydown(
    [
      { id: "a", name: "Card", balance: 1000, ratePct: 20, minPayment: 50 },
      { id: "b", name: "Loan", balance: 1000, ratePct: 5, minPayment: 50 },
    ],
    100,
    "avalanche",
  );
  assert.equal(plan.debtFree, true);
  assert.ok(plan.months > 0);
  assert.equal(plan.schedule[0]?.extraTo, "Card");
});

test("snowball pays smallest balance first", () => {
  const plan = planPaydown(
    [
      { id: "a", name: "Small", balance: 200, ratePct: 5, minPayment: 25 },
      { id: "b", name: "Big", balance: 2000, ratePct: 20, minPayment: 50 },
    ],
    50,
    "snowball",
  );
  assert.equal(plan.schedule[0]?.extraTo, "Small");
});

test("avalanche and snowball pick different focus debts", () => {
  const debts = [
    { id: "visa", name: "Visa", balance: 2800, ratePct: 22.9, minPayment: 70 },
    { id: "car", name: "Car loan", balance: 950, ratePct: 4.5, minPayment: 90 },
    { id: "personal", name: "Personal loan", balance: 6200, ratePct: 9.5, minPayment: 140 },
  ];
  const ava = planPaydown(debts, 100, "avalanche");
  const snow = planPaydown(debts, 100, "snowball");
  assert.equal(ava.schedule[0]?.extraTo, "Visa");
  assert.equal(snow.schedule[0]?.extraTo, "Car loan");
  assert.notEqual(ava.totalInterest, snow.totalInterest);
  assert.ok(ava.schedule.length > 24);
  assert.ok(snow.schedule.length > 24);
});

test("large purchase is active only during its window", () => {
  const lp = {
    id: "wm",
    name: "Washer",
    total: 600,
    months: 6,
    startMonth: "2026-09",
    category: "essential" as const,
  };
  assert.equal(installmentOf(lp), 100);
  assert.equal(isLargeActive(lp, "2026-08"), false);
  assert.equal(isLargeActive(lp, "2026-09"), true);
  assert.equal(isLargeActive(lp, "2027-02"), true);
  assert.equal(isLargeActive(lp, "2027-03"), false);
});

test("monthly snapshot leftover is income minus outflows", () => {
  const profile = {
    percents: { essential: 50, flexible: 20, investing: 20, savings: 10, debt: 0 },
    adjustments: { essential: 0, flexible: 0, investing: 0, savings: 0, debt: 0 },
    months: {
      "2026-08": {
        income: 1000,
        items: [
          { id: "1", name: "Rent", amount: 400, category: "essential" as const },
          { id: "2", name: "Fun", amount: 100, category: "flexible" as const },
        ],
        goalContributions: {},
      },
    },
    transactions: [],
    largePurchases: [],
    goals: [],
    debts: [],
    recurring: [],
    recurringMemory: [],
    inflows: [],
    paymentMethods: [],
    assets: { cash: 0, bank: 0, savings: 0, investments: 0, property: 0, other: 0 },
    id: "p",
    name: "t",
    debtMethod: "avalanche" as const,
    extraDebtPayment: 0,
    aiTip: "",
  } satisfies Profile;
  const snap = monthSnapshot(profile, "2026-08");
  assert.equal(snap.income, 1000);
  assert.equal(snap.essential, 400);
  assert.equal(snap.flexible, 100);
  assert.equal(snap.leftover, 500);
  assert.equal(snap.leftToBudget, 0);
});

test("liquidity ratio healthy at 3 months", () => {
  const h = computeHealth({
    cash: 300,
    bank: 0,
    savings: 0,
    investments: 0,
    property: 0,
    other: 0,
    debts: [],
    monthlyEssentials: 100,
    monthlyIncome: 1000,
    monthlySaved: 200,
    monthlyInvested: 0,
  });
  const liq = h.ratios.find((r) => r.key === "liquidity");
  assert.equal(liq?.healthy, true);
});

test("tip engine never returns empty", () => {
  const tip = pickTip({
    netIncome: 0,
    essentialExpenses: 0,
    flexibleExpenses: 0,
    savings: 0,
    investments: 0,
    debts: 0,
    netWorth: 0,
    liquidityMonths: 0,
    savingsInvestmentRate: 0,
    leftToBudget: 0,
    leftover: 0,
  });
  assert.ok(tip.en.length > 10);
  const asked = answerBudgetQuestion("how much leftover", {
    netIncome: 3000,
    essentialExpenses: 2000,
    flexibleExpenses: 200,
    savings: 100,
    investments: 300,
    debts: 0,
    netWorth: 5000,
    liquidityMonths: 4,
    savingsInvestmentRate: 13,
    leftToBudget: 200,
    leftover: 400,
  }, "en");
  assert.ok(asked.includes("400"));
});

test("spreadsheet month names map to keys and skip simulations", () => {
  assert.equal(monthKeyFromSheetName("Julio 2023"), "2023-07");
  assert.equal(monthKeyFromSheetName("August 2026"), "2026-08");
  assert.equal(monthKeyFromSheetName("September 2024"), "2024-09");
  assert.equal(monthKeyFromSheetName("Simulacro Baby 2025"), null);
  assert.equal(monthKeyFromSheetName("Cashflow Mensual"), null);
  assert.equal(toNumber("1.234"), 1.234);
  assert.equal(toNumber("49,95"), 49.95);
});

test("amount expression sums chained values", () => {
  assert.equal(evalAmountExpr("4000+2000"), 6000);
  assert.equal(evalAmountExpr("4000 + 2000 - 150.50"), 5849.5);
  assert.equal(evalAmountExpr("100"), 100);
  assert.equal(evalAmountExpr("abc"), null);
  assert.equal(evalAmountExpr("45+30+20"), 95);
  assert.equal(evalAmountExpr("10/5"), 2);
  assert.equal(evalAmountExpr("45.67*2"), 91.34);
  assert.equal(evalAmountExpr("60-19"), 41);
  assert.equal(evalAmountExpr("(40+10)*2"), 100);
  assert.equal(evalAmountExpr("10/0"), null);
  assert.equal(evalAmountExpr("45+"), null);
});

test("same-name grocery adds merge onto one line", () => {
  const items = [
    { id: "g1", name: "Groceries", amount: 45, category: "essential" as const },
    { id: "r1", name: "Rent", amount: 1200, category: "essential" as const },
  ];
  const hit = findMergeableItem(items, { name: "groceries", category: "essential" });
  assert.equal(hit?.id, "g1");
  assert.equal(findMergeableItem(items, { name: "Groceries", category: "flexible" }), undefined);
  assert.equal(
    findMergeableItem(items, { name: "Groceries", category: "essential", source: "recurring" }),
    undefined,
  );
});

test("same-name activity entries merge in the same month", () => {
  const txs = [
    {
      id: "t1",
      type: "expense" as const,
      category: "essential" as const,
      name: "Groceries",
      amount: 45,
      date: "2026-08-04",
    },
  ];
  const hit = findMergeableTx(txs, {
    name: "GROCERIES",
    category: "essential",
    type: "expense",
    date: "2026-08-20",
  });
  assert.equal(hit?.id, "t1");
  assert.equal(
    findMergeableTx(txs, { name: "Groceries", category: "essential", type: "expense", date: "2026-07-20" }),
    undefined,
  );
});

test("recurring frequencies land only on due months", () => {
  const rec = {
    id: "ins",
    name: "Insurance",
    amount: 420,
    category: "essential" as const,
    frequency: "quarterly" as const,
    startMonth: "2026-01",
    active: true,
  };
  assert.equal(isRecurringDue(rec, "2026-01"), true);
  assert.equal(isRecurringDue(rec, "2026-02"), false);
  assert.equal(isRecurringDue(rec, "2026-04"), true);
  assert.equal(isRecurringDue({ ...rec, frequency: "yearly" }, "2027-01"), true);
  assert.equal(isRecurringDue({ ...rec, frequency: "yearly" }, "2026-07"), false);
  assert.equal(isRecurringDue({ ...rec, frequency: "bimonthly" }, "2026-03"), true);
  assert.equal(isRecurringDue({ ...rec, frequency: "semiannual" }, "2026-07"), true);
  assert.equal(isRecurringDue({ ...rec, frequency: "semiannual" }, "2026-06"), false);
});

test("investing extras do not inflate other category targets", () => {
  const profile = {
    percents: { essential: 80, flexible: 10, investing: 10, savings: 0, debt: 0 },
    adjustments: { essential: 0, flexible: 0, investing: 0, savings: 0, debt: 0 },
    months: {
      "2026-08": { income: 4000, items: [], goalContributions: {} },
    },
    transactions: [],
    largePurchases: [],
    goals: [],
    debts: [],
    recurring: [],
    recurringMemory: [],
    inflows: [
      {
        id: "pi",
        name: "eToro Popular Investor",
        amount: 85,
        category: "investing" as const,
        recurring: true,
        frequency: "monthly" as const,
        startMonth: "2026-08",
        active: true,
      },
    ],
    paymentMethods: [],
    assets: { cash: 0, bank: 0, savings: 0, investments: 0, property: 0, other: 0 },
    id: "p",
    name: "t",
    debtMethod: "avalanche" as const,
    extraDebtPayment: 0,
    aiTip: "",
  } satisfies Profile;
  const snap = monthSnapshot(profile, "2026-08");
  assert.equal(targetOf(profile, 4000, "essential"), 3200);
  assert.equal(snap.targets.essential, 3200);
  assert.equal(snap.targets.investing, 485);
  assert.equal(extrasFor(profile, "2026-08", "investing"), 85);
  assert.equal(snap.extras, 85);
  assert.equal(snap.leftover, 4085);
  assert.equal(snap.leftToBudget, 0);
  const pending = pendingAutos(profile, "2026-08");
  assert.equal(pending.txs.some((t) => t.inflowId === "pi" && t.type === "income"), true);
});

test("debt minimum posts to the chosen budget category", () => {
  const base = {
    percents: { essential: 80, flexible: 10, investing: 10, savings: 0, debt: 0 },
    adjustments: { essential: 0, flexible: 0, investing: 0, savings: 0, debt: 0 },
    months: {
      "2026-08": { income: 4000, items: [], goalContributions: {} },
    },
    transactions: [],
    largePurchases: [],
    goals: [],
    recurring: [],
    recurringMemory: [],
    inflows: [],
    paymentMethods: [],
    assets: { cash: 0, bank: 0, savings: 0, investments: 0, property: 0, other: 0 },
    id: "p",
    name: "t",
    debtMethod: "avalanche" as const,
    extraDebtPayment: 0,
    aiTip: "",
  };

  const essentialDebt = {
    ...base,
    debts: [{ id: "visa", name: "Visa", balance: 2800, ratePct: 22.9, minPayment: 70, category: "essential" as const }],
  } satisfies Profile;
  const snap = monthSnapshot(essentialDebt, "2026-08");
  assert.equal(snap.essential, 70);
  assert.equal(snap.debt, 0);
  const pending = pendingAutos(essentialDebt, "2026-08");
  assert.equal(pending.items.length, 1);
  assert.equal(pending.items[0]?.category, "essential");
  assert.equal(pending.items[0]?.source, "debt");
  assert.equal(pending.txs[0]?.debtId, "visa");
  const shown = displayItemsFor(essentialDebt, "2026-08", "essential");
  assert.equal(shown.some((i) => i.name === "Visa" && i.source === "debt" && i.amount === 70), true);
  assert.equal(shown.find((i) => i.source === "debt")?.editable, false);

  const debtBucket = {
    ...base,
    debts: [{ id: "visa", name: "Visa", balance: 2800, ratePct: 22.9, minPayment: 70, category: "debt" as const }],
  } satisfies Profile;
  const snapDebt = monthSnapshot(debtBucket, "2026-08");
  assert.equal(snapDebt.essential, 0);
  assert.equal(snapDebt.debt, 70);
  const pendingDebt = pendingAutos(debtBucket, "2026-08");
  assert.equal(pendingDebt.items.length, 0);
  assert.equal(pendingDebt.txs[0]?.category, "debt");

  const skipped = {
    ...essentialDebt,
    debts: [{ ...essentialDebt.debts[0], skippedMonths: ["2026-08"] }],
  } satisfies Profile;
  assert.equal(monthSnapshot(skipped, "2026-08").essential, 0);
  assert.equal(pendingAutos(skipped, "2026-08").items.length, 0);
});

test("receipt parser reads total, store, category and card", () => {
  const ctx = {
    items: [
      { name: "Groceries", category: "essential" as const },
      { name: "Netflix", category: "flexible" as const },
    ],
    methods: [
      { id: "cash", name: "Cash", type: "cash" },
      { id: "amex", name: "Amex" },
      { id: "etoro", name: "Etoro Visa Black Platinum" },
    ],
  };
  const rewe = parseReceiptText(
    `REWE Markt GmbH
Berlin
Milch 1,29
Brot 2,49
SUMME EUR 12,99
AMEX ************1234`,
    ctx,
  );
  assert.equal(rewe.amount, 12.99);
  assert.equal(rewe.category, "essential");
  assert.equal(rewe.methodId, "amex");

  const groceries = parseReceiptText(`Lidl\nGroceries\nTOTAL 45,00\nBAR`, ctx);
  assert.equal(groceries.merchant, "Lidl");
  assert.equal(groceries.amount, 45);
  assert.equal(groceries.methodId, "cash");
  assert.equal(groceries.category, "essential");

  const netflix = parseReceiptText(`NETFLIX\nAmount due 17.99\nVISA`, ctx);
  assert.equal(netflix.category, "flexible");
  assert.equal(netflix.amount, 17.99);

  const invest = parseReceiptText(`eToro\nTOTAL 22,00\neToro Visa Black Platinum`, ctx);
  assert.equal(invest.category, "investing");
  assert.equal(invest.methodId, "etoro");

  const norma = parseReceiptText(
    `NORMA
55118 Mainz
Barbarossaring 25-27
www.norma-online.de
UST.-ID-Nr. DE132748925
Bio Bananen lose
1,242 kg x 1,99 €/kg    2,47 € A
Gebäckspezialitäten     2,49 € A
Einkaufswert            4,96 €
Summe                   4,96 €
Artikel                 2
Gegeben
Visa                    4,96 €
MwSt Übersicht
A 7,00 %  4,64 €  0,32 €
Kartenzahlung
Visa kontaktlos
VISA
EUR 4,96
PAN ############0864
Terminal-ID : 60422272`,
    ctx,
  );
  assert.equal(norma.merchant, "Norma");
  assert.equal(norma.amount, 4.96);
  assert.equal(norma.category, "essential");
  assert.equal(norma.methodId, "etoro");

  const noisy = parseReceiptText(`=3ix\nN0RMA Mainz\nSUMHE 4,96 €\nV1SA kontaktlos\n55118 2180 60422272`, ctx);
  assert.equal(noisy.merchant, "Norma");
  assert.equal(noisy.amount, 4.96);

  const walmart = parseReceiptText(
    `WALMART
Save money. Live better.
SUBTOTAL 18.40
TAX 1.47
TOTAL $19.87
VISA ENDING 1234`,
    ctx,
  );
  assert.equal(walmart.merchant, "Walmart");
  assert.equal(walmart.amount, 19.87);
  assert.equal(walmart.category, "essential");
  assert.equal(walmart.methodId, "etoro");

  const exito = parseReceiptText(
    `Almacenes Exito
IVA
TOTAL A PAGAR $ 12.500
Nequi`,
    { ...ctx, methods: [...ctx.methods, { id: "nequi", name: "Nequi" }] },
  );
  assert.equal(exito.merchant, "Éxito");
  assert.equal(exito.amount, 12500);
  assert.equal(exito.methodId, "nequi");

  const coles = parseReceiptText(
    `COLES
GST 10%
TOTAL AUD 32.10
EFTPOS`,
    ctx,
  );
  assert.equal(coles.merchant, "Coles");
  assert.equal(coles.amount, 32.1);
});

test("wallet notification parser never treats declines as purchases", () => {
  assert.equal(detectEventKind("Payment declined at REWE"), "declined");
  assert.equal(normalizeMerchant("REWE Markt 1234"), "REWE");
  const a = fingerprintOf({ merchantNormalized: "Rewe", amountMinor: 2390, day: "2026-08-26", lastFour: "1234", pkg: "wallet" });
  const b = fingerprintOf({ merchantNormalized: "Rewe", amountMinor: 2390, day: "2026-08-26", lastFour: "1234", pkg: "wallet" });
  assert.equal(a, b);
  const parsed = parseNotification(
    {
      packageName: "com.google.android.apps.walletnfcrel",
      title: "REWE",
      text: "Zahlung 23,90 € Visa •••• 1234",
      postedAt: Date.now(),
    },
    { currency: "EUR", items: [], methods: [], rules: [], maps: [] },
  );
  assert.equal(parsed.eventKind, "purchase");
  assert.equal(parsed.amountMinor, 2390);
  assert.equal(parsed.currencyCode, "EUR");
  assert.equal(parsed.cardLastFour, "1234");
  const cop = parseNotification(
    {
      packageName: "com.google.android.apps.walletnfcrel",
      title: "Exito",
      text: "Pago $ 45.000 COP",
      postedAt: Date.now(),
    },
    { currency: "COP", items: [], methods: [], rules: [], maps: [] },
  );
  assert.equal(cop.amountMinor, 4500000);
  const usd = parseNotification(
    {
      packageName: "bank",
      title: "Walmart",
      text: "Purchase $12.34",
      postedAt: Date.now(),
    },
    { currency: "USD", items: [], methods: [], rules: [], maps: [] },
  );
  assert.equal(usd.amountMinor, 1234);
});

test("visitor locale maps language and currency", () => {
  assert.equal(langFromLocale("es-CO"), "es");
  assert.equal(currencyFromLocale("es-CO"), "COP");
  assert.equal(currencyFromLocale("en-US"), "USD");
  assert.equal(currencyFromLocale("en-GB"), "GBP");
  assert.equal(currencyFromLocale("de-DE"), "EUR");
  assert.equal(currencyFromLocale("en-AU"), "AUD");
  assert.equal(currencyFromLocale("pt-BR"), "BRL");
  const bogota = detectVisitorLocale({ languages: ["es-CO"], timeZone: "America/Bogota" });
  assert.equal(bogota.lang, "es");
  assert.equal(bogota.currency, "COP");
});

// ── Quick capture (one-line entry, NFC links, shared bank texts) ──
import { parseLooseAmount, parseQuickText, parseSharedText, guessCategory } from "./capture/quick";

test("loose amounts from phones and humans", () => {
  assert.equal(parseLooseAmount("23,90", "EUR"), 23.9);
  assert.equal(parseLooseAmount("€23.90", "EUR"), 23.9);
  assert.equal(parseLooseAmount("$45.000", "COP"), 45000);
  assert.equal(parseLooseAmount("1.234,56 €", "EUR"), 1234.56);
  assert.equal(parseLooseAmount("1,234.56", "USD"), 1234.56);
  assert.equal(parseLooseAmount("12", "EUR"), 12);
  assert.equal(parseLooseAmount("AMOUNT", "EUR"), null);
});

test("one-line quick entry", () => {
  const a = parseQuickText("12,50 café", "EUR");
  assert.equal(a?.amount, 12.5);
  assert.equal(a?.name, "Café");
  const b = parseQuickText("Rewe 23.90", "EUR");
  assert.equal(b?.amount, 23.9);
  assert.equal(b?.name, "Rewe");
  const c = parseQuickText("arriendo 1.200.000 #fijo", "COP");
  assert.equal(c?.amount, 1200000);
  assert.equal(c?.forced, "essential");
  assert.equal(parseQuickText("solo texto", "EUR"), null);
});

test("shared bank SMS", () => {
  const r = parseSharedText("Bancolombia: Compraste $45.000 en EXITO CALLE 80 con tu T.Deb *1234", "COP");
  assert.equal(r.amount, 45000);
  assert.equal(r.merchant, "EXITO CALLE 80");
});

test("category guess", () => {
  assert.equal(guessCategory("Rewe").category, "essential");
  assert.equal(guessCategory("Netflix").category, "flexible");
  assert.equal(guessCategory("eToro").category, "investing");
  assert.equal(guessCategory("Rewe", [{ merchant: "rewe", categoryId: "flexible" }]).category, "flexible");
});
