import type { Author } from "../store";
import {
  getValidAuthors,
  latexEscape,
  normalizeORCID,
  resolveAffiliation,
  splitAffiliationLines,
} from "./utils";

function buildAuthorBlock(author: Author): string {
  const lines: string[] = [];
  const safeName = latexEscape(author.name.trim() || "Anonymous");
  lines.push(`\\author{${safeName}}`);

  if (author.orcid && typeof author.orcid === "string") {
    const normalized = normalizeORCID(author.orcid);
    if (normalized) {
      lines.push(`\\orcid{${latexEscape(normalized)}}`);
    }
  }

  const affiliationLines = splitAffiliationLines(
    resolveAffiliation(author.affiliation),
  );
  if (affiliationLines.length > 0) {
    lines.push("\\affiliation{%");
    affiliationLines.forEach((line) => {
      lines.push(`  \\institution{${latexEscape(line)}}`);
    });
    lines.push("}");
  }

  const email = author.email.trim();
  if (email) {
    lines.push(`\\email{${latexEscape(email)}}`);
  }

  return lines.join("\n");
}

export function generateACMAuthorList(authors: Author[]): string {
  const validAuthors = getValidAuthors(authors);

  if (validAuthors.length === 0) {
    return "\\author{Anonymous}";
  }

  return validAuthors.map(buildAuthorBlock).join("\n\n");
}
