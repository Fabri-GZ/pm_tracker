# Delivery Tracker PRO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un mini CRM en Next.js 14 que permite al PM de Avalon ver clientes, gestionar briefs, y generar reportes automáticos via n8n que compara scope vs ejecución en Asana.

**Architecture:** App Router de Next.js con sidebar fijo (Server Component que lee de Supabase) + área principal con tabs por cliente. La única escritura desde el front es el brief; todo lo demás es read-only. El botón "Generar Reporte" llama una API route que dispara el webhook de n8n.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS v3, @supabase/ssr, @supabase/supabase-js, Unbounded + Poppins (Google Fonts)

---

## File Map

```
src/
  app/
    layout.tsx                     # Root layout: sidebar + main, Google Fonts
    page.tsx                       # Redirect → /clientes
    globals.css                    # Tailwind base + design tokens CSS vars
    clientes/
      layout.tsx                   # Layout con sidebar + slot para main
      page.tsx                     # Placeholder "Seleccioná un cliente"
      [id]/
        page.tsx                   # Client detail: header + tabs + tab content
        loading.tsx                # Skeleton de toda la página de cliente
    api/
      generate-report/
        route.ts                   # POST: llama webhook n8n, devuelve report_id
  components/
    sidebar/
      ClientSidebar.tsx            # Server Component: fetches clients + renders list
      ClientItem.tsx               # Client Component: item con status tint + active state
    client/
      ClientHeader.tsx             # Client Component: nombre + badge + botón generar
      ClientTabs.tsx               # Client Component: tab switcher con searchParams
      tabs/
        TasksTab.tsx               # Server Component: secciones + tareas desde Supabase
        BriefTab.tsx               # Client Component: viewer + editor de brief
        ReportTab.tsx              # Server Component: semáforo + desvíos + recomendaciones
    ui/
      StatusBadge.tsx              # Pill verde/amarillo/rojo/gris
      StatusDot.tsx                # Dot de color de estado
      TaskCard.tsx                 # Fila de tarea (checkbox, nombre, responsable, fecha)
      SemaphoreCard.tsx            # Card del semáforo (Verde/Amarillo/Rojo)
  lib/
    supabase/
      client.ts                    # Browser Supabase client (Client Components)
      server.ts                    # Server Supabase client (Server Components)
      queries.ts                   # Typed query functions
    types.ts                       # TypeScript interfaces (Client, Task, Report, etc.)
    utils.ts                       # getInitials, formatDate, isOverdue, statusColors
```

---

## Task 1: Scaffold del proyecto

**Files:**
- Create: `.env.local`
- Modify: `package.json`, `tailwind.config.ts`, `tsconfig.json`

- [ ] **Step 1: Inicializar Next.js en el directorio existente**

