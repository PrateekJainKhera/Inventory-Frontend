// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface IndentItem {
  _uid: number
  TransactionID: number
  VoucherNo: string
  VoucherDate: string
  ItemID: number
  ItemGroupName: string
  ItemSubGroupName: string
  ItemCode: string
  ItemName: string
  RequiredQuantity: number
  IndentQuantity: number
  StockUnit: string
  JobBookingContentNo: string
  JobName: string
  Source: 'Job Card' | 'Stock'
  PhysicalStock: number
  BookedStock: number
  AllocatedStock: number
  FreeStock: number
  PurchaseUnit: string
  OrderUnit: string
  POQtyInStockUnit: number
  LastPurchaseDate: string
  ProductionUnitName: string
}

export interface RequisitionRecord {
  TransactionID: number
  VoucherNo: string
  VoucherDate: string
  ItemID: number
  ItemCode: string
  ItemGroupName: string
  ItemSubGroupName: string
  ItemName: string
  RefJobCardContentNo: string
  JobName: string
  PurchaseQty: number
  StockUnit: string
  OrderUnit: string
  POQtyInStockUnit: number
  PhysicalStock: number
  AllocatedStock: number
  ExpectedDeliveryDate: string
  ItemNarration: string
  Narration: string
  CreatedBy: string
  ApprovedBy: string
  ProductionUnitName: string
  AuditApproved: boolean
  IsAuditCancelled: boolean
  IsVoucherItemApproved: boolean
  IsCancelled: boolean
  POCreated: boolean
  ManuallyClosed: boolean
}

export interface RequisitionItem {
  ItemID: number
  ItemCode: string
  ItemGroupName: string
  ItemSubGroupName: string
  ItemName: string
  RequiredNoOfPacks: number
  QuantityPerPack: number
  PurchaseQty: number
  RequisitionQty: number
  StockUnit: string
  PurchaseUnit: string
  PhysicalStock: number
  BookedStock: number
  PhysicalStockInPurchaseUnit: number
  ExpectedDeliveryDate: string
  RefJobCardContentNo: string
  JobName: string
  ClientID: number | null
  ItemNarration: string
  LastPurchaseDate: string
  OrderUnit: string
  GSM: number
  SizeW: number
  ConversionFactor: number
  UnitPerPacking: number
}

export interface MasterItem {
  ItemID: number
  ItemGroupName: string
  ItemSubGroupName: string
  ItemCode: string
  ItemName: string
  Quality: string
  GSM: number
  Manufacturer: string
  SizeW: number
  PurchaseUnit: string
  OrderUnit: string
  StockUnit: string
  PhysicalStock: number
  BookedStock: number
  UnitPerPacking: number
  ConversionFactor: number
  LastPurchaseDate: string
}

export interface JobCard {
  value: string
  label: string
  jobId: number
  clientId: number | null
}

export interface Client {
  LedgerID: number
  LedgerName: string
}

// ─── Mock Indent Items ────────────────────────────────────────────────────────

