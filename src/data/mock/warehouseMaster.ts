// ─── Types ────────────────────────────────────────────────────────────────────

export interface Warehouse {
  WarehouseID: number
  WarehouseCode: string
  WarehouseName: string
  Address: string
  RefWarehouseCode: string
  City: string
  BranchID: number
  BranchName: string
  ProductionUnitID: number
  ProductionUnitName: string
  IsFloorWarehouse: boolean
}

export interface BinName {
  BinID: number
  BinName: string
  WarehouseID: number
}

export interface City {
  CityName: string
}

export interface Branch {
  BranchID: number
  BranchName: string
}

export interface ProductionUnit {
  ProductionUnitID: number
  ProductionUnitName: string
}

// ─── Mock Warehouses ──────────────────────────────────────────────────────────

export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    WarehouseID: 1,
    WarehouseCode: 'WH-001',
    WarehouseName: 'Main Warehouse',
    Address: '123 Industrial Area, Andheri East, Mumbai - 400069',
    RefWarehouseCode: 'REF-001',
    City: 'Mumbai',
    BranchID: 1,
    BranchName: 'Mumbai Branch',
    ProductionUnitID: 1,
    ProductionUnitName: 'Unit 1',
    IsFloorWarehouse: false,
  },
  {
    WarehouseID: 2,
    WarehouseCode: 'WH-002',
    WarehouseName: 'Floor Store',
    Address: '456 MIDC, Bhosari, Pune - 411026',
    RefWarehouseCode: 'REF-002',
    City: 'Pune',
    BranchID: 2,
    BranchName: 'Pune Branch',
    ProductionUnitID: 1,
    ProductionUnitName: 'Unit 1',
    IsFloorWarehouse: true,
  },
  {
    WarehouseID: 3,
    WarehouseCode: 'WH-003',
    WarehouseName: 'Finished Goods Store',
    Address: '789 Sector 18, Noida - 201301',
    RefWarehouseCode: 'REF-003',
    City: 'Delhi',
    BranchID: 3,
    BranchName: 'Delhi Branch',
    ProductionUnitID: 2,
    ProductionUnitName: 'Unit 2',
    IsFloorWarehouse: false,
  },
]

// ─── Mock Bin Names Per Warehouse ─────────────────────────────────────────────

export const MOCK_BIN_NAMES: Record<number, BinName[]> = {
  1: [
    { BinID: 1, BinName: 'BIN-A1', WarehouseID: 1 },
    { BinID: 2, BinName: 'BIN-A2', WarehouseID: 1 },
    { BinID: 3, BinName: 'BIN-B1', WarehouseID: 1 },
  ],
  2: [
    { BinID: 4, BinName: 'FLOOR-1', WarehouseID: 2 },
    { BinID: 5, BinName: 'FLOOR-2', WarehouseID: 2 },
  ],
  3: [
    { BinID: 6, BinName: 'FG-RACK-1', WarehouseID: 3 },
    { BinID: 7, BinName: 'FG-RACK-2', WarehouseID: 3 },
    { BinID: 8, BinName: 'FG-RACK-3', WarehouseID: 3 },
  ],
}

// ─── Dropdown Options ─────────────────────────────────────────────────────────

export const CITIES: City[] = [
  { CityName: 'Mumbai' },
  { CityName: 'Pune' },
  { CityName: 'Delhi' },
  { CityName: 'Bangalore' },
  { CityName: 'Chennai' },
  { CityName: 'Hyderabad' },
  { CityName: 'Ahmedabad' },
  { CityName: 'Kolkata' },
  { CityName: 'Surat' },
  { CityName: 'Jaipur' },
]

export const BRANCHES: Branch[] = [
  { BranchID: 1, BranchName: 'Mumbai Branch' },
  { BranchID: 2, BranchName: 'Pune Branch' },
  { BranchID: 3, BranchName: 'Delhi Branch' },
  { BranchID: 4, BranchName: 'Bangalore Branch' },
]

export const PRODUCTION_UNITS: ProductionUnit[] = [
  { ProductionUnitID: 1, ProductionUnitName: 'Unit 1' },
  { ProductionUnitID: 2, ProductionUnitName: 'Unit 2' },
  { ProductionUnitID: 3, ProductionUnitName: 'Unit 3' },
]