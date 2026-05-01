import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  getClientById,
  getLatestBrief,
  getSectionsWithTasks,
  getLatestReport,
} from '@/lib/supabase/queries'
import { ClientHeader } from '@/components/client/ClientHeader'
import { ClientTabs } from '@/components/client/ClientTabs'
import { TasksTab } from '@/components/client/tabs/TasksTab'
import { BriefTab } from '@/components/client/tabs/BriefTab'
import { ReportTab } from '@/components/client/tabs/ReportTab'

type Props = {
  params: { id: string }
  searchParams: { tab?: string }
}

export default async function ClientePage({ params, searchParams }: Props) {
  const supabase = await createClient()
  const [client, latestBrief] = await Promise.all([
    getClientById(supabase, params.id),
    getLatestBrief(supabase, params.id),
  ])

  if (!client) notFound()

  const activeTab = searchParams.tab ?? 'tareas'

  let tabContent: React.ReactNode

  if (activeTab === 'tareas') {
    const sections = await getSectionsWithTasks(supabase, params.id)
    tabContent = <TasksTab sections={sections} />
  } else if (activeTab === 'brief') {
    tabContent = <BriefTab clientId={params.id} brief={latestBrief} />
  } else {
    const report = await getLatestReport(supabase, params.id)
    tabContent = <ReportTab report={report} />
  }

  return (
    <div className="flex flex-col h-full min-h-screen">
      <ClientHeader client={client} latestBrief={latestBrief} />
      <Suspense>
        <ClientTabs clientId={params.id} />
      </Suspense>
      <div className="flex-1 p-7">
        {tabContent}
      </div>
    </div>
  )
}
