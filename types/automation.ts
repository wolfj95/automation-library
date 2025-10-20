export interface Link {
  title: string;
  url: string;
}

export interface Reaction {
  emoji: string;
  count: number;
}

export interface Automation {
  id: string;
  title: string;
  description: string;
  studentName: string;
  submissionDate: string;
  tags: string[];
  images: string[];
  links: Link[];
  setupInstructions: string;
  installationCode?: string;
  reactions: Reaction[];
}

export interface NewAutomationInput {
  title: string;
  description: string;
  studentName: string;
  tags: string[];
  images: string[];
  links: Link[];
  setupInstructions: string;
  installationCode?: string;
}
