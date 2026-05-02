// ─── Types ────────────────────────────────────────────────────────────────────

export interface PendingPOItem {
  TransactionID: number
  LedgerID: number
  LedgerName: string
  MaxVoucherNo: string
  ItemID: number
  ItemGroupID: number
  ItemSubGroupID: number
  ItemCode: string
  ItemName: string
  ItemGroupName: string
  ItemSubGroupName: string
  PurchaseVoucherNo: string
  PurchaseVoucherDate: string
  PurchaseOrderQuantity: number
  PurchaseUnit: string
  StockUnit: string
  PurchaseTolerance: number
  ConversionFactor: number
  WtPerPacking: number
  UnitPerPacking: string
  PurchaseDivision: string
  RefJobCardContentNo: string
  PendingQty: number
  Remark: string
  CreatedBy: string
  ApprovedBy: string
  ProductionUnitName: string
  CompanyName: string
}

export interface GRNVoucher {
  TransactionID: number
  ReceiptVoucherNo: string
  MaxVoucherNo: string
  ReceiptVoucherDate: string
  LedgerID: number
  LedgerName: string
  PurchaseDivision: string
  PurchaseVoucherNo: string
  PurchaseVoucherDate: string
  DeliveryNoteNo: string
  DeliveryNoteDate: string
  EWayBillNumber: string
  EWayBillDate: string
  GateEntryNo: string
  GateEntryDate: string
  GateEntryTransactionID: number
  LRNoVehicleNo: string
  Transporter: string
  BiltyNo: string
  BiltyDate: string
  ReceivedBy: number
  ReceiverName: string
  Narration: string
  CreatedBy: string
  IsVoucherItemApproved: number
}

export interface GRNBatchDetail {
  TransactionID: number
  PurchaseTransactionID: number
  BatchNo: string
  SupplierBatchNo: string
  LedgerID: number
  ItemID: number
  ItemGroupID: number
  ItemSubGroupID: number
  ItemCode: string
  ItemName: string
  ItemSubGroupName: string
  PurchaseVoucherNo: string
  PurchaseVoucherDate: string
  PurchaseOrderQuantity: number
  PurchaseUnit: string
  StockUnit: string
  PurchaseTolerance: number
  ConversionFactor: number
  WtPerPacking: number
  ReceiptWtPerPacking: number
  UnitPerPacking: string
  RefJobCardContentNo: string
  PendingQty: number
  ReceiptQuantity: number
  ReceiptQuantityInPurchaseUnit: number
  ChallanQuantity: number
  MfgDate: string | null
  ExpiryDate: string | null
  WarehouseID: number
  Warehouse: string
  Bin: string
  WarehouseBin: string
  Remark: string
  SizeW?: number
  ItemGroupNameID?: number
}

export interface GRNListItem {
  TransactionID: number
  PurchaseTransactionID: number
  LedgerID: number
  MaxVoucherNo: string
  LedgerName: string
  ReceiptVoucherNo: string
  ReceiptVoucherDate: string
  PurchaseVoucherNo: string
  PurchaseVoucherDate: string
  DeliveryNoteNo: string
  DeliveryNoteDate: string
  GateEntryNo: string
  GateEntryDate: string
  LRNoVehicleNo: string
  Transporter: string
  ReceiverName: string
  CreatedBy: string
  ApprovedBy: string | null
  ApprovalDate: string | null
  Narration: string
  ProductionUnitName: string
  CompanyName: string
}

export interface GRNDetailItem {
  TransactionID: number
  PurchaseTransactionID: number
  ItemID: number
  ItemGroupID: number
  PurchaseVoucherNo: string
  PurchaseVoucherDate: string
  ItemCode: string
  ItemGroupName: string
  ItemSubGroupName: string
  ItemName: string
  PurchaseOrderQuantity: number
  PurchaseUnit: string
  ChallanQuantity: number
  ApprovedQuantity: number
  RejectedQuantity: number
  QCApprovalNO: string
  QCApprovedNarration: string
  BatchNo: string
  StockUnit: string
  ReceiptWtPerPacking: number
  Warehouse: string
  Bin: string
  PurchaseTolerance: number
  WtPerPacking: number
  ConversionFactor: number
  WarehouseID: number
  SizeW?: number
  ItemGroupNameID?: number
  IsVoucherItemApproved?: number
}

export interface GRNWarehouse { Warehouse: string }

export interface GRNBin {
  WarehouseID: number
  Warehouse: string
  Bin: string
}

export interface GRNReceiver {
  LedgerID: number
  LedgerName: string
}

// ─── Generators ───────────────────────────────────────────────────────────────

