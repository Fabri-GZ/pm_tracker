'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function SidebarLayout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — fixed overlay on mobile, in-flow on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:relative md:z-auto md:flex-shrink-0 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-bg min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-sidebar flex-shrink-0">
          <span className="font-unbounded text-sm font-bold text-text leading-snug">
            Avalon World Agency
          </span>
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className="flex items-center justify-center w-9 h-9 text-text-secondary -mr-1"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
          >
            <div className="flex flex-col gap-[5px]">
              <span className={`block h-[2px] w-[22px] bg-current rounded-full origin-center transition-all duration-200 ease-in ${
                isOpen ? 'translate-y-[7px] rotate-45' : ''
              }`} />
              <span className={`block h-[2px] w-[22px] bg-current rounded-full transition-all duration-200 ease-in ${
                isOpen ? 'opacity-0 scale-x-0' : ''
              }`} />
              <span className={`block h-[2px] w-[22px] bg-current rounded-full origin-center transition-all duration-200 ease-in ${
                isOpen ? '-translate-y-[7px] -rotate-45' : ''
              }`} />
            </div>
          </button>
        </div>

        {children}
      </main>
    </div>
  )
}
