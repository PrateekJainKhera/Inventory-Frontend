// ─── Types ────────────────────────────────────────────────────────────────────

export interface PurchaseOrderItem {
  TransactionID: number
  VoucherID?: number
  VoucherNo: string
  VoucherDate: string
  LedgerID?: number
  LedgerName: string
  PurchaseDivision: string
  ItemID?: number
  ItemCode?: string
  ItemGroupName?: string
  ItemSubGroupName?: string
  ItemName?: string
  RefJobCardContentNo?: string
  ItemNarration?: string
  RequiredQuantity?: number
  PurchaseQuantityComp?: number   // Pending Qty from requisition
  PurchaseQuantity?: number       // Ordered Qty
  ReceiptQty?: number
  PendingQty?: number
  PurchaseUnit?: string
  StockUnit?: string
  PurchaseRate?: number
  BasicAmount: number
  TaxableAmount: number
  TotalTaxAmount: number
  TotalOverheadAmount: number
  NetAmount: number
  DeliveryAddress: string
  ModeOfTransport: string
  TermsOfPayment: string
  ExpectedDeliveryDate?: string
  VoucherItemApproved: boolean
  VoucherCancelled: boolean
  ManuallyClosed?: boolean
  IsVoucherItemApproved?: boolean
  PurchaseReference: string
  Narration: string
  CancelRemark: string
  ClosedRemark?: string
  ApprovalRemark?: string
  CurrencyCode: string
  ProductionUnitID?: number
  ProductionUnitName: string
  CompanyName: string
  CreatedBy: string
  ApprovedBy: string
  ProductHSNName?: string
  HSNCode?: string
  GSTTaxPercentage?: number
  CGSTTaxPercentage?: number
  SGSTTaxPercentage?: number
  IGSTTaxPercentage?: number
}

export interface PurchaseOrderDetailItem {
  TransactionID: number
  TransID?: number
  ItemID: number
  ItemGroupID?: number
  ProductHSNID?: number
  ItemCode: string
  ItemGroupName: string
  ItemSubGroupName?: string
  ItemName: string
  RefJobCardContentNo?: string
  RequiredQuantity: number
  RequiredQuantityInPurchaseUnit?: number
  RequiredNoOfPacks?: number
  QuantityPerPack?: number
  PurchaseQuantity: number
  PurchaseQuantityInStockUnit?: number
  PurchaseQuantityComp?: number
  StockUnit: string
  PurchaseUnit: string
  PurchaseRate: number
  BasicAmount: number
  Disc?: number
  AfterDisAmt?: number
  TaxableAmount?: number
  TotalAmount?: number
  ProductHSNName?: string
  HSNCode?: string
  GSTTaxPercentage?: number
  CGSTTaxPercentage?: number
  SGSTTaxPercentage?: number
  IGSTTaxPercentage?: number
  CGSTAmt?: number
  SGSTAmt?: number
  IGSTAmt?: number
  ExpectedDeliveryDate?: string
  Tolerance?: number
  WtPerPacking?: number
  UnitPerPacking?: number
  ConversionFactor?: number
  ItemNarration?: string
  Narration?: string
  Remark?: string
  ClientID?: string
  ProductionUnitName?: string
  CompanyName?: string
  CreatedBy?: string
}

export interface PaymentTermsItem {
  id: number
  TermsDescription: string
}

export type FreightGSTType = 'not_applicable' | 'hsn_row_po'

export interface AdditionalChargesItem {
  id: number
  LedgerID: number
  LedgerName: string
  Percentage: number
  CalculateOn: string
  GSTApplicable: boolean
  InAmountChecked: boolean
  InAmount: number
  Amount: number
  TaxType: string
  FreightGSTType?: FreightGSTType
}

export interface DeliveryScheduleItem {
  id: number
  ItemID: number
  ItemCode: string
  Quantity: number
  PurchaseUnit: string
  SchDate: Date | string
}

