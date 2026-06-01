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

export interface ORCIDAuthorInfo {
  name?: string;
  email?: string;
  affiliation?: string | string[];
}

function normalizeORCID(orcid: string): string {
  return orcid.trim().replace(/^https?:\/\/orcid\.org\//i, "");
}

export async function getAuthorInfoFromORCID(
  orcid: string,
): Promise<ORCIDAuthorInfo | null> {
  const normalized = normalizeORCID(orcid);
  if (!normalized) {
    return null;
  }

  const response = await fetch(
    `https://pub.orcid.org/v3.0/${normalized}/record`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const givenName = data?.person?.name?.["given-names"]?.value?.trim() ?? "";
  const familyName = data?.person?.name?.["family-name"]?.value?.trim() ?? "";
  const name = [givenName, familyName].filter(Boolean).join(" ");

  const email =
    data?.person?.emails?.email
      ?.map((entry: any) => entry?.email?.trim())
      .find(
        (value: unknown) => typeof value === "string" && value.length > 0,
      ) ?? "";

  const employmentGroups =
    data?.["activities-summary"]?.employments?.["affiliation-group"] ?? [];
  const educationGroups =
    data?.["activities-summary"]?.educations?.["affiliation-group"] ?? [];

  const organizationsFromGroups = (groups: any[], summaryKey: string) =>
    groups
      .flatMap((group: any) => group?.summaries ?? [])
      .map((summary: any) => {
        const org = summary?.[summaryKey]?.organization;
        const namePart = org?.name?.trim();
        const cityPart = org?.address?.city?.trim();
        const countryPart = org?.address?.country?.trim();
        return [namePart, cityPart, countryPart].filter(Boolean).join(", ");
      })
      .filter((line: unknown) => typeof line === "string" && line.length > 0);

  const organizations = [
    ...organizationsFromGroups(employmentGroups, "employment-summary"),
    ...organizationsFromGroups(educationGroups, "education-summary"),
  ];

  const uniqueOrganizations = Array.from(new Set(organizations));

  const result: ORCIDAuthorInfo = {};
  if (name) result.name = name;
  if (email) result.email = email;
  if (uniqueOrganizations.length > 0) {
    result.affiliation =
      uniqueOrganizations.length === 1
        ? uniqueOrganizations[0]
        : uniqueOrganizations;
  }

  return Object.keys(result).length > 0 ? result : null;
}