```bash
cd /c/Users/fabri/developing/trabajo/pm_crm
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

Responder a los prompts: `Yes` a TypeScript, `Yes` a ESLint, `Yes` a Tailwind, `Yes` a `src/`, `Yes` a App Router, `No` a turbopack si pregunta (usar webpack estable), `@/*` como alias.

- [ ] **Step 2: Instalar dependencias de Supabase**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 3: Crear `.env.local`**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xqvhneikjvefciuhcdgt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu_anon_key_de_supabase>
N8N_WEBHOOK_URL=<url_del_webhook_n8n>
```

Para obtener la anon key: Supabase Dashboard → proyecto → Settings → API → `anon public`.

- [ ] **Step 4: Verificar que el dev server arranca**

```bash
npm run dev
```

Expected: servidor corriendo en `http://localhost:3000` sin errores en consola.

- [ ] **Step 5: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold next.js project with supabase deps"
```

---

## Task 2: TypeScript types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Crear los tipos que mapean el schema de Supabase**

```typescript
// src/lib/types.ts

export type ReportStatus = 'verde' | 'amarillo' | 'rojo' | 'pendiente'

export interface Client {
  id: string
  name: string
  asana_project_id: string
  created_at: string
  latest_report_status?: ReportStatus | null
}

export interface Brief {
  id: string
  client_id: string
  content: string
  source: string
  created_at: string
}

export interface Section {
  id: string
  client_id: string
  name: string
  asana_section_id: string
  order: number | null
}

export interface Task {
  id: string
  section_id: string | null
  client_id: string
  asana_task_id: string
  name: string
  assignee: string | null
  start_date: string | null
  due_date: string | null
  completed: boolean
  completed_at: string | null
  field_aprobado: string | null
  field_areas: string | null
  field_proceso: string | null
  field_plataforma: string | null
  field_prioridad: string | null
  notes: string | null
}

export interface SectionWithTasks extends Section {
  tasks: Task[]
}

export interface ReportDeviation {
  description: string
  severity: 'low' | 'medium' | 'high'
}

export interface ReportRisk {
  description: string
}

export interface ReportRecommendation {
  description: string
}

export interface Report {
  id: string
  client_id: string
  brief_id: string | null
  status: ReportStatus
  summary: string | null
  deviations: ReportDeviation[]
  risks: ReportRisk[]
  recommendations: ReportRecommendation[]
  raw_response: unknown
  generated_at: string
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add typescript types for supabase schema"
```

---

## Task 3: Utility functions

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/lib/__tests__/utils.test.ts`

- [ ] **Step 1: Instalar vitest para tests**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

Crear `vitest.config.ts`:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

Crear `src/test-setup.ts`:

```typescript
// src/test-setup.ts
import '@testing-library/jest-dom'
```

Agregar en `package.json`:
```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 2: Escribir los tests que fallan**

```typescript
// src/lib/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest'
import { getInitials, formatDate, isOverdue, getStatusColors } from '../utils'

describe('getInitials', () => {
  it('returns first 2 chars of first 2 words uppercased', () => {
    expect(getInitials('Openn Pilar')).toBe('OP')
  })
  it('returns first 2 chars when single word', () => {
    expect(getInitials('Viviera')).toBe('VI')
  })
  it('handles 3+ word names', () => {
    expect(getInitials('Del Sol Auto')).toBe('DS')
  })
})

describe('isOverdue', () => {
  it('returns true when due_date is in the past and task not completed', () => {
    expect(isOverdue('2020-01-01', false)).toBe(true)
  })
  it('returns false when task is completed', () => {
    expect(isOverdue('2020-01-01', true)).toBe(false)
  })
  it('returns false when due_date is null', () => {
    expect(isOverdue(null, false)).toBe(false)
  })
  it('returns false when due_date is in the future', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    expect(isOverdue(future.toISOString().split('T')[0], false)).toBe(false)
  })
})

describe('formatDate', () => {
  it('formats a date string to DD MMM YYYY', () => {
    expect(formatDate('2025-10-24')).toBe('24 oct 2025')
  })
  it('returns dash when null', () => {
    expect(formatDate(null)).toBe('—')
  })
})

describe('getStatusColors', () => {
  it('returns green colors for verde', () => {
    const colors = getStatusColors('verde')
    expect(colors.dot).toContain('green')
    expect(colors.bgResting).toContain('rgba(34')
  })
  it('returns yellow colors for amarillo', () => {
    const colors = getStatusColors('amarillo')
    expect(colors.dot).toContain('yellow')
  })
  it('returns red colors for rojo', () => {
    const colors = getStatusColors('rojo')
    expect(colors.dot).toContain('red')
  })
  it('returns gray colors for null', () => {
    const colors = getStatusColors(null)
    expect(colors.dot).toContain('gray')
  })
})
```

- [ ] **Step 3: Correr tests y verificar que fallan**

```bash
npm run test:run
```

Expected: FAIL — "Cannot find module '../utils'"

- [ ] **Step 4: Implementar utils.ts**

```typescript
// src/lib/utils.ts
import type { ReportStatus } from './types'

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function isOverdue(dueDate: string | null, completed: boolean): boolean {
  if (!dueDate || completed) return false
  return new Date(dueDate) < new Date(new Date().toDateString())
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export interface StatusColors {
  bgResting: string
  bgActive: string
  avatarBg: string
  avatarText: string
  dot: string
  badge: string
  badgeText: string
  border: string
}

export function getStatusColors(status: ReportStatus | null | undefined): StatusColors {
  switch (status) {
    case 'verde':
      return {
        bgResting: 'rgba(34, 197, 94, 0.08)',
        bgActive: 'rgba(34, 197, 94, 0.22)',
        avatarBg: 'rgba(34, 197, 94, 0.18)',
        avatarText: '#16a34a',
        dot: 'bg-green-400',
        badge: 'bg-green-50',
        badgeText: 'text-green-700',
        border: '#22c55e',
      }
    case 'amarillo':
      return {
        bgResting: 'rgba(234, 179, 8, 0.09)',
        bgActive: 'rgba(234, 179, 8, 0.22)',
        avatarBg: 'rgba(234, 179, 8, 0.18)',
        avatarText: '#b45309',
        dot: 'bg-yellow-400',
        badge: 'bg-yellow-50',
        badgeText: 'text-yellow-700',
        border: '#eab308',
      }
    case 'rojo':
      return {
        bgResting: 'rgba(239, 68, 68, 0.08)',
        bgActive: 'rgba(239, 68, 68, 0.20)',
        avatarBg: 'rgba(239, 68, 68, 0.18)',
        avatarText: '#dc2626',
        dot: 'bg-red-400',
        badge: 'bg-red-50',
        badgeText: 'text-red-700',
        border: '#ef4444',
      }
    default:
      return {
        bgResting: 'transparent',
        bgActive: 'rgba(124, 58, 237, 0.08)',
        avatarBg: '#f3f4f6',
        avatarText: '#6b7280',
        dot: 'bg-gray-300',
        badge: 'bg-gray-100',
        badgeText: 'text-gray-500',
        border: '#d1d5db',
      }
  }
}
```

- [ ] **Step 5: Correr tests y verificar que pasan**

```bash
npm run test:run
```

Expected: PASS — todos los tests en verde.

- [ ] **Step 6: Commit**

```bash
git add src/lib/utils.ts src/lib/__tests__/utils.test.ts src/test-setup.ts vitest.config.ts
git commit -m "feat: add utility functions with tests"
```

---

## Task 4: Supabase clients y queries

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/queries.ts`

- [ ] **Step 1: Browser client**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Server client**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3: Query functions**

```typescript
// src/lib/supabase/queries.ts
import type { Client, Brief, SectionWithTasks, Report } from '../types'

// ─── SERVER-SIDE QUERIES ─────────────────────────────────────────────────────

export async function getClientsWithStatus(
  supabase: ReturnType<typeof import('./server').createClient>
): Promise<Client[]> {
  // Fetch all clients
  const { data: clients, error } = await supabase
    .from('pm_clients')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)

  // Fetch latest report status per client
  const { data: reports } = await supabase
    .from('pm_reports')
    .select('client_id, status, generated_at')
    .order('generated_at', { ascending: false })

  // Map: client_id → latest status
  const latestStatus = new Map<string, string>()
  for (const r of reports ?? []) {
    if (!latestStatus.has(r.client_id)) {
      latestStatus.set(r.client_id, r.status)
    }
  }

  return clients.map((c) => ({
    ...c,
    latest_report_status: (latestStatus.get(c.id) ?? null) as Client['latest_report_status'],
  }))
}

export async function getClientById(
  supabase: ReturnType<typeof import('./server').createClient>,
  id: string
): Promise<Client | null> {
  const { data, error } = await supabase
    .from('pm_clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Client
}

export async function getSectionsWithTasks(
  supabase: ReturnType<typeof import('./server').createClient>,
  clientId: string
): Promise<SectionWithTasks[]> {
  const { data: sections, error: secErr } = await supabase
    .from('pm_sections')
    .select('*')
    .eq('client_id', clientId)
    .order('order', { ascending: true, nullsFirst: false })

  if (secErr) throw new Error(secErr.message)

  const { data: tasks, error: taskErr } = await supabase
    .from('pm_tasks')
    .select('*')
    .eq('client_id', clientId)
    .order('due_date', { ascending: true, nullsFirst: false })

  if (taskErr) throw new Error(taskErr.message)

  return (sections ?? []).map((section) => ({
    ...section,
    tasks: (tasks ?? []).filter((t) => t.section_id === section.id),
  }))
}

export async function getLatestBrief(
  supabase: ReturnType<typeof import('./server').createClient>,
  clientId: string
): Promise<Brief | null> {
  const { data, error } = await supabase
    .from('pm_briefs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data as Brief | null
}

export async function getLatestReport(
  supabase: ReturnType<typeof import('./server').createClient>,
  clientId: string
): Promise<Report | null> {
  const { data, error } = await supabase
    .from('pm_reports')
    .select('*')
    .eq('client_id', clientId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data as Report | null
}

// ─── CLIENT-SIDE MUTATIONS ────────────────────────────────────────────────────

export async function upsertBrief(
  supabase: ReturnType<typeof import('./client').createClient>,
  clientId: string,
  content: string
): Promise<Brief> {
  const { data, error } = await supabase
    .from('pm_briefs')
    .insert({ client_id: clientId, content, source: 'text' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Brief
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat: add supabase client, server, and query functions"
```

---

## Task 5: Design tokens + Tailwind config + Global CSS

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Configurar Tailwind con los design tokens**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F4F3F8',
        sidebar: '#FFFFFF',
        border: '#F0EEF8',
        brand: {
          DEFAULT: '#7C3AED',
          hover: '#6D28D9',
        },
        text: {
          DEFAULT: '#1A1A2E',
          muted: '#9CA3AF',
          secondary: '#6B7280',
        },
      },
      fontFamily: {
        unbounded: ['var(--font-unbounded)', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        item: '10px',
        avatar: '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Actualizar globals.css**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    box-sizing: border-box;
  }
  body {
    @apply bg-bg text-text font-poppins;
  }
}

@layer utilities {
  .font-title {
    font-family: var(--font-unbounded), sans-serif;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: configure tailwind design tokens"
```

---

## Task 6: Root layout con fuentes y estructura base

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/clientes/layout.tsx`

- [ ] **Step 1: Root layout con Google Fonts**

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Unbounded, Poppins } from 'next/font/google'
import './globals.css'

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-unbounded',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PM Tracker — Avalon World Agency',
  description: 'Delivery tracking CRM for project managers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${unbounded.variable} ${poppins.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Root redirect**

```typescript
// src/app/page.tsx
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/clientes')
}
```

- [ ] **Step 3: Layout de clientes con sidebar**

```typescript
// src/app/clientes/layout.tsx
import { ClientSidebar } from '@/components/sidebar/ClientSidebar'

export default function ClientesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ClientSidebar />
      <main className="flex-1 overflow-y-auto bg-bg">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/app/clientes/layout.tsx
git commit -m "feat: root layout with Google Fonts and clientes layout"
```

---

## Task 7: UI Primitives

**Files:**
- Create: `src/components/ui/StatusBadge.tsx`
- Create: `src/components/ui/StatusDot.tsx`
- Create: `src/components/ui/TaskCard.tsx`
- Create: `src/components/ui/SemaphoreCard.tsx`

- [ ] **Step 1: StatusDot**

```typescript
// src/components/ui/StatusDot.tsx
import { getStatusColors } from '@/lib/utils'
import type { ReportStatus } from '@/lib/types'

export function StatusDot({ status }: { status: ReportStatus | null | undefined }) {
  const colors = getStatusColors(status)
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`}
    />
  )
}
```

- [ ] **Step 2: StatusBadge**

```typescript
// src/components/ui/StatusBadge.tsx
import { getStatusColors } from '@/lib/utils'
import type { ReportStatus } from '@/lib/types'

const LABELS: Record<string, string> = {
  verde: 'Verde',
  amarillo: 'Amarillo',
  rojo: 'Rojo',
  pendiente: 'Pendiente',
}

export function StatusBadge({ status }: { status: ReportStatus | null | undefined }) {
  if (!status) return null
  const colors = getStatusColors(status)
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-poppins ${colors.badge} ${colors.badgeText}`}
    >
      <StatusDotInline status={status} />
      {LABELS[status] ?? status}
    </span>
  )
}

function StatusDotInline({ status }: { status: ReportStatus }) {
  const colors = getStatusColors(status)
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors.dot}`} />
}
```

- [ ] **Step 3: TaskCard**

```typescript
// src/components/ui/TaskCard.tsx
import { formatDate, isOverdue, getInitials } from '@/lib/utils'
import type { Task } from '@/lib/types'

export function TaskCard({ task }: { task: Task }) {
  const overdue = isOverdue(task.due_date, task.completed)
  const noAssignee = !task.assignee

  return (
    <div className="flex items-center gap-3 bg-white rounded-item px-4 py-3 shadow-card">
      {/* Checkbox visual — read-only */}
      <div
        className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center ${
          task.completed
            ? 'bg-brand border-brand'
            : 'border-gray-300'
        }`}
      >
        {task.completed && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {/* Task name */}
      <span
        className={`flex-1 text-sm font-poppins ${
          task.completed ? 'line-through text-text-muted' : 'text-text'
        }`}
      >
        {task.name}
      </span>

      {/* Assignee */}
      {noAssignee ? (
        <span className="text-xs text-red-400 font-poppins font-medium">Sin responsable</span>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-purple-100 text-brand text-[9px] font-unbounded font-bold flex items-center justify-center flex-shrink-0">
            {getInitials(task.assignee!)}
          </span>
          <span className="text-xs text-text-secondary font-poppins">{task.assignee}</span>
        </div>
      )}

      {/* Due date */}
      <span className={`text-xs font-poppins ml-2 ${overdue ? 'text-red-500 font-semibold' : 'text-text-muted'}`}>
        {overdue && '⚠ '}{formatDate(task.due_date)}
      </span>
    </div>
  )
}
```