export interface HSNItem {
  ProductHSNID: number
  HSNCode: string
  ProductHSNName: string
  GSTTaxPercentage: number
  CGSTTaxPercentage: number
  SGSTTaxPercentage: number
  IGSTTaxPercentage: number
}

// ─── Derived: Pending Requisitions from approved PRs ─────────────────────────

import { getApprovedPendingRequisitions } from './purchaseRequisition'

export function derivePendingRequisitions(): PurchaseOrderItem[] {
  return getApprovedPendingRequisitions().map(r => ({
    TransactionID: r.TransactionID,
    VoucherNo: r.VoucherNo,
    VoucherDate: r.VoucherDate,
    LedgerName: '',
    PurchaseDivision: 'DIV001',
    ItemID: r.ItemID,
    ItemCode: r.ItemCode,
    ItemGroupName: r.ItemGroupName,
    ItemSubGroupName: r.ItemSubGroupName,
    ItemName: r.ItemName,
    RefJobCardContentNo: r.RefJobCardContentNo,
    ItemNarration: r.ItemNarration,
    RequiredQuantity: r.PurchaseQty,
    PurchaseQuantityComp: r.PurchaseQty,
    PurchaseQuantity: 0,
    PurchaseUnit: r.OrderUnit,
    StockUnit: r.StockUnit,
    CreatedBy: r.CreatedBy,
    Narration: r.Narration,
    ProductionUnitName: r.ProductionUnitName,
    CompanyName: 'Indas Analytics',
    BasicAmount: 0, TaxableAmount: 0, TotalTaxAmount: 0, TotalOverheadAmount: 0, NetAmount: 0,
    DeliveryAddress: '', ModeOfTransport: '', TermsOfPayment: '',
    VoucherItemApproved: false, VoucherCancelled: false,
    PurchaseReference: '', CancelRemark: '', CurrencyCode: 'INR',
    ApprovedBy: r.ApprovedBy,
  }))
}

// ─── Mock: Pending Requisitions (approved, POCreated = false) ─────────────────
// Kept for reference — use derivePendingRequisitions() in components

