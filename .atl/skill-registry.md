# Skill Registry — pm_crm
Generated: 2026-04-30

## Project Context
- Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase, Vercel
- Architecture: App Router RSC + client components, Supabase for DB/auth
- Testing: Vitest + React Testing Library (planned — not yet installed)

## User Skills

| Skill | Description | Trigger Context |
|-------|-------------|-----------------|
| `next-best-practices` | Next.js file conventions, RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font/bundling | Writing or reviewing any Next.js code, App Router files, route handlers |
| `vercel-react-best-practices` | React and Next.js performance optimization from Vercel Engineering | React components, Next.js pages, data fetching, bundle optimization, performance |
| `tailwind-design-system` | Scalable design systems with Tailwind CSS v4, design tokens, component libraries | Creating component libraries, implementing design systems, standardizing UI patterns |
| `frontend-design` | Distinctive, production-grade frontend interfaces — avoids generic AI aesthetics | Building web components, pages, dashboards, React components, HTML/CSS layouts |
| `brainstorming` | Turn ideas into fully formed designs through collaborative dialogue | BEFORE any creative work — features, components, new functionality |
| `test-driven-development` | TDD cycle: write test first, watch it fail, write minimal passing code | Implementing any feature or bugfix |
| `writing-plans` | Write structured implementation plans before touching code | Multi-step tasks with a spec or requirements |
| `sdd-explore` | Investigate an idea or feature before committing to a change | `/sdd-explore <topic>` |
| `sdd-propose` | Create a change proposal with intent, scope, and approach | After exploration, before spec |
| `sdd-spec` | Write specifications with requirements and scenarios | After proposal |
| `sdd-design` | Technical design document with architecture decisions | After proposal, alongside spec |
| `sdd-tasks` | Break down a change into an implementation task checklist | After spec + design |
| `sdd-apply` | Implement tasks from the change following specs and design | `/sdd-apply` |
| `sdd-verify` | Validate implementation against specs, design, and tasks | `/sdd-verify` |
| `sdd-archive` | Sync delta specs and archive a completed change | `/sdd-archive` |
| `sdd-init` | Initialize SDD context — detect stack and bootstrap persistence | Project start or re-init |
| `sdd-onboard` | Guided SDD walkthrough using the real codebase | First-time SDD users |
| `judgment-day` | Parallel adversarial review — two independent blind judges | Code review, architecture review |
| `skill-creator` | Create new agent skills following the Agent Skills spec | When user wants a new skill |
| `branch-pr` | PR creation workflow for Agent Teams Lite | Creating pull requests |
| `issue-creation` | Issue creation workflow for Agent Teams Lite | Creating GitHub issues |
| `skill-registry` | Create or update the skill registry for the current project | Updating this file |
| `site-teardown` | Reverse engineer any website into a complete build blueprint | Analyzing an existing site |
| `seo-audit` | Audit, review, or diagnose SEO issues | SEO work |
| `find-skills` | Discover and install agent skills | Finding available skills |

## Compact Rules

### next-best-practices
- Use App Router file conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`
- Server Components by default; add `"use client"` only when needed (event handlers, hooks, browser APIs)
- Fetch data in Server Components; pass down as props to Client Components
- Use `generateMetadata` for dynamic metadata; static `metadata` export for static pages
- Prefer `<Image>` from `next/image` over `<img>`; use `next/font` for fonts
- Route Handlers in `app/api/**/route.ts`; use `NextResponse` for responses
- Error boundaries: `error.tsx` for segment errors, `global-error.tsx` for root layout errors

### vercel-react-best-practices
- Avoid unnecessary `useEffect` — derive state where possible
- Use `React.memo`, `useMemo`, `useCallback` only when profiling shows a need
- Co-locate data fetching with the component that needs it (RSC pattern)
- Use Suspense boundaries for streaming and async Server Components
- Minimize client bundle: keep `"use client"` components small and leaf-level

### tailwind-design-system
- Use CSS-first configuration (Tailwind v4): `@theme` in CSS, not `tailwind.config.js`
- Define design tokens as CSS custom properties under `@theme`
- Use `@layer components` for reusable component classes
- Mobile-first responsive design with `sm:`, `md:`, `lg:` breakpoints
- Prefer semantic color tokens over hardcoded color values

### test-driven-development
- Write the test FIRST. Watch it fail. Then write minimal code to make it pass.
- One failing test at a time — do not write multiple tests before implementing
- Tests describe behavior, not implementation details
- Refactor only after tests are green

### brainstorming
- ALWAYS run before creating features, building components, or modifying behavior
- Explore user intent and requirements BEFORE writing any code
- Ask clarifying questions to surface hidden requirements

### writing-plans
- Write the plan before touching code
- Use hierarchical task numbering (1.1, 1.2)
- Group by phase: infrastructure → implementation → testing
