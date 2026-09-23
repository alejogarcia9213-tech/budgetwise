import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  lang: z.enum(["en", "es", "de", "it", "fr", "pt"]),
  snapshot: z.string().max(4000),
  question: z.string().max(500).optional(),
});

const SYSTEM: Record<string, string> = {
  en: "You are a practical financial coach for Budget Wise. Give a short tip (3–5 sentences) based on the user's budget. No long disclaimers, no markdown, no bullet lists. Be specific with the numbers provided. Warm, not preachy. Do not promise returns.",
  es: "Eres un asesor financiero práctico y directo para Budget Wise. Das un consejo breve (3-5 frases) basado en el presupuesto del usuario. Sin disclaimers largos, sin markdown, sin listas con viñetas. Sé específico con los números que te pasan. Tono cercano, no paternalista. No prometas rentabilidades.",
  de: "Du bist ein praktischer Finanzcoach für Budget Wise. Gib einen kurzen Tipp (3–5 Sätze) zum Budget. Keine langen Disclaimer, kein Markdown, keine Aufzählungen. Sei konkret mit den Zahlen. Warm, nicht belehrend. Keine Renditeversprechen.",
  it: "Sei un coach finanziario pratico per Budget Wise. Dai un consiglio breve (3–5 frasi) sul budget. Niente disclaimer lunghi, markdown o elenchi. Sii specifico con i numeri. Caldo, non moralizzatore. Non promettere rendimenti.",
  fr: "Tu es un coach financier pratique pour Budget Wise. Donne un conseil court (3–5 phrases) basé sur le budget. Pas de longs disclaimers, pas de markdown, pas de listes. Sois précis avec les chiffres. Chaleureux, pas moralisateur. Ne promets pas de rendements.",
  pt: "És um coach financeiro prático para o Budget Wise. Dá um conselho curto (3–5 frases) com base no orçamento. Sem disclaimers longos, markdown ou listas. Sê específico com os números. Acolhedor, não paternalista. Não prometas rendimentos.",
};

export const getAiTip = createServerFn({ method: "POST" })
  .validator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "unavailable" };

    const system = SYSTEM[data.lang] ?? SYSTEM.en;

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 280,
          temperature: 0.7,
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: data.question?.trim()
                ? `Budget snapshot:\n${data.snapshot}\n\nQuestion: ${data.question.trim()}\nAnswer only from these numbers. If you cannot, say so.`
                : data.snapshot,
            },
          ],
        }),
      });
      if (!res.ok) return { ok: false as const, error: `xAI API error ${res.status}` };
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = body.choices?.[0]?.message?.content?.trim() ?? "";
      if (!text) return { ok: false as const, error: "empty" };
      return { ok: true as const, text };
    } catch {
      return { ok: false as const, error: "network" };
    }
  });