let _receiptSeq = 5
export const genReceiptNo = () =>
  `REC-${new Date().getFullYear()}-${String(_receiptSeq++).padStart(3, '0')}`

// ─── Lookup Data ──────────────────────────────────────────────────────────────

export const GRN_WAREHOUSES: GRNWarehouse[] = [
  { Warehouse: 'Main Warehouse' },
  { Warehouse: 'Cold Storage' },
  { Warehouse: 'Overflow Store' },
]

export const GRN_BINS: Record<string, GRNBin[]> = {
  'Main Warehouse': [
    { WarehouseID: 1, Warehouse: 'Main Warehouse', Bin: 'Rack A-1' },
    { WarehouseID: 2, Warehouse: 'Main Warehouse', Bin: 'Rack A-2' },
    { WarehouseID: 3, Warehouse: 'Main Warehouse', Bin: 'Rack B-1' },
    { WarehouseID: 4, Warehouse: 'Main Warehouse', Bin: 'Rack B-2' },
  ],
  'Cold Storage': [
    { WarehouseID: 5, Warehouse: 'Cold Storage', Bin: 'Bay 1' },
    { WarehouseID: 6, Warehouse: 'Cold Storage', Bin: 'Bay 2' },
  ],
  'Overflow Store': [
    { WarehouseID: 7, Warehouse: 'Overflow Store', Bin: 'Zone A' },
    { WarehouseID: 8, Warehouse: 'Overflow Store', Bin: 'Zone B' },
  ],
}

export const GRN_RECEIVERS: GRNReceiver[] = [
  { LedgerID: 1, LedgerName: 'Ramesh Kumar' },
  { LedgerID: 2, LedgerName: 'Priya Singh' },
  { LedgerID: 3, LedgerName: 'Suresh Patel' },
  { LedgerID: 4, LedgerName: 'Amit Verma' },
]

// ─── Mock: Pending PO Items (approved POs with PendingQty > 0) ────────────────

