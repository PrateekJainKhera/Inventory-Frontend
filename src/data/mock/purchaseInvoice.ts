// ─── Types ────────────────────────────────────────────────────────────────────

export interface PendingGRNItem {
  TransactionID: number
  PurchaseTransactionID: number
  LedgerID: number
  LedgerName: string
  ReceiptVoucherNo: string
  ReceiptVoucherDate: string
  PurchaseVoucherNo: string
  PurchaseVoucherDate: string
  ItemID: number
  ItemGroupID: number
  ItemSubGroupID: number
  ItemCode: string
  ItemName: string
  ItemGroupName: string
  ChallanQuantity: number
  ReceiptQuantity: number
  PurchaseRate: number
  StockUnit: string
  PurchaseUnit: string
  BasicAmount: number
  GSTTaxPercentage: number
  ProductHSNID: number
  ProductHSNName: string
  HSNCode: string
  DeliveryNoteNo: string
  DeliveryNoteDate: string
  EWayBillNumber: string
  EWayBillDate: string
  GateEntryNo: string
  GateEntryDate: string
  LRNoVehicleNo: string
  Transporter: string
  ReceivedBy: number
  ReceiverName: string
  Narration: string
  FYear: string
  CreatedBy: string
  ProductionUnitID: number
  ProductionUnitName: string
  CompanyID: number
  CompanyName: string
}

export interface ProcessedInvoice {
  TransactionID: number
  VoucherID: number
  VoucherNo: string
  VoucherDate: string
  PONo: string
  GRNNo: string
  GRNDate: string
  InvoiceNo: string
  InvoiceDate: string
  SupplierName: string
  DeliveryNoteNo: string
  DeliveryNoteDate: string
  EWayBillNumber: string
  EWayBillDate: string
  CreatedBy: string
  CreatedDate: string
  NetAmount: number
  IsIntegrated: boolean
  FYear: string
  ProductionUnitID: number
  ProductionUnitName: string
  CompanyID: number
  CompanyName: string
}

export interface InvoiceLineItem {
  TransactionID: number
  PurchaseTransactionID: number
  ItemID: number
  ItemGroupID: number
  ItemGroupNameID: number
  ItemSubGroupID: number
  PurchaseVoucherNo: string
  PurchaseVoucherDate: string
  ItemCode: string
  ItemName: string
  ProductHSNID: number
  ProductHSNName: string
  HSNCode: string
  PurchaseOrderQuantity: number
  ChallanQuantity: number
  StockUnit: string
  ReceiptQuantity: number
  PurchaseRate: number
  PurchaseUnit: string
  ReceiptWtPerPacking: number
  ExpectedDeliveryDate: string
  PurchaseTolerance: number
  BasicAmount: number
  UnitPerPacking: number
  ConversionFactor: number
  SizeW: number
  Disc: number
  AfterDisAmt: number
  GSTTaxPercentage: number
  CGSTTaxPercentage: number
  SGSTTaxPercentage: number
  IGSTTaxPercentage: number
  CGSTAmt: number
  SGSTAmt: number
  IGSTAmt: number
  TaxableAmount: number
  TotalAmount: number
  ReceiptQuantityComp: number
  Narration: string
  FYear: string
  LandedAmt: number
  LandedPrice: number
}

export interface AdditionalCharge {
  LedgerID: number
  LedgerName: string
  TaxRatePer: number
  CalculateON: number
  GSTApplicable: boolean
  InAmount: boolean
  ChargesAmount: number
  IsService: boolean
  ProductHSNID: number
  ProductHSNName: string
  HSNCode: string
  GSTTaxPercentage: number
  CGSTTaxPercentage: number
  SGSTTaxPercentage: number
  IGSTTaxPercentage: number
  CGSTAmount: number
  SGSTAmount: number
  IGSTAmount: number
  TotalAmount: number
  IsCumulative: boolean
  TaxType: string
  GSTLedgerType: string
}

