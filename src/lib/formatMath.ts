/**
 * Utility to clean, sanitize, and format scientific/mathematical text from AI generation.
 * Converts raw LaTeX macros (\frac, \sqrt, \text, Greek letters, etc.) and malformed
 * tokens (like /$fraction/) into clean, human-readable Unicode scientific notation.
 */

/**
 * Replaces \frac{numerator}{denominator} and \dfrac{...}{...} with clean (num)/(den) or num/den notation.
 * Uses balanced brace parsing to correctly handle nested braces like \frac{1}{2\pi\sqrt{LC}}.
 */
function replaceFractions(input: string): string {
  let text = input;

  // 1. First clean any malformed tokens like /$fraction/a/b or /\$fraction/ or similar artifacts
  text = text.replace(/\/?\$?fraction\/?/gi, "/");

  // 2. Parse \frac{...}{...} and \dfrac{...}{...}
  const fracRegex = /\\(?:d?frac)\s*\{/i;

  let iterations = 0;
  while (fracRegex.test(text) && iterations < 50) {
    iterations++;
    const match = fracRegex.exec(text);
    if (!match) break;

    const startIdx = match.index;
    const numStart = startIdx + match[0].length;

    // Find closing brace of numerator
    let depth = 1;
    let numEnd = -1;
    for (let i = numStart; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") {
        depth--;
        if (depth === 0) {
          numEnd = i;
          break;
        }
      }
    }

    if (numEnd === -1) {
      // Unmatched brace, strip \frac{ to just (
      text = text.replace(/\\(?:d?frac)\s*\{/i, "(");
      continue;
    }

    const numerator = text.substring(numStart, numEnd).trim();

    // Look for denominator starting with {
    let denomStartCandidate = text.indexOf("{", numEnd);
    if (denomStartCandidate === -1 || text.substring(numEnd + 1, denomStartCandidate).trim() !== "") {
      // Malformed denominator, just replace numerator part
      text = text.substring(0, startIdx) + numerator + text.substring(numEnd + 1);
      continue;
    }

    const denomStart = denomStartCandidate + 1;
    depth = 1;
    let denomEnd = -1;
    for (let i = denomStart; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") {
        depth--;
        if (depth === 0) {
          denomEnd = i;
          break;
        }
      }
    }

    if (denomEnd === -1) {
      text = text.substring(0, startIdx) + numerator + "/" + text.substring(denomStart);
      continue;
    }

    const denominator = text.substring(denomStart, denomEnd).trim();

    // Recursively clean inside numerator and denominator
    const cleanNum = replaceFractions(numerator);
    const cleanDen = replaceFractions(denominator);

    // Format neatly: if single term or number, don't over-parenthesize
    const isSimpleNum = /^[a-zA-Z0-9_\^]+$/.test(cleanNum);
    const isSimpleDen = /^[a-zA-Z0-9_\^]+$/.test(cleanDen);

    const formattedNum = isSimpleNum ? cleanNum : `(${cleanNum})`;
    const formattedDen = isSimpleDen ? cleanDen : `(${cleanDen})`;

    const replacement = `${formattedNum} / ${formattedDen}`;
    text = text.substring(0, startIdx) + replacement + text.substring(denomEnd + 1);
  }

  // Handle single character \frac 1 2 without braces if any
  text = text.replace(/\\(?:d?frac)\s+([a-zA-Z0-9])\s+([a-zA-Z0-9])/gi, "$1 / $2");

  return text;
}

/**
 * Replaces \sqrt{x} and \sqrt[n]{x} with √(x) notation.
 */
function replaceSquareRoots(input: string): string {
  let text = input;

  const sqrtRegex = /\\sqrt\s*(?:\[([^\]]+)\])?\s*\{/i;
  let iterations = 0;
  while (sqrtRegex.test(text) && iterations < 30) {
    iterations++;
    const match = sqrtRegex.exec(text);
    if (!match) break;

    const startIdx = match.index;
    const rootDegree = match[1]; // e.g. "3" for cube root
    const contentStart = startIdx + match[0].length;

    let depth = 1;
    let contentEnd = -1;
    for (let i = contentStart; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") {
        depth--;
        if (depth === 0) {
          contentEnd = i;
          break;
        }
      }
    }

    if (contentEnd === -1) {
      text = text.replace(/\\sqrt\s*(?:\[([^\]]+)\])?\s*\{/i, "√(");
      continue;
    }

    const innerContent = text.substring(contentStart, contentEnd).trim();
    const cleanInner = replaceSquareRoots(innerContent);
    const prefix = rootDegree ? `${rootDegree}√` : "√";
    const replacement = `${prefix}(${cleanInner})`;

    text = text.substring(0, startIdx) + replacement + text.substring(contentEnd + 1);
  }

  return text;
}

/**
 * Full pipeline to transform any raw LaTeX / math notation into clean human-readable scientific text.
 */