export const MOCK_PENDING_PO_ITEMS: PendingPOItem[] = [
  {
    TransactionID: 501,
    LedgerID: 1,
    LedgerName: 'ABC Suppliers Pvt Ltd',
    MaxVoucherNo: 'PO-2026-005',
    ItemID: 1,
    ItemGroupID: 10,
    ItemSubGroupID: 101,
    ItemCode: 'ITEM-A001',
    ItemName: 'Polymers Granules',
    ItemGroupName: 'Raw Material',
    ItemSubGroupName: 'Plastic',
    PurchaseVoucherNo: 'PO-2026-005',
    PurchaseVoucherDate: '2026-04-12',
    PurchaseOrderQuantity: 600,
    PurchaseUnit: 'KG',
    StockUnit: 'KG',
    PurchaseTolerance: 5,
    ConversionFactor: 1,
    WtPerPacking: 25,
    UnitPerPacking: '25 KG bags',
    PurchaseDivision: 'DIV001',
    RefJobCardContentNo: 'JC-1010',
    PendingQty: 600,
    Remark: 'Grade A required',
    CreatedBy: 'Ramesh Kumar',
    ApprovedBy: 'Admin',
    ProductionUnitName: 'Unit 1',
    CompanyName: 'Indas Analytics',
  },
  {
    TransactionID: 502,
    LedgerID: 1,
    LedgerName: 'ABC Suppliers Pvt Ltd',
    MaxVoucherNo: 'PO-2026-005',
    ItemID: 4,
    ItemGroupID: 14,
    ItemSubGroupID: 141,
    ItemCode: 'ITEM-D004',
    ItemName: 'Water Based Adhesive',
    ItemGroupName: 'Chemicals',
    ItemSubGroupName: 'Adhesive',
    PurchaseVoucherNo: 'PO-2026-005',
    PurchaseVoucherDate: '2026-04-12',
    PurchaseOrderQuantity: 150,
    PurchaseUnit: 'KG',
    StockUnit: 'KG',
    PurchaseTolerance: 2,
    ConversionFactor: 1,
    WtPerPacking: 50,
    UnitPerPacking: '50 KG drum',
    PurchaseDivision: 'DIV001',
    RefJobCardContentNo: 'JC-1010',
    PendingQty: 150,
    Remark: '',
    CreatedBy: 'Sunita Verma',
    ApprovedBy: 'Admin',
    ProductionUnitName: 'Unit 1',
    CompanyName: 'Indas Analytics',
  },
  {
    TransactionID: 503,
    LedgerID: 2,
    LedgerName: 'XYZ Trading Company',
    MaxVoucherNo: 'PO-2026-006',
    ItemID: 2,
    ItemGroupID: 11,
    ItemSubGroupID: 111,
    ItemCode: 'ITEM-B002',
    ItemName: 'Black Solvent Ink',
    ItemGroupName: 'Inks',
    ItemSubGroupName: 'Solvent',
    PurchaseVoucherNo: 'PO-2026-006',
    PurchaseVoucherDate: '2026-04-14',
    PurchaseOrderQuantity: 80,
    PurchaseUnit: 'LTR',
    StockUnit: 'LTR',
    PurchaseTolerance: 0,
    ConversionFactor: 1,
    WtPerPacking: 20,
    UnitPerPacking: '20 LTR can',
    PurchaseDivision: 'DIV001',
    RefJobCardContentNo: 'JC-1011',
    PendingQty: 80,
    Remark: 'Colour match required',
    CreatedBy: 'Priya Sharma',
    ApprovedBy: 'Admin',
    ProductionUnitName: 'Unit 1',
    CompanyName: 'Indas Analytics',
  },
  {
    TransactionID: 504,
    LedgerID: 2,
    LedgerName: 'XYZ Trading Company',
    MaxVoucherNo: 'PO-2026-006',
    ItemID: 5,
    ItemGroupID: 11,
    ItemSubGroupID: 112,
    ItemCode: 'ITEM-E005',
    ItemName: 'Yellow Solvent Ink',
    ItemGroupName: 'Inks',
    ItemSubGroupName: 'Solvent',
    PurchaseVoucherNo: 'PO-2026-006',
    PurchaseVoucherDate: '2026-04-14',
    PurchaseOrderQuantity: 40,
    PurchaseUnit: 'LTR',
    StockUnit: 'LTR',
    PurchaseTolerance: 0,
    ConversionFactor: 1,
    WtPerPacking: 20,
    UnitPerPacking: '20 LTR can',
    PurchaseDivision: 'DIV001',
    RefJobCardContentNo: 'JC-1011',
    PendingQty: 40,
    Remark: '',
    CreatedBy: 'Priya Sharma',
    ApprovedBy: 'Admin',
    ProductionUnitName: 'Unit 1',
    CompanyName: 'Indas Analytics',
  },
  {
    TransactionID: 505,
    LedgerID: 3,
    LedgerName: 'Global Materials Inc',
    MaxVoucherNo: 'PO-2026-007',
    ItemID: 3,
    ItemGroupID: 12,
    ItemSubGroupID: 121,
    ItemCode: 'ITEM-C003',
    ItemName: 'Transparent BOPP Film 30 Micron',
    ItemGroupName: 'Packaging',
    ItemSubGroupName: 'BOPP Film',
    PurchaseVoucherNo: 'PO-2026-007',
    PurchaseVoucherDate: '2026-04-16',
    PurchaseOrderQuantity: 500,
    PurchaseUnit: 'KG',
    StockUnit: 'KG',
    PurchaseTolerance: 3,
    ConversionFactor: 1,
    WtPerPacking: 100,
    UnitPerPacking: '100 KG roll',
    PurchaseDivision: 'DIV002',
    RefJobCardContentNo: 'JC-1012',
    PendingQty: 300,
    Remark: 'Partial receipt allowed',
    CreatedBy: 'Amit Patel',
    ApprovedBy: 'Manager',
    ProductionUnitName: 'Unit 2',
    CompanyName: 'Indas Analytics',
  },
]

// ─── Mock: GRN Vouchers (saved receipt notes) ─────────────────────────────────