export const MOCK_INDENTS: IndentItem[] = [
  {
    _uid: 1, TransactionID: 1001, VoucherNo: 'IND-001', VoucherDate: '2026-04-10',
    ItemID: 1, ItemGroupName: 'Paper', ItemSubGroupName: 'Art Paper',
    ItemCode: 'REL-001', ItemName: 'Art Paper 80 GSM – 100cm Reel',
    RequiredQuantity: 500, IndentQuantity: 500, StockUnit: 'KG',
    JobBookingContentNo: 'JC-2024-001', JobName: 'Cadbury Wrapper Print',
    Source: 'Job Card', PhysicalStock: 200, BookedStock: 120, AllocatedStock: 80, FreeStock: 80,
    PurchaseUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 500,
    LastPurchaseDate: '2026-03-15', ProductionUnitName: 'Unit A – Printing',
  },
  {
    _uid: 2, TransactionID: 1002, VoucherNo: 'IND-002', VoucherDate: '2026-04-11',
    ItemID: 2, ItemGroupName: 'Paper', ItemSubGroupName: 'Kraft Paper',
    ItemCode: 'REL-002', ItemName: 'Kraft Paper 90 GSM – 75cm Reel',
    RequiredQuantity: 300, IndentQuantity: 300, StockUnit: 'KG',
    JobBookingContentNo: 'JC-2024-002', JobName: 'Shipper Box Run',
    Source: 'Job Card', PhysicalStock: 90, BookedStock: 50, AllocatedStock: 30, FreeStock: 40,
    PurchaseUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 300,
    LastPurchaseDate: '2026-03-20', ProductionUnitName: 'Unit B – Packaging',
  },
  {
    _uid: 3, TransactionID: 1003, VoucherNo: 'IND-003', VoucherDate: '2026-04-12',
    ItemID: 6, ItemGroupName: 'Ink', ItemSubGroupName: 'Process Ink',
    ItemCode: 'INK-001', ItemName: 'Cyan Ink – Standard Grade',
    RequiredQuantity: 25, IndentQuantity: 25, StockUnit: 'KG',
    JobBookingContentNo: 'JC-2024-001', JobName: 'Cadbury Wrapper Print',
    Source: 'Job Card', PhysicalStock: 8, BookedStock: 5, AllocatedStock: 3, FreeStock: 3,
    PurchaseUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 25,
    LastPurchaseDate: '2026-02-28', ProductionUnitName: 'Unit A – Printing',
  },
  {
    _uid: 4, TransactionID: 1004, VoucherNo: 'IND-004', VoucherDate: '2026-04-12',
    ItemID: 7, ItemGroupName: 'Ink', ItemSubGroupName: 'Process Ink',
    ItemCode: 'INK-002', ItemName: 'Magenta Ink – UV Grade',
    RequiredQuantity: 20, IndentQuantity: 20, StockUnit: 'KG',
    JobBookingContentNo: 'JC-2024-003', JobName: 'Cosmetics Label Run',
    Source: 'Job Card', PhysicalStock: 4, BookedStock: 2, AllocatedStock: 2, FreeStock: 2,
    PurchaseUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 20,
    LastPurchaseDate: '2026-02-20', ProductionUnitName: 'Unit A – Printing',
  },
  {
    _uid: 5, TransactionID: 1005, VoucherNo: 'IND-005', VoucherDate: '2026-04-13',
    ItemID: 10, ItemGroupName: 'Lamination', ItemSubGroupName: 'BOPP Film',
    ItemCode: 'LAM-001', ItemName: 'Glossy BOPP Film – 20 Micron',
    RequiredQuantity: 150, IndentQuantity: 150, StockUnit: 'KG',
    JobBookingContentNo: 'JC-2024-002', JobName: 'Shipper Box Run',
    Source: 'Job Card', PhysicalStock: 40, BookedStock: 30, AllocatedStock: 20, FreeStock: 10,
    PurchaseUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 150,
    LastPurchaseDate: '2026-03-10', ProductionUnitName: 'Unit C – Lamination',
  },
  {
    _uid: 6, TransactionID: 1006, VoucherNo: 'IND-006', VoucherDate: '2026-04-14',
    ItemID: 3, ItemGroupName: 'Paper', ItemSubGroupName: 'Art Card',
    ItemCode: 'SHT-001', ItemName: 'Art Card 300 GSM – 70×100 Sheet',
    RequiredQuantity: 2000, IndentQuantity: 2000, StockUnit: 'Sheet',
    JobBookingContentNo: '', JobName: '',
    Source: 'Stock', PhysicalStock: 800, BookedStock: 500, AllocatedStock: 0, FreeStock: 300,
    PurchaseUnit: 'Ream', OrderUnit: 'Ream', POQtyInStockUnit: 2000,
    LastPurchaseDate: '2026-03-05', ProductionUnitName: 'Unit B – Packaging',
  },
  {
    _uid: 7, TransactionID: 1007, VoucherNo: 'IND-007', VoucherDate: '2026-04-15',
    ItemID: 11, ItemGroupName: 'Chemical', ItemSubGroupName: 'Varnish',
    ItemCode: 'CHM-001', ItemName: 'Aqueous Coating Varnish',
    RequiredQuantity: 40, IndentQuantity: 40, StockUnit: 'KG',
    JobBookingContentNo: 'JC-2024-004', JobName: 'Pharma Carton Batch',
    Source: 'Job Card', PhysicalStock: 12, BookedStock: 10, AllocatedStock: 5, FreeStock: 2,
    PurchaseUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 40,
    LastPurchaseDate: '2026-02-10', ProductionUnitName: 'Unit D – Coating',
  },
  {
    _uid: 8, TransactionID: 1008, VoucherNo: 'IND-008', VoucherDate: '2026-04-16',
    ItemID: 12, ItemGroupName: 'Ink', ItemSubGroupName: 'Special Ink',
    ItemCode: 'INK-003', ItemName: 'Gold Metallic Ink',
    RequiredQuantity: 10, IndentQuantity: 10, StockUnit: 'KG',
    JobBookingContentNo: 'JC-2024-003', JobName: 'Cosmetics Label Run',
    Source: 'Job Card', PhysicalStock: 3, BookedStock: 2, AllocatedStock: 1, FreeStock: 1,
    PurchaseUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 10,
    LastPurchaseDate: '2026-01-15', ProductionUnitName: 'Unit A – Printing',
  },
  {
    _uid: 9, TransactionID: 1009, VoucherNo: 'IND-009', VoucherDate: '2026-04-17',
    ItemID: 13, ItemGroupName: 'Paper', ItemSubGroupName: 'Duplex Board',
    ItemCode: 'SHT-002', ItemName: 'Duplex Board 400 GSM – 70×100',
    RequiredQuantity: 3000, IndentQuantity: 3000, StockUnit: 'Sheet',
    JobBookingContentNo: 'JC-2024-004', JobName: 'Pharma Carton Batch',
    Source: 'Job Card', PhysicalStock: 1000, BookedStock: 800, AllocatedStock: 200, FreeStock: 200,
    PurchaseUnit: 'Ream', OrderUnit: 'Ream', POQtyInStockUnit: 3000,
    LastPurchaseDate: '2026-03-25', ProductionUnitName: 'Unit B – Packaging',
  },
  {
    _uid: 10, TransactionID: 1010, VoucherNo: 'IND-010', VoucherDate: '2026-04-18',
    ItemID: 14, ItemGroupName: 'Lamination', ItemSubGroupName: 'Thermal Film',
    ItemCode: 'LAM-002', ItemName: 'Matte Thermal Lamination Film – 25 Micron',
    RequiredQuantity: 80, IndentQuantity: 80, StockUnit: 'KG',
    JobBookingContentNo: '', JobName: '',
    Source: 'Stock', PhysicalStock: 25, BookedStock: 20, AllocatedStock: 10, FreeStock: 5,
    PurchaseUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 80,
    LastPurchaseDate: '2026-03-18', ProductionUnitName: 'Unit C – Lamination',
  },
]

