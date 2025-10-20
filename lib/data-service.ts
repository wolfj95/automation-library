import { Automation, NewAutomationInput } from '@/types/automation';

// This service provides a simple in-memory data store
// It's structured to make migration to Supabase straightforward
// Simply replace these functions with Supabase queries later

let automations: Automation[] = [
  {
    id: '1',
    title: 'Auto Email Organizer',
    description: 'Automatically organizes emails into folders based on sender and keywords',
    studentName: 'Alice Johnson',
    submissionDate: new Date('2024-01-15').toISOString(),
    tags: ['email', 'productivity', 'automation'],
    images: [],
    links: [
      { title: 'GitHub Repository', url: 'https://github.com/example/email-organizer' }
    ],
    setupInstructions: `## Setup Instructions

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Configure your email credentials in \`.env\`
4. Run: \`npm start\``,
    installationCode: 'npm install -g email-organizer',
    reactions: [
      { emoji: '👍', count: 5 },
      { emoji: '❤️', count: 3 }
    ]
  },
  {
    id: '2',
    title: 'Assignment Deadline Reminder',
    description: 'Sends SMS reminders 24 hours before assignment deadlines from Canvas',
    studentName: 'Bob Smith',
    submissionDate: new Date('2024-01-20').toISOString(),
    tags: ['canvas', 'reminders', 'sms', 'productivity'],
    images: [],
    links: [
      { title: 'Documentation', url: 'https://docs.example.com/deadline-reminder' }
    ],
    setupInstructions: `## Setup Instructions

1. Get your Canvas API token
2. Set up Twilio account for SMS
3. Configure environment variables
4. Run the script daily via cron job`,
    reactions: [
      { emoji: '👍', count: 8 },
      { emoji: '🔥', count: 4 }
    ]
  }
];

export class DataService {
  // GET all automations
  static async getAllAutomations(): Promise<Automation[]> {
    // Simulate async operation
    return new Promise((resolve) => {
      setTimeout(() => resolve([...automations]), 100);
    });
  }

  // GET automations by tag
  static async getAutomationsByTag(tag: string): Promise<Automation[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = automations.filter(a => a.tags.includes(tag));
        resolve(filtered);
      }, 100);
    });
  }

  // GET single automation by ID
  static async getAutomationById(id: string): Promise<Automation | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const automation = automations.find(a => a.id === id) || null;
        resolve(automation);
      }, 100);
    });
  }

  // POST new automation
  static async createAutomation(input: NewAutomationInput): Promise<Automation> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAutomation: Automation = {
          id: Date.now().toString(),
          ...input,
          submissionDate: new Date().toISOString(),
          reactions: []
        };
        automations.push(newAutomation);
        resolve(newAutomation);
      }, 100);
    });
  }

  // POST add reaction to automation
  static async addReaction(automationId: string, emoji: string): Promise<Automation | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const automation = automations.find(a => a.id === automationId);
        if (!automation) {
          resolve(null);
          return;
        }

        const existingReaction = automation.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          existingReaction.count++;
        } else {
          automation.reactions.push({ emoji, count: 1 });
        }

        resolve(automation);
      }, 100);
    });
  }

  // PUT update automation
  static async updateAutomation(id: string, input: NewAutomationInput): Promise<Automation | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = automations.findIndex(a => a.id === id);
        if (index === -1) {
          resolve(null);
          return;
        }

        const existingAutomation = automations[index];
        const updatedAutomation: Automation = {
          ...existingAutomation,
          ...input,
          id: existingAutomation.id,
          submissionDate: existingAutomation.submissionDate,
          reactions: existingAutomation.reactions
        };

        automations[index] = updatedAutomation;
        resolve(updatedAutomation);
      }, 100);
    });
  }

  // GET all unique tags
  static async getAllTags(): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tagSet = new Set<string>();
        automations.forEach(a => a.tags.forEach(tag => tagSet.add(tag)));
        resolve(Array.from(tagSet).sort());
      }, 100);
    });
  }
}

// For Supabase migration, replace with:
// import { createClient } from '@supabase/supabase-js'
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
// Then replace each method with corresponding Supabase queries
