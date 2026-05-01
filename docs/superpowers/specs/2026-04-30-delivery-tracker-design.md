# Delivery Tracker PRO — Design Spec
**Date:** 2026-04-30  
**Status:** Approved

---

## 1. Overview

Mini CRM para el PM de Avalon World Agency. Permite comparar el scope prometido al cliente (brief en texto) vs las tareas ejecutadas en Asana, y generar un reporte automático via n8n + IA que clasifica el estado del proyecto en verde / amarillo / rojo.

---

## 2. Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Base de datos | Supabase / PostgreSQL (read-only desde el front) |
| Automatización | n8n (sync Asana → Supabase + agente IA) |
| Fuentes | Unbounded (títulos) + Poppins (cuerpo) |
| Deploy | Vercel |

---

## 3. Páginas y rutas

```
/                    → redirect a /clientes
/clientes            → lista de clientes en sidebar + placeholder en main
/clientes/[id]       → detalle del cliente con tabs
/clientes/[id]?tab=tareas   (default)
/clientes/[id]?tab=brief
/clientes/[id]?tab=reporte
```

**Sin auth** — uso personal, un solo PM.

---

## 4. Layout

### Sidebar (220px, fijo)
- Logo "PM Tracker" / Avalon World Agency — Unbounded
- Sección "Clientes": lista scrolleable
- Cada cliente tiene:
  - Avatar con iniciales (2 letras) — fondo con color de estado translúcido
  - Nombre (Poppins 500) + subtítulo con último estado
  - Dot de estado (verde/amarillo/rojo/gris)
  - Fondo del item: color de estado al 8% opacidad en reposo, 22% cuando activo
- Config button al fondo
- Sin emojis — iconos SVG

### Main area
- Header: nombre del cliente (Unbounded 700) + badge de estado + botón "Generar Reporte"
- Tabs: Tareas / Brief / Reporte (Poppins, sin emojis)
- Background: `#F4F3F8`

---

## 5. Tabs por cliente

### Tab: Tareas
- Tareas agrupadas por sección de Asana (Alta cliente, Onboarding, Estrategia, Community, Diseñador, Aprobación cliente)
- Cada tarea: checkbox de completado, nombre, responsable (mini-avatar + nombre), fecha de entrega
- Tareas vencidas destacadas en rojo
- Tareas sin responsable marcadas visualmente
- Read-only — solo visualización

### Tab: Brief
- Texto del brief cargado por el PM
- Botón para editar/reemplazar el brief (textarea + guardar)
- Fecha de carga y fuente ("Texto manual")
- Escritura directa a `pm_briefs` en Supabase

### Tab: Reporte
- Semáforo (3 cards: Verde / Amarillo / Rojo) — la activa tiene borde del color
- Sección "Desvíos detectados" — lista con dots de color
- Sección "Resumen" — texto generado por IA
- Sección "Recomendaciones" — lista accionable
- Metadata: fecha/hora de generación
- Estado "Sin reporte" cuando nunca se generó

---

## 6. Flujo "Generar Reporte"

1. PM hace click en "Generar Reporte"
2. Frontend llama `POST /api/generate-report` con `{ client_id, brief_id }`
3. Next.js API route llama al webhook de n8n
4. n8n: sincroniza Asana → Supabase (tareas actualizadas)
5. n8n: agente IA lee brief + tareas → genera análisis
6. n8n: escribe resultado en `pm_reports` (status, summary, deviations, risks, recommendations)
7. n8n devuelve `{ report_id }` al API route
8. Frontend navega al tab Reporte y muestra el resultado leyendo desde Supabase
9. Loading state visible durante el proceso (spinner en botón + skeleton en tab)

---

## 7. Schema Supabase (existente)

```
pm_clients    → id, name, asana_project_id, created_at
pm_briefs     → id, client_id, content, source ('text'), created_at
pm_sections   → id, client_id, name, asana_section_id, order
pm_tasks      → id, section_id, client_id, asana_task_id, name, assignee,
                 start_date, due_date, completed, completed_at,
                 field_aprobado, field_areas, field_proceso, field_plataforma, field_prioridad, notes
pm_reports    → id, client_id, brief_id, status, summary, deviations[], risks[], recommendations[], generated_at
pm_sync_logs  → id, client_id, synced_at, status, error_msg
```

**Pendiente de aplicar (con confirmación del usuario):**
```sql
ALTER TABLE pm_reports
ADD CONSTRAINT pm_reports_status_check
CHECK (status IN ('verde', 'amarillo', 'rojo', 'pendiente'));
```

---

## 8. Componentes clave

```
app/
  layout.tsx                  → sidebar + fonts
  clientes/
    page.tsx                  → placeholder cuando no hay cliente seleccionado
    [id]/
      page.tsx                → shell del cliente (header + tabs)
      loading.tsx             → skeleton
  api/
    generate-report/
      route.ts                → llama webhook n8n

components/
  sidebar/
    ClientSidebar.tsx         → lista de clientes + config
    ClientItem.tsx            → item individual con estado
  client/
    ClientHeader.tsx          → nombre + badge + botón generar
    ClientTabs.tsx            → tabs Tareas/Brief/Reporte
    tabs/
      TasksTab.tsx            → tareas agrupadas por sección
      BriefTab.tsx            → brief + editor
      ReportTab.tsx           → semáforo + desvíos + recomendaciones
  ui/
    StatusBadge.tsx
    StatusDot.tsx
    TaskCard.tsx
    SemaphoreCard.tsx
```

---

## 9. Design tokens

```css
/* Colores */
--color-bg: #F4F3F8
--color-sidebar: #FFFFFF
--color-border: #F0EEF8
--color-purple: #7C3AED
--color-green: #22C55E
--color-yellow: #EAB308
--color-red: #EF4444
--color-text: #1A1A2E
--color-muted: #9CA3AF

/* Tipografía */
--font-title: 'Unbounded', sans-serif   /* logo, nombres, labels semáforo */
--font-body: 'Poppins', sans-serif       /* todo lo demás */

/* Radios */
--radius-card: 12px
--radius-item: 10px
--radius-avatar: 8px
```

---

## 10. Decisiones técnicas

- **No auth**: uso personal, no se implementa autenticación en MVP
- **Read-only desde front**: el front solo lee Supabase; n8n es quien escribe
- **Brief editable**: única escritura directa del front → `pm_briefs` via Supabase client
- **Sin subtareas**: no se modelan en MVP
- **Reporte en texto plano**: no hay integración con Gamma en v1
- **Input brief**: solo texto manual, sin PDF en MVP
- **Webhook síncrono con timeout**: la llamada a n8n puede tardar 30–60s; el frontend muestra loading state
- **Iconos**: SVGs propios (el usuario los proveerá) — por ahora se usan SVGs inline simples