export const MOCK_GRN_VOUCHERS: GRNVoucher[] = [
  {
    TransactionID: 1001,
    ReceiptVoucherNo: 'REC-2026-001',
    MaxVoucherNo: 'REC-2026-001',
    ReceiptVoucherDate: '2026-04-18',
    LedgerID: 1,
    LedgerName: 'ABC Suppliers Pvt Ltd',
    PurchaseDivision: 'DIV001',
    PurchaseVoucherNo: 'PO-2026-005',
    PurchaseVoucherDate: '2026-04-12',
    DeliveryNoteNo: 'DN-7001',
    DeliveryNoteDate: '2026-04-17',
    EWayBillNumber: 'EWB-123456',
    EWayBillDate: '2026-04-17',
    GateEntryNo: 'GE-501',
    GateEntryDate: '2026-04-18',
    GateEntryTransactionID: 0,
    LRNoVehicleNo: 'GJ-01-AA-1234',
    Transporter: 'Fast Logistics',
    BiltyNo: 'BLT-001',
    BiltyDate: '2026-04-17',
    ReceivedBy: 1,
    ReceiverName: 'Ramesh Kumar',
    Narration: 'Received in good condition',
    CreatedBy: 'Ramesh Kumar',
    IsVoucherItemApproved: 0,
  },
  {
    TransactionID: 1002,
    ReceiptVoucherNo: 'REC-2026-002',
    MaxVoucherNo: 'REC-2026-002',
    ReceiptVoucherDate: '2026-04-20',
    LedgerID: 2,
    LedgerName: 'XYZ Trading Company',
    PurchaseDivision: 'DIV001',
    PurchaseVoucherNo: 'PO-2026-006',
    PurchaseVoucherDate: '2026-04-14',
    DeliveryNoteNo: 'DN-7002',
    DeliveryNoteDate: '2026-04-19',
    EWayBillNumber: '',
    EWayBillDate: '',
    GateEntryNo: '',
    GateEntryDate: '',
    GateEntryTransactionID: 0,
    LRNoVehicleNo: 'GJ-05-ZZ-9988',
    Transporter: 'Quick Move',
    BiltyNo: '',
    BiltyDate: '',
    ReceivedBy: 2,
    ReceiverName: 'Priya Singh',
    Narration: '',
    CreatedBy: 'Priya Sharma',
    IsVoucherItemApproved: 1,
  },
  {
    TransactionID: 1003,
    ReceiptVoucherNo: 'REC-2026-003',
    MaxVoucherNo: 'REC-2026-003',
    ReceiptVoucherDate: '2026-04-22',
    LedgerID: 3,
    LedgerName: 'Global Materials Inc',
    PurchaseDivision: 'DIV002',
    PurchaseVoucherNo: 'PO-2026-007',
    PurchaseVoucherDate: '2026-04-16',
    DeliveryNoteNo: 'DN-7003',
    DeliveryNoteDate: '2026-04-21',
    EWayBillNumber: 'EWB-654321',
    EWayBillDate: '2026-04-21',
    GateEntryNo: 'GE-502',
    GateEntryDate: '2026-04-22',
    GateEntryTransactionID: 0,
    LRNoVehicleNo: 'MH-12-AB-5678',
    Transporter: 'Safe Transport',
    BiltyNo: 'BLT-002',
    BiltyDate: '2026-04-21',
    ReceivedBy: 3,
    ReceiverName: 'Suresh Patel',
    Narration: 'Partial delivery — 200 KG of 500 KG',
    CreatedBy: 'Amit Patel',
    IsVoucherItemApproved: 0,
  },
  {
    TransactionID: 1004,
    ReceiptVoucherNo: 'REC-2026-004',
    MaxVoucherNo: 'REC-2026-004',
    ReceiptVoucherDate: '2026-04-24',
    LedgerID: 1,
    LedgerName: 'ABC Suppliers Pvt Ltd',
    PurchaseDivision: 'DIV001',
    PurchaseVoucherNo: 'PO-2026-005',
    PurchaseVoucherDate: '2026-04-12',
    DeliveryNoteNo: 'DN-7004',
    DeliveryNoteDate: '2026-04-23',
    EWayBillNumber: '',
    EWayBillDate: '',
    GateEntryNo: '',
    GateEntryDate: '',
    GateEntryTransactionID: 0,
    LRNoVehicleNo: 'GJ-01-BB-4321',
    Transporter: 'Fast Logistics',
    BiltyNo: '',
    BiltyDate: '',
    ReceivedBy: 1,
    ReceiverName: 'Ramesh Kumar',
    Narration: 'Second batch delivery',
    CreatedBy: 'Ramesh Kumar',
    IsVoucherItemApproved: 1,
  },
]

// ─── Mock: Batch Details keyed by GRN TransactionID ──────────────────────────

