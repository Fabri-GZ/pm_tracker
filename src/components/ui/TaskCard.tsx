import { formatDate, isOverdue, getInitials } from '@/lib/utils'
import type { Task } from '@/lib/types'

export function TaskCard({ task }: { task: Task }) {
  const overdue = isOverdue(task.due_date, task.completed)
  const noAssignee = !task.assignee

  return (
    <div className="flex items-center gap-3 bg-white rounded-item px-4 py-3 shadow-card">
      <div
        className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center ${
          task.completed ? 'bg-brand border-brand' : 'border-gray-300'
        }`}
      >
        {task.completed && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      <span
        className={`flex-1 text-sm font-poppins ${
          task.completed ? 'line-through text-text-muted' : 'text-text'
        }`}
      >
        {task.name}
      </span>

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

      <span className={`text-xs font-poppins ml-2 ${overdue ? 'text-red-500 font-semibold' : 'text-text-muted'}`}>
        {overdue && '⚠ '}{formatDate(task.due_date)}
      </span>
    </div>
  )
}
