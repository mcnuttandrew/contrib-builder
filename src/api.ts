export function getORCID(name: string): Promise<string[] | string | null> {
  return fetch(`https://pub.orcid.org/v3.0/search/?q=%22${name}%22`, {})
    .then((response) => response.text())
    .then((text) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "application/xml");
      const paths = Array.from(
        xmlDoc.querySelectorAll("result orcid-identifier path"),
      )
        .map((path) => path.textContent?.trim())
        .filter((path): path is string => Boolean(path));

      if (paths.length === 0) return null;
      if (paths.length === 1) return paths[0];
      console.log(paths);
      return paths;
    });
}