export const MOCK_GRN_BATCH_DETAILS: Record<number, GRNBatchDetail[]> = {
  1001: [
    {
      TransactionID: 1001,
      PurchaseTransactionID: 501,
      BatchNo: '_PO-2026-005_1_1',
      SupplierBatchNo: 'SUP-BATCH-A1',
      LedgerID: 1,
      ItemID: 1,
      ItemGroupID: 10,
      ItemSubGroupID: 101,
      ItemCode: 'ITEM-A001',
      ItemName: 'Polymers Granules',
      ItemSubGroupName: 'Plastic',
      PurchaseVoucherNo: 'PO-2026-005',
      PurchaseVoucherDate: '2026-04-12',
      PurchaseOrderQuantity: 600,
      PurchaseUnit: 'KG',
      StockUnit: 'KG',
      PurchaseTolerance: 5,
      ConversionFactor: 1,
      WtPerPacking: 25,
      ReceiptWtPerPacking: 25,
      UnitPerPacking: '25 KG bags',
      RefJobCardContentNo: 'JC-1010',
      PendingQty: 600,
      ReceiptQuantity: 250,
      ReceiptQuantityInPurchaseUnit: 250,
      ChallanQuantity: 250,
      MfgDate: '2026-03-01',
      ExpiryDate: null,
      WarehouseID: 1,
      Warehouse: 'Main Warehouse',
      Bin: 'Rack A-1',
      WarehouseBin: 'Main Warehouse - Rack A-1',
      Remark: 'Grade A required',
    },
    {
      TransactionID: 1001,
      PurchaseTransactionID: 502,
      BatchNo: '_PO-2026-005_4_1',
      SupplierBatchNo: 'SUP-BATCH-D1',
      LedgerID: 1,
      ItemID: 4,
      ItemGroupID: 14,
      ItemSubGroupID: 141,
      ItemCode: 'ITEM-D004',
      ItemName: 'Water Based Adhesive',
      ItemSubGroupName: 'Adhesive',
      PurchaseVoucherNo: 'PO-2026-005',
      PurchaseVoucherDate: '2026-04-12',
      PurchaseOrderQuantity: 150,
      PurchaseUnit: 'KG',
      StockUnit: 'KG',
      PurchaseTolerance: 2,
      ConversionFactor: 1,
      WtPerPacking: 50,
      ReceiptWtPerPacking: 50,
      UnitPerPacking: '50 KG drum',
      RefJobCardContentNo: 'JC-1010',
      PendingQty: 150,
      ReceiptQuantity: 100,
      ReceiptQuantityInPurchaseUnit: 100,
      ChallanQuantity: 100,
      MfgDate: null,
      ExpiryDate: '2027-04-18',
      WarehouseID: 3,
      Warehouse: 'Main Warehouse',
      Bin: 'Rack B-1',
      WarehouseBin: 'Main Warehouse - Rack B-1',
      Remark: '',
    },
  ],
  1002: [
    {
      TransactionID: 1002,
      PurchaseTransactionID: 503,
      BatchNo: '_PO-2026-006_2_1',
      SupplierBatchNo: 'INK-BLACK-001',
      LedgerID: 2,
      ItemID: 2,
      ItemGroupID: 11,
      ItemSubGroupID: 111,
      ItemCode: 'ITEM-B002',
      ItemName: 'Black Solvent Ink',
      ItemSubGroupName: 'Solvent',
      PurchaseVoucherNo: 'PO-2026-006',
      PurchaseVoucherDate: '2026-04-14',
      PurchaseOrderQuantity: 80,
      PurchaseUnit: 'LTR',
      StockUnit: 'LTR',
      PurchaseTolerance: 0,
      ConversionFactor: 1,
      WtPerPacking: 20,
      ReceiptWtPerPacking: 20,
      UnitPerPacking: '20 LTR can',
      RefJobCardContentNo: 'JC-1011',
      PendingQty: 80,
      ReceiptQuantity: 80,
      ReceiptQuantityInPurchaseUnit: 80,
      ChallanQuantity: 80,
      MfgDate: '2026-03-15',
      ExpiryDate: '2027-03-15',
      WarehouseID: 5,
      Warehouse: 'Cold Storage',
      Bin: 'Bay 1',
      WarehouseBin: 'Cold Storage - Bay 1',
      Remark: 'Colour match required',
    },
    {
      TransactionID: 1002,
      PurchaseTransactionID: 504,
      BatchNo: '_PO-2026-006_5_1',
      SupplierBatchNo: 'INK-YEL-001',
      LedgerID: 2,
      ItemID: 5,
      ItemGroupID: 11,
      ItemSubGroupID: 112,
      ItemCode: 'ITEM-E005',
      ItemName: 'Yellow Solvent Ink',
      ItemSubGroupName: 'Solvent',
      PurchaseVoucherNo: 'PO-2026-006',
      PurchaseVoucherDate: '2026-04-14',
      PurchaseOrderQuantity: 40,
      PurchaseUnit: 'LTR',
      StockUnit: 'LTR',
      PurchaseTolerance: 0,
      ConversionFactor: 1,
      WtPerPacking: 20,
      ReceiptWtPerPacking: 20,
      UnitPerPacking: '20 LTR can',
      RefJobCardContentNo: 'JC-1011',
      PendingQty: 40,
      ReceiptQuantity: 40,
      ReceiptQuantityInPurchaseUnit: 40,
      ChallanQuantity: 40,
      MfgDate: '2026-03-20',
      ExpiryDate: '2027-03-20',
      WarehouseID: 5,
      Warehouse: 'Cold Storage',
      Bin: 'Bay 2',
      WarehouseBin: 'Cold Storage - Bay 2',
      Remark: '',
    },
  ],
  1003: [
    {
      TransactionID: 1003,
      PurchaseTransactionID: 505,
      BatchNo: '_PO-2026-007_3_1',
      SupplierBatchNo: 'BOPP-001',
      LedgerID: 3,
      ItemID: 3,
      ItemGroupID: 12,
      ItemSubGroupID: 121,
      ItemCode: 'ITEM-C003',
      ItemName: 'Transparent BOPP Film 30 Micron',
      ItemSubGroupName: 'BOPP Film',
      PurchaseVoucherNo: 'PO-2026-007',
      PurchaseVoucherDate: '2026-04-16',
      PurchaseOrderQuantity: 500,
      PurchaseUnit: 'KG',
      StockUnit: 'KG',
      PurchaseTolerance: 3,
      ConversionFactor: 1,
      WtPerPacking: 100,
      ReceiptWtPerPacking: 100,
      UnitPerPacking: '100 KG roll',
      RefJobCardContentNo: 'JC-1012',
      PendingQty: 300,
      ReceiptQuantity: 200,
      ReceiptQuantityInPurchaseUnit: 200,
      ChallanQuantity: 200,
      MfgDate: null,
      ExpiryDate: null,
      WarehouseID: 7,
      Warehouse: 'Overflow Store',
      Bin: 'Zone A',
      WarehouseBin: 'Overflow Store - Zone A',
      Remark: 'Partial delivery — 200 KG of 500 KG',
    },
  ],
  1004: [
    {
      TransactionID: 1004,
      PurchaseTransactionID: 501,
      BatchNo: '_PO-2026-005_1_2',
      SupplierBatchNo: 'SUP-BATCH-A2',
      LedgerID: 1,
      ItemID: 1,
      ItemGroupID: 10,
      ItemSubGroupID: 101,
      ItemCode: 'ITEM-A001',
      ItemName: 'Polymers Granules',
      ItemSubGroupName: 'Plastic',
      PurchaseVoucherNo: 'PO-2026-005',
      PurchaseVoucherDate: '2026-04-12',
      PurchaseOrderQuantity: 600,
      PurchaseUnit: 'KG',
      StockUnit: 'KG',
      PurchaseTolerance: 5,
      ConversionFactor: 1,
      WtPerPacking: 25,
      ReceiptWtPerPacking: 25,
      UnitPerPacking: '25 KG bags',
      RefJobCardContentNo: 'JC-1010',
      PendingQty: 350,
      ReceiptQuantity: 350,
      ReceiptQuantityInPurchaseUnit: 350,
      ChallanQuantity: 350,
      MfgDate: '2026-03-10',
      ExpiryDate: null,
      WarehouseID: 2,
      Warehouse: 'Main Warehouse',
      Bin: 'Rack A-2',
      WarehouseBin: 'Main Warehouse - Rack A-2',
      Remark: '',
    },
  ],
}

