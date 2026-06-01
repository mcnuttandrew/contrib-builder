import { describe, expect, it } from "vitest";

import { parseAuthorNames } from "./authorNames";

describe("parseAuthorNames", () => {
  it("returns empty array for blank input", () => {
    expect(parseAuthorNames("\n \n")).toEqual([]);
  });

  it("splits a single line on commas, semicolons, pipes, and 'and'", () => {
    const input =
      "Ada Lovelace, Alan Turing; Grace Hopper | Barbara Liskov and Donald Knuth";

    expect(parseAuthorNames(input)).toEqual([
      "Ada Lovelace",
      "Alan Turing",
      "Grace Hopper",
      "Barbara Liskov",
      "Donald Knuth",
    ]);
  });

  it("keeps one name per line unless the line has explicit separators", () => {
    const input = [
      "Ada Lovelace",
      "Alan Turing and Grace Hopper",
      "Barbara Liskov",
    ].join("\n");

    expect(parseAuthorNames(input)).toEqual([
      "Ada Lovelace",
      "Alan Turing",
      "Grace Hopper",
      "Barbara Liskov",
    ]);
  });

  it("strips common bullets and numeric list prefixes", () => {
    const input = [
      "- Ada Lovelace",
      "* Alan Turing",
      "1. Grace Hopper",
      "2) Barbara Liskov",
      "3- Donald Knuth",
    ].join("\n");

    expect(parseAuthorNames(input)).toEqual([
      "Ada Lovelace",
      "Alan Turing",
      "Grace Hopper",
      "Barbara Liskov",
      "Donald Knuth",
    ]);
  });
});