// ─── Mock Requisitions ────────────────────────────────────────────────────────

export let MOCK_REQUISITIONS: RequisitionRecord[] = [
  {
    TransactionID: 2001, VoucherNo: 'PREQ-001', VoucherDate: '2026-04-15',
    ItemID: 1, ItemCode: 'REL-001', ItemGroupName: 'Paper', ItemSubGroupName: 'Art Paper',
    ItemName: 'Art Paper 80 GSM – 100cm Reel',
    RefJobCardContentNo: 'JC-2024-001', JobName: 'Cadbury Wrapper Print',
    PurchaseQty: 500, StockUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 500,
    PhysicalStock: 200, AllocatedStock: 80, ExpectedDeliveryDate: '2026-04-30',
    ItemNarration: 'Urgent – production starts Monday', Narration: 'Priority order',
    CreatedBy: 'Ravi Kumar', ApprovedBy: '', ProductionUnitName: 'Unit A – Printing',
    AuditApproved: false, IsAuditCancelled: false, IsVoucherItemApproved: false,
    IsCancelled: false, POCreated: false, ManuallyClosed: false,
  },
  {
    TransactionID: 2002, VoucherNo: 'PREQ-002', VoucherDate: '2026-04-14',
    ItemID: 6, ItemCode: 'INK-001', ItemGroupName: 'Ink', ItemSubGroupName: 'Process Ink',
    ItemName: 'Cyan Ink – Standard Grade',
    RefJobCardContentNo: 'JC-2024-001', JobName: 'Cadbury Wrapper Print',
    PurchaseQty: 25, StockUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 25,
    PhysicalStock: 8, AllocatedStock: 3, ExpectedDeliveryDate: '2026-04-25',
    ItemNarration: '', Narration: '',
    CreatedBy: 'Priya Sharma', ApprovedBy: 'Suresh Nair', ProductionUnitName: 'Unit A – Printing',
    AuditApproved: true, IsAuditCancelled: false, IsVoucherItemApproved: true,
    IsCancelled: false, POCreated: false, ManuallyClosed: false,
  },
  {
    TransactionID: 2003, VoucherNo: 'PREQ-003', VoucherDate: '2026-04-13',
    ItemID: 10, ItemCode: 'LAM-001', ItemGroupName: 'Lamination', ItemSubGroupName: 'BOPP Film',
    ItemName: 'Glossy BOPP Film – 20 Micron',
    RefJobCardContentNo: 'JC-2024-002', JobName: 'Shipper Box Run',
    PurchaseQty: 150, StockUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 150,
    PhysicalStock: 40, AllocatedStock: 20, ExpectedDeliveryDate: '2026-04-22',
    ItemNarration: 'Confirm roll width before ordering', Narration: 'Check spec sheet',
    CreatedBy: 'Amit Desai', ApprovedBy: 'Suresh Nair', ProductionUnitName: 'Unit C – Lamination',
    AuditApproved: true, IsAuditCancelled: false, IsVoucherItemApproved: true,
    IsCancelled: false, POCreated: true, ManuallyClosed: false,
  },
  {
    TransactionID: 2004, VoucherNo: 'PREQ-004', VoucherDate: '2026-04-12',
    ItemID: 7, ItemCode: 'INK-002', ItemGroupName: 'Ink', ItemSubGroupName: 'Process Ink',
    ItemName: 'Magenta Ink – UV Grade',
    RefJobCardContentNo: 'JC-2024-003', JobName: 'Cosmetics Label Run',
    PurchaseQty: 20, StockUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 20,
    PhysicalStock: 4, AllocatedStock: 2, ExpectedDeliveryDate: '2026-04-20',
    ItemNarration: '', Narration: 'Wrong spec raised – cancelled',
    CreatedBy: 'Ravi Kumar', ApprovedBy: '', ProductionUnitName: 'Unit A – Printing',
    AuditApproved: false, IsAuditCancelled: true, IsVoucherItemApproved: false,
    IsCancelled: true, POCreated: false, ManuallyClosed: false,
  },
  {
    TransactionID: 2005, VoucherNo: 'PREQ-005', VoucherDate: '2026-04-10',
    ItemID: 3, ItemCode: 'SHT-001', ItemGroupName: 'Paper', ItemSubGroupName: 'Art Card',
    ItemName: 'Art Card 300 GSM – 70×100 Sheet',
    RefJobCardContentNo: '', JobName: '',
    PurchaseQty: 2000, StockUnit: 'Sheet', OrderUnit: 'Ream', POQtyInStockUnit: 2000,
    PhysicalStock: 800, AllocatedStock: 0, ExpectedDeliveryDate: '2026-04-18',
    ItemNarration: 'Fulfilled from alternate stock', Narration: 'Closed – stock arranged internally',
    CreatedBy: 'Priya Sharma', ApprovedBy: 'Suresh Nair', ProductionUnitName: 'Unit B – Packaging',
    AuditApproved: true, IsAuditCancelled: false, IsVoucherItemApproved: true,
    IsCancelled: false, POCreated: false, ManuallyClosed: true,
  },
  {
    TransactionID: 2006, VoucherNo: 'PREQ-006', VoucherDate: '2026-04-16',
    ItemID: 11, ItemCode: 'CHM-001', ItemGroupName: 'Chemical', ItemSubGroupName: 'Varnish',
    ItemName: 'Aqueous Coating Varnish',
    RefJobCardContentNo: 'JC-2024-004', JobName: 'Pharma Carton Batch',
    PurchaseQty: 40, StockUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 40,
    PhysicalStock: 12, AllocatedStock: 5, ExpectedDeliveryDate: '2026-05-05',
    ItemNarration: 'Food-grade approved supplier only', Narration: 'Check COA before GRN',
    CreatedBy: 'Amit Desai', ApprovedBy: '', ProductionUnitName: 'Unit D – Coating',
    AuditApproved: false, IsAuditCancelled: false, IsVoucherItemApproved: false,
    IsCancelled: false, POCreated: false, ManuallyClosed: false,
  },
  {
    TransactionID: 2007, VoucherNo: 'PREQ-007', VoucherDate: '2026-04-17',
    ItemID: 2, ItemCode: 'REL-002', ItemGroupName: 'Paper', ItemSubGroupName: 'Kraft Paper',
    ItemName: 'Kraft Paper 90 GSM – 75cm Reel',
    RefJobCardContentNo: 'JC-2024-002', JobName: 'Shipper Box Run',
    PurchaseQty: 300, StockUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 300,
    PhysicalStock: 90, AllocatedStock: 30, ExpectedDeliveryDate: '2026-05-10',
    ItemNarration: '', Narration: '',
    CreatedBy: 'Priya Sharma', ApprovedBy: 'Suresh Nair', ProductionUnitName: 'Unit B – Packaging',
    AuditApproved: true, IsAuditCancelled: false, IsVoucherItemApproved: true,
    IsCancelled: false, POCreated: false, ManuallyClosed: false,
  },
  {
    TransactionID: 2008, VoucherNo: 'PREQ-008', VoucherDate: '2026-04-18',
    ItemID: 14, ItemCode: 'LAM-002', ItemGroupName: 'Lamination', ItemSubGroupName: 'Thermal Film',
    ItemName: 'Matte Thermal Lamination Film – 25 Micron',
    RefJobCardContentNo: '', JobName: '',
    PurchaseQty: 80, StockUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 80,
    PhysicalStock: 25, AllocatedStock: 10, ExpectedDeliveryDate: '2026-05-15',
    ItemNarration: '', Narration: 'Regular stock order',
    CreatedBy: 'Amit Desai', ApprovedBy: 'Suresh Nair', ProductionUnitName: 'Unit C – Lamination',
    AuditApproved: true, IsAuditCancelled: false, IsVoucherItemApproved: true,
    IsCancelled: false, POCreated: false, ManuallyClosed: false,
  },
  {
    TransactionID: 2009, VoucherNo: 'PREQ-009', VoucherDate: '2026-04-19',
    ItemID: 1, ItemCode: 'REL-001', ItemGroupName: 'Paper', ItemSubGroupName: 'Art Paper',
    ItemName: 'Art Paper 80 GSM – 100cm Reel',
    RefJobCardContentNo: 'JC-2024-003', JobName: 'Cosmetics Label Run',
    PurchaseQty: 250, StockUnit: 'KG', OrderUnit: 'KG', POQtyInStockUnit: 250,
    PhysicalStock: 200, AllocatedStock: 80, ExpectedDeliveryDate: '2026-05-20',
    ItemNarration: 'Same spec as last order', Narration: '',
    CreatedBy: 'Ravi Kumar', ApprovedBy: 'Suresh Nair', ProductionUnitName: 'Unit A – Printing',
    AuditApproved: true, IsAuditCancelled: false, IsVoucherItemApproved: true,
    IsCancelled: false, POCreated: false, ManuallyClosed: false,
  },
]

