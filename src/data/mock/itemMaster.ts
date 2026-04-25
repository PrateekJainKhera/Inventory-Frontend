// ─── Master Groups ─────────────────────────────────────────────────────────────

export interface MasterGroup {
  ItemGroupID: number
  ItemGroupName: string
}

export const MASTER_GROUPS: MasterGroup[] = [
  { ItemGroupID: 1, ItemGroupName: 'Reel' },
  { ItemGroupID: 2, ItemGroupName: 'Sheet' },
  { ItemGroupID: 3, ItemGroupName: 'Plate' },
  { ItemGroupID: 4, ItemGroupName: 'Ink' },
  { ItemGroupID: 5, ItemGroupName: 'Chemical' },
  { ItemGroupID: 6, ItemGroupName: 'Misc' },
]

// ─── Item Record Type ─────────────────────────────────────────────────────────

export interface ItemRecord {
  ItemID: number
  [key: string]: any
}

// ─── Mock Data Per Group ──────────────────────────────────────────────────────

export const MOCK_DATA: Record<number, ItemRecord[]> = {
  1: [ // Reel
    { ItemID: 1, ItemCode: 'REL-001', Quality: 'A Grade', GSM: 80, SizeW: 100, Manufacturer: 'ABC Paper Mills', Finish: 'Matte', Caliper: 0.1, EstimationUnit: 'KG', PurchaseUnit: 'KG' },
    { ItemID: 2, ItemCode: 'REL-002', Quality: 'Premium', GSM: 90, SizeW: 75, Manufacturer: 'XYZ Papers', Finish: 'Gloss', Caliper: 0.12, EstimationUnit: 'KG', PurchaseUnit: 'KG' },
  ],
  2: [ // Sheet
    { ItemID: 3, ItemCode: 'SHT-001', Quality: 'Premium', GSM: 130, SizeW: 70, SizeL: 100, Manufacturer: 'XYZ Papers', Finish: 'Gloss', EstimationUnit: 'Sheet', PurchaseUnit: 'Ream' },
    { ItemID: 4, ItemCode: 'SHT-002', Quality: 'Standard', GSM: 100, SizeW: 64, SizeL: 90, Manufacturer: 'PQR Mills', Finish: 'Matte', EstimationUnit: 'Sheet', PurchaseUnit: 'Ream' },
  ],
  3: [ // Plate
    { ItemID: 5, ItemCode: 'PLT-001', Quality: 'Hi-Res', SizeW: 60, SizeL: 80, Manufacturer: 'Fujifilm', Caliper: 0.3, EstimationUnit: 'Pcs', PurchaseUnit: 'Pcs' },
  ],
  4: [ // Ink
    { ItemID: 6, ItemCode: 'INK-001', Quality: 'Standard', Manufacturer: 'Sun Chemical', CertificationType: 'ISO', Duty: 'Dutiable', EstimationUnit: 'KG', PurchaseUnit: 'KG' },
    { ItemID: 7, ItemCode: 'INK-002', Quality: 'UV Grade', Manufacturer: 'Flint Group', CertificationType: 'FSC', Duty: 'Exempt', EstimationUnit: 'KG', PurchaseUnit: 'KG' },
  ],
  5: [ // Chemical
    { ItemID: 8, ItemCode: 'CHM-001', Quality: 'Grade A', Manufacturer: 'Hubergroup', Duty: 'Dutiable', EstimationUnit: 'Ltr', PurchaseUnit: 'Ltr' },
  ],
  6: [ // Misc
    { ItemID: 9, ItemCode: 'MSC-001', Quality: 'Standard', Manufacturer: 'Local Supplier', EstimationUnit: 'Pcs', PurchaseUnit: 'Pcs' },
  ],
}

// ─── Columns Per Group ────────────────────────────────────────────────────────

export const GROUP_COLUMNS: Record<number, string[]> = {
  1: ['ItemCode', 'Quality', 'GSM', 'SizeW', 'Manufacturer', 'Finish', 'Caliper', 'EstimationUnit', 'PurchaseUnit'],
  2: ['ItemCode', 'Quality', 'GSM', 'SizeW', 'SizeL', 'Manufacturer', 'Finish', 'EstimationUnit', 'PurchaseUnit'],
  3: ['ItemCode', 'Quality', 'SizeW', 'SizeL', 'Manufacturer', 'Caliper', 'EstimationUnit', 'PurchaseUnit'],
  4: ['ItemCode', 'Quality', 'Manufacturer', 'CertificationType', 'Duty', 'EstimationUnit', 'PurchaseUnit'],
  5: ['ItemCode', 'Quality', 'Manufacturer', 'Duty', 'EstimationUnit', 'PurchaseUnit'],
  6: ['ItemCode', 'Quality', 'Manufacturer', 'EstimationUnit', 'PurchaseUnit'],
}

// ─── Field Config Type ────────────────────────────────────────────────────────

