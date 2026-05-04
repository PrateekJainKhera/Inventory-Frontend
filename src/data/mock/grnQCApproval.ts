// ─── Types ────────────────────────────────────────────────────────────────────

export type QCStatus = 'pending' | 'processed' | 'hold' | 'rejected'

export interface GRNQCListItem {
  id: number
  RefNo: number
  ItemName: string
  ItemCode: string
  SupplierName: string
  ReceiptNoteNo: string
  ReceiptNoteDate: string
  PONo: string
  PODate: string
  DNNo: string
  DNDate: string
  Transporter: string
  ReceivedBy: string
  CreatedBy: string
  ApprovedBy: string
  ApprovalDate: string
  Remark: string
  RejectStockAction: string
  Status: QCStatus
}

export interface GRNQCApprovalLine {
  id: number
  PONo: string
  PODate: string
  ItemCode: string
  ItemGroup: string
  SubGroup: string
  ItemName: string
  POQty: number
  PurchaseUnit: string
  ReceiptQty: number
  ApprQty: number
  HoldQty: number
  RejectQty: number
  RMQCNo: string
  COANo: string
  Remark: string
  BatchNo: string
  SupplierBatchNo: string
  StockUnit: string
  Warehouse: string
  Bin: string
}

export interface QCParameterRow {
  id: number
  Characteristics: string
  MethodOfInspection: string
  UOM: string
  MeasuringEquipment: string
  StandardValue: string
  AcceptanceCriteria: string
  samples: Record<string, string>
  AverageValue: string
  AcceptanceStatus: string
  Remark: string
}

// ─── Default QC Parameters ────────────────────────────────────────────────────

export const DEFAULT_QC_PARAMETERS: Omit<QCParameterRow, 'id' | 'samples' | 'AverageValue' | 'AcceptanceStatus' | 'Remark'>[] = [
  { Characteristics: 'Quality',                  MethodOfInspection: 'Visual',                             UOM: '-',  MeasuringEquipment: '-',                       StandardValue: '',      AcceptanceCriteria: 'OK | NOT OK' },
  { Characteristics: 'GSM',                       MethodOfInspection: 'Machinery',                          UOM: '-',  MeasuringEquipment: 'GSM Cutter',               StandardValue: '',      AcceptanceCriteria: 'OK | NOT OK' },
  { Characteristics: 'RCT/ECT',                   MethodOfInspection: 'Machinery',                          UOM: '-',  MeasuringEquipment: 'RCT/ECT Machine',          StandardValue: '',      AcceptanceCriteria: 'OK | NOT OK' },
  { Characteristics: 'Paper Brightness',          MethodOfInspection: 'Machinery',                          UOM: '-',  MeasuringEquipment: 'Photospectrometer',         StandardValue: '',      AcceptanceCriteria: 'OK | NOT OK' },
  { Characteristics: 'Thickness / Caliper',       MethodOfInspection: 'Machinery',                          UOM: '-',  MeasuringEquipment: 'Digital Micrometer',        StandardValue: '',      AcceptanceCriteria: 'OK | NOT OK' },
  { Characteristics: 'Grain Direction',           MethodOfInspection: 'Visual',                             UOM: '-',  MeasuringEquipment: '-',                       StandardValue: '',      AcceptanceCriteria: 'Short | Long'  },
  { Characteristics: 'Moisture',                  MethodOfInspection: 'Machinery',                          UOM: '-',  MeasuringEquipment: 'Digital Moisture Machine', StandardValue: '',      AcceptanceCriteria: 'OK | NOT OK' },
  { Characteristics: 'Top Surface Shade',         MethodOfInspection: 'Compared With Approved Sample',      UOM: '-',  MeasuringEquipment: 'Standard Light',            StandardValue: '',      AcceptanceCriteria: 'OK | NOT OK' },
  { Characteristics: 'Smoothness',                MethodOfInspection: 'Surface Smoothness Test',            UOM: '-',  MeasuringEquipment: 'PPS Tester',               StandardValue: '',      AcceptanceCriteria: 'OK | NOT OK' },
  { Characteristics: 'Free From Speck Marks',     MethodOfInspection: 'Visual Inspection Under Proper Light', UOM: '-', MeasuringEquipment: 'Standard Inspection Light', StandardValue: '',    AcceptanceCriteria: 'OK | NOT OK' },
  { Characteristics: 'SIZE',                      MethodOfInspection: 'Machinery',                          UOM: 'mm', MeasuringEquipment: 'Scale',                    StandardValue: '',      AcceptanceCriteria: 'OK | NOT OK' },
  { Characteristics: 'Folding Endurance',         MethodOfInspection: 'Physical',                           UOM: '-',  MeasuringEquipment: '-',                       StandardValue: '',      AcceptanceCriteria: 'OK | NOT OK' },
]

