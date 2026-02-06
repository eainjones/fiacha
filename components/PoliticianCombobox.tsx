'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface PoliticianResult {
  id: number
  name: string
  party_name: string | null
  position_type: string | null
}

interface PoliticianComboboxProps {
  value: string
  onChange: (value: string) => void
}

export default function PoliticianCombobox({
  value,
  onChange,
}: PoliticianComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<PoliticianResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPolitician, setSelectedPolitician] = useState<PoliticianResult | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch search results with debounce
  const fetchResults = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/politicians/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (err) {
      console.error('Failed to search politicians', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (search.length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    debounceRef.current = setTimeout(() => {
      fetchResults(search)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [search, fetchResults])

  // When a value is set externally (e.g. form reset), fetch the politician name
  useEffect(() => {
    if (!value) {
      setSelectedPolitician(null)
      return
    }

    // If the selected politician already matches, skip
    if (selectedPolitician && String(selectedPolitician.id) === value) {
      return
    }

    // Check if we already have it in results
    const found = results.find((p) => String(p.id) === value)
    if (found) {
      setSelectedPolitician(found)
    }
  }, [value, results, selectedPolitician])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between h-auto py-2.5 px-4 font-normal',
            'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800',
            'text-gray-900 dark:text-slate-100',
            'hover:bg-gray-50 dark:hover:bg-slate-700',
            !value && 'text-gray-400 dark:text-slate-500'
          )}
        >
          {selectedPolitician
            ? `${selectedPolitician.name}${selectedPolitician.party_name ? ` - ${selectedPolitician.party_name}` : ''}`
            : 'Search for a politician...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 dark:bg-slate-900 dark:border-slate-700"
        align="start"
      >
        <Command
          className="dark:bg-slate-900"
          shouldFilter={false}
        >
          <CommandInput
            placeholder="Type to search..."
            value={search}
            onValueChange={setSearch}
            className="dark:text-slate-100"
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400 dark:text-slate-500" />
                <span className="ml-2 text-sm text-gray-400 dark:text-slate-500">Searching...</span>
              </div>
            ) : search.length < 2 ? (
              <div className="py-6 text-center text-sm text-gray-400 dark:text-slate-500">
                Type at least 2 characters to search...
              </div>
            ) : (
              <>
                <CommandEmpty className="dark:text-slate-400">
                  No results found.
                </CommandEmpty>
                <CommandGroup>
                  {results.map((politician) => (
                    <CommandItem
                      key={politician.id}
                      value={String(politician.id)}
                      onSelect={(currentValue) => {
                        const newValue = currentValue === value ? '' : currentValue
                        onChange(newValue)
                        if (newValue) {
                          setSelectedPolitician(politician)
                        } else {
                          setSelectedPolitician(null)
                        }
                        setOpen(false)
                        setSearch('')
                      }}
                      className="dark:text-slate-200 dark:data-[selected=true]:bg-slate-800"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === String(politician.id)
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <span>
                        {politician.name}
                        {politician.party_name && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-slate-400">
                            {politician.party_name}
                          </span>
                        )}
                        {politician.position_type && (
                          <span className="ml-1 text-xs text-gray-400 dark:text-slate-500">
                            ({politician.position_type})
                          </span>
                        )}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
