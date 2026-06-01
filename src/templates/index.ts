import { generateIEEEAuthorList } from "./ieee";
import { generateACMAuthorList } from "./acm";
import { generateCGFAuthorList } from "./cgf";
import { generateCreditContributionList } from "./credit";
import { generatePlainTextAuthorList } from "./plain-text";

const templates = {
  IEEE: generateIEEEAuthorList,
  ACM: generateACMAuthorList,
  CGF: generateCGFAuthorList,
  CRediT: generateCreditContributionList,
  "Plain Text": generatePlainTextAuthorList,
};
export default templates;
