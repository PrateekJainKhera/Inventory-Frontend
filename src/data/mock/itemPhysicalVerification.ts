// ─── Types ─────────────────────────────────────────────────────────────────────

export interface WarehouseItem {
  WarehouseID: number
  Warehouse: string
  Bin: string
}

export interface PhysicalStockItem {
  ItemID: number
  ItemCode: string
  ItemGroupID: number
  ItemSubGroupID: number
  ItemGroupName: string
  ItemSubGroupName: string
  ItemName: string
  ItemDescription: string
  StockUnit: string
  UnitDecimalPlace: number
  PhysicalStock: number
  PhysicalStockPerUnitWithPackingType: string
  BookedStock: number
  AllocatedStock: number
  UnapprovedStock: number
  FreeStock: number
  IncomingStock: number
  OutgoingStock: number
  FloorStock: number
  WtPerPacking: number
  UnitPerPacking: number
  ConversionFactor: number
  Quality: string
  GSM: number
  Manufecturer: string
  Finish: string
  SizeW: number
  SizeL: number
  ProductionUnitName: string
  CompanyName: string
}

export interface StockBatchWiseItem {
  ParentTransactionID: number
  ItemID: number
  ItemGroupID: number
  ItemSubGroupID: number
  ItemCode: string
  ItemGroupName: string
  ItemSubGroupName: string
  ItemName: string
  ItemDescription: string
  StockUnit: string
  BatchStock: number
  GRNNo: string
  GRNDate: string
  BatchNo: string
  BatchID: number
  SupplierBatchNo: string
  MfgDate: string
  ExpiryDate: string
  WarehouseID: number
  Warehouse: string
  Bin: string
}

export interface NewStockItem {
  ParentTransactionID: number
  ItemID: number
  ItemGroupID: number
  ItemSubGroupID: number
  WarehouseID: number
  ItemCode: string
  ItemGroupName: string
  ItemSubGroupName: string
  ItemName: string
  ItemDescription: string
  StockUnit: string
  GRNNo: string
  GRNDate: string
  BatchNo: string
  BatchID: number
  SupplierBatchNo: string
  CurrentStock: number
  NewStock: number
  AdjustedStock: number
  Warehouse: string
  Bin: string
  WtPerPacking: number
  UnitPerPacking: number
  ConversionFactor: number
  MfgDate: string
  ExpiryDate: string
}

export interface VerificationVoucher {
  TransactionID: number
  TransactionDetailID: number
  ItemID: number
  ProductionUnitID: number
  FYear: string
  VoucherNo: string
  VoucherDate: string
  ItemGroupName: string
  ItemSubGroupName: string
  ItemCode: string
  ItemName: string
  StockUnit: string
  OldStockQuantity: number
  NewStockQuantity: number
  AdjustedStockQty: number
  ClosingQty: number
  GRNNo: string
  GRNDate: string
  BatchNo: string
  Warehouse: string
  Bin: string
  Narration: string
  CreatedBy: string
  WtPerPacking: number
  UnitPerPacking: number
  ProductionUnitName: string
  CompanyName: string
}

// ─── Voucher number generator ──────────────────────────────────────────────────

let _ipvSeq = 4
export const genIPVNo = () => `IPV-${new Date().getFullYear()}-${String(_ipvSeq++).padStart(3, '0')}`

// ─── Warehouses ────────────────────────────────────────────────────────────────

export const MOCK_WAREHOUSES: WarehouseItem[] = [
  { WarehouseID: 0, Warehouse: 'Main Godown',   Bin: '' },
  { WarehouseID: 0, Warehouse: 'Paper Store',   Bin: '' },
  { WarehouseID: 0, Warehouse: 'Cold Storage',  Bin: '' },
]