export interface FieldConfig {
  FieldName: string
  FieldDisplayName: string
  FieldType: 'text' | 'number' | 'selectbox' | 'checkbox' | 'calculated'
  IsRequiredFieldValidator?: boolean
  IsLocked?: boolean
  UnitMeasurement?: string | null
  FieldDescription?: string
  FieldDefaultValue?: string
  MinimumValue?: number
  FieldFormula?: string | null
  IsCalculated?: boolean
}

// ─── Field Definitions Per Group ─────────────────────────────────────────────

export const GROUP_FIELDS: Record<number, FieldConfig[]> = {
  1: [ // Reel
    { FieldName: 'Quality', FieldDisplayName: 'Quality', FieldType: 'text', FieldDescription: 'e.g. A Grade' },
    { FieldName: 'GSM', FieldDisplayName: 'GSM', FieldType: 'number', IsRequiredFieldValidator: true, UnitMeasurement: 'g/m²', FieldDefaultValue: '0' },
    { FieldName: 'SizeW', FieldDisplayName: 'Reel Width', FieldType: 'number', UnitMeasurement: 'cm', FieldDefaultValue: '0' },
    { FieldName: 'Manufacturer', FieldDisplayName: 'Manufacturer', FieldType: 'text', IsRequiredFieldValidator: true, FieldDescription: 'e.g. ABC Paper Mills' },
    { FieldName: 'Finish', FieldDisplayName: 'Finish', FieldType: 'selectbox', FieldDefaultValue: 'Matte' },
    { FieldName: 'Caliper', FieldDisplayName: 'Caliper', FieldType: 'number', UnitMeasurement: 'mm', FieldDefaultValue: '0' },
    { FieldName: 'PaperBulk', FieldDisplayName: 'Paper Bulk', FieldType: 'number', FieldDefaultValue: '0' },
    { FieldName: 'CertificationType', FieldDisplayName: 'Certification Type', FieldType: 'selectbox', FieldDefaultValue: 'None' },
    { FieldName: 'Duty', FieldDisplayName: 'Duty', FieldType: 'selectbox', FieldDefaultValue: 'Dutiable' },
    { FieldName: 'EstimationUnit', FieldDisplayName: 'Estimation Unit', FieldType: 'selectbox', IsRequiredFieldValidator: true, FieldDefaultValue: 'KG' },
    { FieldName: 'PurchaseUnit', FieldDisplayName: 'Purchase Unit', FieldType: 'selectbox', FieldDefaultValue: 'KG' },
  ],
  2: [ // Sheet
    { FieldName: 'Quality', FieldDisplayName: 'Quality', FieldType: 'text', FieldDescription: 'e.g. Premium' },
    { FieldName: 'GSM', FieldDisplayName: 'GSM', FieldType: 'number', IsRequiredFieldValidator: true, UnitMeasurement: 'g/m²', FieldDefaultValue: '0' },
    { FieldName: 'SizeW', FieldDisplayName: 'Sheet Width', FieldType: 'number', UnitMeasurement: 'cm', FieldDefaultValue: '0' },
    { FieldName: 'SizeL', FieldDisplayName: 'Sheet Length', FieldType: 'number', UnitMeasurement: 'cm', FieldDefaultValue: '0' },
    { FieldName: 'Manufacturer', FieldDisplayName: 'Manufacturer', FieldType: 'text', IsRequiredFieldValidator: true, FieldDescription: 'e.g. XYZ Papers' },
    { FieldName: 'Finish', FieldDisplayName: 'Finish', FieldType: 'selectbox', FieldDefaultValue: 'Matte' },
    { FieldName: 'Caliper', FieldDisplayName: 'Caliper', FieldType: 'number', UnitMeasurement: 'mm', FieldDefaultValue: '0' },
    { FieldName: 'CertificationType', FieldDisplayName: 'Certification Type', FieldType: 'selectbox', FieldDefaultValue: 'None' },
    { FieldName: 'Duty', FieldDisplayName: 'Duty', FieldType: 'selectbox', FieldDefaultValue: 'Dutiable' },
    { FieldName: 'EstimationUnit', FieldDisplayName: 'Estimation Unit', FieldType: 'selectbox', IsRequiredFieldValidator: true, FieldDefaultValue: 'Sheet' },
    { FieldName: 'PurchaseUnit', FieldDisplayName: 'Purchase Unit', FieldType: 'selectbox', FieldDefaultValue: 'Ream' },
  ],
  3: [ // Plate
    { FieldName: 'Quality', FieldDisplayName: 'Quality', FieldType: 'text', FieldDescription: 'e.g. Hi-Res' },
    { FieldName: 'SizeW', FieldDisplayName: 'Plate Width', FieldType: 'number', UnitMeasurement: 'cm', FieldDefaultValue: '0' },
    { FieldName: 'SizeL', FieldDisplayName: 'Plate Length', FieldType: 'number', UnitMeasurement: 'cm', FieldDefaultValue: '0' },
    { FieldName: 'Manufacturer', FieldDisplayName: 'Manufacturer', FieldType: 'text', IsRequiredFieldValidator: true, FieldDescription: 'e.g. Fujifilm' },
    { FieldName: 'Caliper', FieldDisplayName: 'Caliper', FieldType: 'number', UnitMeasurement: 'mm', FieldDefaultValue: '0' },
    { FieldName: 'Duty', FieldDisplayName: 'Duty', FieldType: 'selectbox', FieldDefaultValue: 'Dutiable' },
    { FieldName: 'EstimationUnit', FieldDisplayName: 'Estimation Unit', FieldType: 'selectbox', IsRequiredFieldValidator: true, FieldDefaultValue: 'Pcs' },
    { FieldName: 'PurchaseUnit', FieldDisplayName: 'Purchase Unit', FieldType: 'selectbox', FieldDefaultValue: 'Pcs' },
  ],
  4: [ // Ink
    { FieldName: 'Quality', FieldDisplayName: 'Quality', FieldType: 'text', FieldDescription: 'e.g. UV Grade' },
    { FieldName: 'Manufacturer', FieldDisplayName: 'Manufacturer', FieldType: 'text', IsRequiredFieldValidator: true, FieldDescription: 'e.g. Sun Chemical' },
    { FieldName: 'CertificationType', FieldDisplayName: 'Certification Type', FieldType: 'selectbox', FieldDefaultValue: 'None' },
    { FieldName: 'Duty', FieldDisplayName: 'Duty', FieldType: 'selectbox', FieldDefaultValue: 'Dutiable' },
    { FieldName: 'EstimationUnit', FieldDisplayName: 'Estimation Unit', FieldType: 'selectbox', IsRequiredFieldValidator: true, FieldDefaultValue: 'KG' },
    { FieldName: 'PurchaseUnit', FieldDisplayName: 'Purchase Unit', FieldType: 'selectbox', FieldDefaultValue: 'KG' },
  ],
  5: [ // Chemical
    { FieldName: 'Quality', FieldDisplayName: 'Quality', FieldType: 'text', FieldDescription: 'e.g. Grade A' },
    { FieldName: 'Manufacturer', FieldDisplayName: 'Manufacturer', FieldType: 'text', IsRequiredFieldValidator: true },
    { FieldName: 'Duty', FieldDisplayName: 'Duty', FieldType: 'selectbox', FieldDefaultValue: 'Dutiable' },
    { FieldName: 'EstimationUnit', FieldDisplayName: 'Estimation Unit', FieldType: 'selectbox', IsRequiredFieldValidator: true, FieldDefaultValue: 'Ltr' },
    { FieldName: 'PurchaseUnit', FieldDisplayName: 'Purchase Unit', FieldType: 'selectbox', FieldDefaultValue: 'Ltr' },
  ],
  6: [ // Misc
    { FieldName: 'Quality', FieldDisplayName: 'Quality', FieldType: 'text' },
    { FieldName: 'Manufacturer', FieldDisplayName: 'Manufacturer', FieldType: 'text', IsRequiredFieldValidator: true },
    { FieldName: 'EstimationUnit', FieldDisplayName: 'Estimation Unit', FieldType: 'selectbox', IsRequiredFieldValidator: true, FieldDefaultValue: 'Pcs' },
    { FieldName: 'PurchaseUnit', FieldDisplayName: 'Purchase Unit', FieldType: 'selectbox', FieldDefaultValue: 'Pcs' },
  ],
}