export const MOCK_PENDING_REQUISITIONS: PurchaseOrderItem[] = [
  {
    TransactionID: 301,
    VoucherNo: 'REQ-2026-001',
    VoucherDate: '2026-04-01',
    LedgerName: '',
    PurchaseDivision: 'DIV001',
    ItemID: 1,
    ItemCode: 'ITEM-A001',
    ItemGroupName: 'Raw Material',
    ItemSubGroupName: 'Plastic',
    ItemName: 'Polymers Granules',
    RefJobCardContentNo: 'JC-1001',
    RequiredQuantity: 500,
    PurchaseQuantityComp: 500,
    PurchaseQuantity: 0,
    PurchaseUnit: 'KG',
    StockUnit: 'KG',
    CreatedBy: 'Ramesh Kumar',
    ItemNarration: 'Urgent requirement',
    Narration: 'For Job 1001',
    ProductionUnitName: 'Unit 1',
    CompanyName: 'Indas Analytics',
    BasicAmount: 0, TaxableAmount: 0, TotalTaxAmount: 0, TotalOverheadAmount: 0, NetAmount: 0,
    DeliveryAddress: '', ModeOfTransport: '', TermsOfPayment: '',
    VoucherItemApproved: false, VoucherCancelled: false,
    PurchaseReference: '', CancelRemark: '', CurrencyCode: 'INR', ApprovedBy: 'Admin',
  },
  {
    TransactionID: 302,
    VoucherNo: 'REQ-2026-002',
    VoucherDate: '2026-04-02',
    LedgerName: '',
    PurchaseDivision: 'DIV001',
    ItemID: 1,
    ItemCode: 'ITEM-A001',
    ItemGroupName: 'Raw Material',
    ItemSubGroupName: 'Plastic',
    ItemName: 'Polymers Granules',
    RefJobCardContentNo: 'JC-1002',
    RequiredQuantity: 300,
    PurchaseQuantityComp: 300,
    PurchaseQuantity: 0,
    PurchaseUnit: 'KG',
    StockUnit: 'KG',
    CreatedBy: 'Priya Sharma',
    ItemNarration: '',
    Narration: 'For Job 1002',
    ProductionUnitName: 'Unit 1',
    CompanyName: 'Indas Analytics',
    BasicAmount: 0, TaxableAmount: 0, TotalTaxAmount: 0, TotalOverheadAmount: 0, NetAmount: 0,
    DeliveryAddress: '', ModeOfTransport: '', TermsOfPayment: '',
    VoucherItemApproved: false, VoucherCancelled: false,
    PurchaseReference: '', CancelRemark: '', CurrencyCode: 'INR', ApprovedBy: 'Admin',
  },
  {
    TransactionID: 303,
    VoucherNo: 'REQ-2026-003',
    VoucherDate: '2026-04-05',
    LedgerName: '',
    PurchaseDivision: 'DIV001',
    ItemID: 2,
    ItemCode: 'ITEM-B002',
    ItemGroupName: 'Inks',
    ItemSubGroupName: 'Solvent',
    ItemName: 'Black Solvent Ink',
    RefJobCardContentNo: 'JC-1003',
    RequiredQuantity: 50,
    PurchaseQuantityComp: 50,
    PurchaseQuantity: 0,
    PurchaseUnit: 'LTR',
    StockUnit: 'LTR',
    CreatedBy: 'Ramesh Kumar',
    ItemNarration: '',
    Narration: 'Stock replenishment',
    ProductionUnitName: 'Unit 1',
    CompanyName: 'Indas Analytics',
    BasicAmount: 0, TaxableAmount: 0, TotalTaxAmount: 0, TotalOverheadAmount: 0, NetAmount: 0,
    DeliveryAddress: '', ModeOfTransport: '', TermsOfPayment: '',
    VoucherItemApproved: false, VoucherCancelled: false,
    PurchaseReference: '', CancelRemark: '', CurrencyCode: 'INR', ApprovedBy: 'Admin',
  },
  {
    TransactionID: 304,
    VoucherNo: 'REQ-2026-004',
    VoucherDate: '2026-04-08',
    LedgerName: '',
    PurchaseDivision: 'DIV002',
    ItemID: 3,
    ItemCode: 'ITEM-C003',
    ItemGroupName: 'Packaging',
    ItemSubGroupName: 'BOPP Film',
    ItemName: 'Transparent BOPP Film 30 Micron',
    RefJobCardContentNo: 'JC-1004',
    RequiredQuantity: 200,
    PurchaseQuantityComp: 200,
    PurchaseQuantity: 0,
    PurchaseUnit: 'KG',
    StockUnit: 'KG',
    CreatedBy: 'Amit Patel',
    ItemNarration: 'Quality grade A',
    Narration: 'For monthly stock',
    ProductionUnitName: 'Unit 2',
    CompanyName: 'Indas Analytics',
    BasicAmount: 0, TaxableAmount: 0, TotalTaxAmount: 0, TotalOverheadAmount: 0, NetAmount: 0,
    DeliveryAddress: '', ModeOfTransport: '', TermsOfPayment: '',
    VoucherItemApproved: false, VoucherCancelled: false,
    PurchaseReference: '', CancelRemark: '', CurrencyCode: 'INR', ApprovedBy: 'Admin',
  },
  {
    TransactionID: 305,
    VoucherNo: 'REQ-2026-005',
    VoucherDate: '2026-04-10',
    LedgerName: '',
    PurchaseDivision: 'DIV001',
    ItemID: 4,
    ItemCode: 'ITEM-D004',
    ItemGroupName: 'Chemicals',
    ItemSubGroupName: 'Adhesive',
    ItemName: 'Water Based Adhesive',
    RefJobCardContentNo: 'JC-1005',
    RequiredQuantity: 100,
    PurchaseQuantityComp: 100,
    PurchaseQuantity: 0,
    PurchaseUnit: 'KG',
    StockUnit: 'KG',
    CreatedBy: 'Sunita Verma',
    ItemNarration: '',
    Narration: 'Regular order',
    ProductionUnitName: 'Unit 1',
    CompanyName: 'Indas Analytics',
    BasicAmount: 0, TaxableAmount: 0, TotalTaxAmount: 0, TotalOverheadAmount: 0, NetAmount: 0,
    DeliveryAddress: '', ModeOfTransport: '', TermsOfPayment: '',
    VoucherItemApproved: false, VoucherCancelled: false,
    PurchaseReference: '', CancelRemark: '', CurrencyCode: 'INR', ApprovedBy: 'Admin',
  },
]

