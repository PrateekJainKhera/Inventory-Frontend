'use client'

import { useState, useMemo } from 'react'
import { X, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input } from '@/components/ui'

export interface GateEntryItem {
  GateEntryID: number
  GateEntryNo: string
  GateEntryDate: string
  GateEntryType: string
  ReceivedFrom: string
  ReceivedThrough: string
  ReceivedThroughNo: string
  VehicleNo: string
  Remark: string
}

const MOCK_GATE_ENTRIES: GateEntryItem[] = [
  { GateEntryID: 1, GateEntryNo: 'GE-2026-001', GateEntryDate: '2026-04-18', GateEntryType: 'Inward', ReceivedFrom: 'Fast Logistics',    ReceivedThrough: 'Road',    ReceivedThroughNo: 'LR-10021', VehicleNo: 'GJ-01-AA-1234', Remark: 'Raw material delivery' },
  { GateEntryID: 2, GateEntryNo: 'GE-2026-002', GateEntryDate: '2026-04-19', GateEntryType: 'Inward', ReceivedFrom: 'Blue Dart Express',  ReceivedThrough: 'Courier', ReceivedThroughNo: 'LR-10022', VehicleNo: 'MH-12-BC-5678', Remark: 'Ink consignment' },
  { GateEntryID: 3, GateEntryNo: 'GE-2026-003', GateEntryDate: '2026-04-20', GateEntryType: 'Inward', ReceivedFrom: 'Gati Transport',     ReceivedThrough: 'Road',    ReceivedThroughNo: 'LR-10023', VehicleNo: 'RJ-14-CD-9012', Remark: 'Packaging film roll' },
  { GateEntryID: 4, GateEntryNo: 'GE-2026-004', GateEntryDate: '2026-04-21', GateEntryType: 'Inward', ReceivedFrom: 'DTDC Logistics',     ReceivedThrough: 'Rail',    ReceivedThroughNo: 'LR-10024', VehicleNo: 'DL-01-EF-3456', Remark: 'Adhesive drums' },
  { GateEntryID: 5, GateEntryNo: 'GE-2026-005', GateEntryDate: '2026-04-22', GateEntryType: 'Inward', ReceivedFrom: 'Fast Logistics',    ReceivedThrough: 'Road',    ReceivedThroughNo: 'LR-10025', VehicleNo: 'GJ-05-GH-7890', Remark: '' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (entry: GateEntryItem) => void
}

export default function SelectGateEntryModal({ isOpen, onClose, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return MOCK_GATE_ENTRIES
    return MOCK_GATE_ENTRIES.filter(e =>
      e.GateEntryNo.toLowerCase().includes(q) ||
      e.ReceivedFrom.toLowerCase().includes(q) ||
      e.VehicleNo.toLowerCase().includes(q) ||
      e.GateEntryType.toLowerCase().includes(q) ||
      e.ReceivedThroughNo.toLowerCase().includes(q)
    )
  }, [search])

  const selectedEntry = filtered.find(e => e.GateEntryID === selectedId) ?? null

  function handleConfirm() {
    if (!selectedEntry) return
    onSelect(selectedEntry)
    setSearch(''); setSelectedId(null)
  }

  function handleClose() {
    setSearch(''); setSelectedId(null); onClose()
  }

  const thCls = 'px-2 py-1.5 text-left text-[10px] font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide whitespace-nowrap border-b border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]'

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="!max-w-[95vw] sm:!max-w-5xl w-full p-0 overflow-hidden flex flex-col" style={{ maxHeight: '85vh' }}>

        {/* ── Title bar ── */}
        <DialogHeader className="flex-shrink-0 px-4 py-2.5 border-b border-[rgb(var(--bd-default))] flex-row items-center justify-between">
          <DialogTitle className="text-sm font-semibold text-[rgb(var(--fg-default))]">
            Select Gate Entry
          </DialogTitle>
          <button onClick={handleClose} className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--fg-default))] transition-colors ml-4">
            <X size={15} />
          </button>
        </DialogHeader>

        {/* ── Search bar ── */}
        <div className="flex-shrink-0 flex items-center justify-end gap-2 px-4 py-2 bg-[rgb(var(--bg-subtle))] border-b border-[rgb(var(--bd-default))]">
          <div className="relative w-56">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
            <Input className="text-xs h-8 pl-8" placeholder="Search gate entries..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className={thCls}>Gate Entry No.</th>
                <th className={thCls}>Gate Entry Date</th>
                <th className={thCls}>Gate Entry Type</th>
                <th className={thCls}>Received From</th>
                <th className={thCls}>Received Through</th>
                <th className={thCls}>Received Through No.</th>
                <th className={thCls}>Vehicle No.</th>
                <th className={thCls}>Remark</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-[rgb(var(--text-muted))]">
                    No gate entries found
                  </td>
                </tr>
              ) : filtered.map(entry => {
                const isSelected = entry.GateEntryID === selectedId
                return (
                  <tr
                    key={entry.GateEntryID}
                    onClick={() => setSelectedId(entry.GateEntryID)}
                    onDoubleClick={() => { setSelectedId(entry.GateEntryID); handleConfirm() }}
                    className={`cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'bg-[rgb(var(--color-primary))]/10 border-l-2 border-l-[rgb(var(--color-primary))]'
                        : 'hover:bg-[rgb(var(--bg-subtle))]'
                    }`}
                  >
                    <td className="px-2 py-2 border-b border-[rgb(var(--bd-default))] font-medium text-[rgb(var(--color-primary))]">{entry.GateEntryNo}</td>
                    <td className="px-2 py-2 border-b border-[rgb(var(--bd-default))] text-[rgb(var(--fg-default))]">{entry.GateEntryDate}</td>
                    <td className="px-2 py-2 border-b border-[rgb(var(--bd-default))] text-[rgb(var(--fg-default))]">{entry.GateEntryType}</td>
                    <td className="px-2 py-2 border-b border-[rgb(var(--bd-default))] text-[rgb(var(--fg-default))]">{entry.ReceivedFrom}</td>
                    <td className="px-2 py-2 border-b border-[rgb(var(--bd-default))] text-[rgb(var(--fg-default))]">{entry.ReceivedThrough}</td>
                    <td className="px-2 py-2 border-b border-[rgb(var(--bd-default))] text-[rgb(var(--fg-default))]">{entry.ReceivedThroughNo}</td>
                    <td className="px-2 py-2 border-b border-[rgb(var(--bd-default))] text-[rgb(var(--fg-default))]">{entry.VehicleNo}</td>
                    <td className="px-2 py-2 border-b border-[rgb(var(--bd-default))] text-[rgb(var(--text-muted))]">{entry.Remark}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]">
          <p className="text-[11px] text-[rgb(var(--text-muted))]">
            {selectedEntry
              ? `Selected: ${selectedEntry.GateEntryNo} — ${selectedEntry.VehicleNo}`
              : 'Click a row to select · Double-click to confirm'}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={handleClose}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={handleConfirm} disabled={!selectedEntry}>
              Select
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}