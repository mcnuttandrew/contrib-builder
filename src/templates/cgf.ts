import type { Author } from "../store";
import {
  getValidAuthors,
  latexEscape,
  normalizeORCID,
  resolveAffiliation,
  splitAffiliationLines,
} from "./utils";

function splitName(name: string): { given: string[]; family: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { given: [], family: parts[0] ?? "Anonymous" };
  }
  return {
    given: parts.slice(0, -1),
    family: parts[parts.length - 1],
  };
}

function abbreviatedName(name: string): string {
  const { given, family } = splitName(name);
  if (given.length === 0) {
    return latexEscape(family);
  }

  const initials = given
    .map((part) => latexEscape(part.charAt(0).toUpperCase()) + ".")
    .join("\\,");
  return `${initials} ${latexEscape(family)}`;
}

function surname(name: string): string {
  const { family } = splitName(name);
  return latexEscape(family);
}

function buildShortList(authors: Author[]): string {
  const surnames = authors.map((author) => surname(author.name));

  if (surnames.length <= 3) {
    return surnames.join(", ");
  }

  return `${surnames.slice(0, 3).join(", ")}, \\etal{}`;
}

function buildAffiliationMap(authors: Author[]): Map<string, number> {
  const entries = authors
    .map((author) => resolveAffiliation(author.affiliation).trim())
    .filter(Boolean);

  const unique = Array.from(new Set(entries));
  const mapped = new Map<string, number>();
  unique.forEach((affiliation, idx) => {
    mapped.set(affiliation, idx + 1);
  });
  return mapped;
}

function buildAuthorLine(author: Author, affiliationIndex: number): string {
  const pieces: string[] = [
    `${abbreviatedName(author.name)}$^{${affiliationIndex}}$`,
  ];

  if (author.orcid && typeof author.orcid === "string") {
    const normalized = normalizeORCID(author.orcid);
    if (normalized) {
      pieces.push(`\\orcid{${latexEscape(normalized)}}`);
    }
  }

  return pieces.join("");
}

function joinHumanList(values: string[]): string {
  if (values.length <= 1) {
    return values[0] ?? "";
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

export function generateCGFAuthorList(authors: Author[]): string {
  const validAuthors = getValidAuthors(authors);

  if (validAuthors.length === 0) {
    return "\\author[Anon]\n{\n  anon \\\\ \n  {}\n}";
  }

  const affiliationMap = buildAffiliationMap(validAuthors);

  const authorLines = validAuthors.map((author) => {
    const key = resolveAffiliation(author.affiliation).trim();
    const affiliationIndex = affiliationMap.get(key) ?? 1;
    return buildAuthorLine(author, affiliationIndex);
  });

  const affiliationLines = Array.from(affiliationMap.entries()).map(
    ([affiliation, idx]) => {
      const label = `$^${idx}$`;
      const lines = splitAffiliationLines(affiliation).map((line) =>
        latexEscape(line),
      );
      return `${label}${lines.join(" \\\\ ")}`;
    },
  );

  const authorBlock = joinHumanList(authorLines);
  const affiliationBlock =
    affiliationLines.length > 0
      ? affiliationLines.join("\\\\\n         ")
      : "$^1$Independent Researcher";

  return `\\author[${buildShortList(validAuthors)}]\n{\\parbox{\\textwidth}{\\centering\n    ${authorBlock}\n}\n        \\\\ \n{\\parbox{\\textwidth}{\\centering ${affiliationBlock}\n       }\n}\n}`;
}
