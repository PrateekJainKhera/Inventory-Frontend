'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { Dropdown } from '@/components/ui'
import { DataGrid, createActionsColumn } from '@/components/datagrid'
import { ItemMasterModal } from './ItemModal'
import { MASTER_GROUPS, MOCK_DATA, GROUP_COLUMNS } from '@/data/mock/itemMaster'
import type { ItemRecord } from '@/data/mock/itemMaster'

export type { ItemRecord }

let nextId = 100

export default function ItemMasterPage() {
  const alerts = useGlobalAlert()

  const [selectedMaster, setSelectedMaster] = useState<string>('')
  const [mockData, setMockData] = useState<Record<number, ItemRecord[]>>(MOCK_DATA)

  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ItemRecord | null>(null)

  const gridData = selectedMaster ? (mockData[parseInt(selectedMaster)] || []) : []

  const dynamicColumns = useMemo((): ColumnDef<ItemRecord>[] => {
    if (!selectedMaster) return []
    const groupId = parseInt(selectedMaster)
    const cols = GROUP_COLUMNS[groupId] || []

    const fieldCols: ColumnDef<ItemRecord>[] = cols.map(key => ({
      accessorKey: key,
      header: key.replace(/([A-Z])/g, ' $1').trim(),
    }))

    const actionsCol = createActionsColumn<ItemRecord>({
      onView: (row) => alerts.showInfo('Item Details', Object.entries(row).map(([k, v]) => `${k}: ${v}`).join('\n')),
      onEdit: (row) => handleEdit(row),
      onDelete: (row) => handleDelete(row),
      showView: true,
      showEdit: true,
      showDelete: true,
      mode: 'buttons',
      primaryActions: ['view', 'edit', 'delete'],
      confirmDelete: true,
      deleteConfirmation: { title: 'Delete Item', description: 'Are you sure you want to delete this item? This action cannot be undone.' },
    })

    return [actionsCol, ...fieldCols]
  }, [selectedMaster])

  const masterOptions = MASTER_GROUPS.map(g => ({ value: String(g.ItemGroupID), label: g.ItemGroupName }))

  const getSelectedMasterName = () => {
    if (!selectedMaster) return 'No Master Selected'
    return MASTER_GROUPS.find(g => g.ItemGroupID === parseInt(selectedMaster))?.ItemGroupName || ''
  }

  const handleCreate = () => {
    if (!selectedMaster) {
      alerts.showWarning('No Master Selected', 'Please select a master type first.')
      return
    }
    setSelectedItem(null)
    setShowModal(true)
  }

  const handleEdit = (item: ItemRecord) => {
    if (!selectedMaster) {
      alerts.showWarning('No Master Selected', 'Please select a master type first.')
      return
    }
    setSelectedItem(item)
    setShowModal(true)
  }

  const handleDelete = (item: ItemRecord) => {
    const groupId = parseInt(selectedMaster)
    setMockData(prev => ({
      ...prev,
      [groupId]: prev[groupId].filter(i => i.ItemID !== item.ItemID),
    }))
    alerts.showSuccess('Item Deleted', 'Item has been deleted successfully.')
  }

  const handleSave = (data: Record<string, any>) => {
    const groupId = parseInt(selectedMaster)
    const masterName = getSelectedMasterName()
    const groupPrefix = masterName.slice(0, 3).toUpperCase()

    if (selectedItem) {
      setMockData(prev => ({
        ...prev,
        [groupId]: prev[groupId].map(i =>
          i.ItemID === selectedItem.ItemID ? { ...i, ...data } : i
        ),
      }))
      alerts.showSuccess(`${masterName} Updated`, 'Item has been updated successfully.')
    } else {
      const newId = nextId++
      const count = (mockData[groupId]?.length || 0) + 1
      const itemCode = `${groupPrefix}-${String(count).padStart(3, '0')}`
      const newItem: ItemRecord = { ItemID: newId, ItemCode: itemCode, ...data }
      setMockData(prev => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), newItem],
      }))
      alerts.showSuccess(`${masterName} Created`, 'Item has been created successfully.')
    }

    setShowModal(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="py-3 px-4 bg-[rgb(var(--bg-default))] min-h-screen"
    >
      {/* Page Title */}
      <div className="text-center px-3">
        <h1 className="text-xl font-bold text-[rgb(var(--fg-default))]">Item Master</h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-end gap-3 mb-3 px-3">
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

      {/* Data Grid */}
      <DataGrid
        data={selectedMaster ? gridData : []}
        columns={selectedMaster ? dynamicColumns : []}
        onRowClick={handleEdit}
        getRowId={(row) => String(row.ItemID)}
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
        title="Create Item"
        className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-[rgb(var(--color-primary))] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl"
      >
        <Plus className="h-5 w-5" />
      </button>

      {/* Modal */}
      {selectedMaster && (
        <ItemMasterModal
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