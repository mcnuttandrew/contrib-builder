export interface CreditContributionRole {
  id: string;
  name: string;
  description: string;
  aliases?: readonly string[];
}

export interface CreditTaxonomy {
  id: string;
  label: string;
  emptyContributionLabel: string;
  roles: readonly CreditContributionRole[];
}

const normalizeCreditLabel = (value: string) =>
  value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");

const GROUNDWORKS_CREDIT_FAIR_ROLES: readonly CreditContributionRole[] = [
  {
    id: "conceptualization",
    name: "Conceptualization",
    description:
      "Ideas; formulation or evolution of overarching research goals and aims.",
  },
  {
    id: "data_curation",
    name: "Data curation",
    description:
      "Management activities to annotate (produce metadata), scrub data and maintain research data (including software code, where it is necessary for interpreting the data itself) for initial use and later re-use.",
  },
  {
    id: "formal_analysis",
    name: "Formal Analysis",
    description:
      "Application of computational or other formal techniques to analyze or synthesize project outcomes.",
  },
  {
    id: "funding_acquisition",
    name: "Funding acquisition",
    description:
      "Acquisition of the financial support for the project leading to this publication.",
  },
  {
    id: "investigation",
    name: "Investigation and inquiry",
    description:
      "Conducting a research and investigation process, including performing experiments, collecting data, building evidence, and performing research through/with/for art and design*.",
    aliases: ["Investigation"],
  },
  {
    id: "methodology",
    name: "Methodology",
    description:
      "Development or design of research methodology; creation of models, plans, or frames for research and inquiry.",
  },
  {
    id: "production_technical",
    name: "Production - Technical",
    description:
      "Programming, software development; hardware development, schematic design, designing computer programs or systems; implementation of the computer code and supporting algorithms; testing of existing code components and other technical approaches.",
    aliases: ["Software"],
  },
  {
    id: "production_creative",
    name: "Production - Creative",
    description:
      "Artistic, creative, or design production (performance, exhibit design, choreography, curation, design drawings, scripts, scores etc.) that support research taking place or for research knowledge to be delivered in expressive, artistic or design-based forms.",
  },
  {
    id: "production_social",
    name: "Production - Social",
    description:
      "Action in community-based settings (situated inquiry, education, outreach, co-design); stewarding of communities, events, activities, and/or outreach. Community or stakeholder participation. Mobilization of community-specific knowledge and expertise.",
  },
  {
    id: "project_administration",
    name: "Project administration",
    description:
      "Management and coordination responsibility for the research activity planning and execution.",
  },
  {
    id: "reflective_analysis",
    name: "Reflective Analysis",
    description:
      "Application of reflective, artistic or critical judgments to analyze or synthesize project outcomes; developing implications for the arts, society, or culture.",
  },
  {
    id: "relationship_development_and_outreach",
    name: "Relationship Development and Outreach",
    description:
      "Bringing together stakeholders and resources to enable collaborative research. Building, coordinating, or managing community-based, academic, or industrial partnerships based on collectively identified goals and outcomes.",
  },
  {
    id: "resources",
    name: "Resources",
    description:
      "Provision of study materials, participants, samples, instruments/instrumentation, computing resources, or other tools for research and analysis.",
  },
  {
    id: "supervision",
    name: "Supervision",
    description:
      "Oversight and leadership responsibility for the research activity planning and execution, including mentorship external to the core team.",
  },
  {
    id: "validation",
    name: "Validation",
    description:
      "Verification, whether as a part of the activity or separate, of the overall replication/reproducibility of results/experiments and other research outputs.",
  },
  {
    id: "visualization",
    name: "Visualization",
    description:
      "Preparation, creation and/or presentation of the published work, including visualization and data presentation.",
  },
  {
    id: "writing_original_draft",
    name: "Writing – original draft",
    description:
      "Preparation, creation and/or presentation of the published work, specifically writing the initial draft (including substantive translation).",
    aliases: ["Writing - original draft"],
  },
  {
    id: "writing_review_and_editing",
    name: "Writing – review & editing",
    description:
      "Preparation, creation and/or presentation of the published work by those from the original research group, specifically critical review, commentary or revision – including pre- or post-publication stages.",
    aliases: ["Writing - review and editing"],
  },
] as const;