// Bins per warehouse (WarehouseID is unique per bin location)
const BINS: Record<string, WarehouseItem[]> = {
  'Main Godown': [
    { WarehouseID: 1, Warehouse: 'Main Godown', Bin: 'Rack A-1' },
    { WarehouseID: 2, Warehouse: 'Main Godown', Bin: 'Rack A-2' },
    { WarehouseID: 3, Warehouse: 'Main Godown', Bin: 'Rack B-1' },
    { WarehouseID: 4, Warehouse: 'Main Godown', Bin: 'Rack B-2' },
  ],
  'Paper Store': [
    { WarehouseID: 5, Warehouse: 'Paper Store', Bin: 'Bay P-1' },
    { WarehouseID: 6, Warehouse: 'Paper Store', Bin: 'Bay P-2' },
    { WarehouseID: 7, Warehouse: 'Paper Store', Bin: 'Bay P-3' },
  ],
  'Cold Storage': [
    { WarehouseID: 8, Warehouse: 'Cold Storage', Bin: 'Zone C-1' },
    { WarehouseID: 9, Warehouse: 'Cold Storage', Bin: 'Zone C-2' },
  ],
}

export function getBinsForWarehouse(warehouse: string): WarehouseItem[] {
  return BINS[warehouse] ?? []
}

// ─── Physical Stock ────────────────────────────────────────────────────────────

export const MOCK_PHYSICAL_STOCK: PhysicalStockItem[] = [
  {
    ItemID: 1, ItemCode: 'P01597', ItemGroupID: 1, ItemSubGroupID: 11,
    ItemGroupName: 'Paper', ItemSubGroupName: 'Sheet',
    ItemName: 'IVORY, 200 GSM, JK, UnCoated, 711.2 X 558.8 MM',
    ItemDescription: 'Ivory paper for printing', StockUnit: 'Sheet',
    UnitDecimalPlace: 0, PhysicalStock: 11200, PhysicalStockPerUnitWithPackingType: '11200 Sheet',
    BookedStock: 2000, AllocatedStock: 1000, UnapprovedStock: 0, FreeStock: 8200,
    IncomingStock: 0, OutgoingStock: 500, FloorStock: 0,
    WtPerPacking: 25, UnitPerPacking: 500, ConversionFactor: 1,
    Quality: 'IVORY', GSM: 200, Manufecturer: 'JK Paper', Finish: 'Uncoated',
    SizeW: 711.2, SizeL: 558.8, ProductionUnitName: 'Unit 1', CompanyName: 'Indas Analytics',
  },
  {
    ItemID: 2, ItemCode: 'P01550', ItemGroupID: 1, ItemSubGroupID: 11,
    ItemGroupName: 'Paper', ItemSubGroupName: 'Sheet',
    ItemName: 'SBS, 210 GSM, Reel Cut, Coated, A-One',
    ItemDescription: 'SBS coated sheet', StockUnit: 'Sheet',
    UnitDecimalPlace: 0, PhysicalStock: 3000, PhysicalStockPerUnitWithPackingType: '3000 Sheet',
    BookedStock: 500, AllocatedStock: 0, UnapprovedStock: 0, FreeStock: 2500,
    IncomingStock: 0, OutgoingStock: 0, FloorStock: 0,
    WtPerPacking: 30, UnitPerPacking: 500, ConversionFactor: 1,
    Quality: 'SBS', GSM: 210, Manufecturer: 'A-One Paper', Finish: 'Coated',
    SizeW: 700, SizeL: 500, ProductionUnitName: 'Unit 1', CompanyName: 'Indas Analytics',
  },
  {
    ItemID: 3, ItemCode: 'P01599', ItemGroupID: 1, ItemSubGroupID: 12,
    ItemGroupName: 'Paper', ItemSubGroupName: 'Reel',
    ItemName: 'SBS, 300 GSM, Aprilfine, Coated, A-One',
    ItemDescription: '', StockUnit: 'KG',
    UnitDecimalPlace: 2, PhysicalStock: 1500, PhysicalStockPerUnitWithPackingType: '1500 KG',
    BookedStock: 200, AllocatedStock: 0, UnapprovedStock: 0, FreeStock: 1300,
    IncomingStock: 0, OutgoingStock: 0, FloorStock: 0,
    WtPerPacking: 50, UnitPerPacking: 1, ConversionFactor: 1,
    Quality: 'SBS', GSM: 300, Manufecturer: 'Aprilfine', Finish: 'Coated',
    SizeW: 0, SizeL: 0, ProductionUnitName: 'Unit 1', CompanyName: 'Indas Analytics',
  },
  {
    ItemID: 4, ItemCode: 'C00101', ItemGroupID: 5, ItemSubGroupID: 51,
    ItemGroupName: 'Chemical', ItemSubGroupName: 'Adhesive',
    ItemName: 'Water Based Adhesive',
    ItemDescription: 'General purpose adhesive', StockUnit: 'KG',
    UnitDecimalPlace: 2, PhysicalStock: 450, PhysicalStockPerUnitWithPackingType: '450 KG',
    BookedStock: 50, AllocatedStock: 0, UnapprovedStock: 0, FreeStock: 400,
    IncomingStock: 0, OutgoingStock: 0, FloorStock: 0,
    WtPerPacking: 50, UnitPerPacking: 1, ConversionFactor: 1,
    Quality: '', GSM: 0, Manufecturer: '', Finish: '',
    SizeW: 0, SizeL: 0, ProductionUnitName: 'Unit 1', CompanyName: 'Indas Analytics',
  },
  {
    ItemID: 5, ItemCode: 'I00201', ItemGroupID: 4, ItemSubGroupID: 41,
    ItemGroupName: 'Ink', ItemSubGroupName: 'Offset Ink',
    ItemName: 'Black Offset Ink, 1KG',
    ItemDescription: 'Premium black offset ink', StockUnit: 'KG',
    UnitDecimalPlace: 3, PhysicalStock: 120, PhysicalStockPerUnitWithPackingType: '120 KG',
    BookedStock: 20, AllocatedStock: 0, UnapprovedStock: 0, FreeStock: 100,
    IncomingStock: 0, OutgoingStock: 10, FloorStock: 5,
    WtPerPacking: 1, UnitPerPacking: 1, ConversionFactor: 1,
    Quality: '', GSM: 0, Manufecturer: 'Sun Chemical', Finish: '',
    SizeW: 0, SizeL: 0, ProductionUnitName: 'Unit 1', CompanyName: 'Indas Analytics',
  },
  {
    ItemID: 6, ItemCode: 'P01112', ItemGroupID: 1, ItemSubGroupID: 11,
    ItemGroupName: 'Paper', ItemSubGroupName: 'Sheet',
    ItemName: 'Prima Fold SBS, 290 GSM, Century',
    ItemDescription: '', StockUnit: 'Sheet',
    UnitDecimalPlace: 0, PhysicalStock: 5000, PhysicalStockPerUnitWithPackingType: '5000 Sheet',
    BookedStock: 0, AllocatedStock: 0, UnapprovedStock: 0, FreeStock: 5000,
    IncomingStock: 0, OutgoingStock: 0, FloorStock: 0,
    WtPerPacking: 25, UnitPerPacking: 500, ConversionFactor: 1,
    Quality: 'SBS', GSM: 290, Manufecturer: 'Century Paper', Finish: 'Coated',
    SizeW: 630, SizeL: 880, ProductionUnitName: 'Unit 1', CompanyName: 'Indas Analytics',
  },
]

