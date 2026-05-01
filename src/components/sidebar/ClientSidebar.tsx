import { createClient } from '@/lib/supabase/server'
import { getClientsWithStatus } from '@/lib/supabase/queries'
import { ClientItem } from './ClientItem'

function SettingsIcon() {
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
      <div className="px-4 py-5 border-b border-border flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-avatar bg-brand flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[11px] font-unbounded font-bold">PM</span>
        </div>
        <div>
          <p className="text-xs font-unbounded font-bold text-text leading-tight">PM Tracker</p>
          <p className="text-[9px] text-text-muted font-poppins">Avalon World Agency</p>
        </div>
      </div>

      <p className="px-4 pt-4 pb-2 text-[10px] font-semibold text-text-muted uppercase tracking-wider font-poppins">
        Clientes
      </p>

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

      <div className="border-t border-border px-2 py-3">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-item text-text-secondary hover:bg-purple-50 hover:text-brand transition-colors font-poppins text-xs">
          <SettingsIcon />
          Configuración
        </button>
      </div>
    </aside>
  )
}
