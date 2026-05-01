import { TaskCard } from '@/components/ui/TaskCard'
import type { SectionWithTasks } from '@/lib/types'

export function TasksTab({ sections }: { sections: SectionWithTasks[] }) {
  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-card bg-gray-100 flex items-center justify-center mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        <p className="font-unbounded font-bold text-sm text-text mb-1">Sin tareas</p>
        <p className="text-xs text-text-muted font-poppins text-center max-w-xs">
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
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider font-poppins whitespace-nowrap">
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
