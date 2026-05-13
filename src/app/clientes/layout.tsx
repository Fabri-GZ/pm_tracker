import { after } from 'next/server'
import { ClientSidebar } from '@/components/sidebar/ClientSidebar'
import { SidebarLayout } from '@/components/layout/SidebarLayout'
import { triggerSync } from '@/lib/asana/sync'

export default function ClientesLayout({ children }: { children: React.ReactNode }) {
  after(() => triggerSync())
  return (
    <SidebarLayout sidebar={<ClientSidebar />}>
      {children}
    </SidebarLayout>
  )
}