export function makeQCParameters(noOfSamples: number): QCParameterRow[] {
  const sampleKeys = Array.from({ length: noOfSamples }, (_, i) => `s${i + 1}`)
  return DEFAULT_QC_PARAMETERS.map((p, i) => ({
    ...p,
    id: i + 1,
    samples: Object.fromEntries(sampleKeys.map(k => [k, ''])),
    AverageValue: '',
    AcceptanceStatus: '',
    Remark: '',
  }))
}

// ─── Mock: Lines by ReceiptNoteNo ─────────────────────────────────────────────

export const MOCK_QC_APPROVAL_LINES: Record<string, GRNQCApprovalLine[]> = {
  // Pending
  'REC00284_26_27': [
    { id: 1, PONo: 'PO00264_26_27', PODate: '2026-04-29', ItemCode: 'P01598', ItemGroup: 'PAPER', SubGroup: '', ItemName: 'IVORY, 200 GSM, JK, UnCoated, 711.2 X 558.8 MM', POQty: 4000, PurchaseUnit: 'Sheet', ReceiptQty: 4000, ApprQty: 0, HoldQty: 0, RejectQty: 0, RMQCNo: '', COANo: '', Remark: '', BatchNo: '10175_PO00264_26_27_5868_1.00', SupplierBatchNo: '', StockUnit: 'Sheet', Warehouse: 'Main Godown', Bin: 'Paper Store' },
    { id: 2, PONo: 'PO00264_26_27', PODate: '2026-04-29', ItemCode: 'P01597', ItemGroup: 'PAPER', SubGroup: '', ItemName: 'IVORY, 200 GSM, JK, UnCoated, 635 X 508 MM',        POQty: 7200, PurchaseUnit: 'Sheet', ReceiptQty: 7200, ApprQty: 0, HoldQty: 0, RejectQty: 0, RMQCNo: '', COANo: '', Remark: '', BatchNo: '10175_PO00264_26_27_5868_2.00', SupplierBatchNo: '', StockUnit: 'Sheet', Warehouse: 'Main Godown', Bin: 'Paper Store' },
  ],
  'REC00283_26_27': [
    { id: 1, PONo: 'PO00265_26_27', PODate: '2026-04-28', ItemCode: 'P01550', ItemGroup: 'PAPER', SubGroup: '', ItemName: 'SBS, 210 GSM, Reel Cut, Coated', POQty: 3000, PurchaseUnit: 'Sheet', ReceiptQty: 3000, ApprQty: 0, HoldQty: 0, RejectQty: 0, RMQCNo: '', COANo: '', Remark: '', BatchNo: 'BATCH-283-001', SupplierBatchNo: '', StockUnit: 'Sheet', Warehouse: 'Main Godown', Bin: 'Paper Store' },
  ],
  'REC00281_26_27': [
    { id: 1, PONo: 'PO00267_26_27', PODate: '2026-04-29', ItemCode: 'P01599', ItemGroup: 'PAPER', SubGroup: '', ItemName: 'SBS, 300 GSM, Aprilfine, Coated, 71 X 55.8 CM', POQty: 5000, PurchaseUnit: 'Sheet', ReceiptQty: 5000, ApprQty: 0, HoldQty: 0, RejectQty: 0, RMQCNo: '', COANo: '', Remark: '', BatchNo: 'BATCH-281-001', SupplierBatchNo: '', StockUnit: 'Sheet', Warehouse: 'Main Godown', Bin: 'Paper Store' },
  ],

  // Processed
  'REC00288_26_27': [
    { id: 1, PONo: 'PO00268_26_27', PODate: '2026-04-30', ItemCode: 'P01234', ItemGroup: 'PAPER', SubGroup: 'KRAFT', ItemName: '18. Semi Kraft, 120 GSM, JN, UnCoated', POQty: 5000, PurchaseUnit: 'Sheet', ReceiptQty: 5000, ApprQty: 5000, HoldQty: 0, RejectQty: 0, RMQCNo: 'QC02128_26_27', COANo: 'COA-288-01', Remark: '', BatchNo: '10175_PO00268_26_27_5872_1.00', SupplierBatchNo: 'ISH-5872', StockUnit: 'Sheet', Warehouse: 'Main Godown', Bin: 'Paper Store' },
    { id: 2, PONo: 'PO00268_26_27', PODate: '2026-04-30', ItemCode: 'P01235', ItemGroup: 'PAPER', SubGroup: 'KRAFT', ItemName: '18. Semi Kraft, 140 GSM, JN, UnCoated', POQty: 3000, PurchaseUnit: 'Sheet', ReceiptQty: 3000, ApprQty: 3000, HoldQty: 0, RejectQty: 0, RMQCNo: 'QC02129_26_27', COANo: 'COA-288-02', Remark: '', BatchNo: '10175_PO00268_26_27_5872_2.00', SupplierBatchNo: 'ISH-5873', StockUnit: 'Sheet', Warehouse: 'Main Godown', Bin: 'Paper Store' },
  ],
  'REC00287_26_27': [
    { id: 1, PONo: 'PO00255_26_27', PODate: '2026-04-28', ItemCode: 'P00901', ItemGroup: 'CONSUMABLES', SubGroup: '', ItemName: 'Green Strip', POQty: 200, PurchaseUnit: 'Roll', ReceiptQty: 200, ApprQty: 200, HoldQty: 0, RejectQty: 0, RMQCNo: 'QC02127_26_27', COANo: '', Remark: '', BatchNo: 'BATCH-287-001', SupplierBatchNo: 'GS-200', StockUnit: 'Roll', Warehouse: 'Main Godown', Bin: 'Consumables' },
  ],

  // Hold
  'REC00277_26_27': [
    { id: 1, PONo: 'PO00263_26_27', PODate: '2026-04-28', ItemCode: 'P01112', ItemGroup: 'PAPER', SubGroup: '', ItemName: 'Prima Fold SBS, 290 GSM, Century, Coated', POQty: 6000, PurchaseUnit: 'Sheet', ReceiptQty: 6000, ApprQty: 0, HoldQty: 6000, RejectQty: 0, RMQCNo: 'QC02120_26_27', COANo: '', Remark: 'Shade mismatch', BatchNo: 'BATCH-277-001', SupplierBatchNo: 'JNT-6000', StockUnit: 'Sheet', Warehouse: 'Main Godown', Bin: 'Paper Store' },
  ],

  // Rejected
  'REC00136_26_27': [
    { id: 1, PONo: 'PO00126_26_27', PODate: '2026-04-14', ItemCode: 'P00225', ItemGroup: 'PAPER', SubGroup: 'GREY BOARD', ItemName: 'Grey Board, 1650, Magnum, Coated', POQty: 10000, PurchaseUnit: 'Sheet', ReceiptQty: 10000, ApprQty: 0, HoldQty: 0, RejectQty: 10000, RMQCNo: 'QC02050_26_27', COANo: '', Remark: '', BatchNo: 'BATCH-136-001', SupplierBatchNo: 'MGN-1650', StockUnit: 'Sheet', Warehouse: 'Main Godown', Bin: 'Paper Store' },
  ],
}