export function cleanScientificText(rawInput: string | undefined | null): string {
  if (!rawInput) return "";
  let text = String(rawInput);

  // 1. Replace fractions
  text = replaceFractions(text);

  // 2. Replace roots
  text = replaceSquareRoots(text);

  // 3. Common Greek symbols replacement
  const greekMap: Record<string, string> = {
    "\\\\Delta": "Δ",
    "\\\\delta": "δ",
    "\\\\mu": "μ",
    "\\\\alpha": "α",
    "\\\\beta": "β",
    "\\\\gamma": "γ",
    "\\\\Gamma": "Γ",
    "\\\\theta": "θ",
    "\\\\Theta": "Θ",
    "\\\\lambda": "λ",
    "\\\\Lambda": "Λ",
    "\\\\pi": "π",
    "\\\\Pi": "Π",
    "\\\\omega": "ω",
    "\\\\Omega": "Ω",
    "\\\\phi": "φ",
    "\\\\Phi": "Φ",
    "\\\\psi": "ψ",
    "\\\\rho": "ρ",
    "\\\\sigma": "σ",
    "\\\\Sigma": "Σ",
    "\\\\tau": "τ",
    "\\\\eta": "η",
    "\\\\nu": "ν",
    "\\\\epsilon": "ε",
    "\\\\varepsilon": "ε",
    "\\\\kappa": "κ",
    "\\\\chi": "χ",
    "\\\\zeta": "ζ",
  };

  // Also match single backslash versions
  for (const [key, val] of Object.entries(greekMap)) {
    const singleSlash = key.replace(/\\\\/g, "\\");
    const regex = new RegExp(`${key}|${singleSlash.replace(/\\/g, "\\\\")}(?![a-zA-Z])`, "g");
    text = text.replace(regex, val);
  }

  // 4. Mathematical Operators and Symbols
  text = text
    .replace(/\\(?:times|cdot|bullet)/gi, " × ")
    .replace(/\\pm/gi, " ± ")
    .replace(/\\approx/gi, " ≈ ")
    .replace(/\\neq/gi, " ≠ ")
    .replace(/\\(?:le|leq)(?![a-zA-Z])/gi, " ≤ ")
    .replace(/\\(?:ge|geq)(?![a-zA-Z])/gi, " ≥ ")
    .replace(/\\infty/gi, "∞")
    .replace(/\\(?:to|rightarrow)(?![a-zA-Z])/gi, " → ")
    .replace(/\\rightleftharpoons/gi, " ⇌ ")
    .replace(/\\leftarrow/gi, " ← ")
    .replace(/\\(?:circ|\^\\circ|\^\{\\circ\}|\^\circ)/gi, "°")
    .replace(/\\%/g, "%")
    .replace(/\\degree/gi, "°");

  // 5. LaTeX text blocks: \text{...}, \mathrm{...}, \mathbf{...}, \mathit{...}, \pu{...}, \ce{...}
  text = text.replace(/\\(?:text|mathrm|mathbf|mathit|pu|ce|operatorname)\s*\{([^}]+)\}/gi, "$1");

  // 6. Clean \left and \right delimiters
  text = text
    .replace(/\\left\(/gi, "(")
    .replace(/\\right\)/gi, ")")
    .replace(/\\left\[/gi, "[")
    .replace(/\\right\]/gi, "]")
    .replace(/\\left\\\{/gi, "{")
    .replace(/\\right\\\}/gi, "}")
    .replace(/\\left\|/gi, "|")
    .replace(/\\right\|/gi, "|");

  // 7. Math functions (\sin, \cos, \tan, \ln, \log)
  text = text.replace(/\\(sin|cos|tan|cot|sec|cosec|ln|log|exp)(?![a-zA-Z])/gi, "$1");

  // 8. Subscripts and Superscripts braces: e.g. C_{1} -> C1, 10^{-2} -> 10^-2, x^{2} -> x^2
  text = text.replace(/_\{([^}]+)\}/g, "$1");
  text = text.replace(/\^\{([^}]+)\}/g, "^$1");

  // 9. Remove stray LaTeX inline math delimiters ($...$, $$...$$, \(...\), \[...\])
  text = text
    .replace(/\$\$/g, "")
    .replace(/\$/g, "")
    .replace(/\\\(/g, "")
    .replace(/\\\)/g, "")
    .replace(/\\\[/g, "")
    .replace(/\\\]/g, "");

  // 10. Clean any leftover rogue backslashes before alphanumeric words (e.g. \DeltaU -> ΔU, \muF -> μF)
  text = text.replace(/\\([a-zA-Z0-9])/g, "$1");

  // 11. Normalize excessive whitespace
  text = text.replace(/[ \t]+/g, " ").replace(/\s+([.,;:!?)])/g, "$1").trim();

  return text;
}

/**
 * Cleans an entire question object (stem, options, and explanation)
 */
export function cleanQuestionObject<T extends {
  questionText: string;
  options: string[];
  explanation?: string | null;
}>(q: T): T {
  return {
    ...q,
    questionText: cleanScientificText(q.questionText),
    options: Array.isArray(q.options)
      ? q.options.map((opt) => cleanScientificText(opt))
      : [],
    explanation: q.explanation ? cleanScientificText(q.explanation) : q.explanation,
  };
}
