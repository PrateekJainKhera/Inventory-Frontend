'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useGlobalAlert } from '@/contexts/GlobalAlertContext'
import { Badge } from '@/components/ui'
import { DataGrid, createActionsColumn } from '@/components/datagrid'
import { MOCK_WAREHOUSES, MOCK_BIN_NAMES } from '@/data/mock/warehouseMaster'
import type { Warehouse, BinName } from '@/data/mock/warehouseMaster'
import WarehouseModal from './WarehouseModal'

let nextId = 100

export default function WarehouseMasterPage() {
  const alerts = useGlobalAlert()

  const [warehouses, setWarehouses] = useState<Warehouse[]>(MOCK_WAREHOUSES)
  const [binNames, setBinNames] = useState<Record<number, BinName[]>>(MOCK_BIN_NAMES)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  const handleCreate = () => {
    setSelectedWarehouse(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleView = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleDelete = (warehouse: Warehouse) => {
    setWarehouses(prev => prev.filter(w => w.WarehouseID !== warehouse.WarehouseID))
    setBinNames(prev => {
      const next = { ...prev }
      delete next[warehouse.WarehouseID]
      return next
    })
    alerts.showSuccess('Deleted', `Warehouse "${warehouse.WarehouseName}" deleted successfully.`)
  }

  const handleSave = (
    data: Omit<Warehouse, 'WarehouseID' | 'WarehouseCode'>,
    bins: BinName[]
  ) => {
    if (selectedWarehouse) {
      setWarehouses(prev =>
        prev.map(w => w.WarehouseID === selectedWarehouse.WarehouseID ? { ...w, ...data } : w)
      )
      setBinNames(prev => ({ ...prev, [selectedWarehouse.WarehouseID]: bins }))
      alerts.showSuccess('Updated', 'Warehouse updated successfully.')
    } else {
      const newId = nextId++
      const count = warehouses.length + 1
      const newWarehouse: Warehouse = {
        WarehouseID: newId,
        WarehouseCode: `WH-${String(count).padStart(3, '0')}`,
        ...data,
      }
      setWarehouses(prev => [...prev, newWarehouse])
      setBinNames(prev => ({ ...prev, [newId]: bins }))
      alerts.showSuccess('Created', 'Warehouse created successfully.')
    }
    setIsModalOpen(false)
  }

  const columns = useMemo(() => {
    const actionsCol = createActionsColumn<Warehouse>({
      onView: (row) => handleView(row),
      onEdit: (row) => handleEdit(row),
      onDelete: (row) => handleDelete(row),
      showView: true,
      showEdit: true,
      showDelete: true,
      mode: 'buttons',
      primaryActions: ['view', 'edit', 'delete'],
      confirmDelete: true,
      deleteConfirmation: {
        title: 'Delete Warehouse',
        description: 'Are you sure you want to delete this warehouse? This action cannot be undone.',
      },
    })

    return [
      actionsCol,
      { accessorKey: 'WarehouseName',      header: 'Warehouse Name' },
      { accessorKey: 'WarehouseCode',      header: 'Warehouse Code' },
      { accessorKey: 'RefWarehouseCode',   header: 'Ref Warehouse Code' },
      { accessorKey: 'City',               header: 'City' },
      { accessorKey: 'Address',            header: 'Address' },
      { accessorKey: 'ProductionUnitName', header: 'Production Unit' },
      { accessorKey: 'BranchName',         header: 'Branch Name' },
      {
        accessorKey: 'IsFloorWarehouse',
        header: 'Is Floor Warehouse',
        cell: ({ row }: { row: { original: Warehouse } }) => (
          <Badge variant={row.original.IsFloorWarehouse ? 'success' : 'default'}>
            {row.original.IsFloorWarehouse ? 'Yes' : 'No'}
          </Badge>
        ),
      },
    ]
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="py-3 px-4 bg-[rgb(var(--bg-default))] min-h-screen"
    >
      {/* Page Title */}
      <div className="text-center mb-2 px-3">
        <h1 className="text-xl font-bold text-[rgb(var(--fg-default))]">Warehouse Master</h1>
      </div>


      {/* DataGrid */}
      <DataGrid
        data={warehouses}
        columns={columns}
        onRowClick={handleEdit}
        getRowId={(row) => String(row.WarehouseID)}
        title="Warehouse List"
        description={`Managing ${warehouses.length} warehouse records`}
        enableRowSelection={false}
        enableFiltering={true}
        enableSorting={true}
        enablePagination={true}
        enableColumnVisibility={true}
        enableColumnResizing={true}
        pageSize={10}
      />

      {/* Modal */}
      <WarehouseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedWarehouse(null)
        }}
        onSave={handleSave}
        warehouseData={selectedWarehouse}
        existingBins={selectedWarehouse ? (binNames[selectedWarehouse.WarehouseID] || []) : []}
        mode={modalMode}
      />
      {/* FAB */}
      <button
        onClick={handleCreate}
        title="Create Warehouse"
        className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-[rgb(var(--color-primary))] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
      >
        <Plus className="h-5 w-5" />
      </button>
    </motion.div>
  )
}