// ─── Select Options ───────────────────────────────────────────────────────────

export const SELECT_OPTIONS: Record<string, { value: string; label: string }[]> = {
  Finish: [
    { value: 'Matte', label: 'Matte' },
    { value: 'Gloss', label: 'Gloss' },
    { value: 'Silk', label: 'Silk' },
    { value: 'Uncoated', label: 'Uncoated' },
    { value: 'N/A', label: 'N/A' },
  ],
  CertificationType: [
    { value: 'FSC', label: 'FSC' },
    { value: 'ISO', label: 'ISO' },
    { value: 'PEFC', label: 'PEFC' },
    { value: 'None', label: 'None' },
  ],
  Duty: [
    { value: 'Dutiable', label: 'Dutiable' },
    { value: 'Exempt', label: 'Exempt' },
    { value: 'N/A', label: 'N/A' },
  ],
  EstimationUnit: [
    { value: 'KG', label: 'KG' },
    { value: 'Sheet', label: 'Sheet' },
    { value: 'Ream', label: 'Ream' },
    { value: 'Pcs', label: 'Pcs' },
    { value: 'Ltr', label: 'Ltr' },
    { value: 'Mtr', label: 'Mtr' },
    { value: 'Roll', label: 'Roll' },
  ],
  PurchaseUnit: [
    { value: 'KG', label: 'KG' },
    { value: 'Sheet', label: 'Sheet' },
    { value: 'Ream', label: 'Ream' },
    { value: 'Pcs', label: 'Pcs' },
    { value: 'Ltr', label: 'Ltr' },
    { value: 'Mtr', label: 'Mtr' },
    { value: 'Roll', label: 'Roll' },
  ],
}