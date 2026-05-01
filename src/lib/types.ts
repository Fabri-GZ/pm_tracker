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
