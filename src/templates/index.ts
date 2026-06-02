import { generateIEEEAuthorList } from "./ieee";
import { generateACMAuthorList } from "./acm";
import { generateCGFAuthorList } from "./cgf";
import {
  generateCreditContributionList,
  generateCreditContributionMatrix,
} from "./credit";
import { generatePlainTextAuthorList } from "./plain-text";
import type { CreditTaxonomyId } from "../creditTaxonomy";

type TemplateGenerator = (
  authors: Parameters<typeof generateIEEEAuthorList>[0],
  creditTaxonomyId?: CreditTaxonomyId,
) => string;

const templates: Record<string, TemplateGenerator> = {
  IEEE: generateIEEEAuthorList,
  ACM: generateACMAuthorList,
  CGF: generateCGFAuthorList,
  Contributions: generateCreditContributionList,
  "Contribution Matrix": generateCreditContributionMatrix,
  "Plain Text": generatePlainTextAuthorList,
};
export default templates;
