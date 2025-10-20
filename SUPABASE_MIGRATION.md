# Supabase Migration Guide

This guide will walk you through migrating the Student Automation Library from the in-memory data store to Supabase.

## Why Supabase?

Supabase is a great choice for this project because it provides:
- **PostgreSQL database** - reliable, scalable storage
- **Real-time subscriptions** - automatic UI updates when data changes
- **Free tier** - perfect for classroom projects
- **Easy hosting** - no server management required
- **Built-in authentication** - if you want to add user login later

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project Name: `student-automation-library`
   - Database Password: (generate a strong password and save it)
   - Region: Choose the closest to your students
4. Click "Create new project"
5. Wait for the project to be created (takes ~2 minutes)

## Step 2: Create Database Tables

1. In your Supabase dashboard, go to the **SQL Editor**
2. Click "New Query"
3. Copy and paste this SQL schema:

```sql
-- Create automations table
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  student_name TEXT NOT NULL,
  submission_date TIMESTAMPTZ DEFAULT NOW(),
  tags TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  setup_instructions TEXT NOT NULL,
  installation_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create links table (one-to-many relationship with automations)
CREATE TABLE automation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reactions table
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(automation_id, emoji)
);

-- Create indexes for better query performance
CREATE INDEX idx_automations_tags ON automations USING GIN(tags);
CREATE INDEX idx_automations_submission_date ON automations(submission_date DESC);
CREATE INDEX idx_automation_links_automation_id ON automation_links(automation_id);
CREATE INDEX idx_reactions_automation_id ON reactions(automation_id);

-- Enable Row Level Security (RLS)
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read/write for now - you can restrict later)
CREATE POLICY "Allow public read access" ON automations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON automations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access" ON automation_links FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON automation_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access" ON reactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON reactions FOR UPDATE USING (true);
```

4. Click "Run" to execute the SQL
5. Verify the tables were created by going to **Table Editor** in the sidebar

## Step 3: Install Supabase Client

In your project directory, install the Supabase JavaScript client:

```bash
npm install @supabase/supabase-js
```

## Step 4: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project API key (anon public)** (a long string starting with `eyJ...`)

## Step 5: Add Environment Variables

1. In your project root, create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace the values with your actual credentials from Step 4
3. Make sure `.env.local` is in your `.gitignore` (it should be by default)

## Step 6: Update the Data Service

