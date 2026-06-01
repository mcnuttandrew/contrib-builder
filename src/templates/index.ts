import { generateIEEEAuthorList } from "./ieee";
import { generateACMAuthorList } from "./acm";
import { generateCGFAuthorList } from "./cgf";
import { generatePlainTextAuthorList } from "./plain-text";

const templates = {
  IEEE: generateIEEEAuthorList,
  ACM: generateACMAuthorList,
  CGF: generateCGFAuthorList,
  "Plain Text": generatePlainTextAuthorList,
};
export default templates;
