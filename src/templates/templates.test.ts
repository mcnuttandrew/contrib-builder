import { describe, expect, it } from "vitest";

import type { Author } from "../store";
import { generateACMAuthorList } from "./acm";
import { generateCGFAuthorList } from "./cgf";
import { generateCreditContributionList } from "./credit";
import { generateIEEEAuthorList } from "./ieee";
import { generatePlainTextAuthorList } from "./plain-text";

function makeAuthor(overrides: Partial<Author>): Author {
  return {
    name: "",
    email: "",
    affiliation: "",
    orcid: null,
    contributions: [],
    ...overrides,
  };
}

describe("generateIEEEAuthorList", () => {
  it("returns anonymous fallback when there are no valid authors", () => {
    const output = generateIEEEAuthorList([makeAuthor({ name: "   " })]);
    expect(output).toBe("\\author{Anonymous}");
    expect(output).toMatchSnapshot();
  });

  it("formats name, email and affiliation for valid authors", () => {
    const output = generateIEEEAuthorList([
      makeAuthor({
        name: "Ada Lovelace",
        email: "ada@example.com",
        affiliation: "University of Example",
      }),
    ]);

    expect(output).toContain("\\author{");
    expect(output).toContain("Ada Lovelace");
    expect(output).toContain("\\thanks{e-mail: ada@example.com}");
    expect(output).toContain("\\scriptsize University of Example");
    expect(output).toMatchSnapshot();
  });
});

describe("generateACMAuthorList", () => {
  it("returns anonymous fallback when there are no valid authors", () => {
    const output = generateACMAuthorList([makeAuthor({ name: "" })]);
    expect(output).toBe("\\author{Anonymous}");
    expect(output).toMatchSnapshot();
  });

  it("includes orcid, affiliation institutions, and email", () => {
    const output = generateACMAuthorList([
      makeAuthor({
        name: "Grace Hopper",
        email: "grace@example.com",
        affiliation: "US Navy; Harvard University",
        orcid: "https://orcid.org/0000-0001-2345-6789",
      }),
    ]);

    expect(output).toContain("\\author{Grace Hopper}");
    expect(output).toContain("\\orcid{0000-0001-2345-6789}");
    expect(output).toContain("\\institution{US Navy}");
    expect(output).toContain("\\institution{Harvard University}");
    expect(output).toContain("\\email{grace@example.com}");
    expect(output).toMatchSnapshot();
  });
});

describe("generateCGFAuthorList", () => {
  it("returns anonymous fallback when there are no valid authors", () => {
    const output = generateCGFAuthorList([makeAuthor({ name: "\n" })]);
    expect(output).toContain("\\author[Anon]");
    expect(output).toContain("anon");
    expect(output).toMatchSnapshot();
  });

  it("builds short list and affiliation mapping across authors", () => {
    const output = generateCGFAuthorList([
      makeAuthor({
        name: "Ada Lovelace",
        affiliation: "University A",
        orcid: "0000-0001-1111-1111",
      }),
      makeAuthor({
        name: "Alan Turing",
        affiliation: "University B",
      }),
      makeAuthor({
        name: "Grace Hopper",
        affiliation: "University A",
      }),
      makeAuthor({
        name: "Barbara Liskov",
        affiliation: "University C",
      }),
    ]);

    expect(output).toContain("\\author[Lovelace, Turing, Hopper, \\etal{}]");
    expect(output).toContain("A. Lovelace$^{1}$\\orcid{0000-0001-1111-1111}");
    expect(output).toContain("A. Turing$^{2}$");
    expect(output).toContain("G. Hopper$^{1}$");
    expect(output).toContain("B. Liskov$^{3}$");
    expect(output).toContain("$^1$University A");
    expect(output).toContain("$^2$University B");
    expect(output).toContain("$^3$University C");
    expect(output).toMatchSnapshot();
  });
});

describe("generatePlainTextAuthorList", () => {
  it("returns anonymous fallback when there are no valid authors", () => {
    const output = generatePlainTextAuthorList([makeAuthor({ name: "  " })]);
    expect(output).toBe("Anonymous");
    expect(output).toMatchSnapshot();
  });

  it("returns a comma-separated list of author names", () => {
    const output = generatePlainTextAuthorList([
      makeAuthor({ name: "Ada Lovelace" }),
      makeAuthor({ name: "Alan Turing" }),
      makeAuthor({ name: "Grace Hopper" }),
    ]);

    expect(output).toBe("Ada Lovelace, Alan Turing, Grace Hopper");
    expect(output).toMatchSnapshot();
  });
});

describe("generateCreditContributionList", () => {
  it("returns fallback when no valid contributions are set", () => {
    const output = generateCreditContributionList([
      makeAuthor({ name: "Ada Lovelace" }),
      makeAuthor({ name: "Alan Turing", contributions: [] }),
    ]);

    expect(output).toBe("No CRediT contributions assigned.");
    expect(output).toMatchSnapshot();
  });

  it("renders per-author CRediT roles in taxonomy order", () => {
    const output = generateCreditContributionList([
      makeAuthor({
        name: "Ada Lovelace",
        contributions: ["Software", "Conceptualization", "Validation"],
      }),
      makeAuthor({
        name: "Alan Turing",
        contributions: ["Methodology", "Writing - review and editing"],
      }),
    ]);

    expect(output).toBe(
      "Ada Lovelace: Conceptualization, Software, Validation.\nAlan Turing: Methodology, Writing - review and editing.",
    );
    expect(output).toMatchSnapshot();
  });
});
