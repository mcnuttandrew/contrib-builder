import type { Author } from "../store";
import {
  getValidAuthors,
  latexEscape,
  resolveAffiliation,
  splitAffiliationLines,
} from "./utils";

function formatAffiliation(affiliation: string): string {
  const lines = splitAffiliationLines(affiliation).map((line) =>
    latexEscape(line),
  );

  if (lines.length === 0) {
    return "\\scriptsize Independent Researcher";
  }

  if (lines.length === 1) {
    return `\\scriptsize ${lines[0]}`;
  }

  return `\\parbox{1.7in}{\\scriptsize \\centering ${lines.join(" \\\\ ")}}`;
}

function formatEmail(email: string): string {
  const cleaned = email.trim();
  if (!cleaned) {
    return "";
  }
  return `\\thanks{e-mail: ${latexEscape(cleaned)}}`;
}

function formatSingleAuthor(author: Author): string {
  const name = latexEscape(author.name.trim() || "Anonymous");
  const email = formatEmail(author.email);
  const affiliation = formatAffiliation(resolveAffiliation(author.affiliation));
  return `${name}${email}\\\\ %\n     ${affiliation} %`;
}

export function generateIEEEAuthorList(authors: Author[]): string {
  const validAuthors = getValidAuthors(authors);

  if (validAuthors.length === 0) {
    return "\\author{Anonymous}";
  }

  const body = validAuthors.map(formatSingleAuthor).join("\n\\and ");
  return `\\author{${body}}`;
}
