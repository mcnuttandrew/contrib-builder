import { describe, expect, it } from "vitest";
import type { Author } from "../store";
import templates from "./index";

const generateIEEEAuthorList = templates["IEEE"];
const generateACMAuthorList = templates["ACM"];
const generateCGFAuthorList = templates["CGF"];
const generateCreditContributionList = templates["Contributions"];
const generateCreditContributionMatrix = templates["Contribution Matrix"];
const generatePlainTextAuthorList = templates["Plain Text"];
import {
  setCreditContributions,
  setCreditContributionLevel,
  DEFAULT_CREDIT_TAXONOMY_ID,
  LEGACY_CREDIT_TAXONOMY_ID,
} from "../creditTaxonomy";

function makeAuthor(overrides: Partial<Author>): Author {
  return {
    name: "",
    email: "",
    affiliation: "",
    orcid: null,
    contributions: {},
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
      makeAuthor({
        name: "Alan Turing",
        contributions: setCreditContributions(
          {},
          DEFAULT_CREDIT_TAXONOMY_ID,
          [],
        ),
      }),
    ]);

    expect(output).toBe("No CReDIT-fAIR contributions assigned.");
    expect(output).toMatchSnapshot();
  });

  it("renders per-author roles in Ground Works taxonomy order", () => {
    const alanContributions = setCreditContributionLevel(
      setCreditContributions({}, DEFAULT_CREDIT_TAXONOMY_ID, [
        "Methodology",
        "Writing – review & editing",
      ]),
      DEFAULT_CREDIT_TAXONOMY_ID,
      "Methodology",
      "low",
    );

    const output = generateCreditContributionList(
      [
        makeAuthor({
          name: "Ada Lovelace",
          contributions: setCreditContributions(
            {},
            DEFAULT_CREDIT_TAXONOMY_ID,
            ["Production - Technical", "Conceptualization", "Validation"],
          ),
        }),
        makeAuthor({
          name: "Alan Turing",
          contributions: alanContributions,
        }),
      ],
      DEFAULT_CREDIT_TAXONOMY_ID,
    );

    expect(output).toBe(
      "Ada Lovelace: Conceptualization (high), Production - Technical (high), Validation (high).\nAlan Turing: Methodology (low), Writing – review & editing (high).",
    );
    expect(output).toMatchSnapshot();
  });

  it("renders legacy CRediT roles when that taxonomy is selected", () => {
    const output = generateCreditContributionList(
      [
        makeAuthor({
          name: "Ada Lovelace",
          contributions: setCreditContributions({}, LEGACY_CREDIT_TAXONOMY_ID, [
            "Software",
            "Conceptualization",
            "Validation",
          ]),
        }),
        makeAuthor({
          name: "Alan Turing",
          contributions: setCreditContributions({}, LEGACY_CREDIT_TAXONOMY_ID, [
            "Methodology",
            "Writing - review and editing",
          ]),
        }),
      ],
      LEGACY_CREDIT_TAXONOMY_ID,
    );

    expect(output).toBe(
      "Ada Lovelace: Conceptualization (high), Software (high), Validation (high).\nAlan Turing: Methodology (high), Writing - review and editing (high).",
    );
    expect(output).toMatchSnapshot();
  });
});

describe("generateCreditContributionMatrix", () => {
  it("returns fallback when no valid contributions are set", () => {
    const output = generateCreditContributionMatrix([
      makeAuthor({ name: "Ada Lovelace" }),
      makeAuthor({
        name: "Alan Turing",
        contributions: setCreditContributions(
          {},
          DEFAULT_CREDIT_TAXONOMY_ID,
          [],
        ),
      }),
    ]);

    expect(output).toBe("No CReDIT-fAIR contributions assigned.");
    expect(output).toMatchSnapshot();
  });

  it("renders a latex matrix in Ground Works taxonomy order", () => {
    const alanContributions = setCreditContributionLevel(
      setCreditContributions({}, DEFAULT_CREDIT_TAXONOMY_ID, [
        "Methodology",
        "Writing – review & editing",
      ]),
      DEFAULT_CREDIT_TAXONOMY_ID,
      "Methodology",
      "low",
    );

    const output = generateCreditContributionMatrix(
      [
        makeAuthor({
          name: "Ada Lovelace",
          contributions: setCreditContributions(
            {},
            DEFAULT_CREDIT_TAXONOMY_ID,
            ["Production - Technical", "Conceptualization", "Validation"],
          ),
        }),
        makeAuthor({
          name: "Alan Turing",
          contributions: alanContributions,
        }),
        makeAuthor({ name: "   " }),
      ],
      DEFAULT_CREDIT_TAXONOMY_ID,
    );

    expect(output).toBe(
      [
        "\\begin{tabular}{lcc}",
        "Role & Ada Lovelace & Alan Turing \\\\",
        "\\hline",
        "Conceptualization & H &  \\\\",
        "Methodology &  & L \\\\",
        "Production - Technical & H &  \\\\",
        "Validation & H &  \\\\",
        "Writing – review \\& editing &  & H \\\\",
        "\\end{tabular}",
      ].join("\n"),
    );
    expect(output).toMatchSnapshot();
  });

  it("renders legacy CRediT role names when that taxonomy is selected", () => {
    const output = generateCreditContributionMatrix(
      [
        makeAuthor({
          name: "Ada Lovelace",
          contributions: setCreditContributions({}, LEGACY_CREDIT_TAXONOMY_ID, [
            "Software",
            "Conceptualization",
            "Validation",
          ]),
        }),
        makeAuthor({
          name: "Alan Turing",
          contributions: setCreditContributions({}, LEGACY_CREDIT_TAXONOMY_ID, [
            "Methodology",
            "Writing - review and editing",
          ]),
        }),
      ],
      LEGACY_CREDIT_TAXONOMY_ID,
    );

    expect(output).toContain("Role & Ada Lovelace & Alan Turing \\\\");
    expect(output).toContain("Software & H &  \\\\");
    expect(output).toContain("Writing - review and editing &  & H \\\\");
    expect(output).toMatchSnapshot();
  });
});