// ─── Mock: GRN Approval List ──────────────────────────────────────────────────

export const MOCK_GRN_APPROVAL_LIST: GRNListItem[] = [
  {
    TransactionID: 1001,
    PurchaseTransactionID: 501,
    LedgerID: 1,
    MaxVoucherNo: 'REC-2026-001',
    LedgerName: 'ABC Suppliers Pvt Ltd',
    ReceiptVoucherNo: 'REC-2026-001',
    ReceiptVoucherDate: '2026-04-18',
    PurchaseVoucherNo: 'PO-2026-005',
    PurchaseVoucherDate: '2026-04-12',
    DeliveryNoteNo: 'DN-7001',
    DeliveryNoteDate: '2026-04-17',
    GateEntryNo: 'GE-501',
    GateEntryDate: '2026-04-18',
    LRNoVehicleNo: 'GJ-01-AA-1234',
    Transporter: 'Fast Logistics',
    ReceiverName: 'Ramesh Kumar',
    CreatedBy: 'Ramesh Kumar',
    ApprovedBy: null,
    ApprovalDate: null,
    Narration: 'Received in good condition',
    ProductionUnitName: 'Unit 1',
    CompanyName: 'Indas Analytics',
  },
  {
    TransactionID: 1003,
    PurchaseTransactionID: 505,
    LedgerID: 3,
    MaxVoucherNo: 'REC-2026-003',
    LedgerName: 'Global Materials Inc',
    ReceiptVoucherNo: 'REC-2026-003',
    ReceiptVoucherDate: '2026-04-22',
    PurchaseVoucherNo: 'PO-2026-007',
    PurchaseVoucherDate: '2026-04-16',
    DeliveryNoteNo: 'DN-7003',
    DeliveryNoteDate: '2026-04-21',
    GateEntryNo: 'GE-502',
    GateEntryDate: '2026-04-22',
    LRNoVehicleNo: 'MH-12-AB-5678',
    Transporter: 'Safe Transport',
    ReceiverName: 'Suresh Patel',
    CreatedBy: 'Amit Patel',
    ApprovedBy: null,
    ApprovalDate: null,
    Narration: 'Partial delivery — 200 KG of 500 KG',
    ProductionUnitName: 'Unit 2',
    CompanyName: 'Indas Analytics',
  },
  {
    TransactionID: 1002,
    PurchaseTransactionID: 503,
    LedgerID: 2,
    MaxVoucherNo: 'REC-2026-002',
    LedgerName: 'XYZ Trading Company',
    ReceiptVoucherNo: 'REC-2026-002',
    ReceiptVoucherDate: '2026-04-20',
    PurchaseVoucherNo: 'PO-2026-006',
    PurchaseVoucherDate: '2026-04-14',
    DeliveryNoteNo: 'DN-7002',
    DeliveryNoteDate: '2026-04-19',
    GateEntryNo: '',
    GateEntryDate: '',
    LRNoVehicleNo: 'GJ-05-ZZ-9988',
    Transporter: 'Quick Move',
    ReceiverName: 'Priya Singh',
    CreatedBy: 'Priya Sharma',
    ApprovedBy: 'Admin',
    ApprovalDate: '2026-04-21',
    Narration: '',
    ProductionUnitName: 'Unit 1',
    CompanyName: 'Indas Analytics',
  },
  {
    TransactionID: 1004,
    PurchaseTransactionID: 501,
    LedgerID: 1,
    MaxVoucherNo: 'REC-2026-004',
    LedgerName: 'ABC Suppliers Pvt Ltd',
    ReceiptVoucherNo: 'REC-2026-004',
    ReceiptVoucherDate: '2026-04-24',
    PurchaseVoucherNo: 'PO-2026-005',
    PurchaseVoucherDate: '2026-04-12',
    DeliveryNoteNo: 'DN-7004',
    DeliveryNoteDate: '2026-04-23',
    GateEntryNo: '',
    GateEntryDate: '',
    LRNoVehicleNo: 'GJ-01-BB-4321',
    Transporter: 'Fast Logistics',
    ReceiverName: 'Ramesh Kumar',
    CreatedBy: 'Ramesh Kumar',
    ApprovedBy: 'Manager',
    ApprovalDate: '2026-04-25',
    Narration: 'Second batch delivery',
    ProductionUnitName: 'Unit 1',
    CompanyName: 'Indas Analytics',
  },
]

