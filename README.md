# Student Automation Library

A digital library for students to submit, browse, and share automation projects. Built with Next.js, TypeScript, and Tailwind CSS, designed for easy migration to Supabase.

## Features

- **Browse Automations**: View all student automation projects in a beautiful gallery
- **Tag Filtering**: Filter projects by tags for easy discovery
- **Rich Submissions**: Students can include:
  - Photos/screenshots
  - External links (GitHub, documentation)
  - Detailed setup instructions (Markdown supported)
  - Installation commands
  - Custom tags
- **Emoji Reactions**: Users can react to automations with emoji
- **Responsive Design**: Works great on desktop and mobile

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
automation-library/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Home page
│   ├── browse/              # Browse automations page
│   ├── submit/              # Submit new automation page
│   └── automation/[id]/     # Individual automation detail page
├── types/                    # TypeScript type definitions
│   └── automation.ts        # Automation data types
├── lib/                      # Utilities and services
│   └── data-service.ts      # Data access layer (Supabase-ready)
└── public/                   # Static assets
```

## Data Structure

### Automation Object

```typescript
{
  id: string;
  title: string;
  description: string;
  studentName: string;
  submissionDate: string;
  tags: string[];
  images: string[];           // Array of image URLs
  links: Array<{             // External links
    title: string;
    url: string;
  }>;
  setupInstructions: string;  // Markdown text
  installationCode?: string;  // Optional install command
  reactions: Array<{
    emoji: string;
    count: number;
  }>;
}
```

## Current Implementation

The app currently uses an **in-memory data store** for development. Data is stored in the `lib/data-service.ts` file and will reset when the server restarts.

This is intentional to make development easy while keeping the structure ready for Supabase migration.

## Migrating to Supabase

See [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md) for detailed instructions on setting up Supabase and migrating the data layer.

### Quick Overview

1. Create a Supabase project
2. Create the database tables using the provided SQL schema
3. Install Supabase client: `npm install @supabase/supabase-js`
4. Update `lib/data-service.ts` to use Supabase queries
5. Add environment variables for Supabase credentials

## Development

### Adding New Features

The codebase is structured to be easily extensible:

- **Add new pages**: Create files in the `app/` directory
- **Modify data structure**: Update `types/automation.ts` and `lib/data-service.ts`
- **Style changes**: Edit Tailwind classes directly in components

### Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **React Hooks**: State management

## Customization Ideas

- Add user authentication (student login)
- Add search functionality
- Add categories in addition to tags
- Add file upload for screenshots
- Add comments/discussions on automations
- Add "fork" or "remix" functionality
- Add analytics for popular automations

## License

This project is created for educational purposes.
