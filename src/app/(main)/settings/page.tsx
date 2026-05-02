'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'

const TABS = [
  { id: 'qc', label: 'QC Check', icon: CheckSquare },
]

// ── QC Check Tab ──────────────────────────────────────────────────────────────
function QCCheckTab() {
  const alerts = useGlobalAlert()
  const [qcRequired, setQcRequired] = useState(false)

  const handleSave = () => {
    alerts.showSuccess('Settings Saved', `QC Approval is now ${qcRequired ? 'enabled' : 'disabled'}.`)
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="rounded-lg border border-[rgb(var(--border-default))] bg-[rgb(var(--bg-subtle))] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-[rgb(var(--fg-default))]">QC Approval Required</span>
            <span className="text-xs text-[rgb(var(--fg-muted))]">
              When enabled, GRN items must pass QC approval before stock is updated.
            </span>
          </div>
          <button
            onClick={() => setQcRequired(v => !v)}
            role="switch"
            aria-checked={qcRequired}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none',
              qcRequired ? 'bg-[#002852]' : 'bg-slate-300'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform',
                qcRequired ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-5 py-1.5 text-sm font-semibold rounded-md bg-[#002852] text-white hover:bg-[#003a75] transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('qc')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex overflow-hidden bg-[rgb(var(--bg-default))]"
    >
      {/* Left tab list */}
      <div className="w-44 shrink-0 border-r border-[rgb(var(--border-default))] bg-[rgb(var(--bg-subtle))] flex flex-col py-2">
        <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--fg-muted))]">
          Settings
        </p>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors',
              activeTab === tab.id
                ? 'bg-[rgb(var(--bg-default))] text-[rgb(var(--fg-default))] font-medium border-r-2 border-[#002852]'
                : 'text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--bg-default))] hover:text-[rgb(var(--fg-default))]'
            )}
          >
            <tab.icon className="h-3.5 w-3.5 shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'qc' && <QCCheckTab />}
      </div>
    </motion.div>
  )
}