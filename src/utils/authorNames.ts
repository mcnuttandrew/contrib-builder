export function parseAuthorNames(value: string): string[] {
  const cleanedLines = value
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .replace(/^[-*]\s+/, "")
        .replace(/^\d+[.)-]?\s+/, ""),
    )
    .filter(Boolean);

  if (cleanedLines.length === 0) {
    return [];
  }

  const splitPattern = /\s*(?:[,;|]|\band\b)\s*/i;
  const names =
    cleanedLines.length === 1
      ? cleanedLines[0].split(splitPattern)
      : cleanedLines.flatMap((line) =>
          /[;|]|\band\b/i.test(line) ? line.split(splitPattern) : [line],
        );

  return names.map((name) => name.trim()).filter(Boolean);
}