// ─── Mock Item Master (for Add Item modal) ────────────────────────────────────

export const MASTER_ITEMS: MasterItem[] = [
  { ItemID: 1,  ItemGroupName: 'Paper',      ItemSubGroupName: 'Art Paper',    ItemCode: 'REL-001', ItemName: 'Art Paper 80 GSM – 100cm Reel',         Quality: 'A Grade',  GSM: 80,  Manufacturer: 'ABC Paper Mills', SizeW: 100, PurchaseUnit: 'KG',    OrderUnit: 'KG',    StockUnit: 'KG',    PhysicalStock: 200,  BookedStock: 120, UnitPerPacking: 1,   ConversionFactor: 1,   LastPurchaseDate: '2026-03-15' },
  { ItemID: 2,  ItemGroupName: 'Paper',      ItemSubGroupName: 'Kraft Paper',  ItemCode: 'REL-002', ItemName: 'Kraft Paper 90 GSM – 75cm Reel',          Quality: 'Standard', GSM: 90,  Manufacturer: 'XYZ Papers',     SizeW: 75,  PurchaseUnit: 'KG',    OrderUnit: 'KG',    StockUnit: 'KG',    PhysicalStock: 90,   BookedStock: 50,  UnitPerPacking: 1,   ConversionFactor: 1,   LastPurchaseDate: '2026-03-20' },
  { ItemID: 3,  ItemGroupName: 'Paper',      ItemSubGroupName: 'Art Card',     ItemCode: 'SHT-001', ItemName: 'Art Card 300 GSM – 70×100 Sheet',          Quality: 'Premium',  GSM: 300, Manufacturer: 'XYZ Papers',     SizeW: 70,  PurchaseUnit: 'Ream',  OrderUnit: 'Ream',  StockUnit: 'Sheet', PhysicalStock: 800,  BookedStock: 500, UnitPerPacking: 500, ConversionFactor: 500, LastPurchaseDate: '2026-03-05' },
  { ItemID: 4,  ItemGroupName: 'Paper',      ItemSubGroupName: 'Art Card',     ItemCode: 'SHT-003', ItemName: 'Art Card 350 GSM – 64×90 Sheet',           Quality: 'Premium',  GSM: 350, Manufacturer: 'PQR Mills',       SizeW: 64,  PurchaseUnit: 'Ream',  OrderUnit: 'Ream',  StockUnit: 'Sheet', PhysicalStock: 400,  BookedStock: 100, UnitPerPacking: 500, ConversionFactor: 500, LastPurchaseDate: '2026-02-18' },
  { ItemID: 5,  ItemGroupName: 'Paper',      ItemSubGroupName: 'Duplex Board', ItemCode: 'SHT-002', ItemName: 'Duplex Board 400 GSM – 70×100',            Quality: 'Standard', GSM: 400, Manufacturer: 'PQR Mills',       SizeW: 70,  PurchaseUnit: 'Ream',  OrderUnit: 'Ream',  StockUnit: 'Sheet', PhysicalStock: 1000, BookedStock: 800, UnitPerPacking: 250, ConversionFactor: 250, LastPurchaseDate: '2026-03-25' },
  { ItemID: 6,  ItemGroupName: 'Ink',        ItemSubGroupName: 'Process Ink',  ItemCode: 'INK-001', ItemName: 'Cyan Ink – Standard Grade',                Quality: 'Standard', GSM: 0,   Manufacturer: 'Sun Chemical',   SizeW: 0,   PurchaseUnit: 'KG',    OrderUnit: 'KG',    StockUnit: 'KG',    PhysicalStock: 8,    BookedStock: 5,   UnitPerPacking: 1,   ConversionFactor: 1,   LastPurchaseDate: '2026-02-28' },
  { ItemID: 7,  ItemGroupName: 'Ink',        ItemSubGroupName: 'Process Ink',  ItemCode: 'INK-002', ItemName: 'Magenta Ink – UV Grade',                   Quality: 'UV Grade', GSM: 0,   Manufacturer: 'Flint Group',     SizeW: 0,   PurchaseUnit: 'KG',    OrderUnit: 'KG',    StockUnit: 'KG',    PhysicalStock: 4,    BookedStock: 2,   UnitPerPacking: 1,   ConversionFactor: 1,   LastPurchaseDate: '2026-02-20' },
  { ItemID: 8,  ItemGroupName: 'Ink',        ItemSubGroupName: 'Process Ink',  ItemCode: 'INK-004', ItemName: 'Yellow Ink – Standard Grade',               Quality: 'Standard', GSM: 0,   Manufacturer: 'Sun Chemical',   SizeW: 0,   PurchaseUnit: 'KG',    OrderUnit: 'KG',    StockUnit: 'KG',    PhysicalStock: 6,    BookedStock: 2,   UnitPerPacking: 1,   ConversionFactor: 1,   LastPurchaseDate: '2026-03-01' },
  { ItemID: 9,  ItemGroupName: 'Ink',        ItemSubGroupName: 'Process Ink',  ItemCode: 'INK-005', ItemName: 'Black Ink – Standard Grade',                Quality: 'Standard', GSM: 0,   Manufacturer: 'Toyo Ink',       SizeW: 0,   PurchaseUnit: 'KG',    OrderUnit: 'KG',    StockUnit: 'KG',    PhysicalStock: 10,   BookedStock: 4,   UnitPerPacking: 1,   ConversionFactor: 1,   LastPurchaseDate: '2026-03-12' },
  { ItemID: 10, ItemGroupName: 'Lamination', ItemSubGroupName: 'BOPP Film',    ItemCode: 'LAM-001', ItemName: 'Glossy BOPP Film – 20 Micron',              Quality: 'A Grade',  GSM: 0,   Manufacturer: 'Cosmo Films',     SizeW: 0,   PurchaseUnit: 'KG',    OrderUnit: 'KG',    StockUnit: 'KG',    PhysicalStock: 40,   BookedStock: 30,  UnitPerPacking: 1,   ConversionFactor: 1,   LastPurchaseDate: '2026-03-10' },
  { ItemID: 11, ItemGroupName: 'Chemical',   ItemSubGroupName: 'Varnish',      ItemCode: 'CHM-001', ItemName: 'Aqueous Coating Varnish',                   Quality: 'Standard', GSM: 0,   Manufacturer: 'Huber Group',     SizeW: 0,   PurchaseUnit: 'KG',    OrderUnit: 'KG',    StockUnit: 'KG',    PhysicalStock: 12,   BookedStock: 10,  UnitPerPacking: 1,   ConversionFactor: 1,   LastPurchaseDate: '2026-02-10' },
  { ItemID: 12, ItemGroupName: 'Ink',        ItemSubGroupName: 'Special Ink',  ItemCode: 'INK-003', ItemName: 'Gold Metallic Ink',                         Quality: 'Special',  GSM: 0,   Manufacturer: 'Toyo Ink',       SizeW: 0,   PurchaseUnit: 'KG',    OrderUnit: 'KG',    StockUnit: 'KG',    PhysicalStock: 3,    BookedStock: 2,   UnitPerPacking: 1,   ConversionFactor: 1,   LastPurchaseDate: '2026-01-15' },
  { ItemID: 13, ItemGroupName: 'Paper',      ItemSubGroupName: 'Duplex Board', ItemCode: 'SHT-004', ItemName: 'Duplex Board 300 GSM – 60×90',              Quality: 'Standard', GSM: 300, Manufacturer: 'ABC Paper Mills', SizeW: 60,  PurchaseUnit: 'Ream',  OrderUnit: 'Ream',  StockUnit: 'Sheet', PhysicalStock: 600,  BookedStock: 200, UnitPerPacking: 250, ConversionFactor: 250, LastPurchaseDate: '2026-03-08' },
  { ItemID: 14, ItemGroupName: 'Lamination', ItemSubGroupName: 'Thermal Film', ItemCode: 'LAM-002', ItemName: 'Matte Thermal Lamination Film – 25 Micron', Quality: 'A Grade',  GSM: 0,   Manufacturer: 'Cosmo Films',     SizeW: 0,   PurchaseUnit: 'KG',    OrderUnit: 'KG',    StockUnit: 'KG',    PhysicalStock: 25,   BookedStock: 20,  UnitPerPacking: 1,   ConversionFactor: 1,   LastPurchaseDate: '2026-03-18' },
  { ItemID: 15, ItemGroupName: 'Chemical',   ItemSubGroupName: 'Adhesive',     ItemCode: 'CHM-002', ItemName: 'Water-Based Lamination Adhesive',           Quality: 'Standard', GSM: 0,   Manufacturer: 'Henkel',          SizeW: 0,   PurchaseUnit: 'KG',    OrderUnit: 'KG',    StockUnit: 'KG',    PhysicalStock: 30,   BookedStock: 15,  UnitPerPacking: 1,   ConversionFactor: 1,   LastPurchaseDate: '2026-02-25' },
]