// ─── Mock: Purchase Orders ────────────────────────────────────────────────────

export const MOCK_PURCHASE_ORDERS: PurchaseOrderItem[] = [
  {
    TransactionID: 401,
    VoucherNo: 'PO-2026-001',
    VoucherDate: '2026-04-03',
    LedgerID: 1,
    LedgerName: 'ABC Suppliers Pvt Ltd',
    PurchaseDivision: 'DIV001',
    ItemID: 1,
    ItemCode: 'ITEM-A001',
    ItemGroupName: 'Raw Material',
    ItemSubGroupName: 'Plastic',
    ItemName: 'Polymers Granules',
    RefJobCardContentNo: 'JC-1001',
    PurchaseQuantity: 800,
    ReceiptQty: 0,
    PendingQty: 800,
    PurchaseUnit: 'KG',
    PurchaseRate: 125,
    ExpectedDeliveryDate: '2026-04-20',
    BasicAmount: 100000,
    TaxableAmount: 100000,
    TotalTaxAmount: 18000,
    TotalOverheadAmount: 0,
    NetAmount: 118000,
    DeliveryAddress: 'Plot No. 123, GIDC, Ahmedabad',
    ModeOfTransport: 'Road',
    TermsOfPayment: 'Payment within 30 days',
    VoucherItemApproved: false,
    VoucherCancelled: false,
    ManuallyClosed: false,
    PurchaseReference: 'REF-001',
    Narration: 'Urgent delivery needed',
    CancelRemark: '',
    CurrencyCode: 'INR',
    ProductionUnitName: 'Unit 1',
    CompanyName: 'Indas Analytics',
    CreatedBy: 'Ramesh Kumar',
    ApprovedBy: '',
  },
  {
    TransactionID: 402,
    VoucherNo: 'PO-2026-002',
    VoucherDate: '2026-04-05',
    LedgerID: 2,
    LedgerName: 'XYZ Trading Company',
    PurchaseDivision: 'DIV001',
    ItemID: 2,
    ItemCode: 'ITEM-B002',
    ItemGroupName: 'Inks',
    ItemSubGroupName: 'Solvent',
    ItemName: 'Black Solvent Ink',
    RefJobCardContentNo: 'JC-1003',
    PurchaseQuantity: 50,
    ReceiptQty: 50,
    PendingQty: 0,
    PurchaseUnit: 'LTR',
    PurchaseRate: 850,
    ExpectedDeliveryDate: '2026-04-15',
    BasicAmount: 42500,
    TaxableAmount: 42500,
    TotalTaxAmount: 7650,
    TotalOverheadAmount: 0,
    NetAmount: 50150,
    DeliveryAddress: 'Plot No. 123, GIDC, Ahmedabad',
    ModeOfTransport: 'Road',
    TermsOfPayment: 'Immediate Payment',
    VoucherItemApproved: true,
    VoucherCancelled: false,
    ManuallyClosed: false,
    PurchaseReference: 'REF-002',
    Narration: '',
    CancelRemark: '',
    ApprovalRemark: 'Approved after rate verification',
    CurrencyCode: 'INR',
    ProductionUnitName: 'Unit 1',
    CompanyName: 'Indas Analytics',
    CreatedBy: 'Ramesh Kumar',
    ApprovedBy: 'Admin',
  },
  {
    TransactionID: 403,
    VoucherNo: 'PO-2026-003',
    VoucherDate: '2026-04-08',
    LedgerID: 3,
    LedgerName: 'Global Materials Inc',
    PurchaseDivision: 'DIV002',
    ItemID: 3,
    ItemCode: 'ITEM-C003',
    ItemGroupName: 'Packaging',
    ItemSubGroupName: 'BOPP Film',
    ItemName: 'Transparent BOPP Film 30 Micron',
    RefJobCardContentNo: 'JC-1004',
    PurchaseQuantity: 200,
    ReceiptQty: 0,
    PendingQty: 200,
    PurchaseUnit: 'KG',
    PurchaseRate: 180,
    ExpectedDeliveryDate: '2026-04-25',
    BasicAmount: 36000,
    TaxableAmount: 36000,
    TotalTaxAmount: 6480,
    TotalOverheadAmount: 0,
    NetAmount: 42480,
    DeliveryAddress: 'Survey No. 45, Changodar, Ahmedabad',
    ModeOfTransport: 'Road',
    TermsOfPayment: 'Payment within 45 days',
    VoucherItemApproved: false,
    VoucherCancelled: true,
    ManuallyClosed: false,
    PurchaseReference: '',
    Narration: 'Cancelled due to price revision',
    CancelRemark: 'Supplier revised rates; order cancelled',
    CurrencyCode: 'INR',
    ProductionUnitName: 'Unit 2',
    CompanyName: 'Indas Analytics',
    CreatedBy: 'Amit Patel',
    ApprovedBy: '',
  },
  {
    TransactionID: 404,
    VoucherNo: 'PO-2026-004',
    VoucherDate: '2026-04-10',
    LedgerID: 1,
    LedgerName: 'ABC Suppliers Pvt Ltd',
    PurchaseDivision: 'DIV001',
    ItemID: 4,
    ItemCode: 'ITEM-D004',
    ItemGroupName: 'Chemicals',
    ItemSubGroupName: 'Adhesive',
    ItemName: 'Water Based Adhesive',
    RefJobCardContentNo: 'JC-1005',
    PurchaseQuantity: 100,
    ReceiptQty: 100,
    PendingQty: 0,
    PurchaseUnit: 'KG',
    PurchaseRate: 220,
    ExpectedDeliveryDate: '2026-04-18',
    BasicAmount: 22000,
    TaxableAmount: 22000,
    TotalTaxAmount: 3960,
    TotalOverheadAmount: 0,
    NetAmount: 25960,
    DeliveryAddress: 'Plot No. 123, GIDC, Ahmedabad',
    ModeOfTransport: 'Road',
    TermsOfPayment: 'Payment within 30 days',
    VoucherItemApproved: true,
    VoucherCancelled: false,
    ManuallyClosed: true,
    PurchaseReference: 'REF-004',
    Narration: 'Fully received and closed',
    CancelRemark: '',
    ClosedRemark: 'All goods received and verified',
    CurrencyCode: 'INR',
    ProductionUnitName: 'Unit 1',
    CompanyName: 'Indas Analytics',
    CreatedBy: 'Sunita Verma',
    ApprovedBy: 'Admin',
  },
]