// ─── Mock: List Items ─────────────────────────────────────────────────────────

export const MOCK_GRN_QC_ITEMS: GRNQCListItem[] = [
  // Pending
  { id: 1,  RefNo: 284, ItemName: 'IVORY, 200 GSM, JK, UnCoated, S...',   ItemCode: 'P01598', SupplierName: 'S D Chaudhary and Co - Delhi', ReceiptNoteNo: 'REC00284_26_27', ReceiptNoteDate: '2026-04-29', PONo: 'PO00264_26_27', PODate: '2026-04-29', DNNo: '42',  DNDate: '2026-04-28', Transporter: '',           ReceivedBy: 'Yogesh Jain', CreatedBy: 'Chandan', ApprovedBy: '', ApprovalDate: '', Remark: '', RejectStockAction: '', Status: 'pending' },
  { id: 2,  RefNo: 284, ItemName: 'IVORY, 200 GSM, JK, UnCoated, T...',   ItemCode: 'P01597', SupplierName: 'S D Chaudhary and Co - Delhi', ReceiptNoteNo: 'REC00284_26_27', ReceiptNoteDate: '2026-04-29', PONo: 'PO00264_26_27', PODate: '2026-04-29', DNNo: '42',  DNDate: '2026-04-28', Transporter: '',           ReceivedBy: 'Yogesh Jain', CreatedBy: 'Chandan', ApprovedBy: '', ApprovalDate: '', Remark: '', RejectStockAction: '', Status: 'pending' },
  { id: 3,  RefNo: 281, ItemName: 'SBS, 300 GSM, Aprilfine, Coated...',   ItemCode: 'P01599', SupplierName: 'Shital Paper Agency',           ReceiptNoteNo: 'REC00281_26_27', ReceiptNoteDate: '2026-04-29', PONo: 'PO00267_26_27', PODate: '2026-04-29', DNNo: '67',  DNDate: '2026-04-29', Transporter: '',           ReceivedBy: 'Yogesh Jain', CreatedBy: 'Shashikant', ApprovedBy: '', ApprovalDate: '', Remark: '', RejectStockAction: '', Status: 'pending' },
  { id: 4,  RefNo: 283, ItemName: 'SBS, 210 GSM, Reel Cut, Coated...',    ItemCode: 'P01550', SupplierName: 'Kumar Paper Mart - Delhi',       ReceiptNoteNo: 'REC00283_26_27', ReceiptNoteDate: '2026-04-29', PONo: 'PO00263_26_27', PODate: '2026-04-28', DNNo: '205', DNDate: '2026-04-28', Transporter: '',           ReceivedBy: 'Yogesh Jain', CreatedBy: 'Chandan', ApprovedBy: '', ApprovalDate: '', Remark: '', RejectStockAction: '', Status: 'pending' },

  // Processed
  { id: 5,  RefNo: 288, ItemName: '18. Semi Kraft, 120 GSM, JN, Unc...', ItemCode: 'P01234', SupplierName: 'Ishan Papers (P) Ltd.- Gzb.',    ReceiptNoteNo: 'REC00288_26_27', ReceiptNoteDate: '2026-04-30', PONo: 'PO00268_26_27', PODate: '2026-04-30', DNNo: 'GST-183', DNDate: '2026-04-29', Transporter: '',   ReceivedBy: 'Yogesh Jain', CreatedBy: 'Yogesh', ApprovedBy: 'Admin', ApprovalDate: '2026-04-30', Remark: '', RejectStockAction: '', Status: 'processed' },
  { id: 6,  RefNo: 288, ItemName: '18. Semi Kraft, 140 GSM, JN, Unc...', ItemCode: 'P01235', SupplierName: 'Ishan Papers (P) Ltd.- Gzb.',    ReceiptNoteNo: 'REC00288_26_27', ReceiptNoteDate: '2026-04-30', PONo: 'PO00268_26_27', PODate: '2026-04-30', DNNo: 'GST-183', DNDate: '2026-04-29', Transporter: '',   ReceivedBy: 'Yogesh Jain', CreatedBy: 'Yogesh', ApprovedBy: 'Admin', ApprovalDate: '2026-04-30', Remark: '', RejectStockAction: '', Status: 'processed' },
  { id: 7,  RefNo: 287, ItemName: 'Green Strip',                          ItemCode: 'P00901', SupplierName: 'Maa Durga Mfg. and Trading Co.', ReceiptNoteNo: 'REC00287_26_27', ReceiptNoteDate: '2026-04-30', PONo: 'PO00255_26_27', PODate: '2026-04-28', DNNo: '164',     DNDate: '2026-04-30', Transporter: '',   ReceivedBy: 'Guard',       CreatedBy: 'Deepali', ApprovedBy: 'Admin', ApprovalDate: '2026-04-30', Remark: '', RejectStockAction: '', Status: 'processed' },

  // Hold
  { id: 8,  RefNo: 279, ItemName: 'Prima Fold SBS, 290 GSM, Centur...', ItemCode: 'P01112', SupplierName: 'Janta Paper Products- Delhi',     ReceiptNoteNo: 'REC00277_26_27', ReceiptNoteDate: '2026-04-28', PONo: 'PO00263_26_27', PODate: '2026-04-28', DNNo: '----',    DNDate: '2026-04-28', Transporter: '',   ReceivedBy: 'Yogesh Jain', CreatedBy: 'Chandan', ApprovedBy: 'Admin', ApprovalDate: '2026-04-30', Remark: 'Shade mismatch', RejectStockAction: '', Status: 'hold' },

  // Rejected
  { id: 9,  RefNo: 136, ItemName: 'Grey Board, 1650, Magnum, Coated...',  ItemCode: 'P00225', SupplierName: 'Magnum Ventures Ltd. Gzb.',      ReceiptNoteNo: 'REC00136_26_27', ReceiptNoteDate: '2026-04-14', PONo: 'PO00126_26_27', PODate: '2026-04-14', DNNo: '99',      DNDate: '2026-04-13', Transporter: '',   ReceivedBy: 'Yogesh Jain', CreatedBy: 'Chandan', ApprovedBy: 'IQC', ApprovalDate: '2026-04-20', Remark: '', RejectStockAction: 'Return to Supplier', Status: 'rejected' },
]