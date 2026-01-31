'use client'

import { useState, useMemo } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
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

interface Politician {
  id: number
  name: string
  party?: string
}

interface PoliticianComboboxProps {
  politicians: Politician[]
  value: string
  onChange: (value: string) => void
}

export default function PoliticianCombobox({
  politicians,
  value,
  onChange,
}: PoliticianComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedPolitician = useMemo(
    () => politicians.find((p) => String(p.id) === value),
    [politicians, value]
  )

  // Filter politicians client-side for performance with 1700+ items
  const filtered = useMemo(() => {
    if (!search) return politicians.slice(0, 50) // Show first 50 when no search
    const lower = search.toLowerCase()
    return politicians
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          (p.party && p.party.toLowerCase().includes(lower))
      )
      .slice(0, 50) // Limit results for performance
  }, [politicians, search])

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
            ? `${selectedPolitician.name}${selectedPolitician.party ? ` - ${selectedPolitician.party}` : ''}`
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
            placeholder="Type a name or party..."
            value={search}
            onValueChange={setSearch}
            className="dark:text-slate-100"
          />
          <CommandList>
            <CommandEmpty className="dark:text-slate-400">
              No politician found.
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((politician) => (
                <CommandItem
                  key={politician.id}
                  value={String(politician.id)}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? '' : currentValue)
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
                    {politician.party && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-slate-400">
                        {politician.party}
                      </span>
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