// ─── Mock Job Cards ───────────────────────────────────────────────────────────

export const JOB_CARDS: JobCard[] = [
  { value: 'JC-2024-001', label: 'JC-2024-001 – Cadbury Wrapper Print',  jobId: 101, clientId: 1 },
  { value: 'JC-2024-002', label: 'JC-2024-002 – Shipper Box Run',         jobId: 102, clientId: 2 },
  { value: 'JC-2024-003', label: 'JC-2024-003 – Cosmetics Label Run',     jobId: 103, clientId: 4 },
  { value: 'JC-2024-004', label: 'JC-2024-004 – Pharma Carton Batch',     jobId: 104, clientId: 3 },
  { value: 'JC-2024-005', label: 'JC-2024-005 – Food Packaging Run',      jobId: 105, clientId: null },
]

// ─── Mock Clients ─────────────────────────────────────────────────────────────

export const CLIENTS: Client[] = [
  { LedgerID: 1, LedgerName: 'Cadbury India Ltd' },
  { LedgerID: 2, LedgerName: 'Hindustan Unilever Ltd' },
  { LedgerID: 3, LedgerName: 'Sun Pharma Industries' },
  { LedgerID: 4, LedgerName: 'Marico Ltd' },
]

// ─── Status Helper ────────────────────────────────────────────────────────────

