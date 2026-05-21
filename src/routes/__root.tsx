import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'AUR App Store' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
  }),
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <div className="min-h-screen bg-[#FFF4E0] text-black font-sans selection:bg-[#FF90E8] selection:text-black flex flex-col">
        <header className="border-b-4 border-black py-4 px-6 sticky top-0 z-10 bg-[#FF90E8]">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
              <span className="font-black text-black text-xl leading-none">A</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase text-black">AUR Store</h1>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full p-6">
          <Outlet />
        </main>
        <footer className="py-6 text-center text-sm font-bold tracking-widest uppercase text-black border-t-4 border-black mt-8 bg-white">
          Not affiliated with Arch Linux // Neo-Brutalist Edition
        </footer>
      </div>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