export interface VoucherTypeData {
  VoucherTypeID: number
  VoucherTypeName: string
  Prefix: string
  GSTApplicable: boolean
}

export interface SupplierData {
  LedgerID: number
  LedgerName: string
  MailingName: string
  State: string
  Country: string
  StateTin: number
  VatGSTApplicable: boolean
  Currency: string
  ConversionRate: number
}

export interface PurchaseLedgerData {
  LedgerID: number
  LedgerName: string
}

export interface TaxesLedgerData {
  LedgerID: number
  LedgerName: string
  GSTApplicable: boolean
  GSTLedgerType: string
  CalculateON: number
  TaxRatePer: number
}

export interface HSNGroupData {
  ProductHSNID: number
  ProductHSNName: string
  HSNCode: string
  GSTTaxPercentage: number
  CGSTTaxPercentage: number
  SGSTTaxPercentage: number
  IGSTTaxPercentage: number
}

// ─── Mock Lookup Data ──────────────────────────────────────────────────────────

export const MOCK_PI_VOUCHER_TYPES: VoucherTypeData[] = [
  { VoucherTypeID: 1, VoucherTypeName: 'Purchase Invoice', Prefix: 'PI', GSTApplicable: true },
  { VoucherTypeID: 2, VoucherTypeName: 'Import Invoice', Prefix: 'PI-IMP', GSTApplicable: false },
  { VoucherTypeID: 3, VoucherTypeName: 'Service Invoice', Prefix: 'PI-SER', GSTApplicable: true },
]

export const MOCK_PI_SUPPLIERS: SupplierData[] = [
  { LedgerID: 101, LedgerName: 'Paper Mart Pvt. Ltd.', MailingName: 'Paper Mart Pvt. Ltd.', State: 'Karnataka', Country: 'India', StateTin: 29, VatGSTApplicable: true, Currency: 'INR', ConversionRate: 1 },
  { LedgerID: 102, LedgerName: 'Ink Solutions Ltd.', MailingName: 'Ink Solutions Ltd.', State: 'Maharashtra', Country: 'India', StateTin: 27, VatGSTApplicable: true, Currency: 'INR', ConversionRate: 1 },
  { LedgerID: 103, LedgerName: 'Packaging Pro', MailingName: 'Packaging Pro', State: 'Karnataka', Country: 'India', StateTin: 29, VatGSTApplicable: true, Currency: 'INR', ConversionRate: 1 },
]

export const MOCK_PI_PURCHASE_LEDGERS: PurchaseLedgerData[] = [
  { LedgerID: 201, LedgerName: 'Purchase - Raw Material' },
  { LedgerID: 202, LedgerName: 'Purchase - Packaging' },
  { LedgerID: 203, LedgerName: 'Purchase - Consumables' },
]

export const MOCK_PI_TAXES_LEDGERS: TaxesLedgerData[] = [
  { LedgerID: 301, LedgerName: 'CGST Input', GSTApplicable: false, GSTLedgerType: 'CGST', CalculateON: 1, TaxRatePer: 0 },
  { LedgerID: 302, LedgerName: 'SGST Input', GSTApplicable: false, GSTLedgerType: 'SGST', CalculateON: 1, TaxRatePer: 0 },
  { LedgerID: 303, LedgerName: 'IGST Input', GSTApplicable: false, GSTLedgerType: 'IGST', CalculateON: 1, TaxRatePer: 0 },
  { LedgerID: 304, LedgerName: 'Freight Charges', GSTApplicable: true, GSTLedgerType: '', CalculateON: 0, TaxRatePer: 18 },
]