// ─── Batch stock per item ──────────────────────────────────────────────────────

const BATCH_STOCK: Record<number, StockBatchWiseItem[]> = {
  1: [
    {
      ParentTransactionID: 5868, ItemID: 1, ItemGroupID: 1, ItemSubGroupID: 11,
      ItemCode: 'P01597', ItemGroupName: 'Paper', ItemSubGroupName: 'Sheet',
      ItemName: 'IVORY, 200 GSM, JK, UnCoated, 711.2 X 558.8 MM',
      ItemDescription: '', StockUnit: 'Sheet', BatchStock: 4000,
      GRNNo: 'REC00284_26_27', GRNDate: '2026-04-29',
      BatchNo: '10175_PO00264_26_27_5868_1.00', BatchID: 101,
      SupplierBatchNo: 'SUP-BATCH-001', MfgDate: '', ExpiryDate: '',
      WarehouseID: 5, Warehouse: 'Paper Store', Bin: 'Bay P-1',
    },
    {
      ParentTransactionID: 5700, ItemID: 1, ItemGroupID: 1, ItemSubGroupID: 11,
      ItemCode: 'P01597', ItemGroupName: 'Paper', ItemSubGroupName: 'Sheet',
      ItemName: 'IVORY, 200 GSM, JK, UnCoated, 711.2 X 558.8 MM',
      ItemDescription: '', StockUnit: 'Sheet', BatchStock: 7200,
      GRNNo: 'REC00270_26_27', GRNDate: '2026-04-22',
      BatchNo: '10175_PO00250_26_27_5700_1.00', BatchID: 102,
      SupplierBatchNo: 'SUP-BATCH-002', MfgDate: '', ExpiryDate: '',
      WarehouseID: 6, Warehouse: 'Paper Store', Bin: 'Bay P-2',
    },
  ],
  2: [
    {
      ParentTransactionID: 5900, ItemID: 2, ItemGroupID: 1, ItemSubGroupID: 11,
      ItemCode: 'P01550', ItemGroupName: 'Paper', ItemSubGroupName: 'Sheet',
      ItemName: 'SBS, 210 GSM, Reel Cut, Coated, A-One',
      ItemDescription: '', StockUnit: 'Sheet', BatchStock: 3000,
      GRNNo: 'REC00283_26_27', GRNDate: '2026-04-29',
      BatchNo: 'BATCH-283-001', BatchID: 201,
      SupplierBatchNo: '', MfgDate: '', ExpiryDate: '',
      WarehouseID: 5, Warehouse: 'Paper Store', Bin: 'Bay P-1',
    },
  ],
  3: [
    {
      ParentTransactionID: 5820, ItemID: 3, ItemGroupID: 1, ItemSubGroupID: 12,
      ItemCode: 'P01599', ItemGroupName: 'Paper', ItemSubGroupName: 'Reel',
      ItemName: 'SBS, 300 GSM, Aprilfine, Coated, A-One',
      ItemDescription: '', StockUnit: 'KG', BatchStock: 1500,
      GRNNo: 'REC00281_26_27', GRNDate: '2026-04-29',
      BatchNo: 'BATCH-281-001', BatchID: 301,
      SupplierBatchNo: '', MfgDate: '', ExpiryDate: '',
      WarehouseID: 1, Warehouse: 'Main Godown', Bin: 'Rack A-1',
    },
  ],
  4: [
    {
      ParentTransactionID: 5600, ItemID: 4, ItemGroupID: 5, ItemSubGroupID: 51,
      ItemCode: 'C00101', ItemGroupName: 'Chemical', ItemSubGroupName: 'Adhesive',
      ItemName: 'Water Based Adhesive',
      ItemDescription: '', StockUnit: 'KG', BatchStock: 300,
      GRNNo: 'REC00260_26_27', GRNDate: '2026-04-10',
      BatchNo: 'BATCH-260-001', BatchID: 401,
      SupplierBatchNo: 'PADMA-001', MfgDate: '2026-01-15', ExpiryDate: '2027-01-15',
      WarehouseID: 8, Warehouse: 'Cold Storage', Bin: 'Zone C-1',
    },
    {
      ParentTransactionID: 5601, ItemID: 4, ItemGroupID: 5, ItemSubGroupID: 51,
      ItemCode: 'C00101', ItemGroupName: 'Chemical', ItemSubGroupName: 'Adhesive',
      ItemName: 'Water Based Adhesive',
      ItemDescription: '', StockUnit: 'KG', BatchStock: 150,
      GRNNo: 'REC00265_26_27', GRNDate: '2026-04-15',
      BatchNo: 'BATCH-265-001', BatchID: 402,
      SupplierBatchNo: 'PADMA-002', MfgDate: '2026-02-01', ExpiryDate: '2027-02-01',
      WarehouseID: 9, Warehouse: 'Cold Storage', Bin: 'Zone C-2',
    },
  ],
  5: [
    {
      ParentTransactionID: 5400, ItemID: 5, ItemGroupID: 4, ItemSubGroupID: 41,
      ItemCode: 'I00201', ItemGroupName: 'Ink', ItemSubGroupName: 'Offset Ink',
      ItemName: 'Black Offset Ink, 1KG',
      ItemDescription: '', StockUnit: 'KG', BatchStock: 120,
      GRNNo: 'REC00240_26_27', GRNDate: '2026-04-01',
      BatchNo: 'INK-BATCH-001', BatchID: 501,
      SupplierBatchNo: 'SUN-001', MfgDate: '2026-03-01', ExpiryDate: '2027-03-01',
      WarehouseID: 3, Warehouse: 'Main Godown', Bin: 'Rack B-1',
    },
  ],
  6: [
    {
      ParentTransactionID: 5750, ItemID: 6, ItemGroupID: 1, ItemSubGroupID: 11,
      ItemCode: 'P01112', ItemGroupName: 'Paper', ItemSubGroupName: 'Sheet',
      ItemName: 'Prima Fold SBS, 290 GSM, Century',
      ItemDescription: '', StockUnit: 'Sheet', BatchStock: 5000,
      GRNNo: 'REC00277_26_27', GRNDate: '2026-04-28',
      BatchNo: 'BATCH-277-001', BatchID: 601,
      SupplierBatchNo: '', MfgDate: '', ExpiryDate: '',
      WarehouseID: 7, Warehouse: 'Paper Store', Bin: 'Bay P-3',
    },
  ],
}

