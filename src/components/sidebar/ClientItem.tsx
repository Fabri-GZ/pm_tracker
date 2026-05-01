'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getInitials, getStatusColors } from '@/lib/utils'
import { StatusDot } from '@/components/ui/StatusDot'
import type { Client } from '@/lib/types'

export function ClientItem({ client }: { client: Client }) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(`/clientes/${client.id}`)
  const colors = getStatusColors(client.latest_report_status)

  return (
    <Link
      href={`/clientes/${client.id}`}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-item transition-all"
      style={{
        backgroundColor: isActive ? colors.bgActive : colors.bgResting,
      }}
    >
      <span
        className="w-8 h-8 rounded-avatar flex items-center justify-center text-[10px] font-unbounded font-bold flex-shrink-0"
        style={{
          backgroundColor: colors.avatarBg,
          color: colors.avatarText,
        }}
      >
        {getInitials(client.name)}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`text-xs font-poppins truncate ${isActive ? 'font-semibold' : 'font-medium'} text-text`}>
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
