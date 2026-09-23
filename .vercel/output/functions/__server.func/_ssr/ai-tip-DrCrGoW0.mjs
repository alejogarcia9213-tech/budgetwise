import { n as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { a as string, i as object, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-tip-DrCrGoW0.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var schema = object({
	lang: _enum([
		"en",
		"es",
		"de",
		"it",
		"fr",
		"pt"
	]),
	snapshot: string().max(4e3)
});
var SYSTEM = {
	en: "You are a practical financial coach for Budget Wise. Give a short tip (3–5 sentences) based on the user's budget. No long disclaimers, no markdown, no bullet lists. Be specific with the numbers provided. Warm, not preachy. Do not promise returns.",
	es: "Eres un asesor financiero práctico y directo para Budget Wise. Das un consejo breve (3-5 frases) basado en el presupuesto del usuario. Sin disclaimers largos, sin markdown, sin listas con viñetas. Sé específico con los números que te pasan. Tono cercano, no paternalista. No prometas rentabilidades.",
	de: "Du bist ein praktischer Finanzcoach für Budget Wise. Gib einen kurzen Tipp (3–5 Sätze) zum Budget. Keine langen Disclaimer, kein Markdown, keine Aufzählungen. Sei konkret mit den Zahlen. Warm, nicht belehrend. Keine Renditeversprechen.",
	it: "Sei un coach finanziario pratico per Budget Wise. Dai un consiglio breve (3–5 frasi) sul budget. Niente disclaimer lunghi, markdown o elenchi. Sii specifico con i numeri. Caldo, non moralizzatore. Non promettere rendimenti.",
	fr: "Tu es un coach financier pratique pour Budget Wise. Donne un conseil court (3–5 phrases) basé sur le budget. Pas de longs disclaimers, pas de markdown, pas de listes. Sois précis avec les chiffres. Chaleureux, pas moralisateur. Ne promets pas de rendements.",
	pt: "És um coach financeiro prático para o Budget Wise. Dá um conselho curto (3–5 frases) com base no orçamento. Sem disclaimers longos, markdown ou listas. Sê específico com os números. Acolhedor, não paternalista. Não prometas rendimentos."
};
var getAiTip_createServerFn_handler = createServerRpc({
	id: "1552f2a45c1a1aeb55bef4430ae10c7ee16c0bfb60a8208531133f6d91cc316b",
	name: "getAiTip",
	filename: "src/lib/ai-tip.ts"
}, (opts) => getAiTip.__executeServer(opts));
var getAiTip = createServerFn({ method: "POST" }).validator((input) => schema.parse(input)).handler(getAiTip_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "unavailable"
	};
	const system = SYSTEM[data.lang] ?? SYSTEM.en;
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				max_tokens: 280,
				temperature: .7,
				messages: [{
					role: "system",
					content: system
				}, {
					role: "user",
					content: data.snapshot
				}]
			})
		});
		if (!res.ok) return {
			ok: false,
			error: `xAI API error ${res.status}`
		};
		const text = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
		if (!text) return {
			ok: false,
			error: "empty"
		};
		return {
			ok: true,
			text
		};
	} catch {
		return {
			ok: false,
			error: "network"
		};
	}
});
//#endregion
export { getAiTip_createServerFn_handler };
