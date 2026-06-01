import { CREDIT_CONTRIBUTION_ROLES } from "../creditTaxonomy";
import type { Author } from "../store";
import { getValidAuthors } from "./utils";

const roleRank = new Map(
  CREDIT_CONTRIBUTION_ROLES.map((role, idx) => [role.name, idx]),
);

function sortByTaxonomyRoleOrder(roles: string[]): string[] {
  return [...new Set(roles)].sort((a, b) => {
    const left = roleRank.get(a) ?? Number.MAX_SAFE_INTEGER;
    const right = roleRank.get(b) ?? Number.MAX_SAFE_INTEGER;
    return left - right;
  });
}

export function generateCreditContributionList(authors: Author[]): string {
  const validAuthors = getValidAuthors(authors);
  const authorsWithContributions = validAuthors.filter(
    (author) => author.contributions.length > 0,
  );

  if (authorsWithContributions.length === 0) {
    return "No CRediT contributions assigned.";
  }

  return authorsWithContributions
    .map((author) => {
      const orderedRoles = sortByTaxonomyRoleOrder(author.contributions);
      return `${author.name.trim()}: ${orderedRoles.join(", ")}.`;
    })
    .join("\n");
}
