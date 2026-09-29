import type { Phase8Analysis } from "@/features/ai/types";

/** Line prefixes the backend composes into `response` that belong in secondary UI. */
const METADATA_PREFIXES = [
  "Question understood:",
  "Date range:",
  "SQL:",
  "Assumptions:",
  "Chart hint:",
  "Notes:",
] as const;

const PREFIX_PATTERN = new RegExp(
  `^(${METADATA_PREFIXES.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\s*`,
  "i",
);

function isMetadataStart(line: string): boolean {
  return PREFIX_PATTERN.test(line.trim());
}

function looksLikeSqlContinuation(line: string): boolean {
  if (
    /^(WITH|SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP|ORDER|HAVING|UNION|AND|OR|ON|AS|LIMIT|CASE|WHEN|THEN|ELSE|END|COALESCE|SUM|COUNT|AVG|MIN|MAX)\b/i.test(
      line,
    )
  ) {
    return true;
  }
  if (/^[),]/.test(line) || /[(),]$/.test(line) || line.endsWith(",")) {
    return true;
  }
  return false;
}

/**
 * Strip composed metadata lines from the chat `response` string.
 * Keeps measured findings / analysis / trend / insights / recommendations prose.
 */
export function stripComposedMetadata(response: string): string {
  const lines = response.replace(/\r\n/g, "\n").split("\n");
  const kept: string[] = [];
  let skipping = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (isMetadataStart(trimmed)) {
      skipping = true;
      continue;
    }

    if (skipping) {
      if (trimmed === "") {
        skipping = false;
        continue;
      }
      if (/^[-*•]/.test(trimmed) || /^\d+[.)]/.test(trimmed)) {
        continue;
      }
      if (looksLikeSqlContinuation(trimmed)) {
        continue;
      }
      // Prose after metadata — start of the user-facing answer
      skipping = false;
      kept.push(line);
      continue;
    }

    kept.push(line);
  }

  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Prefer structured facts; otherwise a readable strip of the composed response. */
export function derivePrimaryAnswer(
  analysis: Phase8Analysis | null | undefined,
  response: string,
): { facts: string[]; text: string } {
  const facts = analysis?.facts?.filter((f) => f.trim()) ?? [];
  if (facts.length > 0) {
    return { facts, text: "" };
  }
  return { facts: [], text: stripComposedMetadata(response) };
}
