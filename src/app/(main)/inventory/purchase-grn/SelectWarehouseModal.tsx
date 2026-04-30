'use client'

import { useState, useEffect } from 'react'
import { X, Warehouse, Package, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from '@/components/ui'
import { GRN_WAREHOUSES, GRN_BINS, type GRNBin } from '@/data/mock/grn'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (warehouse: string, bin: string, warehouseID: number) => void
  initialWarehouse?: string
  initialBin?: string
}

export default function SelectWarehouseModal({
  isOpen,
  onClose,
  onSelect,
  initialWarehouse = '',
  initialBin = '',
}: Props) {
  const [selectedWarehouse, setSelectedWarehouse] = useState(initialWarehouse)
  const [selectedBin, setSelectedBin] = useState(initialBin)
  // Mobile step: 0 = pick warehouse, 1 = pick bin
  const [mobileStep, setMobileStep] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setSelectedWarehouse(initialWarehouse)
      setSelectedBin(initialBin)
      setMobileStep(initialWarehouse ? 1 : 0)
    }
  }, [isOpen, initialWarehouse, initialBin])

  const bins = selectedWarehouse ? (GRN_BINS[selectedWarehouse] ?? []) : []

  function handleWarehouseClick(wh: string) {
    setSelectedWarehouse(wh)
    setSelectedBin('')
    setMobileStep(1)
  }

  function handleBinClick(bin: GRNBin) {
    setSelectedBin(bin.Bin)
  }

  function handleBinDoubleClick(bin: GRNBin) {
    onSelect(bin.Warehouse, bin.Bin, bin.WarehouseID)
  }

  function handleConfirm() {
    const bin = bins.find(b => b.Bin === selectedBin)
    if (!bin) return
    onSelect(bin.Warehouse, bin.Bin, bin.WarehouseID)
  }

  const canConfirm = Boolean(selectedWarehouse && selectedBin)

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent
        className="!max-w-[95vw] sm:max-w-2xl w-full p-0 overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        <DialogHeader className="px-4 py-2.5 border-b border-[rgb(var(--bd-default))] flex-row items-center justify-between">
          <DialogTitle className="text-sm font-semibold text-[rgb(var(--fg-default))] flex items-center gap-2">
            <Warehouse size={15} className="text-[rgb(var(--color-primary))]" />
            Select Warehouse &amp; Bin
          </DialogTitle>
          <button
            onClick={onClose}
            className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--fg-default))] transition-colors"
          >
            <X size={16} />
          </button>
        </DialogHeader>

        {/* ── Desktop Layout: two panels side-by-side ────────────────── */}
        <div className="hidden sm:flex divide-x divide-[rgb(var(--bd-default))]" style={{ minHeight: 320, maxHeight: 420 }}>
          {/* Warehouse panel */}
          <div className="w-1/2 flex flex-col">
            <div className="px-3 py-2 bg-[rgb(var(--bg-subtle))] border-b border-[rgb(var(--bd-default))]">
              <span className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide flex items-center gap-1.5">
                <Warehouse size={12} /> Warehouse
              </span>
            </div>
            <div className="overflow-y-auto flex-1">
              {GRN_WAREHOUSES.map(wh => {
                const active = wh.Warehouse === selectedWarehouse
                return (
                  <button
                    key={wh.Warehouse}
                    onClick={() => handleWarehouseClick(wh.Warehouse)}
                    className={`w-full text-left px-3 py-2.5 text-xs border-b border-[rgb(var(--bd-default))] flex items-center gap-2 transition-colors
                      ${active
                        ? 'bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))] font-medium'
                        : 'hover:bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-primary))]'
                      }`}
                  >
                    {active && <Check size={11} className="text-[rgb(var(--color-primary))] flex-shrink-0" />}
                    {!active && <span className="w-[11px]" />}
                    {wh.Warehouse}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bin panel */}
          <div className="w-1/2 flex flex-col">
            <div className="px-3 py-2 bg-[rgb(var(--bg-subtle))] border-b border-[rgb(var(--bd-default))]">
              <span className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide flex items-center gap-1.5">
                <Package size={12} /> Bin / Location
              </span>
            </div>
            <div className="overflow-y-auto flex-1">
              {!selectedWarehouse && (
                <p className="text-xs text-[rgb(var(--text-muted))] p-4 text-center">
                  Select a warehouse first
                </p>
              )}
              {selectedWarehouse && bins.length === 0 && (
                <p className="text-xs text-[rgb(var(--text-muted))] p-4 text-center">
                  No bins configured
                </p>
              )}
              {bins.map(bin => {
                const active = bin.Bin === selectedBin
                return (
                  <button
                    key={bin.Bin}
                    onClick={() => handleBinClick(bin)}
                    onDoubleClick={() => handleBinDoubleClick(bin)}
                    className={`w-full text-left px-3 py-2.5 text-xs border-b border-[rgb(var(--bd-default))] flex items-center gap-2 transition-colors
                      ${active
                        ? 'bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))] font-medium'
                        : 'hover:bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-primary))]'
                      }`}
                  >
                    {active && <Check size={11} className="text-[rgb(var(--color-primary))] flex-shrink-0" />}
                    {!active && <span className="w-[11px]" />}
                    {bin.Bin}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Mobile Layout: step-by-step ────────────────────────────── */}
        <div className="sm:hidden">
          {mobileStep === 0 && (
            <div>
              <div className="px-3 py-2 bg-[rgb(var(--bg-subtle))] border-b border-[rgb(var(--bd-default))]">
                <span className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide flex items-center gap-1.5">
                  <Warehouse size={12} /> Step 1 — Select Warehouse
                </span>
              </div>
              {GRN_WAREHOUSES.map(wh => (
                <button
                  key={wh.Warehouse}
                  onClick={() => handleWarehouseClick(wh.Warehouse)}
                  className="w-full text-left px-4 py-3.5 text-sm border-b border-[rgb(var(--bd-default))] hover:bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-primary))]"
                >
                  {wh.Warehouse}
                </button>
              ))}
            </div>
          )}

          {mobileStep === 1 && (
            <div>
              <div className="px-3 py-2 bg-[rgb(var(--bg-subtle))] border-b border-[rgb(var(--bd-default))] flex items-center justify-between">
                <span className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide flex items-center gap-1.5">
                  <Package size={12} /> Step 2 — Select Bin
                </span>
                <button
                  onClick={() => setMobileStep(0)}
                  className="text-xs text-[rgb(var(--color-primary))] hover:underline"
                >
                  ← Change Warehouse
                </button>
              </div>
              <p className="px-4 py-2 text-xs text-[rgb(var(--text-muted))]">
                Warehouse: <span className="font-medium text-[rgb(var(--text-primary))]">{selectedWarehouse}</span>
              </p>
              {bins.map(bin => {
                const active = bin.Bin === selectedBin
                return (
                  <button
                    key={bin.Bin}
                    onClick={() => handleBinClick(bin)}
                    className={`w-full text-left px-4 py-3.5 text-sm border-b border-[rgb(var(--bd-default))] flex items-center justify-between
                      ${active
                        ? 'bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))] font-medium'
                        : 'hover:bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-primary))]'
                      }`}
                  >
                    <span>{bin.Bin}</span>
                    {active && <Check size={14} className="text-[rgb(var(--color-primary))]" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-subtle))]">
          <div className="text-xs text-[rgb(var(--text-muted))] hidden sm:block">
            {canConfirm
              ? <span className="text-[rgb(var(--text-primary))]">{selectedWarehouse} — {selectedBin}</span>
              : 'Double-click a bin or select and click Confirm'}
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={handleConfirm} disabled={!canConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}