export const MOCK_PI_HSN_GROUPS: HSNGroupData[] = [
  { ProductHSNID: 1, ProductHSNName: 'Paper (Newsprint)', HSNCode: '4801', GSTTaxPercentage: 5, CGSTTaxPercentage: 2.5, SGSTTaxPercentage: 2.5, IGSTTaxPercentage: 5 },
  { ProductHSNID: 2, ProductHSNName: 'Printing Ink', HSNCode: '3215', GSTTaxPercentage: 18, CGSTTaxPercentage: 9, SGSTTaxPercentage: 9, IGSTTaxPercentage: 18 },
  { ProductHSNID: 3, ProductHSNName: 'Carton Box', HSNCode: '4819', GSTTaxPercentage: 12, CGSTTaxPercentage: 6, SGSTTaxPercentage: 6, IGSTTaxPercentage: 12 },
  { ProductHSNID: 4, ProductHSNName: 'Adhesive', HSNCode: '3506', GSTTaxPercentage: 18, CGSTTaxPercentage: 9, SGSTTaxPercentage: 9, IGSTTaxPercentage: 18 },
]

export const MOCK_PI_COMPANY_CONFIG = {
  CompanyStateTin: 29, // Karnataka
  GSTApplicable: true,
  TCSApplicable: false,
  TCSRate: 0,
}

// ─── Mock Pending GRNs ─────────────────────────────────────────────────────────