// ─── Mock: GRN Detail Items keyed by TransactionID ───────────────────────────

export const MOCK_GRN_DETAIL_ITEMS: Record<number, GRNDetailItem[]> = {
  1001: [
    {
      TransactionID: 1001, PurchaseTransactionID: 501,
      ItemID: 1, ItemGroupID: 10,
      PurchaseVoucherNo: 'PO-2026-005', PurchaseVoucherDate: '2026-04-12',
      ItemCode: 'ITEM-A001', ItemGroupName: 'Raw Material', ItemSubGroupName: 'Plastic',
      ItemName: 'Polymers Granules',
      PurchaseOrderQuantity: 600, PurchaseUnit: 'KG',
      ChallanQuantity: 250, ApprovedQuantity: 0, RejectedQuantity: 0,
      QCApprovalNO: '', QCApprovedNarration: '',
      BatchNo: '_PO-2026-005_1_1', StockUnit: 'KG',
      ReceiptWtPerPacking: 25, Warehouse: 'Main Warehouse', Bin: 'Rack A-1',
      PurchaseTolerance: 5, WtPerPacking: 25, ConversionFactor: 1, SizeW: 0,
      WarehouseID: 1, ItemGroupNameID: 10,
    },
    {
      TransactionID: 1001, PurchaseTransactionID: 502,
      ItemID: 4, ItemGroupID: 14,
      PurchaseVoucherNo: 'PO-2026-005', PurchaseVoucherDate: '2026-04-12',
      ItemCode: 'ITEM-D004', ItemGroupName: 'Chemicals', ItemSubGroupName: 'Adhesive',
      ItemName: 'Water Based Adhesive',
      PurchaseOrderQuantity: 150, PurchaseUnit: 'KG',
      ChallanQuantity: 100, ApprovedQuantity: 0, RejectedQuantity: 0,
      QCApprovalNO: '', QCApprovedNarration: '',
      BatchNo: '_PO-2026-005_4_1', StockUnit: 'KG',
      ReceiptWtPerPacking: 50, Warehouse: 'Main Warehouse', Bin: 'Rack B-1',
      PurchaseTolerance: 2, WtPerPacking: 50, ConversionFactor: 1, SizeW: 0,
      WarehouseID: 3, ItemGroupNameID: 14,
    },
  ],
  1003: [
    {
      TransactionID: 1003, PurchaseTransactionID: 505,
      ItemID: 3, ItemGroupID: 12,
      PurchaseVoucherNo: 'PO-2026-007', PurchaseVoucherDate: '2026-04-16',
      ItemCode: 'ITEM-C003', ItemGroupName: 'Packaging', ItemSubGroupName: 'BOPP Film',
      ItemName: 'Transparent BOPP Film 30 Micron',
      PurchaseOrderQuantity: 500, PurchaseUnit: 'KG',
      ChallanQuantity: 200, ApprovedQuantity: 0, RejectedQuantity: 0,
      QCApprovalNO: '', QCApprovedNarration: '',
      BatchNo: '_PO-2026-007_3_1', StockUnit: 'KG',
      ReceiptWtPerPacking: 100, Warehouse: 'Overflow Store', Bin: 'Zone A',
      PurchaseTolerance: 3, WtPerPacking: 100, ConversionFactor: 1, SizeW: 0,
      WarehouseID: 7, ItemGroupNameID: 12,
    },
  ],
  1002: [
    {
      TransactionID: 1002, PurchaseTransactionID: 503,
      ItemID: 2, ItemGroupID: 11,
      PurchaseVoucherNo: 'PO-2026-006', PurchaseVoucherDate: '2026-04-14',
      ItemCode: 'ITEM-B002', ItemGroupName: 'Inks', ItemSubGroupName: 'Solvent',
      ItemName: 'Black Solvent Ink',
      PurchaseOrderQuantity: 80, PurchaseUnit: 'LTR',
      ChallanQuantity: 80, ApprovedQuantity: 80, RejectedQuantity: 0,
      QCApprovalNO: 'COA-001', QCApprovedNarration: 'Passed QC',
      BatchNo: '_PO-2026-006_2_1', StockUnit: 'LTR',
      ReceiptWtPerPacking: 20, Warehouse: 'Cold Storage', Bin: 'Bay 1',
      PurchaseTolerance: 0, WtPerPacking: 20, ConversionFactor: 1, SizeW: 0,
      WarehouseID: 5, ItemGroupNameID: 11, IsVoucherItemApproved: 1,
    },
    {
      TransactionID: 1002, PurchaseTransactionID: 504,
      ItemID: 5, ItemGroupID: 11,
      PurchaseVoucherNo: 'PO-2026-006', PurchaseVoucherDate: '2026-04-14',
      ItemCode: 'ITEM-E005', ItemGroupName: 'Inks', ItemSubGroupName: 'Solvent',
      ItemName: 'Yellow Solvent Ink',
      PurchaseOrderQuantity: 40, PurchaseUnit: 'LTR',
      ChallanQuantity: 40, ApprovedQuantity: 38, RejectedQuantity: 2,
      QCApprovalNO: 'COA-002', QCApprovedNarration: '2 cans damaged',
      BatchNo: '_PO-2026-006_5_1', StockUnit: 'LTR',
      ReceiptWtPerPacking: 20, Warehouse: 'Cold Storage', Bin: 'Bay 2',
      PurchaseTolerance: 0, WtPerPacking: 20, ConversionFactor: 1, SizeW: 0,
      WarehouseID: 6, ItemGroupNameID: 11, IsVoucherItemApproved: 1,
    },
  ],
  1004: [
    {
      TransactionID: 1004, PurchaseTransactionID: 501,
      ItemID: 1, ItemGroupID: 10,
      PurchaseVoucherNo: 'PO-2026-005', PurchaseVoucherDate: '2026-04-12',
      ItemCode: 'ITEM-A001', ItemGroupName: 'Raw Material', ItemSubGroupName: 'Plastic',
      ItemName: 'Polymers Granules',
      PurchaseOrderQuantity: 600, PurchaseUnit: 'KG',
      ChallanQuantity: 350, ApprovedQuantity: 350, RejectedQuantity: 0,
      QCApprovalNO: 'COA-003', QCApprovedNarration: 'All good',
      BatchNo: '_PO-2026-005_1_2', StockUnit: 'KG',
      ReceiptWtPerPacking: 25, Warehouse: 'Main Warehouse', Bin: 'Rack A-2',
      PurchaseTolerance: 5, WtPerPacking: 25, ConversionFactor: 1, SizeW: 0,
      WarehouseID: 2, ItemGroupNameID: 10, IsVoucherItemApproved: 1,
    },
  ],
}