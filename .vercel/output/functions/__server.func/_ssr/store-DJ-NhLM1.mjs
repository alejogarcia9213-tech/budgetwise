import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as de, c as enUS, i as es, l as addMonths, n as it, o as parse, r as fr, s as format, t as ptBR } from "../_libs/date-fns.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-DJ-NhLM1.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid() {
	return crypto.randomUUID();
}
var DB_NAME = "budgetwise_db";
var DB_VERSION = 2;
var KV = "kv";
var LEGACY_LS = "idc-finance-v1";
var EXTRA_STORES = [
	"transactions",
	"categories",
	"budgets",
	"settings",
	"goals",
	"profiles",
	"paymentMethods",
	"recurringExpenses",
	"largePurchases",
	"assets",
	"debts",
	"financialTips",
	"calculatorPresets",
	"migrationHistory"
];
function openDb() {
	if (typeof indexedDB === "undefined") return Promise.resolve(null);
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(KV)) db.createObjectStore(KV);
			for (const name of EXTRA_STORES) if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: "id" });
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
function idbGet(key) {
	return openDb().then((db) => new Promise((resolve, reject) => {
		if (!db) return resolve(null);
		const req = db.transaction(KV, "readonly").objectStore(KV).get(key);
		req.onsuccess = () => resolve(req.result ?? null);
		req.onerror = () => reject(req.error);
	}));
}
function idbSet(key, value) {
	return openDb().then((db) => new Promise((resolve, reject) => {
		if (!db) return resolve();
		const tx = db.transaction(KV, "readwrite");
		tx.objectStore(KV).put(value, key);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	}));
}
function idbDel(key) {
	return openDb().then((db) => new Promise((resolve, reject) => {
		if (!db) return resolve();
		const tx = db.transaction(KV, "readwrite");
		tx.objectStore(KV).delete(key);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	}));
}
async function kvGet(key) {
	return idbGet(key);
}
async function kvSet(key, value) {
	return idbSet(key, value);
}
function createBudgetWiseStorage() {
	return {
		getItem: async (name) => {
			try {
				const raw = await idbGet(name) ?? (typeof localStorage !== "undefined" ? localStorage.getItem(name) : null);
				if (raw) return JSON.parse(raw);
				if (typeof localStorage !== "undefined") {
					const legacy = localStorage.getItem(LEGACY_LS);
					if (legacy) return JSON.parse(legacy);
				}
			} catch {
				return null;
			}
			return null;
		},
		setItem: async (name, value) => {
			const raw = JSON.stringify(value);
			try {
				await idbSet(name, raw);
			} catch {}
			try {
				localStorage.setItem(name, raw);
			} catch {}
		},
		removeItem: async (name) => {
			try {
				await idbDel(name);
			} catch {}
			try {
				localStorage.removeItem(name);
			} catch {}
		}
	};
}
var DATE_FNS = {
	en: enUS,
	es,
	de,
	it,
	fr,
	pt: ptBR
};
function localeOf$1(lang) {
	return DATE_FNS[lang] ?? enUS;
}
function currentMonthKey(d = /* @__PURE__ */ new Date()) {
	return format(d, "yyyy-MM");
}
function parseMonthKey(key) {
	return parse(`${key}-01`, "yyyy-MM-dd", /* @__PURE__ */ new Date());
}
function shiftMonth(key, delta) {
	return format(addMonths(parseMonthKey(key), delta), "yyyy-MM");
}
function nextMonthKey(key) {
	return shiftMonth(key, 1);
}
function prevMonthKey(key) {
	return shiftMonth(key, -1);
}
function monthTitle(key, lang) {
	const raw = format(parseMonthKey(key), "MMMM yyyy", { locale: localeOf$1(lang) });
	return raw.charAt(0).toUpperCase() + raw.slice(1);
}
function yearOf(key) {
	return key.slice(0, 4);
}
function isoToday() {
	return format(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
}
function dateInMonth(monthKey, day = 1) {
	const dim = daysInMonth(monthKey);
	return `${monthKey}-${String(Math.max(1, Math.min(day, dim))).padStart(2, "0")}`;
}
function daysInMonth(key) {
	const [y, m] = key.split("-").map(Number);
	return new Date(y, m, 0).getDate();
}
function startWeekday(key) {
	const [y, m] = key.split("-").map(Number);
	return new Date(y, m - 1, 1).getDay();
}
function formatDayTitle(iso, lang) {
	const d = parse(iso, "yyyy-MM-dd", /* @__PURE__ */ new Date());
	const raw = format(d, "d MMMM yyyy", { locale: localeOf$1(lang) });
	return raw.charAt(0).toUpperCase() + raw.slice(1);
}
function monthIndex(key) {
	const [y, m] = key.split("-").map(Number);
	return y * 12 + (m - 1);
}
function monthsBetween(startKey, currentKey) {
	return monthIndex(currentKey) - monthIndex(startKey);
}
function monthNames(lang) {
	return Array.from({ length: 12 }, (_, i) => {
		const raw = format(new Date(2020, i, 1), "MMM", { locale: localeOf$1(lang) });
		return raw.charAt(0).toUpperCase() + raw.slice(1);
	});
}
function monthKeyFromParts(year, month1to12) {
	return `${year}-${String(month1to12).padStart(2, "0")}`;
}
var LANGS = [
	{
		code: "en",
		label: "English"
	},
	{
		code: "es",
		label: "Español (Latam)"
	},
	{
		code: "de",
		label: "Deutsch"
	},
	{
		code: "it",
		label: "Italiano"
	},
	{
		code: "fr",
		label: "Français"
	},
	{
		code: "pt",
		label: "Português"
	}
];
var INTL_LOCALE = {
	en: "en-US",
	es: "es-MX",
	de: "de-DE",
	it: "it-IT",
	fr: "fr-FR",
	pt: "pt-BR"
};
var en = {
	appName: "Budget Wise",
	tagline: "See where every euro goes",
	byline: "By AlejandroGarciaO",
	nav: {
		dashboard: "Home",
		budget: "Budget",
		transactions: "Activity",
		calendar: "Calendar",
		planning: "Plan",
		reports: "Reports",
		settings: "Settings",
		calculator: "Calculator",
		more: "More"
	},
	common: {
		save: "Save",
		cancel: "Cancel",
		delete: "Delete",
		edit: "Edit",
		add: "Add",
		close: "Close",
		confirm: "Confirm",
		name: "Name",
		amount: "Amount",
		date: "Date",
		notes: "Notes",
		category: "Category",
		method: "Payment method",
		type: "Type",
		search: "Search",
		filter: "Filter",
		all: "All",
		empty: "Nothing here yet."
	},
	calc: {
		modeSave: "How much can I accumulate?",
		modeTime: "How long until I reach my goal?",
		modePmt: "How much must I contribute each period?",
		modeRate: "What return do I need?",
		goal: "Target amount",
		principal: "Starting balance",
		pmt: "Periodic contribution",
		freq: "Contribution frequency",
		timing: "Deposit timing",
		timingBegin: "Beginning of each period",
		timingEnd: "End of each period",
		rate: "Annual interest rate",
		duration: "Duration",
		years: "years",
		months: "months",
		calculate: "Calculate",
		youCanSave: "Projected final balance",
		savingLine: "{pmt} {freq} for {duration}",
		needRate: "You need an annual return of",
		toReach: "to reach your goal of {goal}",
		needSave: "You need to contribute",
		eachPeriod: "each period to reach {goal} in {duration}",
		itWillTake: "It will take",
		toReachGoal: "to reach your goal of {goal}",
		year: "year",
		yearsWord: "years",
		month: "month",
		monthsWord: "months",
		and: "and",
		alreadyThere: "Your starting balance already meets the goal.",
		unreachable: "These numbers will not reach the goal. Try a larger contribution, a longer timeline, or a higher rate.",
		initial: "Starting balance",
		periodic: "Periodic contributions",
		interest: "Investment growth",
		tableYear: "Year",
		tablePeriodic: "Contributions this year",
		tableTotalDep: "Total contributions",
		tableInterest: "Total growth",
		tableBalance: "Ending balance",
		share: "Share result",
		freqWeekly: "Weekly (52/Year)",
		freqBiweekly: "Biweekly (26/Year)",
		freqMonthly: "Monthly (12/Year)",
		freqQuarterly: "Quarterly (4/Year)",
		freqAnnually: "Annually (1/Year)",
		freqShortWeekly: "Weekly",
		freqShortBiweekly: "Biweekly",
		freqShortMonthly: "Monthly",
		freqShortQuarterly: "Quarterly",
		freqShortAnnually: "Annual"
	},
	budget: {
		settings: "Settings",
		budgetProfile: "Budget profile",
		main: "Main",
		addProfile: "Add profile",
		removeProfile: "Remove profile",
		month: "Month",
		currency: "Currency",
		language: "Language",
		advanced: "Advanced view",
		paymentMethods: "Payment methods",
		addPayment: "Add payment method",
		incomeTitle: "Monthly net income for {month}",
		incomeExprHint: "Type 4000+2000 and press Enter or tap outside to add them up. You can chain many values.",
		amountExprHint: "Type 45+30 to add purchases on this line instead of creating a new one.",
		largePurchases: "Large purchases",
		largePurchasesHint: "Spread a one-time purchase across several months without treating it as formal debt.",
		noLarge: "No large purchases added yet.",
		addLarge: "Add large purchase",
		recurring: "Recurring expenses",
		recurringHint: "Templates for subscriptions and bills. Logging one creates a real transaction.",
		noRecurring: "No recurring expenses added yet.",
		addRecurring: "Add recurring expense",
		logPaid: "Log this month",
		logged: "Logged",
		essential: "Essential bills & expenses",
		essentialHint: "Core expenses required for living, like rent, groceries, and utilities.",
		investing: "Long-term growth (investing)",
		investingHint: "Money put to work to build wealth: stocks, ETFs, retirement.",
		flexible: "Flexible spending & fun",
		flexibleHint: "Non-essential spending that enhances your lifestyle.",
		debtAlloc: "Debt paydown",
		debtAllocHint: "Planned extra toward balances listed in Financial Health.",
		target: "Target",
		actual: "Actual",
		remaining: "Remaining",
		items: "Items",
		adjustment: "Budget adjustment",
		noItems: "No items added yet.",
		addItem: "Add item",
		invCalc: "Investment growth calculator",
		invCalcHint: "Project your investment growth over time with the power of compound interest.",
		initialInv: "Initial investment",
		monthlyContrib: "Monthly contribution",
		annualRate: "Annual interest rate (%)",
		invPeriod: "Investment period (years)",
		invEmpty: "Enter your investment details to see the projection.",
		openFullCalc: "Open full calculator",
		fullCalc: "Full compound calculator",
		fullCalcHint: "Four modes: how much you can save, how long it takes, required contribution, and required rate.",
		goals: "Savings goals",
		goalsHint: "Track progress toward a target. Monthly contributions post to the ledger.",
		totalMonthly: "Total monthly contribution",
		thisMonth: "This month's contribution",
		addGoal: "Add new goal",
		emergency: "Emergency fund",
		amount: "Amount…",
		debt: "Debt paydown planner",
		debtHint: "Interest-bearing purchases — loans and cards. The monthly minimum posts to the budget category you pick.",
		debtCategoryHint: "Pick where the minimum should show on this month's budget. Extra avalanche or snowball payments still live in Debt paydown.",
		debtMinPreview: "{amount} posts to {category} every month until the balance is gone.",
		yourDebts: "Your debts",
		debtName: "Debt name",
		debtBalance: "Balance",
		debtRate: "Interest rate (%)",
		debtMin: "Min. payment",
		noDebts: "You have no debts with a balance listed in your Financial Health statement.",
		strategy: "Paydown strategy",
		payoffMethod: "Payoff method",
		avalanche: "Avalanche",
		snowball: "Snowball",
		avalancheHint: "Pay minimums, then throw extra at the highest APR first.",
		snowballHint: "Pay minimums, then throw extra at the smallest balance first.",
		extraPayment: "Extra monthly payment",
		extraHint: "Extra on top of minimums. Freed minimums roll into the next debt.",
		paydownPlan: "Your paydown plan",
		debtFreeIn: "Debt-free in {months} months",
		interestPaid: "Total interest",
		interestSaved: "Interest saved vs minimum-only",
		totalPaid: "Total paid",
		monthsShort: "{n} months",
		interestCost: "Interest cost",
		cheaperBy: "This method saves {amount} more in interest",
		fasterBy: "{n} months faster",
		samePlan: "Both methods cost about the same interest with these numbers.",
		monthlySummary: "Monthly summary",
		monthlyHint: "A snapshot of this month's cash flow.",
		enterSpending: "Enter some spending to see the chart.",
		totalIncome: "Total income",
		totalExpenses: "Total expenses",
		totalSavedInv: "Total saved & invested",
		finalBalance: "Final balance",
		health: "Financial health & ratios",
		healthHint: "Assets, liabilities and ratios. Tooltips explain each formula.",
		netWorth: "Net worth statement",
		ratios: "Financial ratios",
		liquidity: "Basic liquidity ratio",
		savInvRate: "Savings-investment rate",
		debtToAssets: "Debt to assets ratio",
		monthlyDebt: "Monthly debt ratio",
		investedNw: "Invested assets to net worth",
		solvency: "Solvency ratio",
		monthsUnit: "months",
		assets: "Assets",
		liabilities: "Liabilities",
		cash: "Cash",
		bank: "Bank accounts",
		savings: "Liquid savings",
		investments: "Investments",
		property: "Property",
		other: "Other",
		netWorthLabel: "Net worth",
		addDebt: "Add debt",
		aiTitle: "AI Financial Tip",
		aiHint: "A personalized tip based on your current budget.",
		aiCta: "Get a new tip",
		aiLoading: "Reading your budget…",
		aiUnavailable: "Grok is unavailable. Showing a local tip instead.",
		askGrok: "Ask Grok",
		yearly: "Yearly summary for {year}",
		yearlyHint: "A high-level overview of the current year.",
		noYearly: "No yearly data to display a chart.",
		totalSaved: "Total saved",
		totalInvested: "Total invested",
		name: "Name",
		total: "Total",
		installments: "Months",
		category: "Category",
		method: "Method",
		save: "Save",
		cancel: "Cancel",
		delete: "Delete",
		edit: "Edit",
		current: "Current",
		targetAmount: "Target",
		loadSample: "Restore sample data",
		reset: "Clear this profile",
		confirmReset: "Clear all data in this profile? This cannot be undone.",
		confirmDeleteProfile: "Delete this profile and all of its financial data?",
		shareBudget: "Share summary",
		leftoverTitle: "Money left to budget",
		leftoverOk: "Every euro has a job.",
		leftoverPos: "Still available to allocate",
		leftoverNeg: "Planned allocations exceed income",
		copyMonth: "Copy previous month's income",
		copied: "Copied previous month's income target",
		percentWarn: "Target percentages sum to {sum}%. They are not forced to 100 — you control the budget.",
		markPaid: "Mark installment paid",
		paidOf: "{paid} / {total} paid",
		pickPeriod: "Choose month and year",
		prevYear: "Previous year",
		nextYear: "Next year",
		largeHintSelf: "Pay from your own money — emergency fund or savings — and repay yourself in installments, with no interest.",
		largeCategory: "Budget category",
		largeNamePh: "e.g. Washing machine",
		monthsSplit: "Split across how many months?",
		perMonthPreview: "{amount} posts to that category every month for {n} months, then disappears on its own.",
		largeDone: "Paid back. This installment has finished.",
		notStarted: "Starts in a later month",
		badgeRecurring: "Recurring",
		badgeInstallment: "Installment",
		badgeDebt: "Loan",
		monthOf: "Month {n} of {total}",
		editItem: "Edit item",
		editRecurring: "Edit recurring expense",
		editGoal: "Edit savings goal",
		alreadySaved: "Already saved",
		recurringAutoHint: "Posted automatically on the months it is due so you do not have to tap it again. Pause if you need a break.",
		suggestions: "Suggestions from earlier entries",
		appliedAuto: "Posted this month",
		paused: "Paused",
		skipped: "Skipped this month",
		pause: "Pause",
		resume: "Resume",
		extraGoesTo: "Extra payment goes to",
		fullSchedule: "Full plan · {n} months",
		extras: "Extra inflows",
		extrasLine: "Extra this month",
		extrasHint: "eToro Popular Investor payouts, Visa cashback and similar extras stay in this category. They do not change the other percentages.",
		addInflow: "Add extra income",
		editInflow: "Edit extra income",
		noInflows: "No extra inflows yet.",
		inflowRepeat: "Repeats on a schedule",
		frequency: "How often",
		freqMonthly: "Monthly",
		freqBimonthly: "Bimonthly (every 2 months)",
		freqQuarterly: "Quarterly (every 3 months)",
		freqSemiannual: "Semester (every 6 months)",
		freqYearly: "Yearly",
		editDebt: "Edit debt",
		editLarge: "Edit large purchase",
		fundFrom: "Take the full amount from",
		fundFromNone: "Do not take from a savings goal",
		fundFromHint: "The total leaves that goal today. Each monthly installment pays it back into the goal, with no interest.",
		fundedFrom: "Taken from {name}",
		repayProgress: "{paid} repaid of {total}",
		oneTime: "This month only",
		debtNotRetired: "These payments will not retire the debt (interest exceeds payments).",
		aiEmpty: "Tap the button for a tip based on this month's numbers.",
		profileDefaultName: "Profile",
		hints: {
			liquidity: "Months of essential expenses you could cover with cash and liquid savings. Formula: (cash + bank + liquid savings) ÷ essential expenses. Typical target: 3+ months.",
			savInvRate: "Share of income saved or invested this month. Formula: (savings + investments) ÷ income. Typical target: 20% or more — not a universal rule.",
			debtToAssets: "Total debt divided by total assets. Formula: liabilities ÷ assets. Under 40% is often considered comfortable.",
			monthlyDebt: "Minimum debt payments versus income. Formula: min payments ÷ income. Under 36% is a common guideline.",
			investedNw: "Share of net worth that is invested. Formula: investments ÷ net worth. 50%+ shows a growth bias for some households.",
			solvency: "Net worth divided by total assets. Formula: (assets − liabilities) ÷ assets. Above 50% is a solid base."
		}
	},
	dash: {
		title: "Dashboard",
		hello: "Your month at a glance",
		recent: "Recent activity",
		seeAll: "See all",
		noTx: "No transactions this month yet.",
		addTx: "Add transaction",
		snapshot: "Allocation snapshot"
	},
	tx: {
		title: "Transactions",
		add: "Add transaction",
		edit: "Edit transaction",
		empty: "No transactions match these filters.",
		income: "Income",
		expense: "Expense",
		saving: "Saving",
		investment: "Investment",
		debt: "Debt payment",
		confirmDelete: "Delete this transaction?",
		net: "Net cash flow"
	},
	cal: {
		title: "Calendar",
		income: "Income",
		expenses: "Expenses",
		saved: "Saved",
		invested: "Invested",
		net: "Net cash flow",
		emptyDay: "No transactions on this day.",
		prev: "Previous month",
		next: "Next month",
		weekdays: "S,M,T,W,T,F,S"
	},
	plan: {
		title: "Planning",
		subtitle: "Large purchases, bills, investing and debt — plans, not duplicate ledgers."
	},
	reports: {
		title: "Reports",
		subtitle: "Monthly and yearly totals, export and backup. Your data never leaves this device unless you export it.",
		monthly: "Monthly report",
		yearly: "Annual report",
		exportCsv: "Export CSV",
		exportJson: "Export backup",
		importJson: "Import backup",
		print: "Print / save PDF",
		confirmImport: "Import this backup and replace current data on this device?",
		importOk: "Backup restored.",
		importBad: "That file is not a valid Budget Wise backup.",
		backupHint: "A JSON backup includes profiles, transactions, budgets, goals, debts and settings.",
		csvHint: "Spreadsheet-friendly export of this profile's transactions.",
		printHint: "Opens a printable summary you can save as PDF from the browser.",
		topTx: "Largest transactions",
		byMethod: "By payment method",
		byCategory: "By category"
	},
	settings: {
		title: "Settings",
		subtitle: "Local-first. No account required.",
		theme: "Theme",
		dark: "Dark",
		light: "Light",
		privacy: "Your numbers stay on this device. Backup when you want a copy.",
		rename: "Rename profile"
	},
	setup: {
		title: "Welcome to Budget Wise",
		subtitle: "Start with a guided example, upload a spreadsheet, or begin empty.",
		sample: "Use the example budget",
		sampleHint: "See where income, groceries and bills go — you can replace this anytime.",
		empty: "Start from scratch",
		emptyHint: "Empty profile with payment methods only. You add every amount yourself.",
		upload: "Upload Excel or CSV",
		uploadHint: "Monthly sheets with Needs / Investing / Wants. A backup is saved first so you can undo.",
		skip: "Continue with the example"
	},
	import: {
		excel: "Import spreadsheet",
		excelHint: "Excel (.xlsx) or CSV. A backup downloads first so you can undo if something looks wrong.",
		working: "Reading spreadsheet…",
		ok: "Imported {months} months ({first} – {last}). A backup was saved.",
		bad: "Could not read that spreadsheet. Use a monthly budget with income and Needs / Investing / Wants columns.",
		restore: "Undo last import",
		restoreOk: "Previous data restored."
	}
};
var messages = {
	en,
	es: {
		appName: "Budget Wise",
		tagline: "Mira a dónde va cada euro",
		byline: "Por AlejandroGarciaO",
		nav: {
			dashboard: "Inicio",
			budget: "Presupuesto",
			transactions: "Movimientos",
			calendar: "Calendario",
			planning: "Plan",
			reports: "Informes",
			settings: "Ajustes",
			calculator: "Calculadora",
			more: "Más"
		},
		common: {
			save: "Guardar",
			cancel: "Cancelar",
			delete: "Eliminar",
			edit: "Editar",
			add: "Agregar",
			close: "Cerrar",
			confirm: "Confirmar",
			name: "Nombre",
			amount: "Monto",
			date: "Fecha",
			notes: "Notas",
			category: "Categoría",
			method: "Método de pago",
			type: "Tipo",
			search: "Buscar",
			filter: "Filtro",
			all: "Todos",
			empty: "Todavía no hay nada aquí."
		},
		calc: {
			modeSave: "¿Cuánto puedo acumular?",
			modeTime: "¿Cuánto tardaré en alcanzar mi objetivo?",
			modePmt: "¿Cuánto necesito aportar cada periodo?",
			modeRate: "¿Qué rentabilidad necesito?",
			goal: "Objetivo",
			principal: "Saldo inicial",
			pmt: "Aporte periódico",
			freq: "Frecuencia",
			timing: "Momento del depósito",
			timingBegin: "Al inicio de cada periodo",
			timingEnd: "Al final de cada periodo",
			rate: "Interés anual",
			duration: "Duración",
			years: "años",
			months: "meses",
			calculate: "Calcular",
			youCanSave: "Saldo final proyectado",
			savingLine: "{pmt} {freq} durante {duration}",
			needRate: "Necesitas una rentabilidad de",
			toReach: "para alcanzar tu objetivo de {goal}",
			needSave: "Necesitas aportar",
			eachPeriod: "cada periodo para alcanzar {goal} en {duration}",
			itWillTake: "Te va a llevar",
			toReachGoal: "para alcanzar tu objetivo de {goal}",
			year: "año",
			yearsWord: "años",
			month: "mes",
			monthsWord: "meses",
			and: "y",
			alreadyThere: "El saldo inicial ya cubre el objetivo.",
			unreachable: "Con estos números no vas a alcanzar el objetivo. Prueba a subir el aporte, el plazo o la tasa.",
			initial: "Saldo inicial",
			periodic: "Aportes periódicos",
			interest: "Crecimiento de la inversión",
			tableYear: "Año",
			tablePeriodic: "Aportes del año",
			tableTotalDep: "Aportes totales",
			tableInterest: "Crecimiento total",
			tableBalance: "Saldo final",
			share: "Compartir resultado",
			freqWeekly: "Semanal (52/año)",
			freqBiweekly: "Quincenal (26/año)",
			freqMonthly: "Mensual (12/año)",
			freqQuarterly: "Trimestral (4/año)",
			freqAnnually: "Anual (1/año)",
			freqShortWeekly: "Semanal",
			freqShortBiweekly: "Quincenal",
			freqShortMonthly: "Mensual",
			freqShortQuarterly: "Trimestral",
			freqShortAnnually: "Anual"
		},
		budget: {
			settings: "Ajustes",
			budgetProfile: "Perfil de presupuesto",
			main: "Principal",
			addProfile: "Agregar perfil",
			removeProfile: "Eliminar perfil",
			month: "Mes",
			currency: "Moneda",
			language: "Idioma",
			advanced: "Vista avanzada",
			paymentMethods: "Métodos de pago",
			addPayment: "Agregar método de pago",
			incomeTitle: "Ingresos netos mensuales de {month}",
			incomeExprHint: "Escribe 4000+2000 y pulsa Enter o toca afuera para sumarlos. Puedes encadenar varios valores.",
			amountExprHint: "Escribe 45+30 para sumar compras en esta línea, sin crear otra.",
			largePurchases: "Compras grandes",
			largePurchasesHint: "Reparte una compra puntual en varios meses sin tratarla como deuda formal.",
			noLarge: "Todavía no hay compras grandes.",
			addLarge: "Agregar compra grande",
			recurring: "Gastos recurrentes",
			recurringHint: "Plantillas para suscripciones y facturas. Registrar una crea un movimiento real.",
			noRecurring: "Todavía no hay gastos recurrentes.",
			addRecurring: "Agregar gasto recurrente",
			logPaid: "Registrar este mes",
			logged: "Registrado",
			essential: "Gastos esenciales",
			essentialHint: "Gastos imprescindibles para vivir: alquiler, comida y servicios.",
			investing: "Crecimiento a largo plazo (inversión)",
			investingHint: "Dinero trabajando para construir patrimonio: acciones, ETF, retiro.",
			flexible: "Gastos flexibles y ocio",
			flexibleHint: "Gastos no esenciales que mejoran tu estilo de vida.",
			debtAlloc: "Pago de deudas",
			debtAllocHint: "Extra previsto hacia los saldos de Salud financiera.",
			target: "Objetivo",
			actual: "Real",
			remaining: "Restante",
			items: "Partidas",
			adjustment: "Ajuste de presupuesto",
			noItems: "Todavía no hay partidas.",
			addItem: "Agregar partida",
			invCalc: "Calculadora de crecimiento",
			invCalcHint: "Proyecta el crecimiento de tu inversión con el interés compuesto.",
			initialInv: "Inversión inicial",
			monthlyContrib: "Aporte mensual",
			annualRate: "Interés anual (%)",
			invPeriod: "Periodo de inversión (años)",
			invEmpty: "Introduce los detalles para ver la proyección.",
			openFullCalc: "Abrir calculadora completa",
			fullCalc: "Calculadora de interés compuesto",
			fullCalcHint: "Cuatro modos: cuánto puedes ahorrar, cuánto tardarás, cuánto aportar y qué rentabilidad necesitas.",
			goals: "Metas de ahorro",
			goalsHint: "Sigue el progreso hacia un objetivo. Los aportes se anotan en el libro.",
			totalMonthly: "Aporte mensual total",
			thisMonth: "Aporte de este mes",
			addGoal: "Agregar nueva meta",
			emergency: "Fondo de emergencia",
			amount: "Monto…",
			debt: "Plan de salida de deudas",
			debtHint: "Compras con interés — préstamos y tarjetas. El mínimo mensual se anota en la categoría que elijas.",
			debtCategoryHint: "Elige dónde aparece el mínimo en el presupuesto del mes. Los pagos extra de avalancha o bola de nieve siguen en el plan de deudas.",
			debtMinPreview: "Se anotan {amount} en {category} cada mes hasta que el saldo se acaba.",
			yourDebts: "Tus deudas",
			debtName: "Nombre",
			debtBalance: "Saldo",
			debtRate: "Interés (%)",
			debtMin: "Pago mín.",
			noDebts: "No tienes deudas con saldo en tu estado de salud financiera.",
			strategy: "Estrategia de pago",
			payoffMethod: "Método de liquidación",
			avalanche: "Avalancha",
			snowball: "Bola de nieve",
			avalancheHint: "Paga mínimos y lanza el extra a la APR más alta.",
			snowballHint: "Paga mínimos y lanza el extra al saldo más pequeño.",
			extraPayment: "Pago extra mensual",
			extraHint: "Extra sobre los mínimos. Los mínimos liberados ruedan a la siguiente deuda.",
			paydownPlan: "Tu plan de pago",
			debtFreeIn: "Libre de deudas en {months} meses",
			interestPaid: "Intereses totales",
			interestSaved: "Intereses ahorrados vs solo mínimos",
			totalPaid: "Total pagado",
			monthsShort: "{n} meses",
			interestCost: "Costo de intereses",
			cheaperBy: "Este método ahorra {amount} más en intereses",
			fasterBy: "{n} meses más rápido",
			samePlan: "Con estos números ambos métodos cuestan casi lo mismo en intereses.",
			monthlySummary: "Resumen mensual",
			monthlyHint: "Una vista del flujo de este mes.",
			enterSpending: "Agrega algún gasto para ver el gráfico.",
			totalIncome: "Ingresos totales",
			totalExpenses: "Gastos totales",
			totalSavedInv: "Ahorrado e invertido",
			finalBalance: "Saldo final",
			health: "Salud financiera y ratios",
			healthHint: "Activos, pasivos y ratios. Cada fórmula se explica en el tooltip.",
			netWorth: "Estado de patrimonio neto",
			ratios: "Ratios financieros",
			liquidity: "Ratio de liquidez básica",
			savInvRate: "Tasa de ahorro-inversión",
			debtToAssets: "Deuda sobre activos",
			monthlyDebt: "Ratio de deuda mensual",
			investedNw: "Activos invertidos / patrimonio",
			solvency: "Ratio de solvencia",
			monthsUnit: "meses",
			assets: "Activos",
			liabilities: "Pasivos",
			cash: "Efectivo",
			bank: "Cuentas bancarias",
			savings: "Ahorros líquidos",
			investments: "Inversiones",
			property: "Propiedad",
			other: "Otros",
			netWorthLabel: "Patrimonio neto",
			addDebt: "Agregar deuda",
			aiTitle: "Consejo financiero con IA",
			aiHint: "Un consejo personalizado según tu presupuesto actual.",
			aiCta: "Pedir un consejo nuevo",
			aiLoading: "Leyendo tu presupuesto…",
			aiUnavailable: "Grok no está disponible. Mostrando un consejo local.",
			askGrok: "Preguntar a Grok",
			yearly: "Resumen anual de {year}",
			yearlyHint: "Una visión general de tus finanzas este año.",
			noYearly: "No hay datos anuales para mostrar el gráfico.",
			totalSaved: "Total ahorrado",
			totalInvested: "Total invertido",
			name: "Nombre",
			total: "Total",
			installments: "Meses",
			category: "Categoría",
			method: "Método",
			save: "Guardar",
			cancel: "Cancelar",
			delete: "Eliminar",
			edit: "Editar",
			current: "Actual",
			targetAmount: "Objetivo",
			loadSample: "Restaurar datos de ejemplo",
			reset: "Vaciar este perfil",
			confirmReset: "¿Vaciar todos los datos de este perfil? No se puede deshacer.",
			confirmDeleteProfile: "¿Eliminar este perfil y todos sus datos financieros?",
			shareBudget: "Compartir resumen",
			leftoverTitle: "Dinero por asignar",
			leftoverOk: "Cada euro tiene un propósito.",
			leftoverPos: "Todavía disponible para asignar",
			leftoverNeg: "Las asignaciones superan los ingresos",
			copyMonth: "Copiar ingresos del mes anterior",
			copied: "Ingresos del mes anterior copiados",
			percentWarn: "Los porcentajes suman {sum}%. No se fuerzan a 100 — tú controlas el presupuesto.",
			markPaid: "Marcar cuota pagada",
			paidOf: "{paid} / {total} pagadas",
			pickPeriod: "Elige mes y año",
			prevYear: "Año anterior",
			nextYear: "Año siguiente",
			largeHintSelf: "Págalo con tu propio dinero — fondo de emergencia o ahorros — y devuélvetelo a plazos, sin intereses.",
			largeCategory: "Categoría del presupuesto",
			largeNamePh: "p. ej. Lavadora",
			monthsSplit: "¿En cuántos meses lo fraccionas?",
			perMonthPreview: "Se anotan {amount} en esa categoría cada mes durante {n} meses y luego desaparecen solos.",
			largeDone: "Devuelto. Esta compra a plazos ya terminó.",
			notStarted: "Empieza en un mes posterior",
			badgeRecurring: "Recurrente",
			badgeInstallment: "Cuota",
			badgeDebt: "Préstamo",
			monthOf: "Mes {n} de {total}",
			editItem: "Editar partida",
			editRecurring: "Editar gasto recurrente",
			editGoal: "Editar meta de ahorro",
			alreadySaved: "Ya ahorrado",
			recurringAutoHint: "Se anota solo en los meses que corresponde para que no tengas que tocarlo otra vez. Pausa si necesitas un respiro.",
			suggestions: "Sugerencias de anotaciones anteriores",
			appliedAuto: "Anotado este mes",
			paused: "En pausa",
			skipped: "Omitido este mes",
			pause: "Pausar",
			resume: "Reanudar",
			extraGoesTo: "El extra va a",
			fullSchedule: "Plan completo · {n} meses",
			extras: "Ingresos extra",
			extrasLine: "Extra este mes",
			extrasHint: "Los pagos de Popular Investor de eToro, el cashback de la Visa y similares se quedan en esta categoría. No cambian los demás porcentajes.",
			addInflow: "Agregar ingreso extra",
			editInflow: "Editar ingreso extra",
			noInflows: "Todavía no hay ingresos extra.",
			inflowRepeat: "Se repite con un calendario",
			frequency: "Cada cuánto",
			freqMonthly: "Mensual",
			freqBimonthly: "Bimestral (cada 2 meses)",
			freqQuarterly: "Trimestral (cada 3 meses)",
			freqSemiannual: "Semestral (cada 6 meses)",
			freqYearly: "Anual",
			editDebt: "Editar deuda",
			editLarge: "Editar compra grande",
			fundFrom: "Tomar el total de",
			fundFromNone: "No tomar de una meta de ahorro",
			fundFromHint: "El total sale de esa meta hoy. Cada cuota mensual se lo va devolviendo, sin intereses.",
			fundedFrom: "Tomado de {name}",
			repayProgress: "{paid} devueltos de {total}",
			oneTime: "Solo este mes",
			debtNotRetired: "Con estos pagos la deuda no se liquida (el interés supera al pago).",
			aiEmpty: "Pulsa el botón para un consejo basado en los números de este mes.",
			profileDefaultName: "Perfil",
			hints: {
				liquidity: "Meses de gastos esenciales que podrías cubrir con efectivo y ahorros líquidos. Fórmula: (efectivo + banco + ahorros líquidos) ÷ gastos esenciales. Objetivo típico: 3 meses o más.",
				savInvRate: "Porcentaje de ingresos que ahorras o inviertes este mes. Fórmula: (ahorro + inversión) ÷ ingresos. Objetivo típico: 20% o más — no es una regla universal.",
				debtToAssets: "Deuda total entre activos. Fórmula: pasivos ÷ activos. Por debajo del 40% suele considerarse cómodo.",
				monthlyDebt: "Pagos mínimos de deuda respecto a ingresos. Fórmula: mínimos ÷ ingresos. Por debajo del 36% es una guía habitual.",
				investedNw: "Parte del patrimonio que está invertida. Fórmula: inversiones ÷ patrimonio neto. Un 50% o más indica sesgo de crecimiento.",
				solvency: "Patrimonio neto entre activos. Fórmula: (activos − pasivos) ÷ activos. Por encima del 50% indica una base sólida."
			}
		},
		dash: {
			title: "Inicio",
			hello: "Tu mes de un vistazo",
			recent: "Actividad reciente",
			seeAll: "Ver todo",
			noTx: "Todavía no hay movimientos este mes.",
			addTx: "Agregar movimiento",
			snapshot: "Asignación"
		},
		tx: {
			title: "Movimientos",
			add: "Agregar movimiento",
			edit: "Editar movimiento",
			empty: "Ningún movimiento coincide con estos filtros.",
			income: "Ingreso",
			expense: "Gasto",
			saving: "Ahorro",
			investment: "Inversión",
			debt: "Pago de deuda",
			confirmDelete: "¿Eliminar este movimiento?",
			net: "Flujo neto"
		},
		cal: {
			title: "Calendario",
			income: "Ingresos",
			expenses: "Gastos",
			saved: "Ahorrado",
			invested: "Invertido",
			net: "Flujo neto",
			emptyDay: "No hay movimientos este día.",
			prev: "Mes anterior",
			next: "Mes siguiente",
			weekdays: "D,L,M,M,J,V,S"
		},
		plan: {
			title: "Planificación",
			subtitle: "Compras grandes, facturas, inversión y deuda — planes, no libros duplicados."
		},
		reports: {
			title: "Informes",
			subtitle: "Totales, exportación y copia de seguridad. Tus datos no salen del dispositivo salvo que los exportes.",
			monthly: "Informe mensual",
			yearly: "Informe anual",
			exportCsv: "Exportar CSV",
			exportJson: "Exportar copia",
			importJson: "Importar copia",
			print: "Imprimir / guardar PDF",
			confirmImport: "¿Importar esta copia y sustituir los datos actuales de este dispositivo?",
			importOk: "Copia restaurada.",
			importBad: "Ese archivo no es una copia válida de Budget Wise.",
			backupHint: "La copia JSON incluye perfiles, movimientos, presupuestos, metas, deudas y ajustes.",
			csvHint: "Exportación lista para hoja de cálculo de los movimientos de este perfil.",
			printHint: "Abre un resumen imprimible que puedes guardar como PDF desde el navegador.",
			topTx: "Movimientos más grandes",
			byMethod: "Por método de pago",
			byCategory: "Por categoría"
		},
		settings: {
			title: "Ajustes",
			subtitle: "Local-first. Sin cuenta.",
			theme: "Tema",
			dark: "Oscuro",
			light: "Claro",
			privacy: "Tus números se quedan en este dispositivo. Haz una copia cuando quieras.",
			rename: "Renombrar perfil"
		},
		setup: {
			title: "Bienvenido a Budget Wise",
			subtitle: "Empieza con un ejemplo, sube una hoja de cálculo o parte de cero.",
			sample: "Usar el presupuesto de ejemplo",
			sampleHint: "Verás ingresos, mercado y cuentas — puedes reemplazarlo cuando quieras.",
			empty: "Empezar de cero",
			emptyHint: "Perfil vacío con métodos de pago. Tú escribes cada monto.",
			upload: "Subir Excel o CSV",
			uploadHint: "Hojas mensuales con Needs / Investing / Wants. Primero se guarda una copia de seguridad.",
			skip: "Seguir con el ejemplo"
		},
		import: {
			excel: "Importar hoja de cálculo",
			excelHint: "Excel (.xlsx) o CSV. Se descarga un backup primero por si hay que deshacer.",
			working: "Leyendo la hoja…",
			ok: "Se importaron {months} meses ({first} – {last}). Se guardó un backup.",
			bad: "No se pudo leer esa hoja. Usa un presupuesto mensual con ingreso y columnas Needs / Investing / Wants.",
			restore: "Deshacer última importación",
			restoreOk: "Se restauraron los datos anteriores."
		}
	},
	de: {
		...en,
		tagline: "Sieh, wohin jeder Euro geht",
		byline: "Von AlejandroGarciaO",
		nav: {
			dashboard: "Start",
			budget: "Budget",
			transactions: "Bewegungen",
			calendar: "Kalender",
			planning: "Plan",
			reports: "Berichte",
			settings: "Einstellungen",
			calculator: "Rechner",
			more: "Mehr"
		},
		common: {
			save: "Speichern",
			cancel: "Abbrechen",
			delete: "Löschen",
			edit: "Bearbeiten",
			add: "Hinzufügen",
			close: "Schließen",
			confirm: "Bestätigen",
			name: "Name",
			amount: "Betrag",
			date: "Datum",
			notes: "Notizen",
			category: "Kategorie",
			method: "Zahlungsmethode",
			type: "Typ",
			search: "Suchen",
			filter: "Filter",
			all: "Alle",
			empty: "Noch nichts hier."
		},
		calc: {
			...en.calc,
			modeSave: "Wie viel kann ich ansparen?",
			modeTime: "Wie lange bis zum Ziel?",
			modePmt: "Wie viel muss ich je Periode einzahlen?",
			modeRate: "Welche Rendite brauche ich?",
			goal: "Zielbetrag",
			principal: "Startguthaben",
			pmt: "Regelmäßige Einzahlung",
			freq: "Einzahlungshäufigkeit",
			timing: "Zeitpunkt der Einzahlung",
			timingBegin: "Anfang jeder Periode",
			timingEnd: "Ende jeder Periode",
			rate: "Jahreszins",
			duration: "Dauer",
			years: "Jahre",
			months: "Monate",
			calculate: "Berechnen",
			youCanSave: "Projiziertes Endguthaben",
			savingLine: "{pmt} {freq} über {duration}",
			needRate: "Du brauchst eine jährliche Rendite von",
			toReach: "um dein Ziel von {goal} zu erreichen",
			needSave: "Du musst einzahlen",
			eachPeriod: "jede Periode, um {goal} in {duration} zu erreichen",
			itWillTake: "Es dauert",
			toReachGoal: "um dein Ziel von {goal} zu erreichen",
			year: "Jahr",
			yearsWord: "Jahre",
			month: "Monat",
			monthsWord: "Monate",
			and: "und",
			alreadyThere: "Das Startguthaben erreicht das Ziel bereits.",
			unreachable: "Mit diesen Zahlen erreichst du das Ziel nicht. Höhere Einzahlung, längere Laufzeit oder höheren Zins versuchen.",
			initial: "Startguthaben",
			periodic: "Regelmäßige Einzahlungen",
			interest: "Anlagewachstum",
			tableYear: "Jahr",
			tablePeriodic: "Einzahlungen dieses Jahr",
			tableTotalDep: "Einzahlungen gesamt",
			tableInterest: "Wachstum gesamt",
			tableBalance: "Endstand",
			share: "Ergebnis teilen",
			freqWeekly: "Wöchentlich (52/Jahr)",
			freqBiweekly: "Alle zwei Wochen (26/Jahr)",
			freqMonthly: "Monatlich (12/Jahr)",
			freqQuarterly: "Vierteljährlich (4/Jahr)",
			freqAnnually: "Jährlich (1/Jahr)",
			freqShortWeekly: "Wöchentlich",
			freqShortBiweekly: "14-täglich",
			freqShortMonthly: "Monatlich",
			freqShortQuarterly: "Quartal",
			freqShortAnnually: "Jährlich"
		},
		budget: {
			...en.budget,
			settings: "Einstellungen",
			budgetProfile: "Budgetprofil",
			main: "Haupt",
			addProfile: "Profil hinzufügen",
			removeProfile: "Profil entfernen",
			month: "Monat",
			currency: "Währung",
			language: "Sprache",
			advanced: "Erweiterte Ansicht",
			paymentMethods: "Zahlungsmethoden",
			addPayment: "Zahlungsmethode hinzufügen",
			incomeTitle: "Monatliches Nettoeinkommen für {month}",
			incomeExprHint: "Tippe 4000+2000 und drücke Enter oder tippe außerhalb, um zu addieren. Mehrere Werte sind möglich.",
			amountExprHint: "Tippe 45+30, um Einkäufe in dieser Zeile zu addieren statt eine neue anzulegen.",
			largePurchases: "Große Anschaffungen",
			noLarge: "Noch keine großen Anschaffungen.",
			addLarge: "Große Anschaffung hinzufügen",
			recurring: "Wiederkehrende Ausgaben",
			noRecurring: "Noch keine wiederkehrenden Ausgaben.",
			addRecurring: "Wiederkehrende Ausgabe hinzufügen",
			logPaid: "Diesen Monat buchen",
			logged: "Gebucht",
			essential: "Lebensnotwendige Ausgaben",
			essentialHint: "Grundkosten wie Miete, Lebensmittel und Energie.",
			investing: "Langfristiges Wachstum (Investieren)",
			investingHint: "Geld, das Vermögen aufbaut: Aktien, ETFs, Altersvorsorge.",
			flexible: "Flexibles Ausgeben & Spaß",
			flexibleHint: "Nicht notwendige Ausgaben, die das Leben schöner machen.",
			debtAlloc: "Schuldentilgung",
			target: "Ziel",
			actual: "Ist",
			remaining: "Rest",
			items: "Posten",
			adjustment: "Budgetanpassung",
			noItems: "Noch keine Posten.",
			addItem: "Posten hinzufügen",
			invCalc: "Wachstumsrechner",
			initialInv: "Anfangsinvestition",
			monthlyContrib: "Monatliche Einzahlung",
			annualRate: "Jahreszins (%)",
			invPeriod: "Anlagedauer (Jahre)",
			invEmpty: "Gib deine Anlagedaten ein, um die Projektion zu sehen.",
			openFullCalc: "Vollen Rechner öffnen",
			goals: "Sparziele",
			totalMonthly: "Monatlicher Beitrag gesamt",
			thisMonth: "Beitrag diesen Monat",
			addGoal: "Neues Ziel hinzufügen",
			emergency: "Notfallfonds",
			amount: "Betrag…",
			debt: "Schuldentilgungsplan",
			debtHint: "Käufe mit Zinsen — Kredite und Karten. Die Mindestrate landet in der Budgetkategorie, die du wählst.",
			debtCategoryHint: "Wähle, wo die Mindestrate im Monatsbudget erscheint. Extra-Lawine oder Schneeball bleiben im Tilgungsplan.",
			debtMinPreview: "{amount} werden jeden Monat in {category} gebucht, bis der Saldo weg ist.",
			yourDebts: "Deine Schulden",
			debtName: "Name",
			debtBalance: "Saldo",
			debtRate: "Zins (%)",
			debtMin: "Mindestrate",
			noDebts: "Keine Schulden mit Saldo in der Finanzgesundheit.",
			strategy: "Tilgungsstrategie",
			payoffMethod: "Tilgungsmethode",
			avalanche: "Lawine",
			snowball: "Schneeball",
			avalancheHint: "Mindesten zahlen, Extra auf den höchsten Zins.",
			snowballHint: "Mindesten zahlen, Extra auf den kleinsten Saldo.",
			extraPayment: "Monatliche Sondertilgung",
			paydownPlan: "Dein Tilgungsplan",
			debtFreeIn: "Schuldenfrei in {months} Monaten",
			interestPaid: "Zinsen gesamt",
			interestSaved: "Zinsen gespart vs. nur Mindestzahlung",
			totalPaid: "Gesamt gezahlt",
			monthsShort: "{n} Monate",
			interestCost: "Zinskosten",
			cheaperBy: "Diese Methode spart {amount} mehr Zinsen",
			fasterBy: "{n} Monate schneller",
			samePlan: "Bei diesen Zahlen kosten beide Methoden etwa gleich viel Zinsen.",
			monthlySummary: "Monatsübersicht",
			enterSpending: "Gib Ausgaben ein, um das Diagramm zu sehen.",
			totalIncome: "Einkommen gesamt",
			totalExpenses: "Ausgaben gesamt",
			totalSavedInv: "Gespart & investiert",
			finalBalance: "Endsaldo",
			health: "Finanzgesundheit & Kennzahlen",
			netWorth: "Vermögensübersicht",
			ratios: "Finanzkennzahlen",
			liquidity: "Basis-Liquiditätsquote",
			savInvRate: "Spar-Investitionsquote",
			debtToAssets: "Verschuldungsgrad",
			monthlyDebt: "Monatliche Schuldenquote",
			investedNw: "Investiertes Vermögen / Nettovermögen",
			solvency: "Solvabilitätsquote",
			monthsUnit: "Monate",
			assets: "Vermögen",
			liabilities: "Verbindlichkeiten",
			cash: "Bargeld",
			bank: "Bankkonten",
			savings: "Liquide Ersparnisse",
			investments: "Investitionen",
			property: "Immobilien",
			other: "Sonstiges",
			netWorthLabel: "Nettovermögen",
			addDebt: "Schuld hinzufügen",
			aiTitle: "KI-Finanztipp",
			aiCta: "Neuen Tipp holen",
			aiLoading: "Budget wird gelesen…",
			askGrok: "Grok fragen",
			yearly: "Jahresübersicht {year}",
			noYearly: "Keine Jahresdaten für ein Diagramm.",
			totalSaved: "Gesamt gespart",
			totalInvested: "Gesamt investiert",
			name: "Name",
			total: "Summe",
			installments: "Monate",
			category: "Kategorie",
			method: "Methode",
			save: "Speichern",
			cancel: "Abbrechen",
			delete: "Löschen",
			edit: "Bearbeiten",
			current: "Aktuell",
			targetAmount: "Ziel",
			loadSample: "Beispieldaten laden",
			reset: "Dieses Profil leeren",
			leftoverTitle: "Noch zu verplanen",
			leftoverOk: "Jeder Euro hat eine Aufgabe.",
			leftoverPos: "Noch verfügbar zum Zuweisen",
			leftoverNeg: "Die Planung übersteigt das Einkommen",
			copyMonth: "Einkommen vom Vormonat kopieren",
			pickPeriod: "Monat und Jahr wählen",
			prevYear: "Vorjahr",
			nextYear: "Nächstes Jahr",
			largeHintSelf: "Zahle aus eigenem Geld — Notfallfonds oder Ersparnisse — und zahle dir ratenweise zurück, ohne Zinsen.",
			largeCategory: "Budgetkategorie",
			largeNamePh: "z. B. Waschmaschine",
			monthsSplit: "Über wie viele Monate aufteilen?",
			perMonthPreview: "{amount} werden {n} Monate lang in dieser Kategorie gebucht und verschwinden dann von selbst.",
			largeDone: "Zurückgezahlt. Diese Rate ist fertig.",
			notStarted: "Beginnt in einem späteren Monat",
			badgeRecurring: "Wiederkehrend",
			badgeInstallment: "Rate",
			badgeDebt: "Kredit",
			monthOf: "Monat {n} von {total}",
			editItem: "Posten bearbeiten",
			editRecurring: "Wiederkehrende Ausgabe bearbeiten",
			editGoal: "Sparziel bearbeiten",
			alreadySaved: "Bereits gespart",
			recurringAutoHint: "Wird in den fälligen Monaten automatisch gebucht. Pausieren, wenn du eine Pause brauchst.",
			suggestions: "Vorschläge aus früheren Einträgen",
			appliedAuto: "Diesen Monat gebucht",
			paused: "Pausiert",
			skipped: "Diesen Monat übersprungen",
			pause: "Pause",
			resume: "Fortsetzen",
			extraGoesTo: "Sondertilgung geht an",
			fullSchedule: "Gesamtplan · {n} Monate",
			extras: "Zusätzliche Zuflüsse",
			extrasLine: "Extra diesen Monat",
			extrasHint: "eToro-Popular-Investor-Auszahlungen, Visa-Cashback und Ähnliches bleiben in dieser Kategorie. Sie ändern die anderen Prozente nicht.",
			addInflow: "Extra-Einkommen hinzufügen",
			editInflow: "Extra-Einkommen bearbeiten",
			noInflows: "Noch keine Extra-Zuflüsse.",
			inflowRepeat: "Wiederholt sich nach Plan",
			frequency: "Wie oft",
			freqMonthly: "Monatlich",
			freqBimonthly: "Alle 2 Monate",
			freqQuarterly: "Vierteljährlich (alle 3 Monate)",
			freqSemiannual: "Halbjährlich (alle 6 Monate)",
			freqYearly: "Jährlich",
			editDebt: "Schuld bearbeiten",
			editLarge: "Große Anschaffung bearbeiten",
			fundFrom: "Gesamtbetrag nehmen aus",
			fundFromNone: "Nicht aus einem Sparziel nehmen",
			fundFromHint: "Der Gesamtbetrag verlässt das Ziel heute. Jede Monatsrate zahlt ihn zinsfrei zurück.",
			fundedFrom: "Entnommen aus {name}",
			repayProgress: "{paid} von {total} zurückgezahlt",
			oneTime: "Nur diesen Monat",
			debtNotRetired: "Mit diesen Zahlungen werden die Schulden nicht getilgt (Zinsen übersteigen die Zahlung).",
			aiEmpty: "Tippe auf den Knopf für einen Tipp zu den Zahlen dieses Monats.",
			profileDefaultName: "Profil"
		},
		dash: {
			title: "Start",
			hello: "Dein Monat auf einen Blick",
			recent: "Letzte Aktivität",
			seeAll: "Alle ansehen",
			noTx: "Diesen Monat noch keine Buchungen.",
			addTx: "Buchung hinzufügen",
			snapshot: "Verteilung"
		},
		tx: {
			title: "Buchungen",
			add: "Buchung hinzufügen",
			edit: "Buchung bearbeiten",
			empty: "Keine Buchung passt zu diesen Filtern.",
			income: "Einkommen",
			expense: "Ausgabe",
			saving: "Sparen",
			investment: "Investition",
			debt: "Schuldentilgung",
			confirmDelete: "Diese Buchung löschen?",
			net: "Netto-Cashflow"
		},
		cal: {
			title: "Kalender",
			income: "Einkommen",
			expenses: "Ausgaben",
			saved: "Gespart",
			invested: "Investiert",
			net: "Netto-Cashflow",
			emptyDay: "Keine Buchungen an diesem Tag.",
			prev: "Voriger Monat",
			next: "Nächster Monat",
			weekdays: "S,M,D,M,D,F,S"
		},
		plan: {
			title: "Planung",
			subtitle: "Große Käufe, Rechnungen, Investieren und Schulden — Pläne, keine doppelten Bücher."
		},
		reports: {
			...en.reports,
			title: "Berichte",
			subtitle: "Monats- und Jahressummen, Export und Backup. Deine Daten verlassen das Gerät nur, wenn du exportierst.",
			monthly: "Monatsbericht",
			yearly: "Jahresbericht",
			exportCsv: "CSV exportieren",
			exportJson: "Backup exportieren",
			importJson: "Backup importieren",
			print: "Drucken / PDF speichern",
			confirmImport: "Dieses Backup importieren und die Daten auf diesem Gerät ersetzen?",
			importOk: "Backup wiederhergestellt.",
			importBad: "Diese Datei ist kein gültiges Budget-Wise-Backup.",
			topTx: "Größte Buchungen",
			byMethod: "Nach Zahlungsmethode",
			byCategory: "Nach Kategorie"
		},
		settings: {
			title: "Einstellungen",
			subtitle: "Zuerst lokal. Kein Konto nötig.",
			theme: "Design",
			dark: "Dunkel",
			light: "Hell",
			privacy: "Deine Zahlen bleiben auf diesem Gerät. Sichere ein Backup, wenn du eine Kopie willst.",
			rename: "Profil umbenennen"
		},
		setup: {
			title: "Willkommen bei Budget Wise",
			subtitle: "Starte mit einem Beispiel, lade eine Tabelle hoch oder beginne leer.",
			sample: "Beispielbudget nutzen",
			sampleHint: "Sieh, wo Einkommen, Einkäufe und Rechnungen landen — jederzeit ersetzbar.",
			empty: "Von vorn beginnen",
			emptyHint: "Leeres Profil nur mit Zahlungsarten. Jeden Betrag selbst eintragen.",
			upload: "Excel oder CSV laden",
			uploadHint: "Monatsblätter mit Needs / Investing / Wants. Zuerst wird ein Backup gespeichert.",
			skip: "Mit dem Beispiel fortfahren"
		},
		import: {
			excel: "Tabelle importieren",
			excelHint: "Excel (.xlsx) oder CSV. Ein Backup wird zuerst heruntergeladen.",
			working: "Tabelle wird gelesen…",
			ok: "{months} Monate importiert ({first} – {last}). Backup gespeichert.",
			bad: "Diese Tabelle konnte nicht gelesen werden. Nutze ein Monatsbudget mit Einkommen und Needs / Investing / Wants.",
			restore: "Letzten Import rückgängig",
			restoreOk: "Vorherige Daten wiederhergestellt."
		}
	},
	it: {
		...en,
		tagline: "Vedi dove va ogni euro",
		byline: "Di AlejandroGarciaO",
		nav: {
			dashboard: "Home",
			budget: "Budget",
			transactions: "Movimenti",
			calendar: "Calendario",
			planning: "Piano",
			reports: "Report",
			settings: "Impostazioni",
			calculator: "Calcolatrice",
			more: "Altro"
		},
		common: {
			save: "Salva",
			cancel: "Annulla",
			delete: "Elimina",
			edit: "Modifica",
			add: "Aggiungi",
			close: "Chiudi",
			confirm: "Conferma",
			name: "Nome",
			amount: "Importo",
			date: "Data",
			notes: "Note",
			category: "Categoria",
			method: "Metodo di pagamento",
			type: "Tipo",
			search: "Cerca",
			filter: "Filtro",
			all: "Tutti",
			empty: "Ancora niente qui."
		},
		calc: {
			...en.calc,
			modeSave: "Quanto posso accumulare?",
			modeTime: "Quanto tempo per raggiungere l'obiettivo?",
			modePmt: "Quanto devo versare ogni periodo?",
			modeRate: "Che rendimento mi serve?",
			goal: "Obiettivo",
			principal: "Saldo iniziale",
			pmt: "Versamento periodico",
			freq: "Frequenza",
			timing: "Momento del versamento",
			timingBegin: "All'inizio di ogni periodo",
			timingEnd: "Alla fine di ogni periodo",
			rate: "Tasso annuale",
			duration: "Durata",
			years: "anni",
			months: "mesi",
			calculate: "Calcola",
			youCanSave: "Saldo finale previsto",
			savingLine: "{pmt} {freq} per {duration}",
			needRate: "Ti serve un rendimento annuale di",
			toReach: "per raggiungere l'obiettivo di {goal}",
			needSave: "Devi versare",
			eachPeriod: "ogni periodo per raggiungere {goal} in {duration}",
			itWillTake: "Ci vorranno",
			toReachGoal: "per raggiungere l'obiettivo di {goal}",
			year: "anno",
			yearsWord: "anni",
			month: "mese",
			monthsWord: "mesi",
			and: "e",
			alreadyThere: "Il saldo iniziale copre già l'obiettivo.",
			unreachable: "Con questi numeri non raggiungi l'obiettivo. Prova un versamento più alto, più tempo o un tasso maggiore.",
			initial: "Saldo iniziale",
			periodic: "Versamenti periodici",
			interest: "Crescita dell'investimento",
			tableYear: "Anno",
			tablePeriodic: "Versamenti di quest'anno",
			tableTotalDep: "Versamenti totali",
			tableInterest: "Crescita totale",
			tableBalance: "Saldo finale",
			share: "Condividi risultato",
			freqWeekly: "Settimanale (52/anno)",
			freqBiweekly: "Quindicinale (26/anno)",
			freqMonthly: "Mensile (12/anno)",
			freqQuarterly: "Trimestrale (4/anno)",
			freqAnnually: "Annuale (1/anno)",
			freqShortWeekly: "Settimanale",
			freqShortBiweekly: "Quindicinale",
			freqShortMonthly: "Mensile",
			freqShortQuarterly: "Trimestrale",
			freqShortAnnually: "Annuale"
		},
		budget: {
			...en.budget,
			settings: "Impostazioni",
			budgetProfile: "Profilo di budget",
			main: "Principale",
			addProfile: "Aggiungi profilo",
			removeProfile: "Rimuovi profilo",
			month: "Mese",
			currency: "Valuta",
			language: "Lingua",
			advanced: "Vista avanzata",
			paymentMethods: "Metodi di pagamento",
			addPayment: "Aggiungi metodo di pagamento",
			incomeTitle: "Reddito netto mensile di {month}",
			incomeExprHint: "Scrivi 4000+2000 e premi Invio o tocca fuori per sommare. Puoi concatenare più valori.",
			amountExprHint: "Scrivi 45+30 per sommare gli acquisti su questa riga invece di crearne un'altra.",
			largePurchases: "Acquisti importanti",
			noLarge: "Nessun acquisto importante.",
			addLarge: "Aggiungi acquisto importante",
			recurring: "Spese ricorrenti",
			noRecurring: "Nessuna spesa ricorrente.",
			addRecurring: "Aggiungi spesa ricorrente",
			logPaid: "Registra questo mese",
			logged: "Registrato",
			essential: "Spese essenziali",
			essentialHint: "Spese per vivere: affitto, spesa, utenze.",
			investing: "Crescita a lungo termine (investimenti)",
			investingHint: "Denaro che costruisce patrimonio: azioni, ETF, pensione.",
			flexible: "Spese flessibili e svago",
			flexibleHint: "Spese non essenziali che migliorano lo stile di vita.",
			debtAlloc: "Rimborso debiti",
			target: "Obiettivo",
			actual: "Effettivo",
			remaining: "Rimanente",
			items: "Voci",
			adjustment: "Rettifica di budget",
			noItems: "Nessuna voce ancora.",
			addItem: "Aggiungi voce",
			invCalc: "Calcolatore di crescita",
			initialInv: "Investimento iniziale",
			monthlyContrib: "Versamento mensile",
			annualRate: "Tasso annuale (%)",
			invPeriod: "Periodo di investimento (anni)",
			invEmpty: "Inserisci i dati per vedere la proiezione.",
			openFullCalc: "Apri calcolatore completo",
			goals: "Obiettivi di risparmio",
			totalMonthly: "Versamento mensile totale",
			thisMonth: "Versamento di questo mese",
			addGoal: "Aggiungi nuovo obiettivo",
			emergency: "Fondo di emergenza",
			amount: "Importo…",
			debt: "Piano di rimborso debiti",
			debtHint: "Acquisti con interessi — prestiti e carte. La rata minima va nella categoria di budget che scegli.",
			debtCategoryHint: "Scegli dove compare la rata minima nel budget del mese. I pagamenti extra valanga o palla di neve restano nel piano debiti.",
			debtMinPreview: "{amount} viene registrato in {category} ogni mese finché il saldo non è a zero.",
			yourDebts: "I tuoi debiti",
			debtName: "Nome",
			debtBalance: "Saldo",
			debtRate: "Tasso (%)",
			debtMin: "Rata min.",
			noDebts: "Nessun debito con saldo nella salute finanziaria.",
			strategy: "Strategia di rimborso",
			payoffMethod: "Metodo di rimborso",
			avalanche: "Valanga",
			snowball: "Palla di neve",
			avalancheHint: "Paga i minimi, poi l'extra sul TAN più alto.",
			snowballHint: "Paga i minimi, poi l'extra sul saldo più piccolo.",
			extraPayment: "Extra mensile",
			paydownPlan: "Il tuo piano di rimborso",
			debtFreeIn: "Senza debiti in {months} mesi",
			interestPaid: "Interessi totali",
			interestSaved: "Interessi risparmiati vs solo minimi",
			totalPaid: "Totale pagato",
			monthsShort: "{n} mesi",
			interestCost: "Costo degli interessi",
			cheaperBy: "Questo metodo risparmia {amount} in più di interessi",
			fasterBy: "{n} mesi più veloce",
			samePlan: "Con questi numeri i due metodi costano quasi gli stessi interessi.",
			monthlySummary: "Riepilogo mensile",
			enterSpending: "Aggiungi qualche spesa per vedere il grafico.",
			totalIncome: "Entrate totali",
			totalExpenses: "Uscite totali",
			totalSavedInv: "Risparmiato e investito",
			finalBalance: "Saldo finale",
			health: "Salute finanziaria e indici",
			netWorth: "Situazione patrimoniale",
			ratios: "Indici finanziari",
			liquidity: "Indice di liquidità di base",
			savInvRate: "Tasso risparmio-investimento",
			debtToAssets: "Debiti su attivi",
			monthlyDebt: "Indice di debito mensile",
			investedNw: "Attivi investiti / patrimonio",
			solvency: "Indice di solvibilità",
			monthsUnit: "mesi",
			assets: "Attivi",
			liabilities: "Passivi",
			cash: "Contanti",
			bank: "Conti bancari",
			savings: "Risparmi liquidi",
			investments: "Investimenti",
			property: "Immobili",
			other: "Altro",
			netWorthLabel: "Patrimonio netto",
			addDebt: "Aggiungi debito",
			aiTitle: "Consiglio finanziario IA",
			aiCta: "Chiedi un nuovo consiglio",
			aiLoading: "Lettura del budget…",
			askGrok: "Chiedi a Grok",
			yearly: "Riepilogo annuale {year}",
			noYearly: "Nessun dato annuale per il grafico.",
			totalSaved: "Totale risparmiato",
			totalInvested: "Totale investito",
			name: "Nome",
			total: "Totale",
			installments: "Mesi",
			category: "Categoria",
			method: "Metodo",
			save: "Salva",
			cancel: "Annulla",
			delete: "Elimina",
			edit: "Modifica",
			current: "Attuale",
			targetAmount: "Obiettivo",
			loadSample: "Ripristina dati di esempio",
			reset: "Svuota questo profilo",
			leftoverTitle: "Denaro da assegnare",
			leftoverOk: "Ogni euro ha un compito.",
			leftoverPos: "Ancora disponibile da assegnare",
			leftoverNeg: "Le assegnazioni superano le entrate",
			copyMonth: "Copia il reddito del mese precedente",
			pickPeriod: "Scegli mese e anno",
			prevYear: "Anno precedente",
			nextYear: "Anno successivo",
			largeHintSelf: "Pagalo con i tuoi soldi — fondo di emergenza o risparmi — e restituiscitelo a rate, senza interessi.",
			largeCategory: "Categoria di budget",
			largeNamePh: "es. Lavatrice",
			monthsSplit: "In quanti mesi lo spezzi?",
			perMonthPreview: "{amount} viene registrato in quella categoria ogni mese per {n} mesi, poi scompare da solo.",
			largeDone: "Rimborsato. Questa rata è finita.",
			notStarted: "Inizia in un mese successivo",
			badgeRecurring: "Ricorrente",
			badgeInstallment: "Rata",
			badgeDebt: "Prestito",
			monthOf: "Mese {n} di {total}",
			editItem: "Modifica voce",
			editRecurring: "Modifica spesa ricorrente",
			editGoal: "Modifica obiettivo di risparmio",
			alreadySaved: "Già risparmiato",
			recurringAutoHint: "Viene registrata automaticamente nei mesi in cui è dovuta. Metti in pausa se ti serve una sosta.",
			suggestions: "Suggerimenti da voci precedenti",
			appliedAuto: "Registrata questo mese",
			paused: "In pausa",
			skipped: "Saltata questo mese",
			pause: "Pausa",
			resume: "Riprendi",
			extraGoesTo: "L'extra va a",
			fullSchedule: "Piano completo · {n} mesi",
			extras: "Entrate extra",
			extrasLine: "Extra questo mese",
			extrasHint: "I pagamenti Popular Investor di eToro, il cashback Visa e simili restano in questa categoria. Non cambiano le altre percentuali.",
			addInflow: "Aggiungi entrata extra",
			editInflow: "Modifica entrata extra",
			noInflows: "Nessuna entrata extra.",
			inflowRepeat: "Si ripete secondo un calendario",
			frequency: "Ogni quanto",
			freqMonthly: "Mensile",
			freqBimonthly: "Bimestrale (ogni 2 mesi)",
			freqQuarterly: "Trimestrale (ogni 3 mesi)",
			freqSemiannual: "Semestrale (ogni 6 mesi)",
			freqYearly: "Annuale",
			editDebt: "Modifica debito",
			editLarge: "Modifica acquisto importante",
			fundFrom: "Prendi l'importo totale da",
			fundFromNone: "Non prendere da un obiettivo di risparmio",
			fundFromHint: "Il totale esce da quell'obiettivo oggi. Ogni rata mensile lo rimborsa, senza interessi.",
			fundedFrom: "Preso da {name}",
			repayProgress: "{paid} rimborsati su {total}",
			oneTime: "Solo questo mese",
			debtNotRetired: "Con questi pagamenti il debito non si estingue (gli interessi superano il pagamento).",
			aiEmpty: "Tocca il pulsante per un consiglio sui numeri di questo mese.",
			profileDefaultName: "Profilo"
		},
		dash: {
			title: "Home",
			hello: "Il tuo mese in un colpo d'occhio",
			recent: "Attività recente",
			seeAll: "Vedi tutto",
			noTx: "Nessun movimento questo mese.",
			addTx: "Aggiungi movimento",
			snapshot: "Ripartizione"
		},
		tx: {
			title: "Movimenti",
			add: "Aggiungi movimento",
			edit: "Modifica movimento",
			empty: "Nessun movimento corrisponde a questi filtri.",
			income: "Entrata",
			expense: "Uscita",
			saving: "Risparmio",
			investment: "Investimento",
			debt: "Pagamento debito",
			confirmDelete: "Eliminare questo movimento?",
			net: "Flusso netto"
		},
		cal: {
			title: "Calendario",
			income: "Entrate",
			expenses: "Uscite",
			saved: "Risparmiato",
			invested: "Investito",
			net: "Flusso netto",
			emptyDay: "Nessun movimento in questo giorno.",
			prev: "Mese precedente",
			next: "Mese successivo",
			weekdays: "D,L,M,M,G,V,S"
		},
		plan: {
			title: "Pianificazione",
			subtitle: "Acquisti importanti, bollette, investimenti e debiti — piani, non registri duplicati."
		},
		reports: {
			...en.reports,
			title: "Report",
			subtitle: "Totali mensili e annuali, export e backup. I dati restano sul dispositivo se non li esporti.",
			monthly: "Report mensile",
			yearly: "Report annuale",
			exportCsv: "Esporta CSV",
			exportJson: "Esporta backup",
			importJson: "Importa backup",
			print: "Stampa / salva PDF",
			confirmImport: "Importare questo backup e sostituire i dati su questo dispositivo?",
			importOk: "Backup ripristinato.",
			importBad: "Quel file non è un backup valido di Budget Wise.",
			topTx: "Movimenti più grandi",
			byMethod: "Per metodo di pagamento",
			byCategory: "Per categoria"
		},
		settings: {
			title: "Impostazioni",
			subtitle: "Prima di tutto locale. Nessun account.",
			theme: "Tema",
			dark: "Scuro",
			light: "Chiaro",
			privacy: "I tuoi numeri restano su questo dispositivo. Fai un backup quando vuoi una copia.",
			rename: "Rinomina profilo"
		},
		setup: {
			title: "Benvenuto in Budget Wise",
			subtitle: "Inizia con un esempio, carica un foglio o parti da zero.",
			sample: "Usa il budget di esempio",
			sampleHint: "Vedi reddito, spesa e bollette — puoi sostituirlo quando vuoi.",
			empty: "Parti da zero",
			emptyHint: "Profilo vuoto con i metodi di pagamento. Inserisci tu ogni importo.",
			upload: "Carica Excel o CSV",
			uploadHint: "Fogli mensili con Needs / Investing / Wants. Prima viene salvato un backup.",
			skip: "Continua con l'esempio"
		},
		import: {
			excel: "Importa foglio di calcolo",
			excelHint: "Excel (.xlsx) o CSV. Un backup viene scaricato prima, così puoi annullare.",
			working: "Lettura del foglio…",
			ok: "Importati {months} mesi ({first} – {last}). Backup salvato.",
			bad: "Impossibile leggere il foglio. Usa un budget mensile con reddito e colonne Needs / Investing / Wants.",
			restore: "Annulla ultima importazione",
			restoreOk: "Dati precedenti ripristinati."
		}
	},
	fr: {
		...en,
		tagline: "Voyez où va chaque euro",
		byline: "Par AlejandroGarciaO",
		nav: {
			dashboard: "Accueil",
			budget: "Budget",
			transactions: "Mouvements",
			calendar: "Calendrier",
			planning: "Plan",
			reports: "Rapports",
			settings: "Réglages",
			calculator: "Calculatrice",
			more: "Plus"
		},
		common: {
			save: "Enregistrer",
			cancel: "Annuler",
			delete: "Supprimer",
			edit: "Modifier",
			add: "Ajouter",
			close: "Fermer",
			confirm: "Confirmer",
			name: "Nom",
			amount: "Montant",
			date: "Date",
			notes: "Notes",
			category: "Catégorie",
			method: "Moyen de paiement",
			type: "Type",
			search: "Rechercher",
			filter: "Filtrer",
			all: "Tous",
			empty: "Rien ici pour le moment."
		},
		calc: {
			...en.calc,
			modeSave: "Combien puis-je accumuler ?",
			modeTime: "Combien de temps pour atteindre l'objectif ?",
			modePmt: "Combien dois-je verser chaque période ?",
			modeRate: "Quel rendement me faut-il ?",
			goal: "Objectif",
			principal: "Solde de départ",
			pmt: "Versement périodique",
			freq: "Fréquence",
			timing: "Moment du versement",
			timingBegin: "Début de chaque période",
			timingEnd: "Fin de chaque période",
			rate: "Taux annuel",
			duration: "Durée",
			years: "ans",
			months: "mois",
			calculate: "Calculer",
			youCanSave: "Solde final projeté",
			savingLine: "{pmt} {freq} pendant {duration}",
			needRate: "Il vous faut un rendement annuel de",
			toReach: "pour atteindre votre objectif de {goal}",
			needSave: "Vous devez verser",
			eachPeriod: "chaque période pour atteindre {goal} en {duration}",
			itWillTake: "Il faudra",
			toReachGoal: "pour atteindre votre objectif de {goal}",
			year: "an",
			yearsWord: "ans",
			month: "mois",
			monthsWord: "mois",
			and: "et",
			alreadyThere: "Le solde de départ couvre déjà l'objectif.",
			unreachable: "Avec ces chiffres, l'objectif n'est pas atteignable. Augmentez le versement, la durée ou le taux.",
			initial: "Solde de départ",
			periodic: "Versements périodiques",
			interest: "Croissance de l'investissement",
			tableYear: "Année",
			tablePeriodic: "Versements de l'année",
			tableTotalDep: "Versements totaux",
			tableInterest: "Croissance totale",
			tableBalance: "Solde final",
			share: "Partager le résultat",
			freqWeekly: "Hebdomadaire (52/an)",
			freqBiweekly: "Toutes les 2 semaines (26/an)",
			freqMonthly: "Mensuel (12/an)",
			freqQuarterly: "Trimestriel (4/an)",
			freqAnnually: "Annuel (1/an)",
			freqShortWeekly: "Hebdo",
			freqShortBiweekly: "Bimensuel",
			freqShortMonthly: "Mensuel",
			freqShortQuarterly: "Trimestriel",
			freqShortAnnually: "Annuel"
		},
		budget: {
			...en.budget,
			settings: "Réglages",
			budgetProfile: "Profil de budget",
			main: "Principal",
			addProfile: "Ajouter un profil",
			removeProfile: "Supprimer le profil",
			month: "Mois",
			currency: "Devise",
			language: "Langue",
			advanced: "Vue avancée",
			paymentMethods: "Moyens de paiement",
			addPayment: "Ajouter un moyen de paiement",
			incomeTitle: "Revenu net mensuel de {month}",
			incomeExprHint: "Tapez 4000+2000 puis Entrée ou touchez ailleurs pour additionner. Vous pouvez enchaîner plusieurs valeurs.",
			amountExprHint: "Tapez 45+30 pour additionner les achats sur cette ligne au lieu d'en créer une nouvelle.",
			largePurchases: "Gros achats",
			noLarge: "Aucun gros achat pour le moment.",
			addLarge: "Ajouter un gros achat",
			recurring: "Dépenses récurrentes",
			noRecurring: "Aucune dépense récurrente.",
			addRecurring: "Ajouter une dépense récurrente",
			logPaid: "Enregistrer ce mois",
			logged: "Enregistré",
			essential: "Dépenses essentielles",
			essentialHint: "Dépenses de vie : loyer, courses, factures.",
			investing: "Croissance à long terme (investissement)",
			investingHint: "L'argent qui construit le patrimoine : actions, ETF, retraite.",
			flexible: "Dépenses flexibles et plaisir",
			flexibleHint: "Dépenses non essentielles qui améliorent le quotidien.",
			debtAlloc: "Remboursement de dettes",
			target: "Objectif",
			actual: "Réel",
			remaining: "Restant",
			items: "Lignes",
			adjustment: "Ajustement du budget",
			noItems: "Aucune ligne pour le moment.",
			addItem: "Ajouter une ligne",
			invCalc: "Calculateur de croissance",
			initialInv: "Investissement initial",
			monthlyContrib: "Versement mensuel",
			annualRate: "Taux annuel (%)",
			invPeriod: "Durée d'investissement (années)",
			invEmpty: "Saisissez les détails pour voir la projection.",
			openFullCalc: "Ouvrir le calculateur complet",
			goals: "Objectifs d'épargne",
			totalMonthly: "Versement mensuel total",
			thisMonth: "Versement de ce mois",
			addGoal: "Ajouter un objectif",
			emergency: "Fonds d'urgence",
			amount: "Montant…",
			debt: "Plan de désendettement",
			debtHint: "Achats avec intérêts — prêts et cartes. Le minimum mensuel s'inscrit dans la catégorie de budget que vous choisissez.",
			debtCategoryHint: "Choisissez où le minimum apparaît dans le budget du mois. Les paiements extra avalanche ou boule de neige restent dans le plan dettes.",
			debtMinPreview: "{amount} est inscrit dans {category} chaque mois jusqu'à épuisement du solde.",
			yourDebts: "Vos dettes",
			debtName: "Nom",
			debtBalance: "Solde",
			debtRate: "Taux (%)",
			debtMin: "Mensualité min.",
			noDebts: "Aucune dette avec un solde dans la santé financière.",
			strategy: "Stratégie de remboursement",
			payoffMethod: "Méthode de remboursement",
			avalanche: "Avalanche",
			snowball: "Boule de neige",
			avalancheHint: "Payez les minimums, puis l'extra sur le taux le plus élevé.",
			snowballHint: "Payez les minimums, puis l'extra sur le plus petit solde.",
			extraPayment: "Extra mensuel",
			paydownPlan: "Votre plan de remboursement",
			debtFreeIn: "Sans dettes en {months} mois",
			interestPaid: "Intérêts totaux",
			interestSaved: "Intérêts économisés vs minimums seuls",
			totalPaid: "Total payé",
			monthsShort: "{n} mois",
			interestCost: "Coût des intérêts",
			cheaperBy: "Cette méthode économise {amount} d'intérêts en plus",
			fasterBy: "{n} mois plus rapide",
			samePlan: "Avec ces chiffres, les deux méthodes coûtent à peu près les mêmes intérêts.",
			monthlySummary: "Résumé mensuel",
			enterSpending: "Ajoutez des dépenses pour voir le graphique.",
			totalIncome: "Revenus totaux",
			totalExpenses: "Dépenses totales",
			totalSavedInv: "Épargné et investi",
			finalBalance: "Solde final",
			health: "Santé financière et ratios",
			netWorth: "État du patrimoine",
			ratios: "Ratios financiers",
			liquidity: "Ratio de liquidité de base",
			savInvRate: "Taux d'épargne-investissement",
			debtToAssets: "Dettes sur actifs",
			monthlyDebt: "Ratio d'endettement mensuel",
			investedNw: "Actifs investis / patrimoine",
			solvency: "Ratio de solvabilité",
			monthsUnit: "mois",
			assets: "Actifs",
			liabilities: "Passifs",
			cash: "Espèces",
			bank: "Comptes bancaires",
			savings: "Épargne liquide",
			investments: "Investissements",
			property: "Immobilier",
			other: "Autre",
			netWorthLabel: "Patrimoine net",
			addDebt: "Ajouter une dette",
			aiTitle: "Conseil financier IA",
			aiCta: "Obtenir un nouveau conseil",
			aiLoading: "Lecture du budget…",
			askGrok: "Demander à Grok",
			yearly: "Résumé annuel {year}",
			noYearly: "Pas de données annuelles pour un graphique.",
			totalSaved: "Total épargné",
			totalInvested: "Total investi",
			name: "Nom",
			total: "Total",
			installments: "Mois",
			category: "Catégorie",
			method: "Moyen",
			save: "Enregistrer",
			cancel: "Annuler",
			delete: "Supprimer",
			edit: "Modifier",
			current: "Actuel",
			targetAmount: "Objectif",
			loadSample: "Restaurer les données d'exemple",
			reset: "Vider ce profil",
			leftoverTitle: "Argent à budgéter",
			leftoverOk: "Chaque euro a un rôle.",
			leftoverPos: "Encore disponible à allouer",
			leftoverNeg: "Les allocations dépassent les revenus",
			copyMonth: "Copier le revenu du mois précédent",
			pickPeriod: "Choisir le mois et l'année",
			prevYear: "Année précédente",
			nextYear: "Année suivante",
			largeHintSelf: "Payez avec votre argent — fonds d'urgence ou épargne — et remboursez-vous en mensualités, sans intérêts.",
			largeCategory: "Catégorie du budget",
			largeNamePh: "ex. Machine à laver",
			monthsSplit: "Sur combien de mois le répartir ?",
			perMonthPreview: "{amount} est inscrit dans cette catégorie chaque mois pendant {n} mois, puis disparaît tout seul.",
			largeDone: "Remboursé. Cette mensualité est terminée.",
			notStarted: "Commence un mois plus tard",
			badgeRecurring: "Récurrent",
			badgeInstallment: "Mensualité",
			badgeDebt: "Crédit",
			monthOf: "Mois {n} sur {total}",
			editItem: "Modifier la ligne",
			editRecurring: "Modifier la dépense récurrente",
			editGoal: "Modifier l'objectif d'épargne",
			alreadySaved: "Déjà épargné",
			recurringAutoHint: "Inscrit automatiquement les mois où c'est dû. Mettez en pause si vous avez besoin d'une pause.",
			suggestions: "Suggestions d'entrées précédentes",
			appliedAuto: "Inscrit ce mois-ci",
			paused: "En pause",
			skipped: "Ignoré ce mois-ci",
			pause: "Pause",
			resume: "Reprendre",
			extraGoesTo: "L'extra va à",
			fullSchedule: "Plan complet · {n} mois",
			extras: "Entrées extra",
			extrasLine: "Extra ce mois-ci",
			extrasHint: "Les versements Popular Investor eToro, le cashback Visa et similaires restent dans cette catégorie. Ils ne changent pas les autres pourcentages.",
			addInflow: "Ajouter un revenu extra",
			editInflow: "Modifier le revenu extra",
			noInflows: "Aucune entrée extra.",
			inflowRepeat: "Se répète selon un calendrier",
			frequency: "Fréquence",
			freqMonthly: "Mensuel",
			freqBimonthly: "Bimestriel (tous les 2 mois)",
			freqQuarterly: "Trimestriel (tous les 3 mois)",
			freqSemiannual: "Semestriel (tous les 6 mois)",
			freqYearly: "Annuel",
			editDebt: "Modifier la dette",
			editLarge: "Modifier le gros achat",
			fundFrom: "Prendre le montant total sur",
			fundFromNone: "Ne pas prendre sur un objectif d'épargne",
			fundFromHint: "Le total quitte cet objectif aujourd'hui. Chaque mensualité le rembourse, sans intérêts.",
			fundedFrom: "Pris sur {name}",
			repayProgress: "{paid} remboursés sur {total}",
			oneTime: "Ce mois seulement",
			debtNotRetired: "Avec ces paiements, la dette ne sera pas soldée (les intérêts dépassent le paiement).",
			aiEmpty: "Appuyez sur le bouton pour un conseil basé sur les chiffres de ce mois.",
			profileDefaultName: "Profil"
		},
		dash: {
			title: "Accueil",
			hello: "Votre mois en un coup d'œil",
			recent: "Activité récente",
			seeAll: "Tout voir",
			noTx: "Aucun mouvement ce mois-ci.",
			addTx: "Ajouter un mouvement",
			snapshot: "Répartition"
		},
		tx: {
			title: "Mouvements",
			add: "Ajouter un mouvement",
			edit: "Modifier le mouvement",
			empty: "Aucun mouvement ne correspond à ces filtres.",
			income: "Revenu",
			expense: "Dépense",
			saving: "Épargne",
			investment: "Investissement",
			debt: "Paiement de dette",
			confirmDelete: "Supprimer ce mouvement ?",
			net: "Flux net"
		},
		cal: {
			title: "Calendrier",
			income: "Revenus",
			expenses: "Dépenses",
			saved: "Épargné",
			invested: "Investi",
			net: "Flux net",
			emptyDay: "Aucun mouvement ce jour-là.",
			prev: "Mois précédent",
			next: "Mois suivant",
			weekdays: "D,L,M,M,J,V,S"
		},
		plan: {
			title: "Planification",
			subtitle: "Gros achats, factures, investissement et dettes — des plans, pas des livres en double."
		},
		reports: {
			...en.reports,
			title: "Rapports",
			subtitle: "Totaux, export et sauvegarde. Vos données ne quittent l'appareil que si vous les exportez.",
			monthly: "Rapport mensuel",
			yearly: "Rapport annuel",
			exportCsv: "Exporter CSV",
			exportJson: "Exporter la sauvegarde",
			importJson: "Importer une sauvegarde",
			print: "Imprimer / enregistrer PDF",
			confirmImport: "Importer cette sauvegarde et remplacer les données de cet appareil ?",
			importOk: "Sauvegarde restaurée.",
			importBad: "Ce fichier n'est pas une sauvegarde Budget Wise valide.",
			topTx: "Plus gros mouvements",
			byMethod: "Par moyen de paiement",
			byCategory: "Par catégorie"
		},
		settings: {
			title: "Réglages",
			subtitle: "D'abord local. Pas de compte.",
			theme: "Thème",
			dark: "Sombre",
			light: "Clair",
			privacy: "Vos chiffres restent sur cet appareil. Faites une sauvegarde quand vous voulez une copie.",
			rename: "Renommer le profil"
		},
		setup: {
			title: "Bienvenue sur Budget Wise",
			subtitle: "Commencez avec un exemple, importez un tableur, ou partez de zéro.",
			sample: "Utiliser le budget d'exemple",
			sampleHint: "Voyez revenus, courses et factures — remplaçable à tout moment.",
			empty: "Partir de zéro",
			emptyHint: "Profil vide avec les moyens de paiement. Vous saisissez chaque montant.",
			upload: "Importer Excel ou CSV",
			uploadHint: "Feuilles mensuelles Needs / Investing / Wants. Une sauvegarde est créée d'abord.",
			skip: "Continuer avec l'exemple"
		},
		import: {
			excel: "Importer un tableur",
			excelHint: "Excel (.xlsx) ou CSV. Une sauvegarde est téléchargée d'abord.",
			working: "Lecture du tableur…",
			ok: "{months} mois importés ({first} – {last}). Sauvegarde enregistrée.",
			bad: "Impossible de lire ce fichier. Utilisez un budget mensuel avec le revenu et Needs / Investing / Wants.",
			restore: "Annuler le dernier import",
			restoreOk: "Données précédentes restaurées."
		}
	},
	pt: {
		...en,
		tagline: "Veja para onde vai cada euro",
		byline: "Por AlejandroGarciaO",
		nav: {
			dashboard: "Início",
			budget: "Orçamento",
			transactions: "Movimentos",
			calendar: "Calendário",
			planning: "Plano",
			reports: "Relatórios",
			settings: "Definições",
			calculator: "Calculadora",
			more: "Mais"
		},
		common: {
			save: "Guardar",
			cancel: "Cancelar",
			delete: "Eliminar",
			edit: "Editar",
			add: "Adicionar",
			close: "Fechar",
			confirm: "Confirmar",
			name: "Nome",
			amount: "Montante",
			date: "Data",
			notes: "Notas",
			category: "Categoria",
			method: "Método de pagamento",
			type: "Tipo",
			search: "Pesquisar",
			filter: "Filtro",
			all: "Todos",
			empty: "Ainda não há nada aqui."
		},
		calc: {
			...en.calc,
			modeSave: "Quanto posso acumular?",
			modeTime: "Quanto tempo até ao objetivo?",
			modePmt: "Quanto preciso de contribuir em cada período?",
			modeRate: "Que rendimento preciso?",
			goal: "Objetivo",
			principal: "Saldo inicial",
			pmt: "Contribuição periódica",
			freq: "Frequência",
			timing: "Momento do depósito",
			timingBegin: "No início de cada período",
			timingEnd: "No fim de cada período",
			rate: "Taxa anual",
			duration: "Duração",
			years: "anos",
			months: "meses",
			calculate: "Calcular",
			youCanSave: "Saldo final projetado",
			savingLine: "{pmt} {freq} durante {duration}",
			needRate: "Precisa de um rendimento anual de",
			toReach: "para alcançar o objetivo de {goal}",
			needSave: "Precisa de contribuir",
			eachPeriod: "em cada período para alcançar {goal} em {duration}",
			itWillTake: "Vai demorar",
			toReachGoal: "para alcançar o objetivo de {goal}",
			year: "ano",
			yearsWord: "anos",
			month: "mês",
			monthsWord: "meses",
			and: "e",
			alreadyThere: "O saldo inicial já cobre o objetivo.",
			unreachable: "Com estes números não chega ao objetivo. Tente uma contribuição maior, mais tempo ou uma taxa mais alta.",
			initial: "Saldo inicial",
			periodic: "Contribuições periódicas",
			interest: "Crescimento do investimento",
			tableYear: "Ano",
			tablePeriodic: "Contribuições deste ano",
			tableTotalDep: "Contribuições totais",
			tableInterest: "Crescimento total",
			tableBalance: "Saldo final",
			share: "Partilhar resultado",
			freqWeekly: "Semanal (52/ano)",
			freqBiweekly: "Quinzenal (26/ano)",
			freqMonthly: "Mensal (12/ano)",
			freqQuarterly: "Trimestral (4/ano)",
			freqAnnually: "Anual (1/ano)",
			freqShortWeekly: "Semanal",
			freqShortBiweekly: "Quinzenal",
			freqShortMonthly: "Mensal",
			freqShortQuarterly: "Trimestral",
			freqShortAnnually: "Anual"
		},
		budget: {
			...en.budget,
			settings: "Definições",
			budgetProfile: "Perfil de orçamento",
			main: "Principal",
			addProfile: "Adicionar perfil",
			removeProfile: "Remover perfil",
			month: "Mês",
			currency: "Moeda",
			language: "Idioma",
			advanced: "Vista avançada",
			paymentMethods: "Métodos de pagamento",
			addPayment: "Adicionar método de pagamento",
			incomeTitle: "Rendimento líquido mensal de {month}",
			incomeExprHint: "Escreva 4000+2000 e prima Enter ou toque fora para somar. Pode encadear vários valores.",
			amountExprHint: "Escreva 45+30 para somar compras nesta linha em vez de criar outra.",
			largePurchases: "Compras grandes",
			noLarge: "Ainda não há compras grandes.",
			addLarge: "Adicionar compra grande",
			recurring: "Despesas recorrentes",
			noRecurring: "Ainda não há despesas recorrentes.",
			addRecurring: "Adicionar despesa recorrente",
			logPaid: "Registar este mês",
			logged: "Registado",
			essential: "Despesas essenciais",
			essentialHint: "Despesas para viver: renda, alimentação e serviços.",
			investing: "Crescimento a longo prazo (investimento)",
			investingHint: "Dinheiro a trabalhar para o património: ações, ETF, reforma.",
			flexible: "Gastos flexíveis e lazer",
			flexibleHint: "Gastos não essenciais que melhoram o estilo de vida.",
			debtAlloc: "Pagamento de dívidas",
			target: "Objetivo",
			actual: "Real",
			remaining: "Restante",
			items: "Itens",
			adjustment: "Ajuste do orçamento",
			noItems: "Ainda não há itens.",
			addItem: "Adicionar item",
			invCalc: "Calculadora de crescimento",
			initialInv: "Investimento inicial",
			monthlyContrib: "Contribuição mensal",
			annualRate: "Taxa anual (%)",
			invPeriod: "Período de investimento (anos)",
			invEmpty: "Introduza os detalhes para ver a projeção.",
			openFullCalc: "Abrir calculadora completa",
			goals: "Metas de poupança",
			totalMonthly: "Contribuição mensal total",
			thisMonth: "Contribuição deste mês",
			addGoal: "Adicionar nova meta",
			emergency: "Fundo de emergência",
			amount: "Montante…",
			debt: "Plano de saída de dívidas",
			debtHint: "Compras com juros — empréstimos e cartões. O mínimo mensal é lançado na categoria de orçamento que escolher.",
			debtCategoryHint: "Escolha onde o mínimo aparece no orçamento do mês. Pagamentos extra avalanche ou bola de neve ficam no plano de dívidas.",
			debtMinPreview: "{amount} é lançado em {category} todos os meses até o saldo acabar.",
			yourDebts: "As suas dívidas",
			debtName: "Nome",
			debtBalance: "Saldo",
			debtRate: "Taxa (%)",
			debtMin: "Pag. mín.",
			noDebts: "Não tem dívidas com saldo na saúde financeira.",
			strategy: "Estratégia de pagamento",
			payoffMethod: "Método de liquidação",
			avalanche: "Avalanche",
			snowball: "Bola de neve",
			avalancheHint: "Pague os mínimos e o extra na taxa mais alta.",
			snowballHint: "Pague os mínimos e o extra no saldo mais pequeno.",
			extraPayment: "Extra mensal",
			paydownPlan: "O seu plano de pagamento",
			debtFreeIn: "Sem dívidas em {months} meses",
			interestPaid: "Juros totais",
			interestSaved: "Juros poupados vs só mínimos",
			totalPaid: "Total pago",
			monthsShort: "{n} meses",
			interestCost: "Custo dos juros",
			cheaperBy: "Este método poupa mais {amount} em juros",
			fasterBy: "{n} meses mais rápido",
			samePlan: "Com estes números ambos os métodos custam quase os mesmos juros.",
			monthlySummary: "Resumo mensal",
			enterSpending: "Adicione algum gasto para ver o gráfico.",
			totalIncome: "Rendimentos totais",
			totalExpenses: "Despesas totais",
			totalSavedInv: "Poupado e investido",
			finalBalance: "Saldo final",
			health: "Saúde financeira e rácios",
			netWorth: "Estado do património",
			ratios: "Rácios financeiros",
			liquidity: "Rácio de liquidez básica",
			savInvRate: "Taxa de poupança-investimento",
			debtToAssets: "Dívida sobre ativos",
			monthlyDebt: "Rácio de dívida mensal",
			investedNw: "Ativos investidos / património",
			solvency: "Rácio de solvência",
			monthsUnit: "meses",
			assets: "Ativos",
			liabilities: "Passivos",
			cash: "Numerário",
			bank: "Contas bancárias",
			savings: "Poupanças líquidas",
			investments: "Investimentos",
			property: "Imóveis",
			other: "Outros",
			netWorthLabel: "Património líquido",
			addDebt: "Adicionar dívida",
			aiTitle: "Conselho financeiro com IA",
			aiCta: "Pedir um conselho novo",
			aiLoading: "A ler o orçamento…",
			askGrok: "Perguntar ao Grok",
			yearly: "Resumo anual de {year}",
			noYearly: "Sem dados anuais para um gráfico.",
			totalSaved: "Total poupado",
			totalInvested: "Total investido",
			name: "Nome",
			total: "Total",
			installments: "Meses",
			category: "Categoria",
			method: "Método",
			save: "Guardar",
			cancel: "Cancelar",
			delete: "Eliminar",
			edit: "Editar",
			current: "Atual",
			targetAmount: "Objetivo",
			loadSample: "Restaurar dados de exemplo",
			reset: "Limpar este perfil",
			leftoverTitle: "Dinheiro por orçamentar",
			leftoverOk: "Cada euro tem uma função.",
			leftoverPos: "Ainda disponível para atribuir",
			leftoverNeg: "As alocações superam os rendimentos",
			copyMonth: "Copiar o rendimento do mês anterior",
			pickPeriod: "Escolher mês e ano",
			prevYear: "Ano anterior",
			nextYear: "Ano seguinte",
			largeHintSelf: "Pague com o seu dinheiro — fundo de emergência ou poupanças — e devolva a si próprio em prestações, sem juros.",
			largeCategory: "Categoria do orçamento",
			largeNamePh: "ex. Máquina de lavar",
			monthsSplit: "Em quantos meses divide?",
			perMonthPreview: "{amount} é lançado nessa categoria todos os meses durante {n} meses e depois desaparece sozinho.",
			largeDone: "Devolvido. Esta prestação já terminou.",
			notStarted: "Começa num mês posterior",
			badgeRecurring: "Recorrente",
			badgeInstallment: "Prestação",
			badgeDebt: "Empréstimo",
			monthOf: "Mês {n} de {total}",
			editItem: "Editar item",
			editRecurring: "Editar despesa recorrente",
			editGoal: "Editar meta de poupança",
			alreadySaved: "Já poupado",
			recurringAutoHint: "É lançada automaticamente nos meses em que é devida. Pause se precisar de uma pausa.",
			suggestions: "Sugestões de lançamentos anteriores",
			appliedAuto: "Lançada este mês",
			paused: "Em pausa",
			skipped: "Omitida este mês",
			pause: "Pausar",
			resume: "Retomar",
			extraGoesTo: "O extra vai para",
			fullSchedule: "Plano completo · {n} meses",
			extras: "Entradas extra",
			extrasLine: "Extra este mês",
			extrasHint: "Os pagamentos Popular Investor da eToro, o cashback Visa e semelhantes ficam nesta categoria. Não alteram as outras percentagens.",
			addInflow: "Adicionar rendimento extra",
			editInflow: "Editar rendimento extra",
			noInflows: "Ainda não há entradas extra.",
			inflowRepeat: "Repete-se num calendário",
			frequency: "Com que frequência",
			freqMonthly: "Mensal",
			freqBimonthly: "Bimestral (a cada 2 meses)",
			freqQuarterly: "Trimestral (a cada 3 meses)",
			freqSemiannual: "Semestral (a cada 6 meses)",
			freqYearly: "Anual",
			editDebt: "Editar dívida",
			editLarge: "Editar compra grande",
			fundFrom: "Tirar o valor total de",
			fundFromNone: "Não tirar de uma meta de poupança",
			fundFromHint: "O total sai dessa meta hoje. Cada prestação mensal devolve-o, sem juros.",
			fundedFrom: "Retirado de {name}",
			repayProgress: "{paid} devolvidos de {total}",
			oneTime: "Só este mês",
			debtNotRetired: "Com estes pagamentos a dívida não se extingue (os juros superam o pagamento).",
			aiEmpty: "Toque no botão para um conselho com base nos números deste mês.",
			profileDefaultName: "Perfil"
		},
		dash: {
			title: "Início",
			hello: "O seu mês de relance",
			recent: "Atividade recente",
			seeAll: "Ver tudo",
			noTx: "Ainda não há movimentos este mês.",
			addTx: "Adicionar movimento",
			snapshot: "Repartição"
		},
		tx: {
			title: "Movimentos",
			add: "Adicionar movimento",
			edit: "Editar movimento",
			empty: "Nenhum movimento corresponde a estes filtros.",
			income: "Rendimento",
			expense: "Despesa",
			saving: "Poupança",
			investment: "Investimento",
			debt: "Pagamento de dívida",
			confirmDelete: "Eliminar este movimento?",
			net: "Fluxo líquido"
		},
		cal: {
			title: "Calendário",
			income: "Rendimentos",
			expenses: "Despesas",
			saved: "Poupado",
			invested: "Investido",
			net: "Fluxo líquido",
			emptyDay: "Não há movimentos neste dia.",
			prev: "Mês anterior",
			next: "Mês seguinte",
			weekdays: "D,S,T,Q,Q,S,S"
		},
		plan: {
			title: "Planeamento",
			subtitle: "Compras grandes, contas, investimento e dívidas — planos, não livros duplicados."
		},
		reports: {
			...en.reports,
			title: "Relatórios",
			subtitle: "Totais, exportação e cópia de segurança. Os dados não saem do dispositivo a não ser que os exporte.",
			monthly: "Relatório mensal",
			yearly: "Relatório anual",
			exportCsv: "Exportar CSV",
			exportJson: "Exportar cópia",
			importJson: "Importar cópia",
			print: "Imprimir / guardar PDF",
			confirmImport: "Importar esta cópia e substituir os dados neste dispositivo?",
			importOk: "Cópia restaurada.",
			importBad: "Esse ficheiro não é uma cópia válida do Budget Wise.",
			topTx: "Maiores movimentos",
			byMethod: "Por método de pagamento",
			byCategory: "Por categoria"
		},
		settings: {
			title: "Definições",
			subtitle: "Primeiro local. Sem conta.",
			theme: "Tema",
			dark: "Escuro",
			light: "Claro",
			privacy: "Os seus números ficam neste dispositivo. Faça uma cópia quando quiser.",
			rename: "Mudar o nome do perfil"
		},
		setup: {
			title: "Bem-vindo ao Budget Wise",
			subtitle: "Comece com um exemplo, envie uma planilha ou comece vazio.",
			sample: "Usar o orçamento de exemplo",
			sampleHint: "Veja rendimento, mercado e contas — pode substituir quando quiser.",
			empty: "Começar do zero",
			emptyHint: "Perfil vazio só com métodos de pagamento. Você escreve cada valor.",
			upload: "Enviar Excel ou CSV",
			uploadHint: "Folhas mensais com Needs / Investing / Wants. Um backup é guardado primeiro.",
			skip: "Continuar com o exemplo"
		},
		import: {
			excel: "Importar planilha",
			excelHint: "Excel (.xlsx) ou CSV. Um backup é descarregado primeiro para poder desfazer.",
			working: "A ler a planilha…",
			ok: "Importados {months} meses ({first} – {last}). Backup guardado.",
			bad: "Não foi possível ler essa planilha. Use um orçamento mensal com rendimento e colunas Needs / Investing / Wants.",
			restore: "Desfazer última importação",
			restoreOk: "Dados anteriores restaurados."
		}
	}
};
function getPath(obj, path) {
	return path.split(".").reduce((acc, key) => {
		if (acc && typeof acc === "object" && key in acc) return acc[key];
	}, obj);
}
function t(lang, path, vars) {
	const raw = getPath(messages[lang] ?? messages.en, path) ?? getPath(messages.en, path);
	let str = typeof raw === "string" ? raw : path;
	if (vars) for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, String(v));
	return str;
}
var CURRENCIES = [
	{
		code: "EUR",
		label: "EUR (€)",
		symbol: "€"
	},
	{
		code: "USD",
		label: "USD ($)",
		symbol: "$"
	},
	{
		code: "GBP",
		label: "GBP (£)",
		symbol: "£"
	},
	{
		code: "MXN",
		label: "MXN ($)",
		symbol: "$"
	},
	{
		code: "COP",
		label: "COP ($)",
		symbol: "$"
	},
	{
		code: "ARS",
		label: "ARS ($)",
		symbol: "$"
	},
	{
		code: "BRL",
		label: "BRL (R$)",
		symbol: "R$"
	},
	{
		code: "CHF",
		label: "CHF (Fr)",
		symbol: "Fr"
	}
];
function currencySymbol(code) {
	return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}