Replace the contents of `lib/data-service.ts` with this Supabase implementation:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Automation, NewAutomationInput } from '@/types/automation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class DataService {
  // GET all automations
  static async getAllAutomations(): Promise<Automation[]> {
    const { data: automations, error: automationsError } = await supabase
      .from('automations')
      .select('*')
      .order('submission_date', { ascending: false });

    if (automationsError) throw automationsError;

    // Fetch links and reactions for each automation
    const automationsWithRelations = await Promise.all(
      (automations || []).map(async (automation) => {
        const [links, reactions] = await Promise.all([
          this.getLinksForAutomation(automation.id),
          this.getReactionsForAutomation(automation.id)
        ]);

        return {
          id: automation.id,
          title: automation.title,
          description: automation.description,
          studentName: automation.student_name,
          submissionDate: automation.submission_date,
          tags: automation.tags,
          images: automation.images,
          setupInstructions: automation.setup_instructions,
          installationCode: automation.installation_code,
          links,
          reactions
        } as Automation;
      })
    );

    return automationsWithRelations;
  }

  // GET automations by tag
  static async getAutomationsByTag(tag: string): Promise<Automation[]> {
    const allAutomations = await this.getAllAutomations();
    return allAutomations.filter(a => a.tags.includes(tag));
  }

  // GET single automation by ID
  static async getAutomationById(id: string): Promise<Automation | null> {
    const { data: automation, error } = await supabase
      .from('automations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !automation) return null;

    const [links, reactions] = await Promise.all([
      this.getLinksForAutomation(id),
      this.getReactionsForAutomation(id)
    ]);

    return {
      id: automation.id,
      title: automation.title,
      description: automation.description,
      studentName: automation.student_name,
      submissionDate: automation.submission_date,
      tags: automation.tags,
      images: automation.images,
      setupInstructions: automation.setup_instructions,
      installationCode: automation.installation_code,
      links,
      reactions
    } as Automation;
  }

  // POST new automation
  static async createAutomation(input: NewAutomationInput): Promise<Automation> {
    const { data: automation, error } = await supabase
      .from('automations')
      .insert({
        title: input.title,
        description: input.description,
        student_name: input.studentName,
        tags: input.tags,
        images: input.images,
        setup_instructions: input.setupInstructions,
        installation_code: input.installationCode
      })
      .select()
      .single();

    if (error) throw error;

    // Insert links
    if (input.links.length > 0) {
      const linksToInsert = input.links.map(link => ({
        automation_id: automation.id,
        title: link.title,
        url: link.url
      }));

      await supabase.from('automation_links').insert(linksToInsert);
    }

    return this.getAutomationById(automation.id) as Promise<Automation>;
  }

  // POST add reaction to automation
  static async addReaction(automationId: string, emoji: string): Promise<Automation | null> {
    // Try to increment existing reaction
    const { data: existing } = await supabase
      .from('reactions')
      .select('*')
      .eq('automation_id', automationId)
      .eq('emoji', emoji)
      .single();

    if (existing) {
      await supabase
        .from('reactions')
        .update({ count: existing.count + 1 })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('reactions')
        .insert({
          automation_id: automationId,
          emoji,
          count: 1
        });
    }

    return this.getAutomationById(automationId);
  }

  // GET all unique tags
  static async getAllTags(): Promise<string[]> {
    const { data: automations } = await supabase
      .from('automations')
      .select('tags');

    if (!automations) return [];

    const tagSet = new Set<string>();
    automations.forEach(a => a.tags?.forEach((tag: string) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }

  // Helper: Get links for an automation
  private static async getLinksForAutomation(automationId: string) {
    const { data: links } = await supabase
      .from('automation_links')
      .select('title, url')
      .eq('automation_id', automationId);

    return links || [];
  }

  // Helper: Get reactions for an automation
  private static async getReactionsForAutomation(automationId: string) {
    const { data: reactions } = await supabase
      .from('reactions')
      .select('emoji, count')
      .eq('automation_id', automationId);

    return reactions || [];
  }
}
```

## Step 7: Test the Migration

1. Restart your development server:

```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000)
3. Test the following:
   - Browse page loads (might be empty)
   - Submit a new automation
   - View the automation details
   - Add a reaction
   - Filter by tags

4. Check your Supabase dashboard **Table Editor** to see the data being stored

## Step 8: Add Sample Data (Optional)

If you want to pre-populate the database with sample data:

1. Go to Supabase **SQL Editor**
2. Run this query:

```sql
-- Insert sample automation
INSERT INTO automations (title, description, student_name, tags, setup_instructions)
VALUES (
  'Auto Email Organizer',
  'Automatically organizes emails into folders based on sender and keywords',
  'Alice Johnson',
  ARRAY['email', 'productivity', 'automation'],
  E'## Setup Instructions\n\n1. Clone the repository\n2. Install dependencies: `npm install`\n3. Configure your email credentials in `.env`\n4. Run: `npm start`'
);

-- Get the ID of the automation we just created
WITH last_automation AS (
  SELECT id FROM automations ORDER BY created_at DESC LIMIT 1
)
-- Insert a link for it
INSERT INTO automation_links (automation_id, title, url)
SELECT id, 'GitHub Repository', 'https://github.com/example/email-organizer'
FROM last_automation;

-- Insert some reactions
INSERT INTO reactions (automation_id, emoji, count)
SELECT id, '👍', 5 FROM last_automation
UNION ALL
SELECT id, '❤️', 3 FROM last_automation;
```

## Troubleshooting

### Environment variables not loading
- Make sure your `.env.local` file is in the project root
- Restart the dev server after creating/modifying `.env.local`
- Check that variable names start with `NEXT_PUBLIC_`

### Database connection errors
- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is running (not paused)
- Make sure Row Level Security policies allow public access

### Data not appearing
- Check the browser console for errors
- Verify tables were created correctly in Supabase Table Editor
- Make sure RLS policies are set up correctly

## Next Steps

### Add Authentication
To restrict who can submit automations:
1. Enable Email auth in Supabase Dashboard > Authentication
2. Update RLS policies to require authentication
3. Add login/signup pages to your app

### Add File Upload
To upload images instead of using URLs:
1. Set up Supabase Storage bucket
2. Update submission form to include file upload
3. Store file URLs in the database

### Enable Real-time Updates
To see changes instantly without refreshing:
1. Set up Supabase real-time subscriptions
2. Update components to listen for database changes

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