export const MOCK_PENDING_GRNS: PendingGRNItem[] = [
  {
    TransactionID: 1001,
    PurchaseTransactionID: 501,
    LedgerID: 101,
    LedgerName: 'Paper Mart Pvt. Ltd.',
    ReceiptVoucherNo: 'GRN/2024/001',
    ReceiptVoucherDate: '2024-11-10',
    PurchaseVoucherNo: 'PO/2024/001',
    PurchaseVoucherDate: '2024-11-01',
    ItemID: 11,
    ItemGroupID: 1,
    ItemSubGroupID: 10,
    ItemCode: 'PAPER-001',
    ItemName: 'Newsprint Paper 45 GSM',
    ItemGroupName: 'Paper',
    ChallanQuantity: 500,
    ReceiptQuantity: 500,
    PurchaseRate: 42.5,
    StockUnit: 'KG',
    PurchaseUnit: 'KG',
    BasicAmount: 21250,
    GSTTaxPercentage: 5,
    ProductHSNID: 1,
    ProductHSNName: 'Paper (Newsprint)',
    HSNCode: '4801',
    DeliveryNoteNo: 'DN-2024-0011',
    DeliveryNoteDate: '2024-11-09',
    EWayBillNumber: 'EWB-1234567890',
    EWayBillDate: '2024-11-09',
    GateEntryNo: 'GE/2024/0045',
    GateEntryDate: '2024-11-10',
    LRNoVehicleNo: 'KA-04-AB-1234',
    Transporter: 'Fast Logistics',
    ReceivedBy: 5,
    ReceiverName: 'Ramesh K.',
    Narration: 'Newsprint paper for production',
    FYear: '2024-2025',
    CreatedBy: 'Admin',
    ProductionUnitID: 1,
    ProductionUnitName: 'Unit 1 - Bangalore',
    CompanyID: 1,
    CompanyName: 'Indus Analytics Pvt. Ltd.',
  },
  {
    TransactionID: 1002,
    PurchaseTransactionID: 502,
    LedgerID: 101,
    LedgerName: 'Paper Mart Pvt. Ltd.',
    ReceiptVoucherNo: 'GRN/2024/002',
    ReceiptVoucherDate: '2024-11-12',
    PurchaseVoucherNo: 'PO/2024/002',
    PurchaseVoucherDate: '2024-11-05',
    ItemID: 12,
    ItemGroupID: 1,
    ItemSubGroupID: 10,
    ItemCode: 'PAPER-002',
    ItemName: 'Art Paper 90 GSM',
    ItemGroupName: 'Paper',
    ChallanQuantity: 200,
    ReceiptQuantity: 200,
    PurchaseRate: 68.0,
    StockUnit: 'KG',
    PurchaseUnit: 'KG',
    BasicAmount: 13600,
    GSTTaxPercentage: 5,
    ProductHSNID: 1,
    ProductHSNName: 'Paper (Newsprint)',
    HSNCode: '4801',
    DeliveryNoteNo: 'DN-2024-0015',
    DeliveryNoteDate: '2024-11-11',
    EWayBillNumber: 'EWB-9876543210',
    EWayBillDate: '2024-11-11',
    GateEntryNo: 'GE/2024/0046',
    GateEntryDate: '2024-11-12',
    LRNoVehicleNo: 'KA-04-CD-5678',
    Transporter: 'Fast Logistics',
    ReceivedBy: 5,
    ReceiverName: 'Ramesh K.',
    Narration: 'Art paper for brochure printing',
    FYear: '2024-2025',
    CreatedBy: 'Admin',
    ProductionUnitID: 1,
    ProductionUnitName: 'Unit 1 - Bangalore',
    CompanyID: 1,
    CompanyName: 'Indus Analytics Pvt. Ltd.',
  },
  {
    TransactionID: 1003,
    PurchaseTransactionID: 503,
    LedgerID: 102,
    LedgerName: 'Ink Solutions Ltd.',
    ReceiptVoucherNo: 'GRN/2024/003',
    ReceiptVoucherDate: '2024-11-14',
    PurchaseVoucherNo: 'PO/2024/003',
    PurchaseVoucherDate: '2024-11-06',
    ItemID: 21,
    ItemGroupID: 2,
    ItemSubGroupID: 20,
    ItemCode: 'INK-001',
    ItemName: 'Offset Ink - Black 1KG',
    ItemGroupName: 'Ink',
    ChallanQuantity: 50,
    ReceiptQuantity: 50,
    PurchaseRate: 380,
    StockUnit: 'KG',
    PurchaseUnit: 'KG',
    BasicAmount: 19000,
    GSTTaxPercentage: 18,
    ProductHSNID: 2,
    ProductHSNName: 'Printing Ink',
    HSNCode: '3215',
    DeliveryNoteNo: 'DN-MH-2024-008',
    DeliveryNoteDate: '2024-11-13',
    EWayBillNumber: 'EWB-5556667778',
    EWayBillDate: '2024-11-13',
    GateEntryNo: 'GE/2024/0047',
    GateEntryDate: '2024-11-14',
    LRNoVehicleNo: 'MH-14-GH-9012',
    Transporter: 'Speed Courier',
    ReceivedBy: 6,
    ReceiverName: 'Suresh M.',
    Narration: 'Black offset ink for press',
    FYear: '2024-2025',
    CreatedBy: 'Admin',
    ProductionUnitID: 1,
    ProductionUnitName: 'Unit 1 - Bangalore',
    CompanyID: 1,
    CompanyName: 'Indus Analytics Pvt. Ltd.',
  },
  {
    TransactionID: 1004,
    PurchaseTransactionID: 504,
    LedgerID: 103,
    LedgerName: 'Packaging Pro',
    ReceiptVoucherNo: 'GRN/2024/004',
    ReceiptVoucherDate: '2024-11-16',
    PurchaseVoucherNo: 'PO/2024/004',
    PurchaseVoucherDate: '2024-11-08',
    ItemID: 31,
    ItemGroupID: 3,
    ItemSubGroupID: 30,
    ItemCode: 'BOX-001',
    ItemName: 'Corrugated Box 12x10x8',
    ItemGroupName: 'Packaging',
    ChallanQuantity: 1000,
    ReceiptQuantity: 1000,
    PurchaseRate: 28,
    StockUnit: 'NOS',
    PurchaseUnit: 'NOS',
    BasicAmount: 28000,
    GSTTaxPercentage: 12,
    ProductHSNID: 3,
    ProductHSNName: 'Carton Box',
    HSNCode: '4819',
    DeliveryNoteNo: 'DN-KA-2024-022',
    DeliveryNoteDate: '2024-11-15',
    EWayBillNumber: 'EWB-1112223334',
    EWayBillDate: '2024-11-15',
    GateEntryNo: 'GE/2024/0048',
    GateEntryDate: '2024-11-16',
    LRNoVehicleNo: 'KA-05-EF-3456',
    Transporter: 'Local Transport',
    ReceivedBy: 5,
    ReceiverName: 'Ramesh K.',
    Narration: 'Corrugated boxes for despatch',
    FYear: '2024-2025',
    CreatedBy: 'Admin',
    ProductionUnitID: 1,
    ProductionUnitName: 'Unit 1 - Bangalore',
    CompanyID: 1,
    CompanyName: 'Indus Analytics Pvt. Ltd.',
  },
]

