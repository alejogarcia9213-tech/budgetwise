import { roundMoney } from "./money";

/**
 * Evaluates a typed money expression: 45+9, 60-19, 10/5, 45.67*2, (40+10)*2.
 * Returns null if the string is incomplete or invalid.
 */
export function evalAmountExpr(raw: string): number | null {
  const src = raw.trim().replace(/\s+/g, "").replace(/,/g, ".");
  if (!src) return 0;
  let i = 0;
  const peek = () => src[i] ?? "";
  const eat = () => src[i++] ?? "";

  function number(): number | null {
    const m = /^\d+(?:\.\d+)?/.exec(src.slice(i));
    if (!m) return null;
    i += m[0].length;
    const n = Number(m[0]);
    return Number.isFinite(n) ? n : null;
  }

  function factor(): number | null {
    if (peek() === "+") {
      eat();
      return factor();
    }
    if (peek() === "-") {
      eat();
      const v = factor();
      return v == null ? null : -v;
    }
    if (peek() === "(") {
      eat();
      const v = expr();
      if (peek() !== ")") return null;
      eat();
      return v;
    }
    return number();
  }

  function term(): number | null {
    let v = factor();
    if (v == null) return null;
    while (peek() === "*" || peek() === "/") {
      const op = eat();
      const r = factor();
      if (r == null) return null;
      if (op === "/") {
        if (r === 0) return null;
        v /= r;
      } else {
        v *= r;
      }
    }
    return v;
  }

  function expr(): number | null {
    let v = term();
    if (v == null) return null;
    while (peek() === "+" || peek() === "-") {
      const op = eat();
      const r = term();
      if (r == null) return null;
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }

  const value = expr();
  if (value == null || i !== src.length || !Number.isFinite(value)) return null;
  return roundMoney(value);
}
