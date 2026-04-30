'use client'

import { useState, useMemo, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Plus, Loader2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { Dropdown } from '@/components/ui'
import { DataGrid, createActionsColumn } from '@/components/datagrid'
import { LedgerMasterModal } from './LedgerMasterModal'
import {
  LEDGER_GROUPS,
  MOCK_LEDGER_DATA,
  GROUP_COLUMNS,
} from '@/data/mock/ledgerMaster'
import type { LedgerRecord } from '@/data/mock/ledgerMaster'

let nextId = 100

function LedgerMasterPageContent() {
  const alerts = useGlobalAlert()

  const [selectedMaster, setSelectedMaster] = useState<string>('')
  const [mockData, setMockData] = useState<Record<number, LedgerRecord[]>>(MOCK_LEDGER_DATA)
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<LedgerRecord | null>(null)

  const gridData = selectedMaster ? (mockData[parseInt(selectedMaster)] || []) : []

  const getSelectedMasterName = () => {
    if (!selectedMaster) return 'No Master Selected'
    return LEDGER_GROUPS.find(g => g.LedgerGroupID === parseInt(selectedMaster))?.LedgerGroupNameDisplay || ''
  }

  const dynamicColumns = useMemo((): ColumnDef<LedgerRecord>[] => {
    if (!selectedMaster) return []
    const groupId = parseInt(selectedMaster)
    const cols = GROUP_COLUMNS[groupId] || []

    const fieldCols: ColumnDef<LedgerRecord>[] = cols.map(c => ({
      accessorKey: c.key,
      header: c.header,
    }))

    const actionsCol = createActionsColumn<LedgerRecord>({
      onView: (row) => alerts.showInfo('Ledger Details', Object.entries(row).map(([k, v]) => `${k}: ${v}`).join('\n')),
      onEdit: (row) => handleEdit(row),
      onDelete: (row) => handleDelete(row),
      onDuplicate: (row) => handleDuplicate(row),
      showView: true,
      showEdit: true,
      showDelete: true,
      showDuplicate: true,
      mode: 'buttons',
      primaryActions: ['view', 'edit', 'duplicate', 'delete'],
      confirmDelete: true,
      deleteConfirmation: {
        title: 'Delete Ledger',
        description: 'Are you sure you want to delete this ledger? This action cannot be undone.',
      },
    })

    return [actionsCol, ...fieldCols]
  }, [selectedMaster])

  const masterOptions = LEDGER_GROUPS.map(g => ({
    value: String(g.LedgerGroupID),
    label: g.LedgerGroupNameDisplay,
  }))

  const handleCreate = () => {
    if (!selectedMaster) {
      alerts.showWarning('No Master Selected', 'Please select a master type first.')
      return
    }
    setSelectedItem(null)
    setShowModal(true)
  }

  const handleEdit = (item: LedgerRecord) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const handleDelete = (item: LedgerRecord) => {
    const groupId = parseInt(selectedMaster)
    setMockData(prev => ({
      ...prev,
      [groupId]: prev[groupId].filter(r => r.LedgerID !== item.LedgerID),
    }))
    alerts.showSuccess('Ledger Deleted', 'Ledger has been deleted successfully.')
  }

  const handleDuplicate = (item: LedgerRecord) => {
    const groupId = parseInt(selectedMaster)
    const masterName = getSelectedMasterName()
    const prefix = masterName.slice(0, 3).toUpperCase()
    const newId = nextId++
    const count = (mockData[groupId]?.length || 0) + 1
    const clone: LedgerRecord = {
      ...item,
      LedgerID: newId,
      LedgerCode: `${prefix}-${String(count).padStart(3, '0')}`,
      LedgerName: `${item.LedgerName} (Copy)`,
    }
    setMockData(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), clone],
    }))
    alerts.showSuccess('Ledger Cloned', 'Ledger cloned successfully.')
  }

  const handleSave = (data: Record<string, any>, isSaveAs = false) => {
    const groupId = parseInt(selectedMaster)
    const masterName = getSelectedMasterName()
    const prefix = masterName.slice(0, 3).toUpperCase()

    if (selectedItem && !isSaveAs) {
      setMockData(prev => ({
        ...prev,
        [groupId]: prev[groupId].map(r =>
          r.LedgerID === selectedItem.LedgerID ? { ...r, ...data } : r
        ),
      }))
      alerts.showSuccess('Ledger Updated', 'Ledger has been updated successfully.')
    } else {
      const newId = nextId++
      const count = (mockData[groupId]?.length || 0) + 1
      const newRecord: LedgerRecord = {
        LedgerID: newId,
        LedgerCode: `${prefix}-${String(count).padStart(3, '0')}`,
        LedgerName: data.LedgerName || '',
        ...data,
      }
      setMockData(prev => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), newRecord],
      }))
      alerts.showSuccess(
        isSaveAs ? 'Ledger Cloned' : 'Ledger Created',
        isSaveAs ? 'Ledger cloned successfully.' : 'Ledger has been created successfully.'
      )
    }

    setShowModal(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col overflow-hidden py-3 px-4 bg-[rgb(var(--bg-default))]"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-end gap-3 mb-3 px-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <Dropdown
              placeholder="Select a master type"
              value={selectedMaster}
              onValueChange={(value) => {
                const v = Array.isArray(value) ? value[0] : String(value || '')
                setSelectedMaster(v)
              }}
              options={masterOptions}
              searchable={true}
              clearable={true}
              emptyMessage="No master types available"
              triggerClassName="h-8"
            />
          </div>
        </div>
      </div>


      {/* DataGrid */}
      <DataGrid
        className="flex-1 min-h-0"
        data={selectedMaster ? gridData : []}
        columns={selectedMaster ? dynamicColumns : []}
        onRowClick={handleEdit}
        getRowId={(row) => String(row.LedgerID)}
        title={getSelectedMasterName()}
        description={
          selectedMaster
            ? `Managing ${gridData.length} ${getSelectedMasterName()} records`
            : 'Select a master type from the dropdown above to view and manage data'
        }
        enableVirtualization={false}
        enableColumnResizing={true}
        enableColumnReordering={true}
        enableRowSelection={true}
        rowSelectionMode="single"
        enableFiltering={true}
        enableExport={!!selectedMaster}
        pageSize={25}
        stickyHeader={true}
      />

      {/* FAB */}
      <button
        onClick={handleCreate}
        disabled={!selectedMaster}
        title="Create Ledger"
        className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-[rgb(var(--color-primary))] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl"
      >
        <Plus className="h-5 w-5" />
      </button>

      {/* Modal */}
      {selectedMaster && (
        <LedgerMasterModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          item={selectedItem}
          masterName={getSelectedMasterName()}
          selectedGroupId={parseInt(selectedMaster)}
        />
      )}
    </motion.div>
  )
}

export default function LedgerMasterPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--color-primary))]" />
      </div>
    }>
      <LedgerMasterPageContent />
    </Suspense>
  )
}