function roundMoney(n) {
	if (!Number.isFinite(n)) return 0;
	return Math.round((n + Number.EPSILON) * 100) / 100;
}
function localeOf(lang) {
	return INTL_LOCALE[lang] ?? "en-US";
}
function formatMoney(amount, currency, lang, opts) {
	const n = roundMoney(amount);
	try {
		return new Intl.NumberFormat(localeOf(lang), {
			style: "currency",
			currency,
			minimumFractionDigits: opts?.compact ? 0 : 2,
			maximumFractionDigits: 2
		}).format(n);
	} catch {
		return `${n.toFixed(2)} ${currency}`;
	}
}
function formatPct(value, lang, digits = 2) {
	return `${new Intl.NumberFormat(localeOf(lang), {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(value)}%`;
}
var ALLOC_KEYS = [
	"essential",
	"flexible",
	"investing",
	"savings",
	"debt"
];
var RECURRING_FREQS = [
	"monthly",
	"bimonthly",
	"quarterly",
	"semiannual",
	"yearly"
];
var FREQ_LABEL = {
	monthly: "budget.freqMonthly",
	bimonthly: "budget.freqBimonthly",
	quarterly: "budget.freqQuarterly",
	semiannual: "budget.freqSemiannual",
	yearly: "budget.freqYearly"
};
var FREQ_STEPS = {
	monthly: 1,
	bimonthly: 2,
	quarterly: 3,
	semiannual: 6,
	yearly: 12
};
function emptyMonth() {
	return {
		income: 0,
		items: [],
		goalContributions: {}
	};
}
function monthOf(profile, monthKey) {
	return profile.months[monthKey] ?? emptyMonth();
}
function txsInMonth(profile, monthKey) {
	return (profile.transactions ?? []).filter((t) => t.date.startsWith(monthKey));
}
function installmentOf(lp) {
	return lp.months > 0 ? lp.total / lp.months : 0;
}
function largeMonthIndex(lp, monthKey) {
	return monthsBetween(lp.startMonth, monthKey);
}
function isLargeActive(lp, monthKey) {
	const idx = largeMonthIndex(lp, monthKey);
	if (idx < 0 || idx >= lp.months) return false;
	if (lp.skippedMonths?.includes(monthKey)) return false;
	return true;
}
function isLargeCompleted(lp, monthKey) {
	return largeMonthIndex(lp, monthKey) >= lp.months;
}
function largeProgress(lp, monthKey) {
	const idx = largeMonthIndex(lp, monthKey);
	const dueCount = idx < 0 ? 0 : Math.min(lp.months, idx + 1);
	const installment = installmentOf(lp);
	return {
		index: idx,
		dueCount,
		installment,
		remaining: Math.max(0, lp.total - installment * dueCount),
		active: isLargeActive(lp, monthKey),
		completed: isLargeCompleted(lp, monthKey)
	};
}
function isScheduleDue(startMonth, frequency, monthKey, skipped, active) {
	if (active === false) return false;
	if (skipped?.includes(monthKey)) return false;
	const delta = monthsBetween(startMonth || monthKey, monthKey);
	if (delta < 0) return false;
	return delta % (FREQ_STEPS[frequency ?? "monthly"] ?? 1) === 0;
}
function isRecurringDue(r, monthKey) {
	return isScheduleDue(r.startMonth, r.frequency ?? "monthly", monthKey, r.skippedMonths, r.active);
}
function isDebtActive(d, monthKey) {
	if (d.balance <= .005) return false;
	if (d.skippedMonths?.includes(monthKey)) return false;
	return true;
}
function isSpendCat(cat) {
	return cat === "essential" || cat === "flexible" || cat === "investing";
}
function allocI18nKey(cat) {
	if (cat === "savings") return "budget.goals";
	if (cat === "debt") return "budget.debtAlloc";
	return `budget.${cat ?? "essential"}`;
}
function isInflowDue(inf, monthKey) {
	if (inf.active === false) return false;
	if (inf.skippedMonths?.includes(monthKey)) return false;
	if (!inf.recurring) return inf.startMonth === monthKey;
	return isScheduleDue(inf.startMonth, inf.frequency ?? "monthly", monthKey, inf.skippedMonths, inf.active);
}
function targetOf(profile, income, key) {
	const pct = profile.percents[key] ?? 0;
	const adj = profile.adjustments[key] ?? 0;
	return roundMoney(income * (pct / 100) + adj);
}
function findMergeableItem(items, next) {
	if (next.source && next.source !== "manual") return void 0;
	const key = next.name.trim().toLowerCase();
	if (!key) return void 0;
	return items.find((it) => (it.source ?? "manual") === "manual" && it.category === next.category && it.name.trim().toLowerCase() === key);
}
function findMergeableTx(txs, next) {
	if (next.recurringExpenseId || next.debtId || next.largePurchaseId || next.inflowId) return void 0;
	const month = next.date.slice(0, 7);
	const key = next.name.trim().toLowerCase();
	if (!key) return void 0;
	return txs.find((t) => t.date.slice(0, 7) === month && t.name.trim().toLowerCase() === key && t.category === next.category && t.type === next.type && !t.recurringExpenseId && !t.debtId && !t.largePurchaseId && !t.inflowId);
}
function displayItemsFor(profile, monthKey, cat) {
	const data = monthOf(profile, monthKey);
	const out = [];
	const seenRec = /* @__PURE__ */ new Set();
	const seenLarge = /* @__PURE__ */ new Set();
	const seenDebt = /* @__PURE__ */ new Set();
	for (const it of data.items) {
		if (it.category !== cat) continue;
		const source = it.source ?? "manual";
		out.push({
			id: it.id,
			name: it.name,
			amount: it.amount,
			source,
			sourceId: it.sourceId,
			editable: source === "manual" || source === "recurring"
		});
		if (source === "recurring" && it.sourceId) seenRec.add(it.sourceId);
		if (source === "large" && it.sourceId) seenLarge.add(it.sourceId);
		if (source === "debt" && it.sourceId) seenDebt.add(it.sourceId);
	}
	for (const r of profile.recurring ?? []) {
		if (r.category !== cat) continue;
		if (!isRecurringDue(r, monthKey)) continue;
		if (seenRec.has(r.id)) continue;
		if (out.some((i) => i.name.toLowerCase() === r.name.toLowerCase() && i.source === "manual")) continue;
		out.push({
			id: `rec-${r.id}`,
			name: r.name,
			amount: r.amount,
			source: "recurring",
			sourceId: r.id,
			editable: true
		});
	}
	for (const lp of profile.largePurchases ?? []) {
		if ((lp.category ?? "essential") !== cat) continue;
		if (!isLargeActive(lp, monthKey)) continue;
		if (seenLarge.has(lp.id)) continue;
		out.push({
			id: `lp-${lp.id}`,
			name: lp.name,
			amount: installmentOf(lp),
			source: "large",
			sourceId: lp.id,
			editable: false
		});
	}
	for (const d of profile.debts ?? []) {
		if ((d.category ?? "essential") !== cat) continue;
		if (!isDebtActive(d, monthKey)) continue;
		if (seenDebt.has(d.id)) continue;
		out.push({
			id: `debt-${d.id}`,
			name: d.name,
			amount: d.minPayment,
			source: "debt",
			sourceId: d.id,
			editable: false
		});
	}
	return out;
}
function categoryActual(profile, monthKey, cat) {
	const data = monthOf(profile, monthKey);
	const txs = txsInMonth(profile, monthKey).filter((t) => t.category === cat && t.type !== "income");
	const coveredItems = new Set(txs.map((t) => t.itemId).filter(Boolean));
	const coveredLarge = new Set(txs.map((t) => t.largePurchaseId).filter(Boolean));
	const coveredRec = new Set(txs.map((t) => t.recurringExpenseId).filter(Boolean));
	const coveredGoals = new Set(txs.map((t) => t.goalId).filter(Boolean));
	const coveredDebt = new Set(txs.map((t) => t.debtId).filter(Boolean));
	let sum = txs.reduce((s, t) => s + t.amount, 0);
	if (cat === "essential" || cat === "flexible" || cat === "investing") {
		for (const it of data.items) {
			if (it.category !== cat) continue;
			if (coveredItems.has(it.id)) continue;
			sum += it.amount;
		}
		for (const r of profile.recurring ?? []) {
			if (r.category !== cat) continue;
			if (!isRecurringDue(r, monthKey)) continue;
			if (coveredRec.has(r.id)) continue;
			if (data.items.some((i) => i.sourceId === r.id || i.name.toLowerCase() === r.name.toLowerCase())) continue;
			if (txs.some((t) => t.name.toLowerCase() === r.name.toLowerCase())) continue;
			sum += r.amount;
		}
	}
	for (const lp of profile.largePurchases ?? []) {
		if ((lp.category ?? "essential") !== cat) continue;
		if (!isLargeActive(lp, monthKey)) continue;
		if (coveredLarge.has(lp.id)) continue;
		if (data.items.some((i) => i.sourceId === lp.id)) continue;
		sum += installmentOf(lp);
	}
	for (const d of profile.debts ?? []) {
		if ((d.category ?? "essential") !== cat) continue;
		if (!isDebtActive(d, monthKey)) continue;
		if (coveredDebt.has(d.id)) continue;
		if (data.items.some((i) => i.sourceId === d.id)) continue;
		sum += d.minPayment;
	}
	if (cat === "savings") for (const [gid, amt] of Object.entries(data.goalContributions)) {
		if (coveredGoals.has(gid)) continue;
		sum += amt;
	}
	return roundMoney(sum);
}
function extrasFor(profile, monthKey, cat) {
	const txs = txsInMonth(profile, monthKey).filter((t) => t.category === cat && t.type === "income");
	const covered = new Set(txs.map((t) => t.inflowId).filter(Boolean));
	let sum = txs.reduce((s, t) => s + t.amount, 0);
	for (const inf of profile.inflows ?? []) {
		if ((inf.category ?? "investing") !== cat) continue;
		if (!isInflowDue(inf, monthKey)) continue;
		if (covered.has(inf.id)) continue;
		sum += inf.amount;
	}
	return roundMoney(sum);
}
function monthSnapshot(profile, monthKey) {
	const data = monthOf(profile, monthKey);
	const essential = categoryActual(profile, monthKey, "essential");
	const flexible = categoryActual(profile, monthKey, "flexible");
	const investing = categoryActual(profile, monthKey, "investing");
	const savings = categoryActual(profile, monthKey, "savings");
	const debt = categoryActual(profile, monthKey, "debt");
	const extras = extrasFor(profile, monthKey, "investing");
	const expenses = essential + flexible;
	const savedInv = savings + investing;
	const leftover = roundMoney(data.income + extras - expenses - savedInv - debt);
	const targets = {
		essential: targetOf(profile, data.income, "essential"),
		flexible: targetOf(profile, data.income, "flexible"),
		investing: targetOf(profile, data.income, "investing"),
		savings: targetOf(profile, data.income, "savings"),
		debt: targetOf(profile, data.income, "debt")
	};
	const allocated = ALLOC_KEYS.reduce((s, k) => s + targets[k], 0);
	const leftToBudget = roundMoney(data.income - allocated);
	const percentSum = ALLOC_KEYS.reduce((s, k) => s + (profile.percents[k] ?? 0), 0);
	return {
		income: data.income,
		essential,
		flexible,
		investing,
		savings,
		debt,
		extras,
		expenses,
		savedInv,
		leftover,
		targets,
		allocated,
		leftToBudget,
		percentSum
	};
}
function yearRows(profile, year) {
	const keys = /* @__PURE__ */ new Set([...Object.keys(profile.months).filter((k) => k.startsWith(year)), ...(profile.transactions ?? []).filter((t) => t.date.startsWith(year)).map((t) => t.date.slice(0, 7))]);
	for (const r of profile.recurring ?? []) {
		if (r.active === false) continue;
		for (const k of Object.keys(profile.months)) if (k.startsWith(year)) keys.add(k);
	}
	return [...keys].sort().map((k) => {
		const s = monthSnapshot(profile, k);
		return {
			month: k.slice(5),
			income: s.income + s.extras,
			expenses: s.expenses,
			saved: s.savings,
			invested: s.investing,
			debt: s.debt,
			leftover: s.leftover
		};
	});
}
function txSigned(t) {
	if (t.type === "income") return t.amount;
	return -t.amount;
}
function categoryToType(cat) {
	if (cat === "income") return "income";
	if (cat === "investing") return "investment";
	if (cat === "savings") return "saving";
	if (cat === "debt") return "debt-payment";
	return "expense";
}
function rememberRecurring(memory, entry) {
	return [entry, ...(memory ?? []).filter((m) => m.name.trim().toLowerCase() !== entry.name.trim().toLowerCase())].slice(0, 24);
}
function pendingAutos(profile, monthKey) {
	const data = monthOf(profile, monthKey);
	const txs = txsInMonth(profile, monthKey);
	const items = [];
	const outTxs = [];
	const date = `${monthKey}-01`;
	for (const r of profile.recurring ?? []) {
		if (!isRecurringDue(r, monthKey)) continue;
		if (txs.some((t) => t.recurringExpenseId === r.id)) continue;
		if (data.items.some((i) => i.sourceId === r.id)) continue;
		if (data.items.some((i) => i.name.toLowerCase() === r.name.toLowerCase() && i.category === r.category)) continue;
		const itemId = `auto-r-${r.id}-${monthKey}`;
		items.push({
			id: itemId,
			name: r.name,
			amount: r.amount,
			category: r.category,
			methodId: r.methodId,
			source: "recurring",
			sourceId: r.id
		});
		outTxs.push({
			type: categoryToType(r.category),
			category: r.category,
			name: r.name,
			amount: r.amount,
			date,
			methodId: r.methodId,
			itemId,
			recurringExpenseId: r.id
		});
	}
	for (const lp of profile.largePurchases ?? []) {
		if (!isLargeActive(lp, monthKey)) continue;
		if (txs.some((t) => t.largePurchaseId === lp.id)) continue;
		if (data.items.some((i) => i.sourceId === lp.id)) continue;
		const cat = lp.category ?? "essential";
		const amount = installmentOf(lp);
		if (isSpendCat(cat)) {
			const itemId = `auto-lp-${lp.id}-${monthKey}`;
			items.push({
				id: itemId,
				name: lp.name,
				amount,
				category: cat,
				source: "large",
				sourceId: lp.id
			});
			outTxs.push({
				type: categoryToType(cat),
				category: cat,
				name: lp.name,
				amount,
				date,
				itemId,
				largePurchaseId: lp.id
			});
		} else outTxs.push({
			type: categoryToType(cat),
			category: cat,
			name: lp.name,
			amount,
			date,
			largePurchaseId: lp.id
		});
	}
	for (const d of profile.debts ?? []) {
		if (!isDebtActive(d, monthKey)) continue;
		if (txs.some((t) => t.debtId === d.id)) continue;
		if (data.items.some((i) => i.sourceId === d.id)) continue;
		const cat = d.category ?? "essential";
		const amount = d.minPayment;
		if (amount <= 0) continue;
		if (isSpendCat(cat)) {
			const itemId = `auto-d-${d.id}-${monthKey}`;
			items.push({
				id: itemId,
				name: d.name,
				amount,
				category: cat,
				source: "debt",
				sourceId: d.id
			});
			outTxs.push({
				type: categoryToType(cat),
				category: cat,
				name: d.name,
				amount,
				date,
				itemId,
				debtId: d.id
			});
		} else outTxs.push({
			type: categoryToType(cat),
			category: cat,
			name: d.name,
			amount,
			date,
			debtId: d.id
		});
	}
	for (const inf of profile.inflows ?? []) {
		if (!isInflowDue(inf, monthKey)) continue;
		if (txs.some((t) => t.inflowId === inf.id)) continue;
		outTxs.push({
			type: "income",
			category: inf.category,
			name: inf.name,
			amount: inf.amount,
			date,
			inflowId: inf.id
		});
	}
	return {
		items,
		txs: outTxs
	};
}
var METHOD_COLORS = [
	"#22c55e",
	"#6e7bff",
	"#111827",
	"#94a3b8",
	"#0ea5e9",
	"#f97316",
	"#e11d48"
];
var DEFAULT_PERCENTS = {
	essential: 80,
	flexible: 10,
	investing: 10,
	savings: 0,
	debt: 0
};
var ZERO_ADJ = {
	essential: 0,
	flexible: 0,
	investing: 0,
	savings: 0,
	debt: 0
};
function emptyProfile(name) {
	return {
		id: uid(),
		name,
		paymentMethods: [
			{
				id: uid(),
				name: "Cash",
				color: "#22c55e",
				type: "cash"
			},
			{
				id: uid(),
				name: "Amex",
				color: "#1d4ed8",
				type: "credit-card"
			},
			{
				id: uid(),
				name: "Etoro Visa Black Platinum",
				color: "#0b0b0f",
				type: "broker-card"
			},
			{
				id: uid(),
				name: "Trade Republic",
				color: "#94a3b8",
				type: "broker-card"
			},
			{
				id: uid(),
				name: "C24 Bank",
				color: "#0ea5e9",
				type: "bank"
			}
		],
		months: {},
		goals: [],
		debts: [],
		largePurchases: [],
		recurring: [],
		recurringMemory: [],
		inflows: [],
		transactions: [],
		assets: {
			cash: 0,
			bank: 0,
			savings: 0,
			investments: 0,
			property: 0,
			other: 0
		},
		percents: { ...DEFAULT_PERCENTS },
		adjustments: { ...ZERO_ADJ },
		debtMethod: "avalanche",
		extraDebtPayment: 100,
		aiTip: ""
	};
}
function txFromItem(item, monthKey, day) {
	return {
		id: uid(),
		type: categoryToType(item.category),
		category: item.category,
		name: item.name,
		amount: item.amount,
		date: dateInMonth(monthKey, day),
		methodId: item.methodId,
		itemId: item.id
	};
}
function sampleProfile(name, month) {
	const cashId = "pm-cash";
	const amexId = "pm-amex";
	const etoroId = "pm-etoro";
	const trId = "pm-tr";
	const c24Id = "pm-c24";
	const emergencyId = "goal-emergency";
	const items = [
		{
			id: "it-food",
			name: "Groceries",
			amount: 340,
			category: "essential",
			methodId: amexId
		},
		{
			id: "it-util",
			name: "Electricity & gas",
			amount: 95,
			category: "essential",
			methodId: c24Id
		},
		{
			id: "it-trans",
			name: "Transportation",
			amount: 85,
			category: "essential",
			methodId: cashId
		},
		{
			id: "it-etf",
			name: "World ETF",
			amount: 300,
			category: "investing",
			methodId: trId
		},
		{
			id: "it-dine",
			name: "Restaurants",
			amount: 75,
			category: "flexible",
			methodId: amexId
		}
	];
	const transactions = [
		{
			id: "tx-salary",
			type: "income",
			category: "income",
			name: "Salary",
			amount: 4044.72,
			date: dateInMonth(month, 1),
			methodId: c24Id
		},
		...items.map((it, i) => txFromItem(it, month, [
			4,
			6,
			8,
			12,
			15
		][i] ?? 12)),
		{
			id: "tx-emergency",
			type: "saving",
			category: "savings",
			name: "Emergency Fund",
			amount: 150,
			date: dateInMonth(month, 2),
			methodId: c24Id,
			goalId: emergencyId
		}
	];
	return {
		id: "main",
		name,
		paymentMethods: [
			{
				id: cashId,
				name: "Cash",
				color: "#22c55e",
				type: "cash"
			},
			{
				id: amexId,
				name: "Amex",
				color: "#1d4ed8",
				type: "credit-card"
			},
			{
				id: etoroId,
				name: "Etoro Visa Black Platinum",
				color: "#0b0b0f",
				type: "broker-card"
			},
			{
				id: trId,
				name: "Trade Republic",
				color: "#94a3b8",
				type: "broker-card"
			},
			{
				id: c24Id,
				name: "C24 Bank",
				color: "#0ea5e9",
				type: "bank"
			}
		],
		months: { [month]: {
			income: 4044.72,
			items,
			goalContributions: { [emergencyId]: 150 }
		} },
		goals: [{
			id: emergencyId,
			name: "Emergency Fund",
			target: 5e3,
			current: 800
		}],
		debts: [
			{
				id: "d-visa",
				name: "Visa",
				balance: 2800,
				ratePct: 22.9,
				minPayment: 70,
				category: "essential"
			},
			{
				id: "d-car",
				name: "Car loan",
				balance: 950,
				ratePct: 4.5,
				minPayment: 90,
				category: "essential"
			},
			{
				id: "d-personal",
				name: "Personal loan",
				balance: 6200,
				ratePct: 9.5,
				minPayment: 140,
				category: "essential"
			}
		],
		largePurchases: [],
		recurring: [
			{
				id: "rc-rent",
				name: "Rent / Mortgage",
				amount: 980,
				category: "essential",
				methodId: c24Id,
				frequency: "monthly",
				active: true
			},
			{
				id: "rc-phone",
				name: "Phone",
				amount: 24.99,
				category: "essential",
				methodId: c24Id,
				frequency: "monthly",
				active: true
			},
			{
				id: "rc-netflix",
				name: "Netflix",
				amount: 12.99,
				category: "flexible",
				methodId: amexId,
				frequency: "monthly",
				active: true
			}
		],
		recurringMemory: [
			{
				name: "Rent / Mortgage",
				amount: 980,
				category: "essential"
			},
			{
				name: "Phone",
				amount: 24.99,
				category: "essential"
			},
			{
				name: "Netflix",
				amount: 12.99,
				category: "flexible"
			}
		],
		inflows: [{
			id: "inf-etoro-pi",
			name: "eToro Popular Investor",
			amount: 85,
			category: "investing",
			recurring: true,
			frequency: "monthly",
			startMonth: month,
			active: true
		}, {
			id: "inf-etoro-cb",
			name: "eToro Visa cashback",
			amount: 22,
			category: "investing",
			recurring: true,
			frequency: "monthly",
			startMonth: month,
			active: true
		}],
		transactions,
		assets: {
			cash: 320,
			bank: 1850,
			savings: 800,
			investments: 4200,
			property: 0,
			other: 0
		},
		percents: {
			essential: 80,
			investing: 10,
			flexible: 10,
			savings: 0,
			debt: 0
		},
		adjustments: { ...ZERO_ADJ },
		debtMethod: "avalanche",
		extraDebtPayment: 100,
		aiTip: "",
		tipId: ""
	};
}
var month = currentMonthKey();
var initialProfile = sampleProfile("Main", month);
function withActive(state, fn) {
	return { profiles: state.profiles.map((p) => p.id === state.activeProfileId ? fn(p) : p) };
}
function withMonth(p, monthKey, fn) {
	const current = p.months[monthKey] ?? emptyMonth();
	return {
		...p,
		months: {
			...p.months,
			[monthKey]: fn(current)
		}
	};
}
function normalizeProfile(p) {
	return {
		...p,
		transactions: p.transactions ?? [],
		percents: {
			...DEFAULT_PERCENTS,
			...p.percents
		},
		adjustments: {
			...ZERO_ADJ,
			...p.adjustments
		},
		largePurchases: (p.largePurchases ?? []).map((lp) => ({
			paidMonths: 0,
			skippedMonths: [],
			...lp,
			category: lp.category ?? "essential"
		})),
		recurring: (p.recurring ?? []).map((r) => ({
			frequency: "monthly",
			skippedMonths: [],
			...r,
			active: r.active ?? true
		})),
		recurringMemory: p.recurringMemory ?? [],
		inflows: p.inflows ?? [],
		debts: (p.debts ?? []).map((d) => ({
			skippedMonths: [],
			...d,
			category: d.category ?? "essential"
		}))
	};
}
function applyAutos(p, monthKey, date) {
	const pending = pendingAutos(p, monthKey);
	if (pending.items.length === 0 && pending.txs.length === 0) return p;
	const next = withMonth(p, monthKey, (m) => ({
		...m,
		items: [...m.items, ...pending.items]
	}));
	let goals = next.goals;
	for (const tx of pending.txs) {
		if (!tx.largePurchaseId) continue;
		const lp = p.largePurchases.find((x) => x.id === tx.largePurchaseId);
		if (!lp?.fundFromGoalId) continue;
		goals = goals.map((g) => g.id === lp.fundFromGoalId ? {
			...g,
			current: roundMoney(g.current + tx.amount)
		} : g);
	}
	return {
		...next,
		goals,
		transactions: [...next.transactions, ...pending.txs.map((t) => ({
			...t,
			id: uid(),
			date
		}))]
	};
}
function defaultDate(monthKey) {
	const today = isoToday();
	return today.startsWith(monthKey) ? today : dateInMonth(monthKey, 1);
}
var useAppStore = create()(persist((set, get) => ({
	lang: "en",
	theme: "dark",
	currency: "EUR",
	advancedView: true,
	activeMonth: month,
	activeProfileId: initialProfile.id,
	profiles: [initialProfile],
	calc: {
		mode: "save",
		goal: 1e4,
		principal: 1e3,
		pmt: 100,
		annualRatePct: 7,
		years: 10,
		freq: "monthly",
		timing: "end"
	},
	hydrated: false,
	setupComplete: true,
	hasUndoImport: false,
	setHydrated: (v) => set({ hydrated: v }),
	setSetupComplete: (setupComplete) => set({ setupComplete }),
	setHasUndoImport: (hasUndoImport) => set({ hasUndoImport }),
	setLang: (lang) => set({ lang }),
	setTheme: (theme) => set({ theme }),
	setCurrency: (currency) => set({ currency }),
	setAdvanced: (advancedView) => set({ advancedView }),
	setMonth: (activeMonth) => {
		set({ activeMonth });
		set(withActive(get(), (p) => applyAutos(p, activeMonth, defaultDate(activeMonth))));
	},
	setCalc: (partial) => set({ calc: {
		...get().calc,
		...partial
	} }),
	addProfile: (name) => {
		const p = emptyProfile(name || "Profile");
		set({
			profiles: [...get().profiles, p],
			activeProfileId: p.id
		});
	},
	removeProfile: (id) => {
		const { profiles, activeProfileId } = get();
		if (profiles.length <= 1) return;
		const next = profiles.filter((p) => p.id !== id);
		set({
			profiles: next,
			activeProfileId: activeProfileId === id ? next[0].id : activeProfileId
		});
	},
	renameProfile: (id, name) => set({ profiles: get().profiles.map((p) => p.id === id ? {
		...p,
		name
	} : p) }),
	setActiveProfile: (id) => set({ activeProfileId: id }),
	patchProfile: (fn) => set(withActive(get(), fn)),
	ensureMonth: () => {
		const s = get();
		set(withActive(s, (p) => {
			if (p.months[s.activeMonth]) return p;
			return {
				...p,
				months: {
					...p.months,
					[s.activeMonth]: emptyMonth()
				}
			};
		}));
	},
	setIncome: (n) => {
		const s = get();
		set(withActive(s, (p) => withMonth(p, s.activeMonth, (m) => ({
			...m,
			income: n
		}))));
	},
	addItem: (item) => {
		const s = get();
		const date = defaultDate(s.activeMonth);
		set(withActive(s, (p) => {
			const existing = findMergeableItem((p.months[s.activeMonth] ?? emptyMonth()).items, item);
			if (existing) {
				const amount = roundMoney(existing.amount + item.amount);
				const next = withMonth(p, s.activeMonth, (cur) => ({
					...cur,
					items: cur.items.map((it) => it.id === existing.id ? {
						...it,
						amount
					} : it)
				}));
				return {
					...next,
					transactions: next.transactions.map((t) => t.itemId === existing.id ? {
						...t,
						amount,
						name: existing.name
					} : t)
				};
			}
			const id = uid();
			const next = withMonth(p, s.activeMonth, (cur) => ({
				...cur,
				items: [...cur.items, {
					...item,
					id
				}]
			}));
			return {
				...next,
				transactions: [...next.transactions, {
					id: uid(),
					type: categoryToType(item.category),
					category: item.category,
					name: item.name,
					amount: item.amount,
					date,
					methodId: item.methodId,
					itemId: id
				}]
			};
		}));
	},
	updateItem: (id, patch) => {
		const s = get();
		set(withActive(s, (p) => {
			const next = withMonth(p, s.activeMonth, (m) => ({
				...m,
				items: m.items.map((it) => it.id === id ? {
					...it,
					...patch
				} : it)
			}));
			return {
				...next,
				transactions: next.transactions.map((t) => t.itemId === id ? {
					...t,
					name: patch.name ?? t.name,
					amount: patch.amount ?? t.amount,
					methodId: patch.methodId ?? t.methodId,
					category: patch.category ?? t.category,
					type: patch.category ? categoryToType(patch.category) : t.type
				} : t)
			};
		}));
	},
	removeItem: (id) => {
		const s = get();
		set(withActive(s, (p) => {
			const next = withMonth(p, s.activeMonth, (m) => ({
				...m,
				items: m.items.filter((it) => it.id !== id)
			}));
			return {
				...next,
				transactions: next.transactions.filter((t) => t.itemId !== id)
			};
		}));
	},
	addPaymentMethod: (name, color) => set(withActive(get(), (p) => ({
		...p,
		paymentMethods: [...p.paymentMethods, {
			id: uid(),
			name,
			color: color || METHOD_COLORS[p.paymentMethods.length % METHOD_COLORS.length]
		}]
	}))),
	removePaymentMethod: (id) => set(withActive(get(), (p) => ({
		...p,
		paymentMethods: p.paymentMethods.filter((m) => m.id !== id)
	}))),
	addGoal: (goal) => set(withActive(get(), (p) => ({
		...p,
		goals: [...p.goals, {
			...goal,
			id: uid()
		}]
	}))),
	updateGoal: (id, patch) => set(withActive(get(), (p) => ({
		...p,
		goals: p.goals.map((g) => g.id === id ? {
			...g,
			...patch
		} : g),
		transactions: p.transactions.map((t) => t.goalId === id && patch.name ? {
			...t,
			name: patch.name
		} : t)
	}))),
	removeGoal: (id) => set(withActive(get(), (p) => ({
		...p,
		goals: p.goals.filter((g) => g.id !== id)
	}))),
	setGoalContribution: (id, amount) => {
		const s = get();
		set(withActive(s, (p) => {
			const next = withMonth(p, s.activeMonth, (m) => ({
				...m,
				goalContributions: {
					...m.goalContributions,
					[id]: amount
				}
			}));
			const goal = p.goals.find((g) => g.id === id);
			const existing = next.transactions.find((t) => t.goalId === id && t.date.startsWith(s.activeMonth));
			let transactions = next.transactions;
			if (amount <= 0) transactions = transactions.filter((t) => t.id !== existing?.id);
			else if (existing) transactions = transactions.map((t) => t.id === existing.id ? {
				...t,
				amount
			} : t);
			else transactions = [...transactions, {
				id: uid(),
				type: "saving",
				category: "savings",
				name: goal?.name ?? "Savings",
				amount,
				date: defaultDate(s.activeMonth),
				goalId: id
			}];
			return {
				...next,
				transactions
			};
		}));
	},
	addDebt: (debt) => {
		const s = get();
		const next = {
			...debt,
			id: uid(),
			category: debt.category ?? "essential",
			skippedMonths: []
		};
		set(withActive(s, (p) => applyAutos({
			...p,
			debts: [...p.debts, next]
		}, s.activeMonth, defaultDate(s.activeMonth))));
	},
	updateDebt: (id, patch) => {
		const s = get();
		set(withActive(s, (p) => {
			const prev = p.debts.find((x) => x.id === id);
			if (!prev) return p;
			const next = {
				...prev,
				...patch
			};
			const month = s.activeMonth;
			const cat = next.category ?? "essential";
			const active = isDebtActive(next, month);
			const m = p.months[month] ?? emptyMonth();
			let items = m.items;
			let txs = p.transactions;
			if (active) {
				txs = txs.map((t) => t.debtId === id && t.date.startsWith(month) ? {
					...t,
					name: next.name,
					amount: next.minPayment,
					category: cat,
					type: categoryToType(cat)
				} : t);
				const itemCat = isSpendCat(cat) ? cat : null;
				if (itemCat) {
					if (items.some((it) => it.source === "debt" && it.sourceId === id)) items = items.map((it) => it.source === "debt" && it.sourceId === id ? {
						...it,
						name: next.name,
						amount: next.minPayment,
						category: itemCat
					} : it);
					else {
						const itemId = `auto-d-${id}-${month}`;
						items = [...items, {
							id: itemId,
							name: next.name,
							amount: next.minPayment,
							category: itemCat,
							source: "debt",
							sourceId: id
						}];
						if (!txs.some((t) => t.debtId === id && t.date.startsWith(month))) txs = [...txs, {
							id: uid(),
							type: categoryToType(itemCat),
							category: itemCat,
							name: next.name,
							amount: next.minPayment,
							date: defaultDate(month),
							itemId,
							debtId: id
						}];
					}
				} else items = items.filter((it) => !(it.source === "debt" && it.sourceId === id));
			} else {
				items = items.filter((it) => !(it.source === "debt" && it.sourceId === id));
				txs = txs.filter((t) => !(t.debtId === id && t.date.startsWith(month)));
			}
			return {
				...p,
				debts: p.debts.map((d) => d.id === id ? next : d),
				transactions: txs,
				months: {
					...p.months,
					[month]: {
						...m,
						items
					}
				}
			};
		}));
	},
	removeDebt: (id) => {
		const s = get();
		set(withActive(s, (p) => {
			const month = s.activeMonth;
			const m = p.months[month] ?? emptyMonth();
			return {
				...p,
				debts: p.debts.filter((d) => d.id !== id),
				transactions: p.transactions.filter((t) => t.debtId !== id),
				months: {
					...p.months,
					[month]: {
						...m,
						items: m.items.filter((i) => !(i.source === "debt" && i.sourceId === id))
					}
				}
			};
		}));
	},
	skipDebt: (id) => {
		const s = get();
		set(withActive(s, (p) => ({
			...p,
			debts: p.debts.map((d) => d.id === id ? {
				...d,
				skippedMonths: [...d.skippedMonths ?? [], s.activeMonth]
			} : d),
			transactions: p.transactions.filter((t) => !(t.debtId === id && t.date.startsWith(s.activeMonth))),
			months: {
				...p.months,
				[s.activeMonth]: {
					...p.months[s.activeMonth] ?? emptyMonth(),
					items: (p.months[s.activeMonth]?.items ?? []).filter((i) => !(i.source === "debt" && i.sourceId === id))
				}
			}
		})));
	},
	setDebtMethod: (debtMethod) => set(withActive(get(), (p) => ({
		...p,
		debtMethod
	}))),
	setExtraPayment: (extraDebtPayment) => set(withActive(get(), (p) => ({
		...p,
		extraDebtPayment
	}))),
	setAssets: (patch) => set(withActive(get(), (p) => ({
		...p,
		assets: {
			...p.assets,
			...patch
		}
	}))),
	setPercent: (key, n) => set(withActive(get(), (p) => ({
		...p,
		percents: {
			...p.percents,
			[key]: n
		}
	}))),
	setAdjustment: (key, n) => set(withActive(get(), (p) => ({
		...p,
		adjustments: {
			...p.adjustments,
			[key]: n
		}
	}))),
	addLarge: (lp) => {
		const s = get();
		const id = uid();
		const purchase = {
			...lp,
			id,
			category: lp.category ?? "essential",
			paidMonths: 0,
			skippedMonths: []
		};
		set(withActive(s, (p) => {
			let goals = p.goals;
			if (purchase.fundFromGoalId) goals = goals.map((g) => g.id === purchase.fundFromGoalId ? {
				...g,
				current: roundMoney(g.current - purchase.total)
			} : g);
			return applyAutos({
				...p,
				goals,
				largePurchases: [...p.largePurchases, purchase]
			}, s.activeMonth, defaultDate(s.activeMonth));
		}));
	},
	updateLarge: (id, patch) => {
		const s = get();
		set(withActive(s, (p) => {
			const prev = p.largePurchases.find((x) => x.id === id);
			if (!prev) return p;
			const nextLp = {
				...prev,
				...patch
			};
			const month = s.activeMonth;
			const inst = installmentOf(nextLp);
			const cat = nextLp.category ?? "essential";
			const active = isLargeActive(nextLp, month);
			const oldRepaid = p.transactions.filter((t) => t.largePurchaseId === id).reduce((sum, t) => sum + t.amount, 0);
			const oldOut = prev.fundFromGoalId ? Math.max(0, prev.total - oldRepaid) : 0;
			const m = p.months[month] ?? emptyMonth();
			let items = m.items;
			let txs = p.transactions;
			if (active) {
				txs = txs.map((t) => t.largePurchaseId === id && t.date.startsWith(month) ? {
					...t,
					name: nextLp.name,
					amount: inst,
					category: cat,
					type: categoryToType(cat)
				} : t);
				const itemCat = cat === "essential" || cat === "flexible" || cat === "investing" ? cat : null;
				if (itemCat) {
					if (items.some((it) => it.sourceId === id)) items = items.map((it) => it.sourceId === id ? {
						...it,
						name: nextLp.name,
						amount: inst,
						category: itemCat
					} : it);
					else {
						const itemId = `auto-lp-${id}-${month}`;
						items = [...items, {
							id: itemId,
							name: nextLp.name,
							amount: inst,
							category: itemCat,
							source: "large",
							sourceId: id
						}];
						if (!txs.some((t) => t.largePurchaseId === id && t.date.startsWith(month))) txs = [...txs, {
							id: uid(),
							type: categoryToType(itemCat),
							category: itemCat,
							name: nextLp.name,
							amount: inst,
							date: defaultDate(month),
							itemId,
							largePurchaseId: id
						}];
					}
				} else items = items.filter((it) => it.sourceId !== id);
			} else {
				items = items.filter((it) => it.sourceId !== id);
				txs = txs.filter((t) => !(t.largePurchaseId === id && t.date.startsWith(month)));
			}
			const repaid = txs.filter((t) => t.largePurchaseId === id).reduce((sum, t) => sum + t.amount, 0);
			const newOut = nextLp.fundFromGoalId ? Math.max(0, nextLp.total - repaid) : 0;
			let goals = p.goals;
			if (prev.fundFromGoalId && oldOut) goals = goals.map((g) => g.id === prev.fundFromGoalId ? {
				...g,
				current: roundMoney(g.current + oldOut)
			} : g);
			if (nextLp.fundFromGoalId && newOut) goals = goals.map((g) => g.id === nextLp.fundFromGoalId ? {
				...g,
				current: roundMoney(g.current - newOut)
			} : g);
			return {
				...p,
				goals,
				largePurchases: p.largePurchases.map((x) => x.id === id ? nextLp : x),
				transactions: txs,
				months: {
					...p.months,
					[month]: {
						...m,
						items
					}
				}
			};
		}));
	},
	removeLarge: (id) => set(withActive(get(), (p) => {
		const lp = p.largePurchases.find((x) => x.id === id);
		const repaid = p.transactions.filter((t) => t.largePurchaseId === id).reduce((s, t) => s + t.amount, 0);
		let goals = p.goals;
		if (lp?.fundFromGoalId) {
			const stillOut = Math.max(0, lp.total - repaid);
			goals = goals.map((g) => g.id === lp.fundFromGoalId ? {
				...g,
				current: roundMoney(g.current + stillOut)
			} : g);
		}
		return {
			...p,
			goals,
			largePurchases: p.largePurchases.filter((x) => x.id !== id),
			transactions: p.transactions.filter((t) => t.largePurchaseId !== id)
		};
	})),
	skipLarge: (id) => {
		const s = get();
		set(withActive(s, (p) => {
			const lp = p.largePurchases.find((x) => x.id === id);
			const hadTx = p.transactions.some((t) => t.largePurchaseId === id && t.date.startsWith(s.activeMonth));
			let goals = p.goals;
			if (hadTx && lp?.fundFromGoalId) {
				const inst = installmentOf(lp);
				goals = goals.map((g) => g.id === lp.fundFromGoalId ? {
					...g,
					current: roundMoney(g.current - inst)
				} : g);
			}
			return {
				...p,
				goals,
				largePurchases: p.largePurchases.map((x) => x.id === id ? {
					...x,
					skippedMonths: [...x.skippedMonths ?? [], s.activeMonth]
				} : x),
				transactions: p.transactions.filter((t) => !(t.largePurchaseId === id && t.date.startsWith(s.activeMonth))),
				months: {
					...p.months,
					[s.activeMonth]: {
						...p.months[s.activeMonth] ?? emptyMonth(),
						items: (p.months[s.activeMonth]?.items ?? []).filter((i) => i.sourceId !== id)
					}
				}
			};
		}));
	},
	addRecurring: (r) => {
		const s = get();
		const rec = {
			...r,
			id: uid(),
			active: r.active ?? true,
			skippedMonths: [],
			frequency: r.frequency ?? "monthly",
			startMonth: r.startMonth ?? s.activeMonth
		};
		set(withActive(s, (p) => applyAutos({
			...p,
			recurring: [...p.recurring, rec],
			recurringMemory: rememberRecurring(p.recurringMemory, {
				name: rec.name,
				amount: rec.amount,
				category: rec.category
			})
		}, s.activeMonth, defaultDate(s.activeMonth))));
	},
	updateRecurring: (id, patch) => {
		const s = get();
		set(withActive(s, (p) => {
			const prev = p.recurring.find((x) => x.id === id);
			if (!prev) return p;
			const nextRec = {
				...prev,
				...patch
			};
			const month = s.activeMonth;
			const next = withMonth(p, month, (m) => ({
				...m,
				items: m.items.map((it) => it.sourceId === id ? {
					...it,
					name: nextRec.name,
					amount: nextRec.amount,
					category: nextRec.category,
					methodId: nextRec.methodId ?? it.methodId
				} : it)
			}));
			return {
				...next,
				recurring: p.recurring.map((x) => x.id === id ? nextRec : x),
				recurringMemory: rememberRecurring(p.recurringMemory, {
					name: nextRec.name,
					amount: nextRec.amount,
					category: nextRec.category
				}),
				transactions: next.transactions.map((t) => t.recurringExpenseId === id && t.date.startsWith(month) ? {
					...t,
					name: nextRec.name,
					amount: nextRec.amount,
					category: nextRec.category,
					type: categoryToType(nextRec.category),
					methodId: nextRec.methodId ?? t.methodId
				} : t)
			};
		}));
	},
	removeRecurring: (id) => set(withActive(get(), (p) => ({
		...p,
		recurring: p.recurring.filter((x) => x.id !== id)
	}))),
	toggleRecurring: (id, active) => {
		const s = get();
		set(withActive(s, (p) => {
			const next = {
				...p,
				recurring: p.recurring.map((x) => x.id === id ? {
					...x,
					active
				} : x)
			};
			return active ? applyAutos(next, s.activeMonth, defaultDate(s.activeMonth)) : next;
		}));
	},
	skipRecurring: (id) => {
		const s = get();
		set(withActive(s, (p) => ({
			...p,
			recurring: p.recurring.map((x) => x.id === id ? {
				...x,
				skippedMonths: [...x.skippedMonths ?? [], s.activeMonth]
			} : x),
			transactions: p.transactions.filter((t) => !(t.recurringExpenseId === id && t.date.startsWith(s.activeMonth))),
			months: {
				...p.months,
				[s.activeMonth]: {
					...p.months[s.activeMonth] ?? emptyMonth(),
					items: (p.months[s.activeMonth]?.items ?? []).filter((i) => i.sourceId !== id)
				}
			}
		})));
	},
	logRecurring: (id) => {
		const s = get();
		set(withActive(s, (p) => applyAutos(p, s.activeMonth, defaultDate(s.activeMonth))));
	},
	applyAutosForMonth: (monthKey) => {
		const s = get();
		const mk = monthKey ?? s.activeMonth;
		set(withActive(s, (p) => applyAutos(p, mk, defaultDate(mk))));
	},
	addInflow: (inf) => {
		const s = get();
		const extra = {
			...inf,
			id: uid(),
			category: inf.category ?? "investing",
			startMonth: inf.startMonth || s.activeMonth,
			active: inf.active ?? true
		};
		set(withActive(s, (p) => applyAutos({
			...p,
			inflows: [...p.inflows ?? [], extra]
		}, s.activeMonth, defaultDate(s.activeMonth))));
	},
	updateInflow: (id, patch) => {
		const s = get();
		set(withActive(s, (p) => {
			const nextInf = (p.inflows ?? []).map((x) => x.id === id ? {
				...x,
				...patch
			} : x);
			return {
				...p,
				inflows: nextInf,
				transactions: p.transactions.map((t) => t.inflowId === id && t.date.startsWith(s.activeMonth) ? {
					...t,
					name: patch.name ?? t.name,
					amount: patch.amount ?? t.amount,
					category: patch.category ?? t.category
				} : t)
			};
		}));
	},
	removeInflow: (id) => {
		const s = get();
		set(withActive(s, (p) => ({
			...p,
			inflows: (p.inflows ?? []).filter((x) => x.id !== id),
			transactions: p.transactions.filter((t) => !(t.inflowId === id && t.date.startsWith(s.activeMonth)))
		})));
	},
	addTransaction: (tx) => set(withActive(get(), (p) => {
		const existing = findMergeableTx(p.transactions, tx);
		if (existing) {
			const amount = roundMoney(existing.amount + tx.amount);
			let months = p.months;
			if (existing.itemId) {
				const mk = existing.date.slice(0, 7);
				const m = months[mk];
				if (m) months = {
					...months,
					[mk]: {
						...m,
						items: m.items.map((it) => it.id === existing.itemId ? {
							...it,
							amount
						} : it)
					}
				};
			}
			return {
				...p,
				months,
				transactions: p.transactions.map((t) => t.id === existing.id ? {
					...t,
					amount
				} : t)
			};
		}
		return {
			...p,
			transactions: [...p.transactions, {
				...tx,
				id: uid()
			}]
		};
	})),
	updateTransaction: (id, patch) => set(withActive(get(), (p) => ({
		...p,
		transactions: p.transactions.map((t) => t.id === id ? {
			...t,
			...patch
		} : t)
	}))),
	deleteTransaction: (id) => set(withActive(get(), (p) => {
		const tx = p.transactions.find((t) => t.id === id);
		let months = p.months;
		if (tx?.itemId) {
			const mk = tx.date.slice(0, 7);
			const m = months[mk];
			if (m) months = {
				...months,
				[mk]: {
					...m,
					items: m.items.filter((i) => i.id !== tx.itemId)
				}
			};
		}
		return {
			...p,
			months,
			transactions: p.transactions.filter((t) => t.id !== id)
		};
	})),
	copyPreviousMonth: () => {
		const s = get();
		const prev = prevMonthKey(s.activeMonth);
		set(withActive(s, (p) => {
			const source = p.months[prev];
			if (!source) return p;
			const current = p.months[s.activeMonth] ?? emptyMonth();
			return {
				...p,
				months: {
					...p.months,
					[s.activeMonth]: {
						income: source.income,
						items: current.items,
						goalContributions: current.goalContributions
					}
				}
			};
		}));
	},
	setAiTip: (aiTip, tipId) => set(withActive(get(), (p) => ({
		...p,
		aiTip,
		tipId
	}))),
	restoreSample: () => {
		const s = get();
		const sample = sampleProfile(s.profiles.find((p) => p.id === s.activeProfileId)?.name ?? "Main", s.activeMonth);
		sample.id = s.activeProfileId;
		set({ profiles: s.profiles.map((p) => p.id === s.activeProfileId ? sample : p) });
	},
	resetProfile: () => {
		const s = get();
		const fresh = emptyProfile(s.profiles.find((p) => p.id === s.activeProfileId)?.name ?? "Main");
		fresh.id = s.activeProfileId;
		set({ profiles: s.profiles.map((p) => p.id === s.activeProfileId ? fresh : p) });
	},
	importProfiles: (profiles, extras) => {
		const normalized = profiles.map(normalizeProfile);
		set({
			profiles: normalized,
			activeProfileId: extras?.activeProfileId ?? normalized[0]?.id,
			...extras ?? {}
		});
	}
}), {
	name: "budgetwise-v1",
	skipHydration: true,
	storage: createBudgetWiseStorage(),
	version: 4,
	migrate: (persisted, fromVersion) => {
		const s = persisted;
		const profiles = (s.profiles ?? []).map((p) => {
			const next = normalizeProfile(p);
			if (fromVersion < 3) next.adjustments = { ...ZERO_ADJ };
			return next;
		});
		return {
			...s,
			profiles,
			setupComplete: s.setupComplete ?? true,
			hasUndoImport: s.hasUndoImport ?? false
		};
	},
	partialize: (s) => {
		const { hydrated: _h, ...rest } = s;
		return rest;
	}
}));
function useProfile() {
	return useAppStore((s) => s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]);
}
function useMonthData() {
	const monthKey = useAppStore((s) => s.activeMonth);
	return useProfile().months[monthKey] ?? emptyMonth();
}
//#endregion
export { prevMonthKey as A, yearOf as B, kvSet as C, monthSnapshot as D, monthNames as E, txsInMonth as F, uid as I, useAppStore as L, startWeekday as M, t as N, monthTitle as O, txSigned as P, useMonthData as R, kvGet as S, monthKeyFromParts as T, yearRows as V, formatPct as _, RECURRING_FREQS as a, isLargeActive as b, currencySymbol as c, daysInMonth as d, displayItemsFor as f, formatMoney as g, formatDayTitle as h, LANGS as i, roundMoney as j, nextMonthKey as k, currentMonthKey as l, extrasFor as m, FREQ_LABEL as n, allocI18nKey as o, emptyMonth as p, INTL_LOCALE as r, cn as s, CURRENCIES as t, dateInMonth as u, installmentOf as v, largeProgress as w, isoToday as x, isDebtActive as y, useProfile as z };