// ─── Mock Processed Invoices ───────────────────────────────────────────────────

export const MOCK_PROCESSED_INVOICES: ProcessedInvoice[] = [
  {
    TransactionID: 2001,
    VoucherID: 1,
    VoucherNo: 'PI/2024/001',
    VoucherDate: '2024-10-20',
    PONo: 'PO/2024/0095',
    GRNNo: 'GRN/2024/0088',
    GRNDate: '2024-10-18',
    InvoiceNo: 'PM-INV-20241001',
    InvoiceDate: '2024-10-20',
    SupplierName: 'Paper Mart Pvt. Ltd.',
    DeliveryNoteNo: 'DN-2024-0088',
    DeliveryNoteDate: '2024-10-17',
    EWayBillNumber: 'EWB-4445556667',
    EWayBillDate: '2024-10-17',
    CreatedBy: 'Admin',
    CreatedDate: '2024-10-20',
    NetAmount: 118000,
    IsIntegrated: false,
    FYear: '2024-2025',
    ProductionUnitID: 1,
    ProductionUnitName: 'Unit 1 - Bangalore',
    CompanyID: 1,
    CompanyName: 'Indus Analytics Pvt. Ltd.',
  },
  {
    TransactionID: 2002,
    VoucherID: 1,
    VoucherNo: 'PI/2024/002',
    VoucherDate: '2024-10-25',
    PONo: 'PO/2024/0092',
    GRNNo: 'GRN/2024/0089',
    GRNDate: '2024-10-23',
    InvoiceNo: 'IS-INV-20241015',
    InvoiceDate: '2024-10-25',
    SupplierName: 'Ink Solutions Ltd.',
    DeliveryNoteNo: 'DN-MH-2024-005',
    DeliveryNoteDate: '2024-10-22',
    EWayBillNumber: 'EWB-7778889990',
    EWayBillDate: '2024-10-22',
    CreatedBy: 'Admin',
    CreatedDate: '2024-10-25',
    NetAmount: 95400,
    IsIntegrated: false,
    FYear: '2024-2025',
    ProductionUnitID: 1,
    ProductionUnitName: 'Unit 1 - Bangalore',
    CompanyID: 1,
    CompanyName: 'Indus Analytics Pvt. Ltd.',
  },
  {
    TransactionID: 2003,
    VoucherID: 1,
    VoucherNo: 'PI/2024/003',
    VoucherDate: '2024-11-05',
    PONo: 'PO/2024/0098',
    GRNNo: 'GRN/2024/0095',
    GRNDate: '2024-11-03',
    InvoiceNo: 'PP-INV-20241101',
    InvoiceDate: '2024-11-05',
    SupplierName: 'Packaging Pro',
    DeliveryNoteNo: 'DN-KA-2024-018',
    DeliveryNoteDate: '2024-11-02',
    EWayBillNumber: 'EWB-3334445556',
    EWayBillDate: '2024-11-02',
    CreatedBy: 'Admin',
    CreatedDate: '2024-11-05',
    NetAmount: 73500,
    IsIntegrated: false,
    FYear: '2024-2025',
    ProductionUnitID: 1,
    ProductionUnitName: 'Unit 1 - Bangalore',
    CompanyID: 1,
    CompanyName: 'Indus Analytics Pvt. Ltd.',
  },
]

let _piSeq = 4
export function genPINo(): string {
  return `PI/2024/${String(_piSeq++).padStart(3, '0')}`
}