// ─── Mock Lookup Data ─────────────────────────────────────────────────────────

export const PO_SUPPLIERS = [
  { value: 'SUP001', label: 'ABC Suppliers Pvt Ltd',  gstType: 'intrastate' as const },
  { value: 'SUP002', label: 'XYZ Trading Company',    gstType: 'intrastate' as const },
  { value: 'SUP003', label: 'Global Materials Inc',   gstType: 'interstate' as const },
  { value: 'SUP004', label: 'Reliable Chemicals Ltd', gstType: 'intrastate' as const },
]

export const PO_CONTACT_PERSONS = [
  { value: 'CP001', label: 'Rajesh Kumar' },
  { value: 'CP002', label: 'Priya Mehta' },
  { value: 'CP003', label: 'Amit Patel' },
]

export const PO_TRANSPORT_MODES = [
  { value: 'ROAD', label: 'Road Transport' },
  { value: 'RAIL', label: 'Railway' },
  { value: 'AIR', label: 'Air Cargo' },
  { value: 'SEA', label: 'Sea Freight' },
]

export const PO_CURRENCIES = [
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
]

export const PO_DIVISIONS = [
  { value: 'DIV001', label: 'Raw Materials' },
  { value: 'DIV002', label: 'Packaging' },
  { value: 'DIV003', label: 'Machinery' },
]