export function getBatchStockForItem(itemId: number): StockBatchWiseItem[] {
  return BATCH_STOCK[itemId] ?? []
}

// ─── Saved Verification Vouchers ───────────────────────────────────────────────

export const MOCK_VERIFICATION_VOUCHERS: VerificationVoucher[] = [
  {
    TransactionID: 9001, TransactionDetailID: 90011, ItemID: 5,
    ProductionUnitID: 1, FYear: '2026-27',
    VoucherNo: 'IPV-2026-001', VoucherDate: '2026-04-20',
    ItemGroupName: 'Ink', ItemSubGroupName: 'Offset Ink',
    ItemCode: 'I00201', ItemName: 'Black Offset Ink, 1KG',
    StockUnit: 'KG',
    OldStockQuantity: 150, NewStockQuantity: 120, AdjustedStockQty: -30, ClosingQty: 120,
    GRNNo: 'REC00240_26_27', GRNDate: '2026-04-01',
    BatchNo: 'INK-BATCH-001', Warehouse: 'Main Godown', Bin: 'Rack B-1',
    Narration: 'Physical count discrepancy',
    CreatedBy: 'Admin', WtPerPacking: 1, UnitPerPacking: 1,
    ProductionUnitName: 'Unit 1', CompanyName: 'Indas Analytics',
  },
  {
    TransactionID: 9002, TransactionDetailID: 90021, ItemID: 4,
    ProductionUnitID: 1, FYear: '2026-27',
    VoucherNo: 'IPV-2026-002', VoucherDate: '2026-04-25',
    ItemGroupName: 'Chemical', ItemSubGroupName: 'Adhesive',
    ItemCode: 'C00101', ItemName: 'Water Based Adhesive',
    StockUnit: 'KG',
    OldStockQuantity: 320, NewStockQuantity: 300, AdjustedStockQty: -20, ClosingQty: 300,
    GRNNo: 'REC00260_26_27', GRNDate: '2026-04-10',
    BatchNo: 'BATCH-260-001', Warehouse: 'Cold Storage', Bin: 'Zone C-1',
    Narration: 'Annual stock audit',
    CreatedBy: 'Admin', WtPerPacking: 50, UnitPerPacking: 1,
    ProductionUnitName: 'Unit 1', CompanyName: 'Indas Analytics',
  },
  {
    TransactionID: 9003, TransactionDetailID: 90031, ItemID: 1,
    ProductionUnitID: 1, FYear: '2026-27',
    VoucherNo: 'IPV-2026-003', VoucherDate: '2026-04-28',
    ItemGroupName: 'Paper', ItemSubGroupName: 'Sheet',
    ItemCode: 'P01597', ItemName: 'IVORY, 200 GSM, JK, UnCoated, 711.2 X 558.8 MM',
    StockUnit: 'Sheet',
    OldStockQuantity: 4200, NewStockQuantity: 4000, AdjustedStockQty: -200, ClosingQty: 4000,
    GRNNo: 'REC00284_26_27', GRNDate: '2026-04-29',
    BatchNo: '10175_PO00264_26_27_5868_1.00', Warehouse: 'Paper Store', Bin: 'Bay P-1',
    Narration: '',
    CreatedBy: 'Admin', WtPerPacking: 25, UnitPerPacking: 500,
    ProductionUnitName: 'Unit 1', CompanyName: 'Indas Analytics',
  },
]