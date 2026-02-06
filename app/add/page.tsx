'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Nav from '@/components/Nav'
import { createClient } from '@/lib/supabase'
import PoliticianCombobox from '@/components/PoliticianCombobox'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Client-side Zod schemas for form validation
// ---------------------------------------------------------------------------

const politicianFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters'),
  party: z.string().max(100, 'Party cannot exceed 100 characters').optional().or(z.literal('')),
  constituency: z.string().max(100, 'Constituency cannot exceed 100 characters').optional().or(z.literal('')),
  role: z.string().max(100, 'Role cannot exceed 100 characters').optional().or(z.literal('')),
})

type PoliticianFormValues = z.infer<typeof politicianFormSchema>

const promiseFormSchema = z.object({
  politician_id: z.string().min(1, 'Please select a politician'),
  title: z.string().min(1, 'Promise title is required').max(500, 'Title cannot exceed 500 characters'),
  description: z.string().max(5000, 'Description cannot exceed 5000 characters').optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  promise_date: z.string().optional().or(z.literal('')),
  target_date: z.string().optional().or(z.literal('')),
})

type PromiseFormValues = z.infer<typeof promiseFormSchema>

// ---------------------------------------------------------------------------
// Shared input class names
// ---------------------------------------------------------------------------

const inputBase =
  'w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