const LEGACY_CREDIT_ROLES: readonly CreditContributionRole[] = [
  {
    id: "conceptualization",
    name: "Conceptualization",
    description:
      "Generation of new ideas, conceptualization of the work, and formulation of the research question.",
  },
  {
    id: "data_curation",
    name: "Data curation",
    description:
      "Management of data sets, including creation, validation, and storage.",
  },
  {
    id: "formal_analysis",
    name: "Formal analysis",
    description:
      "Application of mathematical modeling and statistical analysis to the work.",
  },
  {
    id: "funding_acquisition",
    name: "Funding acquisition",
    description: "Securing financial support for the project.",
  },
  {
    id: "investigation",
    name: "Investigation",
    description: "Conducting research and gathering data.",
  },
  {
    id: "methodology",
    name: "Methodology",
    description: "Development and implementation of the research methods.",
  },
  {
    id: "project_administration",
    name: "Project administration",
    description:
      "Management of the project, including planning, coordination, and execution.",
  },
  {
    id: "resources",
    name: "Resources",
    description:
      "Acquisition and management of resources needed for the project.",
  },
  {
    id: "production_technical",
    name: "Software",
    description: "Development and maintenance of software tools and platforms.",
  },
  {
    id: "supervision",
    name: "Supervision",
    description: "Overseeing the work of others and providing guidance.",
  },
  {
    id: "validation",
    name: "Validation",
    description: "Verification of the accuracy and reliability of the work.",
  },
  {
    id: "visualization",
    name: "Visualization",
    description: "Creation of visual representations of the data and findings.",
  },
  {
    id: "writing_original_draft",
    name: "Writing - original draft",
    description: "Creation of the initial version of the written work.",
  },
  {
    id: "writing_review_and_editing",
    name: "Writing - review and editing",
    description: "Reviewing and improving the written work.",
  },
] as const;

export const CREDIT_TAXONOMIES = [
  {
    id: "groundworks-credit-fair",
    label: "CReDIT-fAIR",
    emptyContributionLabel: "No CReDIT-fAIR contributions assigned.",
    roles: GROUNDWORKS_CREDIT_FAIR_ROLES,
  },
  {
    id: "legacy-credit",
    label: "CRediT",
    emptyContributionLabel: "No CRediT contributions assigned.",
    roles: LEGACY_CREDIT_ROLES,
  },
] as const satisfies readonly CreditTaxonomy[];

export type CreditTaxonomyId = (typeof CREDIT_TAXONOMIES)[number]["id"];
export type CreditContributionRoleId = CreditContributionRole["id"];
export type CreditContributionRoleName =
  (typeof CREDIT_TAXONOMIES)[number]["roles"][number]["name"];
export type CreditContributionRecord = Partial<
  Record<CreditTaxonomyId, CreditContributionRoleName[]>
>;

const creditTaxonomyById = new Map<string, CreditTaxonomy>(
  CREDIT_TAXONOMIES.map((taxonomy) => [taxonomy.id, taxonomy]),
);

const creditContributionRoleIdByLabel = new Map<
  string,
  CreditContributionRoleId
>();

for (const taxonomy of CREDIT_TAXONOMIES) {
  for (const role of taxonomy.roles) {
    creditContributionRoleIdByLabel.set(
      normalizeCreditLabel(role.name),
      role.id,
    );
    for (const alias of role.aliases ?? []) {
      creditContributionRoleIdByLabel.set(normalizeCreditLabel(alias), role.id);
    }
  }
}

