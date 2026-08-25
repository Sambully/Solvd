/**
 * Utility to clean, sanitize, and validate AI-generated SVG diagrams
 * ensuring safety, responsive layout, and dark/light mode compatibility.
 */

export function sanitizeAndCleanSvg(rawSvg: string | null | undefined): string | null {
  if (!rawSvg) return null;

  let cleaned = rawSvg.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:svg|xml|html)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }

  // Extract the outermost <svg>...</svg> block if there is surrounding text
  const svgMatch = cleaned.match(/<svg[\s\S]*?<\/svg>/i);
  if (!svgMatch) {
    return null;
  }

  let svg = svgMatch[0];

  // 1. Remove dangerous executable tags
  svg = svg.replace(/<\/?(script|iframe|object|embed|foreignObject|meta|link|style)[^>]*>/gi, "");

  // 2. Remove all inline event handlers (e.g. onload, onerror, onclick, etc.)
  svg = svg.replace(/\s+on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "");

  // 3. Remove javascript: or data: in href/xlink:href attributes
  svg = svg.replace(/(?:href|xlink:href)\s*=\s*["']\s*(?:javascript|data):[^"']*["']/gi, "");

  // 4. Ensure xmlns and responsive attributes
  if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svg = svg.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Check for viewBox, if missing provide default
  if (!svg.includes("viewBox") && !svg.includes("viewbox")) {
    svg = svg.replace(/<svg/i, '<svg viewBox="0 0 440 220"');
  }

  return svg;
}
