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
      router.push(`/clientes/${client.id}?tab=reporte`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-sidebar border-b border-border px-7 flex items-center gap-3 min-h-[60px]">
      <div className="mr-auto">
        <h1 className="font-unbounded font-bold text-sm text-text leading-tight">
          {client.name}
        </h1>
        <p className="text-[10px] text-text-muted font-poppins mt-0.5">
          Asana ID: {client.asana_project_id}
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-poppins max-w-xs truncate">{error}</p>
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