export type RequisitionStatus = 'Pending' | 'Approved' | 'Proceed' | 'Part Proceed' | 'Rejected' | 'Closed'

export function getRequisitionStatus(r: RequisitionRecord): RequisitionStatus {
  if (r.ManuallyClosed) return 'Closed'
  if (r.IsAuditCancelled || r.IsCancelled) return 'Rejected'
  if (r.POCreated) return 'Proceed'
  if (r.IsVoucherItemApproved && r.AuditApproved) return 'Approved'
  return 'Pending'
}

// ─── Voucher Number Generator ─────────────────────────────────────────────────

let nextReqId = 10

export function generateReqNo(): string {
  return `PREQ-00${nextReqId++}`
}

// ─── PR → PO Helpers ──────────────────────────────────────────────────────────

// Returns approved requisitions that are not yet converted to PO
export function getApprovedPendingRequisitions(): RequisitionRecord[] {
  return MOCK_REQUISITIONS.filter(
    r =>
      r.AuditApproved &&
      r.IsVoucherItemApproved &&
      !r.POCreated &&
      !r.ManuallyClosed &&
      !r.IsCancelled &&
      !r.IsAuditCancelled
  )
}

// Marks requisition records as POCreated = true after a PO is saved
export function markRequisitionsAsPOCreated(transactionIds: number[]): void {
  transactionIds.forEach(id => {
    const rec = MOCK_REQUISITIONS.find(r => r.TransactionID === id)
    if (rec) rec.POCreated = true
  })
}