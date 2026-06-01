import { generateIEEEAuthorList } from "./ieee";
import { generateACMAuthorList } from "./acm";
import { generateCGFAuthorList } from "./cgf";

const templates = {
  ieee: generateIEEEAuthorList,
  acm: generateACMAuthorList,
  cgf: generateCGFAuthorList,
};
export default templates;