- [ ] **Step 4: SemaphoreCard**

```typescript
// src/components/ui/SemaphoreCard.tsx
import type { ReportStatus } from '@/lib/types'
import { getStatusColors } from '@/lib/utils'

const CONFIG = {
  verde:    { label: 'Verde',    desc: 'Ejecución alineada' },
  amarillo: { label: 'Amarillo', desc: 'Desvíos leves' },
  rojo:     { label: 'Rojo',     desc: 'Riesgo de incumplimiento' },
}

export function SemaphoreCard({
  value,
  activeStatus,
}: {
  value: 'verde' | 'amarillo' | 'rojo'
  activeStatus: ReportStatus | null
}) {
  const isActive = activeStatus === value
  const colors = getStatusColors(value)
  const { label, desc } = CONFIG[value]

  return (
    <div
      className={`flex flex-col items-center text-center rounded-card p-4 shadow-card transition-all ${
        isActive ? 'border-2' : 'border-2 border-transparent bg-white'
      }`}
      style={
        isActive
          ? {
              borderColor: colors.border,
              backgroundColor: colors.bgResting,
            }
          : {}
      }
    >
      <span className={`inline-block w-3 h-3 rounded-full mb-2 ${colors.dot}`} />
      <span className="font-unbounded text-sm font-bold text-text">{label}</span>
      <span className="text-xs text-text-muted font-poppins mt-0.5">{desc}</span>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add ui primitives StatusBadge, StatusDot, TaskCard, SemaphoreCard"
```