export const PO_PAYMENT_TERMS_OPTIONS = [
  { value: 'Payment within 30 days', label: 'Payment within 30 days' },
  { value: 'Payment within 45 days', label: 'Payment within 45 days' },
  { value: 'Payment within 60 days', label: 'Payment within 60 days' },
  { value: '100% Advance Payment', label: '100% Advance Payment' },
  { value: 'Immediate Payment', label: 'Immediate Payment' },
]

export const PO_CHARGE_LEDGERS = [
  { value: 'LED001', label: 'CGST' },
  { value: 'LED002', label: 'SGST' },
  { value: 'LED003', label: 'IGST' },
  { value: 'LED004', label: 'Freight' },
  { value: 'LED005', label: 'Handling Charges' },
  { value: 'LED006', label: 'Packing Charges' },
  { value: 'LED007', label: 'Insurance' },
  { value: 'LED008', label: 'Round Off' },
  { value: 'LED009', label: 'TDS' },
  { value: 'LED010', label: 'Labour Charges' },
  { value: 'LED011', label: 'Transportation Charges' },
  { value: 'LED012', label: 'Service Charges' },
  { value: 'LED013', label: 'Inspection Charges' },
  { value: 'LED014', label: 'Other Charges' },
]

export const PO_DELIVERY_ADDRESSES = [
  { id: 1, label: 'Main Warehouse', address: 'Plot No. 123, GIDC, Ahmedabad, Gujarat - 382445' },
  { id: 2, label: 'Plant 1', address: 'Survey No. 45, Village: Changodar, Ahmedabad - 382213' },
  { id: 3, label: 'Plant 2', address: 'Plot No. 789, Phase 2, GIDC, Vatva, Ahmedabad - 382445' },
]

export const PO_HSN_LIST: HSNItem[] = [
  { ProductHSNID: 1, HSNCode: '13019099', ProductHSNName: '13019099 - Natural Resins', GSTTaxPercentage: 12, CGSTTaxPercentage: 6, SGSTTaxPercentage: 6, IGSTTaxPercentage: 12 },
  { ProductHSNID: 2, HSNCode: '25030010', ProductHSNName: '25030010 - Sulphur', GSTTaxPercentage: 18, CGSTTaxPercentage: 9, SGSTTaxPercentage: 9, IGSTTaxPercentage: 18 },
  { ProductHSNID: 3, HSNCode: '29094900', ProductHSNName: '29094900 - Ether Alcohols', GSTTaxPercentage: 18, CGSTTaxPercentage: 9, SGSTTaxPercentage: 9, IGSTTaxPercentage: 18 },
  { ProductHSNID: 4, HSNCode: '32082030', ProductHSNName: '32082030 - Paints & Varnishes', GSTTaxPercentage: 18, CGSTTaxPercentage: 9, SGSTTaxPercentage: 9, IGSTTaxPercentage: 18 },
  { ProductHSNID: 5, HSNCode: '32082090', ProductHSNName: '32082090 - Other Paints', GSTTaxPercentage: 18, CGSTTaxPercentage: 9, SGSTTaxPercentage: 9, IGSTTaxPercentage: 18 },
  { ProductHSNID: 6, HSNCode: '39201019', ProductHSNName: '39201019 - Plastic Film', GSTTaxPercentage: 18, CGSTTaxPercentage: 9, SGSTTaxPercentage: 9, IGSTTaxPercentage: 18 },
  { ProductHSNID: 7, HSNCode: '35069190', ProductHSNName: '35069190 - Adhesives', GSTTaxPercentage: 18, CGSTTaxPercentage: 9, SGSTTaxPercentage: 9, IGSTTaxPercentage: 18 },
  { ProductHSNID: 8, HSNCode: '39011010', ProductHSNName: '39011010 - Polymers of Ethylene', GSTTaxPercentage: 18, CGSTTaxPercentage: 9, SGSTTaxPercentage: 9, IGSTTaxPercentage: 18 },
]

