import {
  DEFAULT_CREDIT_TAXONOMY_ID,
  getCreditContributionEntries,
  getCreditTaxonomy,
  type CreditTaxonomyId,
} from "../creditTaxonomy";
import type { Author } from "../store";
import { getValidAuthors, latexEscape } from "./utils";

function createRoleRank(creditTaxonomyId: string) {
  return new Map(
    getCreditTaxonomy(creditTaxonomyId).roles.map((role, idx) => [
      role.name,
      idx,
    ]),
  );
}

function sortByTaxonomyRoleOrder(
  roles: string[],
  creditTaxonomyId: string,
): string[] {
  const roleRank = createRoleRank(creditTaxonomyId);

  return [...new Set(roles)].sort((a, b) => {
    const left = roleRank.get(a) ?? Number.MAX_SAFE_INTEGER;
    const right = roleRank.get(b) ?? Number.MAX_SAFE_INTEGER;
    return left - right;
  });
}

export function generateCreditContributionList(
  authors: Author[],
  creditTaxonomyId: CreditTaxonomyId = DEFAULT_CREDIT_TAXONOMY_ID,
): string {
  const creditTaxonomy = getCreditTaxonomy(creditTaxonomyId);
  const validAuthors = getValidAuthors(authors);
  const authorsWithContributions = validAuthors.filter(
    (author) =>
      getCreditContributionEntries(
        author.contributions,
        creditTaxonomy.id as CreditTaxonomyId,
      ).length > 0,
  );

  if (authorsWithContributions.length === 0) {
    return creditTaxonomy.emptyContributionLabel;
  }

  return authorsWithContributions
    .map((author) => {
      const contributions = getCreditContributionEntries(
        author.contributions,
        creditTaxonomy.id as CreditTaxonomyId,
      );
      const orderedRoles = sortByTaxonomyRoleOrder(
        contributions.map((entry) => entry.name),
        creditTaxonomy.id,
      );

      const levelByRole = new Map(
        contributions.map((entry) => [entry.name, entry.level]),
      );
      const leveledRoles = orderedRoles.map((role) => {
        const level = levelByRole.get(role) ?? "high";
        return `${role} (${level})`;
      });

      return `${author.name.trim()}: ${leveledRoles.join(", ")}.`;
    })
    .join("\n");
}

export function generateCreditContributionMatrix(
  authors: Author[],
  creditTaxonomyId: CreditTaxonomyId = DEFAULT_CREDIT_TAXONOMY_ID,
): string {
  const creditTaxonomy = getCreditTaxonomy(creditTaxonomyId);
  const validAuthors = getValidAuthors(authors);
  const authorsWithContributions = validAuthors.filter(
    (author) =>
      getCreditContributionEntries(
        author.contributions,
        creditTaxonomy.id as CreditTaxonomyId,
      ).length > 0,
  );

  if (authorsWithContributions.length === 0) {
    return creditTaxonomy.emptyContributionLabel;
  }

  const orderedRoles = sortByTaxonomyRoleOrder(
    authorsWithContributions.flatMap((author) =>
      getCreditContributionEntries(
        author.contributions,
        creditTaxonomy.id as CreditTaxonomyId,
      ).map((entry) => entry.name),
    ),
    creditTaxonomy.id,
  );

  const columnSpec = `l${"c".repeat(authorsWithContributions.length)}`;
  const headerRow = [
    latexEscape("Role"),
    ...authorsWithContributions.map((author) =>
      latexEscape(author.name.trim()),
    ),
  ].join(" & ");
  const bodyRows = orderedRoles.map((role) => {
    const cells = authorsWithContributions.map((author) => {
      const contributions = getCreditContributionEntries(
        author.contributions,
        creditTaxonomy.id as CreditTaxonomyId,
      );
      const matchingContribution = contributions.find(
        (entry) => entry.name === role,
      );

      if (!matchingContribution) {
        return "";
      }

      return matchingContribution.level === "high" ? "H" : "L";
    });

    return [latexEscape(role), ...cells].join(" & ");
  });

  return [
    `\\begin{tabular}{${columnSpec}}`,
    `${headerRow} \\\\`,
    "\\hline",
    ...bodyRows.map((row) => `${row} \\\\`),
    "\\end{tabular}",
  ].join("\n");
}
