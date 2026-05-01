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