// ─── PO Approval Types ────────────────────────────────────────────────────────

export interface POListView {
  TransactionID: number
  VoucherID: number
  LedgerID: number
  LedgerName: string
  VoucherNo: string
  VoucherDate: string
  ItemCode: string
  ItemName: string
  PurchaseOrderQuantity: number
  PurchaseUnit: string
  PurchaseRate: number
  GrossAmount: number
  DiscountAmount: number
  BasicAmount: number
  GSTTaxAmount: number
  NetAmount: number
  RefJobCardContentNo: string
  CreatedBy: string
  ApprovedBy: string | null
  ApprovalDate: string | null
  LastPODate: string | null
  ProductionUnitName: string
  CompanyName: string
  IsCancelled: boolean
  CancellationRemark: string | null
}

// ─── PO Close Types ───────────────────────────────────────────────────────────

export interface POCloseItem {
  PurchaseTransactionID: number
  ItemID: number
  VoucherNo: string
  VoucherDate: string
  LedgerName: string
  ItemGroupName: string
  ItemSubGroupName: string
  ItemCode: string
  ItemName: string
  PurchaseQuantity: number
  ReceiptQty: number
  PendingToReceiveQty: number
  PurchaseUnit: string
  PurchaseDivision: string
  PurchaseReferenceRemark: string
  Narration: string
  CreatedBy: string
  ApprovedBy: string
  ProductionUnitID: number
  ProductionUnitName: string
  CompanyName: string
  ManuallyClosed: boolean
  ClosedByUser?: string
  CompletedDate?: string
}

export const MOCK_PO_CLOSE_LIST: POCloseItem[] = [
  {
    PurchaseTransactionID: 402, ItemID: 2,
    VoucherNo: 'PO-2026-002', VoucherDate: '2026-04-05',
    LedgerName: 'XYZ Trading Company',
    ItemGroupName: 'Inks', ItemSubGroupName: 'Solvent',
    ItemCode: 'ITEM-B002', ItemName: 'Black Solvent Ink',
    PurchaseQuantity: 50, ReceiptQty: 50, PendingToReceiveQty: 0,
    PurchaseUnit: 'LTR', PurchaseDivision: 'DIV001',
    PurchaseReferenceRemark: 'REF-002', Narration: '',
    CreatedBy: 'Ramesh Kumar', ApprovedBy: 'Admin',
    ProductionUnitID: 1, ProductionUnitName: 'Unit 1', CompanyName: 'Indas Analytics',
    ManuallyClosed: false,
  },
  {
    PurchaseTransactionID: 404, ItemID: 4,
    VoucherNo: 'PO-2026-004', VoucherDate: '2026-04-10',
    LedgerName: 'ABC Suppliers Pvt Ltd',
    ItemGroupName: 'Chemicals', ItemSubGroupName: 'Adhesive',
    ItemCode: 'ITEM-D004', ItemName: 'Water Based Adhesive',
    PurchaseQuantity: 100, ReceiptQty: 100, PendingToReceiveQty: 0,
    PurchaseUnit: 'KG', PurchaseDivision: 'DIV001',
    PurchaseReferenceRemark: 'REF-004', Narration: 'Fully received and closed',
    CreatedBy: 'Sunita Verma', ApprovedBy: 'Admin',
    ProductionUnitID: 1, ProductionUnitName: 'Unit 1', CompanyName: 'Indas Analytics',
    ManuallyClosed: true, ClosedByUser: 'Admin', CompletedDate: '2026-04-19',
  },
]

