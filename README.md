# PM Tracker — Delivery Tracker PRO

Mini CRM para PMs de Avalon World Agency. Compara el scope prometido al cliente (brief) vs la ejecución real en Asana, y genera reportes automáticos via n8n + IA.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS v3
- **DB**: Supabase / PostgreSQL (read-only desde el front, excepto briefs)
- **Automatización**: n8n (sync Asana → Supabase + agente IA)
- **Fuentes**: Unbounded (títulos) + Poppins (cuerpo)
- **Deploy**: Vercel

## Setup local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Crear `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xqvhneikjvefciuhcdgt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key_de_supabase_dashboard>
   N8N_WEBHOOK_URL=<url_del_webhook_n8n>
   ```

3. Correr dev server:
   ```bash
   npm run dev
   ```

## Flujo "Generar Reporte"

1. PM hace click en **Generar Reporte**
2. `POST /api/generate-report` → llama webhook n8n con `{ client_id, brief_id }`
3. n8n sincroniza Asana → Supabase (pm_tasks, pm_sections)
4. n8n corre análisis IA y escribe resultado en `pm_reports`
5. Front hace `router.refresh()` y muestra el reporte desde Supabase

## Schema Supabase

| Tabla | Propósito |
|-------|-----------|
| `pm_clients` | Clientes con su `asana_project_id` |
| `pm_briefs` | Brief en texto por cliente (único write desde el front) |
| `pm_sections` | Columnas/secciones del tablero Asana |
| `pm_tasks` | Tareas con campos custom de Asana |
| `pm_reports` | Reportes generados (status + desvíos + recomendaciones) |
| `pm_sync_logs` | Log de sincronizaciones n8n |

## Tests

```bash
npm run test:run   # run once
npm run test       # watch mode
```

13 unit tests en `src/lib/__tests__/utils.test.ts` cubriendo `getInitials`, `isOverdue`, `formatDate`, `getStatusColors`.

## Convenciones

- Fuentes: **Unbounded** para títulos/logos, **Poppins** para el resto
- Sidebar: 220px fijo, fondo de cliente = color del último reporte (transparente)
- Sin auth — uso personal de un solo PM
- El front solo escribe en `pm_briefs` — todo lo demás es read-only
