# Project Manifest

> **For AI Agents**: Read this file first to understand the project structure and available tools.

## Stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Framework | React 18 + TypeScript                        |
| Build     | Vite 6                                       |
| Styling   | Tailwind CSS v4                              |
| Database  | Sticklight Cloud (PostgreSQL) - **OPTIONAL** |
| Icons     | Lucide React                                 |
| Routing   | React Router v7                              |

## Project Structure

```
src/
├── main.tsx                    # App entry (BrowserRouter)
├── App.tsx                     # Route definitions
├── index.css                   # Tailwind imports + base styles
├── theme.css                   # Theme configuration (colors, fonts)
├── pages/                      # Page components (one per route)
│   └── Index.tsx               # Home page (replace with your content)
├── components/                 # Reusable UI components (create as needed)
├── integrations/
│   └── supabase/
│       ├── client.ts           # Supabase client (null until database enabled)
│       ├── types.ts            # Auto-generated database types
│       └── helpers.ts          # Type helpers (Tables, TablesInsert, etc.)
├── layouts/                    # Layout components (create as needed)
└── lib/                        # Utility functions (create as needed)
```

## Pre-Configured Features

### Path Aliases

Use `@/` to import from `src/`:

```typescript
import { supabase } from '@/integrations/supabase/client';
import MyComponent from '@/components/MyComponent';
```

### Routing

Routes are defined in `src/App.tsx`. Add new routes:

```typescript
import NewPage from '@/pages/NewPage';

<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/new" element={<NewPage />} />
</Routes>
```

### Icons

Lucide React is available:

```typescript
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

<Mail className="w-5 h-5 text-primary" />
```

## Styling & Theme

### Tailwind CSS v4

Full Tailwind CSS v4 support with utility classes (layout, spacing, typography, etc.):

```tsx
// CORRECT - Using Tailwind for layout, spacing, and typography
<div className="flex items-center gap-4 p-6 rounded-xl shadow-lg">
	<div className="bg-muted text-primary">Card</div>
	<h1 className="text-2xl font-bold">Hello</h1>
</div>
```

**Note:** Tailwind utilities are for layout, spacing, typography, etc. **Colors MUST use design system tokens only.**

### Theme-First Approach

**Before changing colors or fonts directly in components, ALWAYS try modifying `src/theme.css` first.**

The theme system provides centralized design tokens that cascade throughout the application. This ensures consistency and makes global design changes simple.

### Color Usage Rules

**The `src/theme.css` file is the source of truth for all design system tokens.** To know which tokens are available, you must read them from `src/theme.css`.

#### Use Only Design System Tokens and Tailwind Classes

For all color-related styling, you must:

1. **Use ONLY design system tokens** from `src/theme.css` (e.g., `primary`, `accent`, `muted`, `destructive`)
2. **Use ONLY Tailwind utility classes** via the `className` prop (e.g., `bg-primary`, `text-primary-foreground`)

#### Examples: Color Usage

Here are examples of how to use design system tokens with Tailwind classes:

```tsx
// Primary colors - Main brand color, buttons, links
<button className="bg-primary text-primary-foreground">Click me</button>
<a href="#" className="text-primary hover:text-primary/80">Link</a>
<div className="bg-primary text-primary-foreground">Content</div>

// Secondary colors - Secondary actions, alternate backgrounds
<div className="bg-secondary text-secondary-foreground">Content</div>
<button className="bg-secondary">Secondary button</button>

// Accent colors - Highlights, emphasis, special elements
<span className="text-accent">Highlighted text</span>
<div className="bg-accent/10 border-accent">Accent box</div>
<span className="text-accent">Highlighted</span>

// Destructive (errors, delete actions)
<button className="bg-destructive text-destructive-foreground">Delete</button>

// Muted (subtle backgrounds, disabled states)
<div className="bg-muted text-muted-foreground">Subtle content</div>
<button disabled className="bg-muted text-muted-foreground">Disabled</button>

// Borders and inputs
<input className="border-border bg-input" />
<div className="ring-ring">Focus ring</div>
```

**Note:** The tokens shown above are examples. Always check `src/theme.css` to see the complete list of available tokens for your project.

### Modifying Colors

**To change colors:**

1. Edit `src/theme.css` and update the CSS custom properties - **reuse existing variables** instead of creating new ones
2. Changes automatically apply across all components using theme classes

**Example:**

```css
/* Change primary color from blue to green */
--color-primary: var(--color-green-500);

/* Use Tailwind color scale */
--color-secondary: var(--color-slate-600);
```

### Modifying Fonts

**To change fonts:**

1. Add font variables to `src/theme.css`:

```css
@theme {
	--font-sans: 'Inter', system-ui, sans-serif;
	--font-mono: 'Fira Code', monospace;
}
```

2. Use in components:

```tsx
<div className="font-sans">Sans-serif text</div>
<code className="font-mono">Monospace code</code>
```

## Sticklight Cloud Database (Optional)

**The database is NOT enabled by default.** Ask the AI to enable it if you need persistent data storage.

### Enabling the Database

Ask the AI: "Enable Sticklight Cloud for database storage"

The AI will provision a PostgreSQL database and configure the environment.

### Client

```typescript
import { supabase } from '@/integrations/supabase/client';

// IMPORTANT: Check if database is enabled first!
if (!supabase) {
	// Database not enabled yet - handle gracefully
	console.log('Database not available');
	return;
}

// Queries are fully typed
const { data, error } = await supabase.from('todos').select('*');
```

### Type Helpers

After running `supabaseMigration`, types are auto-generated:

```typescript
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/helpers';

type Todo = Tables<'todos'>; // Row type for SELECT
type NewTodo = TablesInsert<'todos'>; // Type for INSERT
type UpdateTodo = TablesUpdate<'todos'>; // Type for UPDATE
```

### Environment Variables

Automatically configured when Sticklight Cloud is enabled:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon/public key

## Scripts

| Command         | Description          |
| --------------- | -------------------- |
| `npm run build` | Build for production |
| `npm run lint`  | Run ESLint           |

## Dev Server

- **Port**: 5173
- **Already running**: Do NOT run `npm run dev` - server is pre-started
- **HMR**: Hot Module Replacement enabled

## Critical Files - DO NOT MODIFY

The following script tag in `index.html` **MUST NOT be removed or modified**:

```html
<script src="https://scripts.sticklight.com/sticklight-data.js" type="module"></script>
```

## Guidelines for AI Agents

1. **Don't regenerate base files** - Build on top of existing structure
2. **Use path aliases** - Always use `@/` imports
3. **Single generateFiles call** - Batch file changes together
4. **Ask before enabling database** - Ask user if they want Sticklight Cloud before calling `enableSticklightCloud`
5. **Database flow** - `enableSticklightCloud` → `supabaseMigration` → use in components
6. **Add pages in `src/pages/`** - One file per route
7. **Add components in `src/components/`** - Reusable UI pieces
8. **Fix errors iteratively** - Don't regenerate everything on error
