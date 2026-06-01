export const CREDIT_CONTRIBUTION_ROLES = [
  {
    name: "Conceptualization",
    description:
      "Generation of new ideas, conceptualization of the work, and formulation of the research question.",
  },
  {
    name: "Data curation",
    description:
      "Management of data sets, including creation, validation, and storage.",
  },
  {
    name: "Formal analysis",
    description:
      "Application of mathematical modeling and statistical analysis to the work.",
  },
  {
    name: "Funding acquisition",
    description: "Securing financial support for the project.",
  },
  {
    name: "Investigation",
    description: "Conducting research and gathering data.",
  },
  {
    name: "Methodology",
    description: "Development and implementation of the research methods.",
  },
  {
    name: "Project administration",
    description:
      "Management of the project, including planning, coordination, and execution.",
  },
  {
    name: "Resources",
    description:
      "Acquisition and management of resources needed for the project.",
  },
  {
    name: "Software",
    description: "Development and maintenance of software tools and platforms.",
  },
  {
    name: "Supervision",
    description: "Overseeing the work of others and providing guidance.",
  },
  {
    name: "Validation",
    description: "Verification of the accuracy and reliability of the work.",
  },
  {
    name: "Visualization",
    description: "Creation of visual representations of the data and findings.",
  },
  {
    name: "Writing - original draft",
    description: "Creation of the initial version of the written work.",
  },
  {
    name: "Writing - review and editing",
    description: "Reviewing and improving the written work.",
  },
] as const;

export type CreditContributionRole = (typeof CREDIT_CONTRIBUTION_ROLES)[number];
export type CreditContributionRoleName = CreditContributionRole["name"];
