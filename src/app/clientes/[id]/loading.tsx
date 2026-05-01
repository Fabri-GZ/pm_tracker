export default function ClienteLoading() {
  return (
    <div className="flex flex-col h-full min-h-screen animate-pulse">
      <div className="bg-sidebar border-b border-border px-7 flex items-center gap-3 min-h-[60px]">
        <div className="mr-auto space-y-1.5">
          <div className="h-3.5 w-36 bg-gray-200 rounded" />
          <div className="h-2.5 w-24 bg-gray-100 rounded" />
        </div>
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
        <div className="h-8 w-36 bg-gray-200 rounded-lg" />
      </div>
      <div className="bg-sidebar border-b border-border px-7 flex items-end min-h-[49px] gap-1">
        {['w-14','w-12','w-16'].map((w, i) => (
          <div key={i} className={`${w} h-3 bg-gray-200 rounded mb-3.5`} />
        ))}
      </div>
      <div className="p-7 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-item p-4 shadow-card flex gap-3 items-center">
            <div className="w-4 h-4 rounded bg-gray-200 flex-shrink-0" />
            <div className="flex-1 h-3 bg-gray-200 rounded" />
            <div className="w-20 h-3 bg-gray-100 rounded" />
            <div className="w-16 h-3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