export const MOCK_PO_APPROVAL_LIST: POListView[] = [
  {
    TransactionID: 401, VoucherID: 401, LedgerID: 1,
    LedgerName: 'ABC Suppliers Pvt Ltd',
    VoucherNo: 'PO-2026-001', VoucherDate: '2026-04-03',
    ItemCode: 'ITEM-A001', ItemName: 'Polymers Granules',
    PurchaseOrderQuantity: 800, PurchaseUnit: 'KG', PurchaseRate: 125,
    GrossAmount: 100000, DiscountAmount: 0, BasicAmount: 100000,
    GSTTaxAmount: 18000, NetAmount: 118000,
    RefJobCardContentNo: 'JC-1001',
    CreatedBy: 'Ramesh Kumar',
    ApprovedBy: null, ApprovalDate: null, LastPODate: '2026-03-10',
    ProductionUnitName: 'Unit 1', CompanyName: 'Indas Analytics',
    IsCancelled: false, CancellationRemark: null,
  },
  {
    TransactionID: 402, VoucherID: 402, LedgerID: 2,
    LedgerName: 'XYZ Trading Company',
    VoucherNo: 'PO-2026-002', VoucherDate: '2026-04-05',
    ItemCode: 'ITEM-B002', ItemName: 'Black Solvent Ink',
    PurchaseOrderQuantity: 50, PurchaseUnit: 'LTR', PurchaseRate: 850,
    GrossAmount: 42500, DiscountAmount: 0, BasicAmount: 42500,
    GSTTaxAmount: 7650, NetAmount: 50150,
    RefJobCardContentNo: 'JC-1003',
    CreatedBy: 'Ramesh Kumar',
    ApprovedBy: 'Admin', ApprovalDate: '2026-04-06', LastPODate: '2026-03-01',
    ProductionUnitName: 'Unit 1', CompanyName: 'Indas Analytics',
    IsCancelled: false, CancellationRemark: null,
  },
  {
    TransactionID: 403, VoucherID: 403, LedgerID: 3,
    LedgerName: 'Global Materials Inc',
    VoucherNo: 'PO-2026-003', VoucherDate: '2026-04-08',
    ItemCode: 'ITEM-C003', ItemName: 'Transparent BOPP Film 30 Micron',
    PurchaseOrderQuantity: 200, PurchaseUnit: 'KG', PurchaseRate: 180,
    GrossAmount: 36000, DiscountAmount: 0, BasicAmount: 36000,
    GSTTaxAmount: 6480, NetAmount: 42480,
    RefJobCardContentNo: 'JC-1004',
    CreatedBy: 'Amit Patel',
    ApprovedBy: null, ApprovalDate: null, LastPODate: null,
    ProductionUnitName: 'Unit 2', CompanyName: 'Indas Analytics',
    IsCancelled: true, CancellationRemark: 'Supplier revised rates; order cancelled',
  },
  {
    TransactionID: 404, VoucherID: 404, LedgerID: 1,
    LedgerName: 'ABC Suppliers Pvt Ltd',
    VoucherNo: 'PO-2026-004', VoucherDate: '2026-04-10',
    ItemCode: 'ITEM-D004', ItemName: 'Water Based Adhesive',
    PurchaseOrderQuantity: 100, PurchaseUnit: 'KG', PurchaseRate: 220,
    GrossAmount: 22000, DiscountAmount: 0, BasicAmount: 22000,
    GSTTaxAmount: 3960, NetAmount: 25960,
    RefJobCardContentNo: 'JC-1005',
    CreatedBy: 'Sunita Verma',
    ApprovedBy: 'Admin', ApprovalDate: '2026-04-11', LastPODate: '2026-03-15',
    ProductionUnitName: 'Unit 1', CompanyName: 'Indas Analytics',
    IsCancelled: false, CancellationRemark: null,
  },
]