export const DEFAULT_CREDIT_TAXONOMY_ID: CreditTaxonomyId =
  CREDIT_TAXONOMIES[0].id;
export const LEGACY_CREDIT_TAXONOMY_ID: CreditTaxonomyId =
  CREDIT_TAXONOMIES[1].id;

export function getCreditTaxonomy(
  creditTaxonomyId?: string | null,
): CreditTaxonomy {
  if (creditTaxonomyId && creditTaxonomyById.has(creditTaxonomyId)) {
    return creditTaxonomyById.get(creditTaxonomyId)!;
  }

  return creditTaxonomyById.get(DEFAULT_CREDIT_TAXONOMY_ID)!;
}

export function getCreditTaxonomyRole(
  creditTaxonomy: CreditTaxonomy,
  roleId: string,
) {
  return creditTaxonomy.roles.find((role) => role.id === roleId);
}

export function isKnownCreditTaxonomyId(
  id: string | null | undefined,
): id is CreditTaxonomyId {
  return typeof id === "string" && creditTaxonomyById.has(id);
}

export function getCreditTaxonomyRoleNames(
  taxonomy: CreditTaxonomy = getCreditTaxonomy(),
): CreditContributionRoleName[] {
  return taxonomy.roles.map((role) => role.name as CreditContributionRoleName);
}

export function getCreditContributions(
  contributions: CreditContributionRecord | undefined,
  creditTaxonomyId: CreditTaxonomyId,
): CreditContributionRoleName[] {
  return contributions?.[creditTaxonomyId] ?? [];
}

export function setCreditContributions(
  contributions: CreditContributionRecord | undefined,
  creditTaxonomyId: CreditTaxonomyId,
  nextContributions: CreditContributionRoleName[],
): CreditContributionRecord {
  return {
    ...(contributions ?? {}),
    [creditTaxonomyId]: nextContributions,
  };
}

function normalizeContributionValue(
  value: unknown,
  creditTaxonomyId: CreditTaxonomyId,
): CreditContributionRoleName[] {
  return normalizeCreditContributions(value).length > 0
    ? normalizeCreditContributions(value)
        .map((roleId) => {
          const taxonomy = getCreditTaxonomy(creditTaxonomyId);
          const role = taxonomy.roles.find(
            (candidate) => candidate.id === roleId,
          );
          return role?.name ?? "";
        })
        .filter(Boolean)
    : [];
}

export function normalizeCreditContributionRecord(
  value: unknown,
  creditTaxonomyId: CreditTaxonomyId,
): CreditContributionRecord {
  if (!value || typeof value !== "object") {
    return {};
  }

  if (Array.isArray(value)) {
    return {
      [creditTaxonomyId]: normalizeContributionValue(value, creditTaxonomyId),
    };
  }

  const record: CreditContributionRecord = {};

  for (const taxonomy of CREDIT_TAXONOMIES) {
    const entry = (value as Record<string, unknown>)[taxonomy.id];
    if (!Array.isArray(entry)) {
      continue;
    }

    record[taxonomy.id] = normalizeContributionValue(entry, taxonomy.id);
  }

  return record;
}

export function normalizeCreditContributions(
  value: unknown,
): CreditContributionRoleId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const contributions: CreditContributionRoleId[] = [];
  const seen = new Set<string>();

  for (const entry of value) {
    let candidate = "";

    if (typeof entry === "string") {
      candidate = entry;
    } else if (
      entry &&
      typeof entry === "object" &&
      "name" in entry &&
      typeof entry.name === "string"
    ) {
      candidate = entry.name;
    }

    const normalized = normalizeCreditLabel(candidate);
    const contributionId =
      creditContributionRoleIdByLabel.get(normalized) ??
      (candidate.trim() ? candidate.trim() : "");

    if (!contributionId || seen.has(contributionId)) {
      continue;
    }

    seen.add(contributionId);
    contributions.push(contributionId as CreditContributionRoleId);
  }

  return contributions;
}
