import type { Author } from "../store";

const ESCAPE_PATTERN = /[#$%&_{}~^\\]/g;

const ESCAPE_MAP: Record<string, string> = {
  "#": "\\#",
  $: "\\$",
  "%": "\\%",
  "&": "\\&",
  _: "\\_",
  "{": "\\{",
  "}": "\\}",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
  "\\": "\\textbackslash{}",
};

export function latexEscape(value: string): string {
  return value.replace(ESCAPE_PATTERN, (char) => ESCAPE_MAP[char] ?? char);
}

export function resolveAffiliation(affiliation: Author["affiliation"]): string {
  if (typeof affiliation === "string") {
    return affiliation;
  }

  if (Array.isArray(affiliation)) {
    return affiliation[0] ?? "";
  }

  return "";
}

export function normalizeORCID(orcid: string): string {
  return orcid.trim().replace(/^https?:\/\/orcid\.org\//i, "");
}

export function splitAffiliationLines(affiliation: string): string[] {
  return affiliation
    .split(/\r?\n|\s*;\s*/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getValidAuthors(authors: Author[]): Author[] {
  return authors.filter((author) => author.name.trim().length > 0);
}