---

## Task 8: ClientItem + ClientSidebar

**Files:**
- Create: `src/components/sidebar/ClientItem.tsx`
- Create: `src/components/sidebar/ClientSidebar.tsx`

- [ ] **Step 1: ClientItem (Client Component)**

```typescript
// src/components/sidebar/ClientItem.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getInitials, getStatusColors } from '@/lib/utils'
import { StatusDot } from '@/components/ui/StatusDot'
import type { Client } from '@/lib/types'

export function ClientItem({ client }: { client: Client }) {
  const pathname = usePathname()
  const isActive = pathname === `/clientes/${client.id}`
  const colors = getStatusColors(client.latest_report_status)

  return (
    <Link
      href={`/clientes/${client.id}`}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-item transition-all"
      style={{
        backgroundColor: isActive ? colors.bgActive : colors.bgResting,
      }}
    >
      {/* Avatar */}
      <span
        className="w-8 h-8 rounded-avatar flex items-center justify-center text-[10px] font-unbounded font-bold flex-shrink-0"
        style={{
          backgroundColor: colors.avatarBg,
          color: colors.avatarText,
        }}
      >
        {getInitials(client.name)}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-poppins truncate ${isActive ? 'font-semibold text-text' : 'font-medium text-text'}`}>
          {client.name}
        </p>
        <p className="text-[10px] text-text-muted font-poppins capitalize">
          {client.latest_report_status ?? 'Sin reporte'}
        </p>
      </div>

      <StatusDot status={client.latest_report_status} />
    </Link>
  )
}
```

- [ ] **Step 2: ClientSidebar (Server Component)**

```typescript
// src/components/sidebar/ClientSidebar.tsx
import { createClient } from '@/lib/supabase/server'
import { getClientsWithStatus } from '@/lib/supabase/queries'
import { ClientItem } from './ClientItem'

function ConfigIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  )
}

export async function ClientSidebar() {
  const supabase = createClient()
  const clients = await getClientsWithStatus(supabase)

  return (
    <aside className="w-[220px] h-screen bg-sidebar border-r border-border flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-avatar bg-brand flex items-center justify-center">
          <span className="text-white text-[11px] font-unbounded font-bold">PM</span>
        </div>
        <div>
          <p className="text-xs font-unbounded font-bold text-text leading-tight">PM Tracker</p>
          <p className="text-[9px] text-text-muted font-poppins">Avalon World Agency</p>
        </div>
      </div>

      {/* Section label */}
      <p className="px-4 pt-4 pb-2 text-[10px] font-semibold text-text-muted uppercase tracking-wider font-poppins">
        Clientes
      </p>

      {/* Client list */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-1">
        {clients.map((client) => (
          <ClientItem key={client.id} client={client} />
        ))}
        {clients.length === 0 && (
          <p className="text-xs text-text-muted font-poppins px-2 py-4 text-center">
            Sin clientes cargados
          </p>
        )}
      </nav>

      {/* Footer: Config */}
      <div className="border-t border-border px-2 py-3">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-item text-text-secondary hover:bg-purple-50 hover:text-brand transition-colors font-poppins text-xs">
          <ConfigIcon />
          Configuración
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Verificar que la sidebar renderiza sin errores**

```bash
npm run dev
```

Navegar a `http://localhost:3000/clientes` — la sidebar debería mostrarse (vacía si no hay datos en Supabase todavía).

- [ ] **Step 4: Commit**

```bash
git add src/components/sidebar/
git commit -m "feat: add ClientSidebar and ClientItem components"
```

---

## Task 9: Página placeholder de /clientes

**Files:**
- Create: `src/app/clientes/page.tsx`

- [ ] **Step 1: Crear la página placeholder**

```typescript
// src/app/clientes/page.tsx
export default function ClientesPage() {
  return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="text-center">
        <div className="w-14 h-14 rounded-card bg-purple-100 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <p className="font-unbounded font-bold text-sm text-text mb-1">Seleccioná un cliente</p>
        <p className="text-xs text-text-muted font-poppins">Elegí un cliente de la barra lateral para ver sus tareas y reportes</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/clientes/page.tsx
git commit -m "feat: add clientes placeholder page"
```

---

## Task 10: Client Header + Tabs

**Files:**
- Create: `src/components/client/ClientHeader.tsx`
- Create: `src/components/client/ClientTabs.tsx`
- Create: `src/app/clientes/[id]/page.tsx`
- Create: `src/app/clientes/[id]/loading.tsx`

- [ ] **Step 1: ClientTabs (Client Component — maneja el tab activo via URL)**

```typescript
// src/components/client/ClientTabs.tsx
'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const TABS = [
  { key: 'tareas',  label: 'Tareas' },
  { key: 'brief',   label: 'Brief' },
  { key: 'reporte', label: 'Reporte' },
] as const

export type TabKey = typeof TABS[number]['key']

export function ClientTabs({ clientId }: { clientId: string }) {
  const searchParams = useSearchParams()
  const activeTab = (searchParams.get('tab') as TabKey) ?? 'tareas'

  return (
    <div className="flex bg-sidebar border-b border-border px-7">
      {TABS.map(({ key, label }) => (
        <Link
          key={key}
          href={`/clientes/${clientId}?tab=${key}`}
          className={`px-5 py-3.5 text-sm font-poppins border-b-2 transition-colors -mb-px ${
            activeTab === key
              ? 'text-brand border-brand font-semibold'
              : 'text-text-muted border-transparent hover:text-text'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: ClientHeader (Client Component — contiene botón generar)**

```typescript
// src/components/client/ClientHeader.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Client, Brief } from '@/lib/types'

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={spinning ? 'animate-spin' : ''}
    >
      <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  )
}

export function ClientHeader({
  client,
  latestBrief,
}: {
  client: Client
  latestBrief: Brief | null
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleGenerateReport() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: client.id,
          brief_id: latestBrief?.id ?? null,
        }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: 'Error desconocido' }))
        throw new Error(msg ?? 'Error al generar el reporte')
      }
      // Refresh server data and navigate to report tab
      router.push(`/clientes/${client.id}?tab=reporte`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-sidebar border-b border-border px-7 py-0 flex items-center gap-3 min-h-[60px]">
      <div className="mr-auto">
        <h1 className="font-unbounded font-bold text-sm text-text leading-tight">
          {client.name}
        </h1>
        <p className="text-[10px] text-text-muted font-poppins mt-0.5">
          Asana ID: {client.asana_project_id}
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-poppins">{error}</p>
      )}

      <StatusBadge status={client.latest_report_status} />

      <button
        onClick={handleGenerateReport}
        disabled={loading}
        className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold font-poppins px-4 py-2 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <RefreshIcon spinning={loading} />
        {loading ? 'Generando...' : 'Generar Reporte'}
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Página del cliente**

```typescript
// src/app/clientes/[id]/page.tsx
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getClientById, getLatestBrief, getSectionsWithTasks, getLatestReport } from '@/lib/supabase/queries'
import { ClientHeader } from '@/components/client/ClientHeader'
import { ClientTabs } from '@/components/client/ClientTabs'
import { TasksTab } from '@/components/client/tabs/TasksTab'
import { BriefTab } from '@/components/client/tabs/BriefTab'
import { ReportTab } from '@/components/client/tabs/ReportTab'

type Props = {
  params: { id: string }
  searchParams: { tab?: string }
}

export default async function ClientePage({ params, searchParams }: Props) {
  const supabase = createClient()
  const [client, latestBrief] = await Promise.all([
    getClientById(supabase, params.id),
    getLatestBrief(supabase, params.id),
  ])

  if (!client) notFound()

  const activeTab = searchParams.tab ?? 'tareas'

  let tabContent: React.ReactNode

  if (activeTab === 'tareas') {
    const sections = await getSectionsWithTasks(supabase, params.id)
    tabContent = <TasksTab sections={sections} />
  } else if (activeTab === 'brief') {
    tabContent = <BriefTab clientId={params.id} brief={latestBrief} />
  } else if (activeTab === 'reporte') {
    const report = await getLatestReport(supabase, params.id)
    tabContent = <ReportTab report={report} />
  }

  return (
    <div className="flex flex-col h-full">
      <ClientHeader client={client} latestBrief={latestBrief} />
      <Suspense>
        <ClientTabs clientId={params.id} />
      </Suspense>
      <div className="flex-1 overflow-y-auto p-7">
        {tabContent}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Loading skeleton**

```typescript
// src/app/clientes/[id]/loading.tsx
export default function ClienteLoading() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* Header skeleton */}
      <div className="bg-sidebar border-b border-border px-7 py-0 flex items-center gap-3 min-h-[60px]">
        <div className="mr-auto space-y-1.5">
          <div className="h-3.5 w-36 bg-gray-200 rounded" />
          <div className="h-2.5 w-24 bg-gray-100 rounded" />
        </div>
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
        <div className="h-8 w-36 bg-gray-200 rounded-lg" />
      </div>

      {/* Tabs skeleton */}
      <div className="bg-sidebar border-b border-border px-7 py-0 flex gap-2 min-h-[49px] items-end pb-0">
        {['w-14', 'w-12', 'w-16'].map((w, i) => (
          <div key={i} className={`${w} h-3 bg-gray-200 rounded mb-3.5`} />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="p-7 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-item p-4 shadow-card flex gap-3 items-center">
            <div className="w-4 h-4 rounded bg-gray-200 flex-shrink-0" />
            <div className="flex-1 h-3 bg-gray-200 rounded" />
            <div className="w-20 h-3 bg-gray-100 rounded" />
            <div className="w-16 h-3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verificar que `/clientes/[id]` renderiza**

```bash
npm run dev
```

Navegar a `/clientes` con un `id` real de Supabase. Debería verse el header, los tabs y el contenido.

- [ ] **Step 6: Commit**

```bash
git add src/app/clientes/ src/components/client/ClientHeader.tsx src/components/client/ClientTabs.tsx
git commit -m "feat: add client detail page with header and tabs"
```

---

## Task 11: TasksTab

**Files:**
- Create: `src/components/client/tabs/TasksTab.tsx`

- [ ] **Step 1: Implementar TasksTab**

```typescript
// src/components/client/tabs/TasksTab.tsx
import { TaskCard } from '@/components/ui/TaskCard'
import type { SectionWithTasks } from '@/lib/types'

export function TasksTab({ sections }: { sections: SectionWithTasks[] }) {
  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="font-unbounded font-bold text-sm text-text mb-1">Sin tareas</p>
        <p className="text-xs text-text-muted font-poppins">
          Generá un reporte para sincronizar las tareas desde Asana
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.id}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider font-poppins">
              {section.name}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {section.tasks.length === 0 ? (
            <p className="text-xs text-text-muted font-poppins px-1">Sin tareas en esta sección</p>
          ) : (
            <div className="space-y-1.5">
              {section.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/client/tabs/TasksTab.tsx
git commit -m "feat: add TasksTab component"
```

---

## Task 12: BriefTab con editor

**Files:**
- Create: `src/components/client/tabs/BriefTab.tsx`

- [ ] **Step 1: Implementar BriefTab**

```typescript
// src/components/client/tabs/BriefTab.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { upsertBrief } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import type { Brief } from '@/lib/types'

export function BriefTab({ clientId, brief }: { clientId: string; brief: Brief | null }) {
  const [editing, setEditing] = useState(!brief)
  const [content, setContent] = useState(brief?.content ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleSave() {
    if (!content.trim()) return
    setError(null)
    const supabase = createClient()
    try {
      await upsertBrief(supabase, clientId, content.trim())
      startTransition(() => {
        router.refresh()
        setEditing(false)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  return (
    <div className="max-w-2xl">
      {editing ? (
        <div className="bg-white rounded-card shadow-card p-6 space-y-4">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider font-poppins">
            Brief del proyecto
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describí el alcance prometido al cliente: entregables, cantidades, plataformas, fechas clave..."
            className="w-full h-48 text-sm font-poppins text-text bg-bg border border-border rounded-item p-4 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand placeholder:text-text-muted"
          />
          {error && <p className="text-xs text-red-500 font-poppins">{error}</p>}
          <div className="flex gap-2 justify-end">
            {brief && (
              <button
                onClick={() => { setEditing(false); setContent(brief.content) }}
                className="px-4 py-2 text-xs font-poppins font-medium text-text-secondary hover:text-text transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!content.trim() || isPending}
              className="px-4 py-2 rounded-lg bg-brand text-white text-xs font-poppins font-semibold hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Guardando...' : 'Guardar Brief'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-card shadow-card p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider font-poppins">
              Brief del proyecto
            </p>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-brand font-poppins font-medium hover:underline"
            >
              Editar
            </button>
          </div>
          <p className="text-sm font-poppins text-text leading-relaxed whitespace-pre-wrap">
            {brief?.content}
          </p>
          <p className="text-[10px] text-text-muted font-poppins mt-5">
            Cargado el {formatDate(brief?.created_at ?? null)} · Texto manual
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/client/tabs/BriefTab.tsx
git commit -m "feat: add BriefTab with editor"
```

---

## Task 13: ReportTab

**Files:**
- Create: `src/components/client/tabs/ReportTab.tsx`

- [ ] **Step 1: Implementar ReportTab**

```typescript
// src/components/client/tabs/ReportTab.tsx
import { SemaphoreCard } from '@/components/ui/SemaphoreCard'
import { formatDate } from '@/lib/utils'
import type { Report } from '@/lib/types'

export function ReportTab({ report }: { report: Report | null }) {
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-card bg-gray-100 flex items-center justify-center mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <p className="font-unbounded font-bold text-sm text-text mb-1">Sin reporte generado</p>
        <p className="text-xs text-text-muted font-poppins text-center max-w-xs">
          Hacé click en "Generar Reporte" para analizar el scope vs las tareas de Asana
        </p>
      </div>
    )
  }

  const deviationDotColor: Record<string, string> = {
    high: 'bg-red-400',
    medium: 'bg-yellow-400',
    low: 'bg-purple-400',
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Semaphore */}
      <div className="grid grid-cols-3 gap-3">
        <SemaphoreCard value="verde"    activeStatus={report.status} />
        <SemaphoreCard value="amarillo" activeStatus={report.status} />
        <SemaphoreCard value="rojo"     activeStatus={report.status} />
      </div>

      {/* Summary */}
      {report.summary && (
        <div className="bg-white rounded-card shadow-card p-5">
          <p className="text-xs font-semibold text-text-muted font-poppins uppercase tracking-wider mb-3">Resumen</p>
          <p className="text-sm font-poppins text-text leading-relaxed">{report.summary}</p>
        </div>
      )}

      {/* Deviations */}
      {report.deviations.length > 0 && (
        <div className="bg-white rounded-card shadow-card p-5">
          <p className="text-xs font-semibold text-text-muted font-poppins uppercase tracking-wider mb-3">Desvíos detectados</p>
          <ul className="space-y-2">
            {report.deviations.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm font-poppins text-text py-1.5 border-b border-border last:border-0">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${deviationDotColor[d.severity] ?? 'bg-gray-300'}`} />
                {d.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {report.risks.length > 0 && (
        <div className="bg-white rounded-card shadow-card p-5">
          <p className="text-xs font-semibold text-text-muted font-poppins uppercase tracking-wider mb-3">Riesgos</p>
          <ul className="space-y-2">
            {report.risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm font-poppins text-text py-1.5 border-b border-border last:border-0">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-red-300" />
                {r.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="bg-white rounded-card shadow-card p-5">
          <p className="text-xs font-semibold text-text-muted font-poppins uppercase tracking-wider mb-3">Recomendaciones</p>
          <ul className="space-y-2">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm font-poppins text-text py-1.5 border-b border-border last:border-0">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-brand" />
                {rec.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[10px] text-text-muted font-poppins">
        Generado el {formatDate(report.generated_at)}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/client/tabs/ReportTab.tsx
git commit -m "feat: add ReportTab component"
```

---

## Task 14: API Route — Generar Reporte

**Files:**
- Create: `src/app/api/generate-report/route.ts`

- [ ] **Step 1: Implementar la API route**

```typescript
// src/app/api/generate-report/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: { client_id?: string; brief_id?: string | null }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { client_id, brief_id } = body

  if (!client_id) {
    return NextResponse.json({ error: 'client_id requerido' }, { status: 400 })
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 500 })
  }

  try {
    const n8nRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id, brief_id: brief_id ?? null }),
      signal: AbortSignal.timeout(90_000), // 90s timeout
    })

    if (!n8nRes.ok) {
      const text = await n8nRes.text().catch(() => '')
      console.error('[generate-report] n8n error:', n8nRes.status, text)
      return NextResponse.json(
        { error: `Error en n8n: ${n8nRes.status}` },
        { status: 502 }
      )
    }

    const data = await n8nRes.json().catch(() => ({}))
    return NextResponse.json({ report_id: data.report_id ?? null })
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'TimeoutError'
    console.error('[generate-report] fetch error:', err)
    return NextResponse.json(
      { error: isTimeout ? 'El reporte tardó demasiado — intentá de nuevo' : 'Error de conexión con n8n' },
      { status: isTimeout ? 504 : 502 }
    )
  }
}
```

- [ ] **Step 2: Verificar que la ruta responde**

```bash
# Con el servidor corriendo:
curl -X POST http://localhost:3000/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{"client_id":"test"}'
```

Expected: `{"error":"Webhook no configurado"}` (status 500, porque `.env.local` aún no tiene la URL real).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/generate-report/route.ts
git commit -m "feat: add generate-report API route"
```

---

## Task 15: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Crear README con setup y arquitectura**

```markdown
# PM Tracker — Delivery Tracker PRO

Mini CRM para PMs de Avalon World Agency. Compara el scope prometido al cliente (brief) vs la ejecución real en Asana, y genera reportes automáticos via n8n + IA.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **DB**: Supabase / PostgreSQL
- **Automatización**: n8n (sync Asana → Supabase + agente IA)
- **Deploy**: Vercel

## Setup local

1. Clonar el repo e instalar dependencias:
   ```bash
   npm install
   ```

2. Crear `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xqvhneikjvefciuhcdgt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
   N8N_WEBHOOK_URL=<webhook_url>
   ```

3. Correr dev server:
   ```bash
   npm run dev
   ```

## Flujo "Generar Reporte"

1. PM hace click en "Generar Reporte"
2. `POST /api/generate-report` → llama webhook n8n con `{ client_id, brief_id }`
3. n8n sincroniza Asana → Supabase
4. n8n corre análisis IA y escribe en `pm_reports`
5. Front refresca y muestra el reporte desde Supabase

## Schema Supabase

| Tabla | Propósito |
|-------|-----------|
| `pm_clients` | Clientes con su `asana_project_id` |
| `pm_briefs` | Brief en texto por cliente |
| `pm_sections` | Columnas/secciones del tablero Asana |
| `pm_tasks` | Tareas con campos custom de Asana |
| `pm_reports` | Reportes generados (status + desvíos + recomendaciones) |
| `pm_sync_logs` | Log de sincronizaciones |

## Correr tests

```bash
npm run test:run
```

## Convenciones

- Fuentes: **Unbounded** para títulos, **Poppins** para cuerpo
- Read-only desde el front (excepto `pm_briefs`)
- Sin auth — uso personal de un solo PM
```

- [ ] **Step 2: Commit final**

```bash
git add README.md
git commit -m "docs: add README with setup and architecture"
```

---

## Self-Review

**Spec coverage:**
- ✅ Sidebar con clientes + status tint + config button → Task 8
- ✅ Tabs Tareas / Brief / Reporte → Tasks 10, 11, 12, 13
- ✅ ClientHeader con badge + botón generar → Task 10
- ✅ TasksTab agrupado por sección, vencidas marcadas, sin responsable → Task 11
- ✅ BriefTab con editor → Task 12
- ✅ ReportTab con semáforo + desvíos + recomendaciones + empty state → Task 13
- ✅ API route → n8n webhook con timeout → Task 14
- ✅ Loading state en botón + skeleton de página → Tasks 10, 14
- ✅ Design tokens Tailwind + fuentes → Tasks 5, 6
- ✅ TypeScript types del schema → Task 2
- ✅ Supabase read-only + brief escritura → Tasks 3, 4, 12
- ✅ Tests para utils (única lógica pura testeable) → Task 3

**Placeholder scan:** Sin TBDs ni TODOs en el plan.

**Type consistency:**
- `ReportStatus` definido en Task 2, usado en Tasks 3, 7, 8
- `getStatusColors` retorna `StatusColors` con `dot`, `bgResting`, `bgActive` — todos los componentes usan esas keys
- `upsertBrief` en queries.ts acepta `(supabase, clientId, content)` — BriefTab lo llama igual
- `getClientsWithStatus` retorna `Client[]` con `latest_report_status` — ClientItem accede `client.latest_report_status` ✅
