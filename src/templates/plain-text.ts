import type { Author } from "../store";
import { getValidAuthors } from "./utils";

export function generatePlainTextAuthorList(authors: Author[]): string {
  const validAuthors = getValidAuthors(authors);

  if (validAuthors.length === 0) {
    return "Anonymous";
  }

  return validAuthors.map((x) => x.name).join(", ");
}
