import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { motion, AnimatePresence } from 'framer-motion'
import Fuse from 'fuse.js'

export const Route = createFileRoute('/')({
  component: Home,
})

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

function Home() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 200)
  const [selectedPkg, setSelectedPkg] = useState<any | null>(null)
  
  const searchAURAction = useAction(api.aur.search)

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['aur', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return []
      return await searchAURAction({ query: debouncedQuery })
    },
    enabled: !!debouncedQuery,
  })

  // Fuzzy sort the results on the client for better relevance
  const sortedResults = useMemo(() => {
    if (!results || results.length === 0 || !debouncedQuery) return []
    const fuse = new Fuse(results, {
      keys: ['Name', 'Description'],
      threshold: 0.4,
      includeScore: true,
    })
    const searchResults = fuse.search(debouncedQuery)
    return searchResults.map(r => r.item)
  }, [results, debouncedQuery])

  const displayResults = sortedResults.length > 0 ? sortedResults : (results || [])

  return (
    <div className="space-y-12 pb-12">
      {/* Search Section */}
      <section className="bg-[#38bdf8] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center space-y-6">
        <h2 className="text-4xl font-black uppercase tracking-tight text-black">Find Packages</h2>
        <p className="text-black font-medium max-w-2xl mx-auto text-lg">
          Fast, fuzzy search across the Arch User Repository.
        </p>
        
        <div className="max-w-2xl mx-auto relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search packages (e.g., yay, spotify)..."
            className="w-full bg-white border-4 border-black px-6 py-4 pl-14 text-black font-bold placeholder-gray-400 focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:translate-x-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          />
          <svg className="w-6 h-6 text-black absolute left-5 top-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </section>

      {/* Results Section */}
      <section className="space-y-6">
        {isLoading && (
          <div className="text-center font-bold text-xl uppercase tracking-widest text-black animate-pulse">
            Searching...
          </div>
        )}
        
        {isError && (
          <div className="text-center font-bold text-xl uppercase tracking-widest text-red-600 bg-red-200 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block mx-auto">
            Error fetching results.
          </div>
        )}

        {!isLoading && !isError && displayResults.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-black uppercase tracking-tight text-black border-b-4 border-black pb-2 w-full">
              Results for "{debouncedQuery}"
            </h3>
          </div>
        )}

        {!isLoading && !isError && displayResults.length === 0 && debouncedQuery && (
          <div className="text-center font-bold text-xl uppercase tracking-widest text-black">
            No packages found
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {displayResults.map((pkg: any, idx: number) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.5) }}
                key={pkg.ID}
                onClick={() => setSelectedPkg(pkg)}
                className="bg-white border-4 border-black p-5 flex flex-col h-full cursor-pointer hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h4 className="text-xl font-black text-black break-all leading-tight">{pkg.Name}</h4>
                  <span className="text-xs font-bold border-2 border-black bg-[#fbbf24] px-2 py-1 whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">v{pkg.Version}</span>
                </div>
                <p className="text-gray-700 font-medium text-sm flex-1 mb-4 line-clamp-3 leading-relaxed">{pkg.Description || "No description provided."}</p>
                
                <div className="flex items-center justify-between text-sm font-bold text-black mt-auto pt-4 border-t-4 border-black">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 bg-[#4ade80] px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" title="Votes">
                      ★ {pkg.NumVotes}
                    </span>
                    <span className="flex items-center gap-1 bg-[#f472b6] px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" title="Popularity">
                      🔥 {pkg.Popularity.toFixed(1)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Package Detail Modal */}
      <AnimatePresence>
        {selectedPkg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPkg(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]"
            >
              <div className="bg-[#fbbf24] border-b-4 border-black p-4 flex justify-between items-center">
                <h2 className="text-2xl font-black truncate pr-4">{selectedPkg.Name}</h2>
                <button
                  onClick={() => setSelectedPkg(null)}
                  className="bg-white border-2 border-black w-8 h-8 flex items-center justify-center font-bold hover:bg-red-400 hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                >
                  X
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h3 className="font-black text-lg mb-1 uppercase tracking-tight">Description</h3>
                  <p className="text-lg font-medium">{selectedPkg.Description || "No description provided."}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#FFF4E0] border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="font-black text-xs uppercase text-gray-500 mb-1">Version</h3>
                    <div className="font-bold">{selectedPkg.Version}</div>
                  </div>
                  <div className="bg-[#FFF4E0] border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="font-black text-xs uppercase text-gray-500 mb-1">Maintainer</h3>
                    <div className="font-bold">{selectedPkg.Maintainer || "Orphaned"}</div>
                  </div>
                  <div className="bg-[#FFF4E0] border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="font-black text-xs uppercase text-gray-500 mb-1">Votes</h3>
                    <div className="font-bold">{selectedPkg.NumVotes}</div>
                  </div>
                  <div className="bg-[#FFF4E0] border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="font-black text-xs uppercase text-gray-500 mb-1">Popularity</h3>
                    <div className="font-bold">{selectedPkg.Popularity.toFixed(2)}</div>
                  </div>
                </div>

                {selectedPkg.URL && (
                  <div>
                    <h3 className="font-black text-lg mb-2 uppercase tracking-tight">Upstream URL</h3>
                    <a
                      href={selectedPkg.URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#FF90E8] text-black font-bold px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                <div>
                  <h3 className="font-black text-lg mb-2 uppercase tracking-tight">Installation</h3>
                  <div className="bg-black text-white p-4 font-mono text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex items-center justify-between">
                    <code>yay -S {selectedPkg.Name}</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText(`yay -S ${selectedPkg.Name}`)}
                      className="bg-white text-black font-bold border-2 border-black px-2 py-1 text-xs hover:bg-gray-200"
                    >
                      COPY
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