const inputNormal = 'border-gray-300 dark:border-slate-600'
const inputError = 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AddPage() {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'politician' | 'promise'>('politician')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // --- Politician form ---
  const {
    register: registerPol,
    handleSubmit: handleSubmitPol,
    formState: { errors: polErrors, isSubmitting: polSubmitting },
    reset: resetPol,
  } = useForm<PoliticianFormValues>({
    resolver: zodResolver(politicianFormSchema),
    defaultValues: { name: '', party: '', constituency: '', role: '' },
  })

  // --- Promise form ---
  const {
    register: registerProm,
    handleSubmit: handleSubmitProm,
    control: promControl,
    formState: { errors: promErrors, isSubmitting: promSubmitting },
    reset: resetProm,
  } = useForm<PromiseFormValues>({
    resolver: zodResolver(promiseFormSchema),
    defaultValues: {
      politician_id: '',
      title: '',
      description: '',
      category: '',
      promise_date: '',
      target_date: '',
    },
  })

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/sign-in')
        return
      }
      setIsAuthenticated(true)
    }

    checkAuth()
  }, [router, supabase.auth])

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <>
        <Nav />
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
          <div className="text-xl text-gray-600 dark:text-slate-400">Loading...</div>
        </main>
      </>
    )
  }

  // Don't render form if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // ---- Submit handlers ----

  const onPoliticianSubmit = async (values: PoliticianFormValues) => {
    try {
      const res = await fetch('/api/politicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          party: values.party || null,
          constituency: values.constituency || null,
          role: values.role || null,
        }),
      })

      if (!res.ok) throw new Error('Failed to create politician')

      toast.success('Politician added successfully')
      resetPol()
      setTimeout(() => router.push('/'), 1500)
    } catch {
      toast.error('Failed to add politician. Please try again.')
    }
  }

  const onPromiseSubmit = async (values: PromiseFormValues) => {
    const politicianIdValue = parseInt(values.politician_id, 10)

    try {
      const res = await fetch('/api/promises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          politician_id: politicianIdValue,
          title: values.title,
          description: values.description || null,
          category: values.category || null,
          promise_date: values.promise_date || null,
          target_date: values.target_date || null,
        }),
      })

      if (!res.ok) throw new Error('Failed to create promise')

      toast.success('Promise added successfully')
      resetProm()
      setTimeout(() => router.push('/'), 1500)
    } catch {
      toast.error('Failed to add promise. Please try again.')
    }
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-slate-50">Add New Entry</h1>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700">
            <div className="border-b border-gray-200 dark:border-slate-700">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('politician')}
                  className={`py-4 px-6 md:px-8 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'politician'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  Add Politician
                </button>
                <button
                  onClick={() => setActiveTab('promise')}
                  className={`py-4 px-6 md:px-8 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'promise'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  Add Promise
                </button>
              </nav>
            </div>

            <div className="p-6 md:p-8">
              {/* ============================================================
                  POLITICIAN FORM
                  ============================================================ */}
              {activeTab === 'politician' ? (
                <form onSubmit={handleSubmitPol(onPoliticianSubmit)} className="space-y-6" noValidate>
                  {/* Name */}
                  <div>
                    <label htmlFor="pol-name" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Name *
                    </label>
                    <input
                      {...registerPol('name')}
                      type="text"
                      id="pol-name"
                      className={cn(inputBase, polErrors.name ? inputError : inputNormal)}
                      aria-invalid={!!polErrors.name}
                      aria-describedby={polErrors.name ? 'error-pol-name' : undefined}
                    />
                    {polErrors.name && (
                      <p id="error-pol-name" className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {polErrors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Party */}
                  <div>
                    <label htmlFor="pol-party" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Party
                    </label>
                    <input
                      {...registerPol('party')}
                      type="text"
                      id="pol-party"
                      className={cn(inputBase, polErrors.party ? inputError : inputNormal)}
                      aria-invalid={!!polErrors.party}
                      aria-describedby={polErrors.party ? 'error-pol-party' : undefined}
                    />
                    {polErrors.party && (
                      <p id="error-pol-party" className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {polErrors.party.message}
                      </p>
                    )}
                  </div>

                  {/* Constituency */}
                  <div>
                    <label htmlFor="pol-constituency" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Constituency
                    </label>
                    <input
                      {...registerPol('constituency')}
                      type="text"
                      id="pol-constituency"
                      className={cn(inputBase, polErrors.constituency ? inputError : inputNormal)}
                      aria-invalid={!!polErrors.constituency}
                      aria-describedby={polErrors.constituency ? 'error-pol-constituency' : undefined}
                    />
                    {polErrors.constituency && (
                      <p id="error-pol-constituency" className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {polErrors.constituency.message}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="pol-role" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Role
                    </label>
                    <input
                      {...registerPol('role')}
                      type="text"
                      id="pol-role"
                      className={cn(inputBase, polErrors.role ? inputError : inputNormal)}
                      aria-invalid={!!polErrors.role}
                      aria-describedby={polErrors.role ? 'error-pol-role' : undefined}
                    />
                    {polErrors.role && (
                      <p id="error-pol-role" className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {polErrors.role.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={polSubmitting}
                    className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    {polSubmitting ? 'Adding...' : 'Add Politician'}
                  </button>
                </form>
              ) : (
                /* ============================================================
                   PROMISE FORM
                   ============================================================ */
                <form onSubmit={handleSubmitProm(onPromiseSubmit)} className="space-y-6" noValidate>
                  {/* Politician */}
                  <div>
                    <label htmlFor="politician_id" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Politician *
                    </label>
                    <Controller
                      name="politician_id"
                      control={promControl}
                      render={({ field }) => (
                        <PoliticianCombobox
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {promErrors.politician_id && (
                      <p id="error-politician-id" className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {promErrors.politician_id.message}
                      </p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="prom-title" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Promise Title *
                    </label>
                    <input
                      {...registerProm('title')}
                      type="text"
                      id="prom-title"
                      className={cn(inputBase, promErrors.title ? inputError : inputNormal)}
                      aria-invalid={!!promErrors.title}
                      aria-describedby={promErrors.title ? 'error-prom-title' : undefined}
                    />
                    {promErrors.title && (
                      <p id="error-prom-title" className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {promErrors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="prom-description" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Description
                    </label>
                    <textarea
                      {...registerProm('description')}
                      id="prom-description"
                      rows={4}
                      className={cn(inputBase, promErrors.description ? inputError : inputNormal)}
                      aria-invalid={!!promErrors.description}
                      aria-describedby={promErrors.description ? 'error-prom-description' : undefined}
                    />
                    {promErrors.description && (
                      <p id="error-prom-description" className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {promErrors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="prom-category" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Category
                    </label>
                    <select
                      {...registerProm('category')}
                      id="prom-category"
                      className={cn(inputBase, promErrors.category ? inputError : inputNormal)}
                      aria-invalid={!!promErrors.category}
                      aria-describedby={promErrors.category ? 'error-prom-category' : undefined}
                    >
                      <option value="">Select a category</option>
                      <option value="Housing">Housing</option>
                      <option value="Health">Health</option>
                      <option value="Childcare">Childcare</option>
                      <option value="Education">Education</option>
                      <option value="Transport">Transport</option>
                      <option value="Climate">Climate</option>
                      <option value="Employment">Employment</option>
                      <option value="Taxation">Taxation</option>
                      <option value="Social Welfare">Social Welfare</option>
                      <option value="Law & Order">Law & Order</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Other">Other</option>
                    </select>
                    {promErrors.category && (
                      <p id="error-prom-category" className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {promErrors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="prom-promise-date" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                        Promise Date
                      </label>
                      <input
                        {...registerProm('promise_date')}
                        type="date"
                        id="prom-promise-date"
                        className={cn(inputBase, promErrors.promise_date ? inputError : inputNormal)}
                        aria-invalid={!!promErrors.promise_date}
                        aria-describedby={promErrors.promise_date ? 'error-prom-promise-date' : undefined}
                      />
                      {promErrors.promise_date && (
                        <p id="error-prom-promise-date" className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {promErrors.promise_date.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="prom-target-date" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                        Target Date
                      </label>
                      <input
                        {...registerProm('target_date')}
                        type="date"
                        id="prom-target-date"
                        className={cn(inputBase, promErrors.target_date ? inputError : inputNormal)}
                        aria-invalid={!!promErrors.target_date}
                        aria-describedby={promErrors.target_date ? 'error-prom-target-date' : undefined}
                      />
                      {promErrors.target_date && (
                        <p id="error-prom-target-date" className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {promErrors.target_date.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={promSubmitting}
                    className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    {promSubmitting ? 'Adding...' : 'Add Promise'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
