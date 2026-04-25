// ─── Types ────────────────────────────────────────────────────────────────────

export interface LedgerGroup {
  LedgerGroupID: number
  LedgerGroupName: string
  LedgerGroupNameDisplay: string
}

export interface LedgerRecord {
  LedgerID: number
  LedgerCode: string
  LedgerName: string
  [key: string]: any
}

export interface DynamicField {
  LedgerGroupFieldID: number
  LedgerGroupID: number
  FieldName: string
  FieldDataType: string
  FieldDescription: string
  IsDisplay: boolean
  FieldDrawSequence: number
  FieldDefaultValue: string
  FieldDisplayName: string
  FieldType: string
  SelectBoxQueryDB: string | null
  SelectBoxDefault: string | null
  IsRequiredFieldValidator: boolean
  UnitMeasurement: string | null
  IsLocked: boolean
  MinimumValue: number
  MaximumValue: number
}

// ─── Ledger Groups ────────────────────────────────────────────────────────────

export const LEDGER_GROUPS: LedgerGroup[] = [
  { LedgerGroupID: 1, LedgerGroupName: 'Customer',  LedgerGroupNameDisplay: 'Customer Ledger' },
  { LedgerGroupID: 2, LedgerGroupName: 'Supplier',  LedgerGroupNameDisplay: 'Supplier Ledger' },
  { LedgerGroupID: 3, LedgerGroupName: 'Bank',      LedgerGroupNameDisplay: 'Bank Ledger' },
  { LedgerGroupID: 4, LedgerGroupName: 'Cash',      LedgerGroupNameDisplay: 'Cash Ledger' },
  { LedgerGroupID: 5, LedgerGroupName: 'Expense',   LedgerGroupNameDisplay: 'Expense Ledger' },
  { LedgerGroupID: 6, LedgerGroupName: 'Income',    LedgerGroupNameDisplay: 'Income Ledger' },
]

// ─── Mock Grid Data Per Group ─────────────────────────────────────────────────

export const MOCK_LEDGER_DATA: Record<number, LedgerRecord[]> = {
  1: [ // Customer
    { LedgerID: 1, LedgerCode: 'CUS-001', LedgerName: 'ABC Printers Pvt Ltd', OpeningBalance: 50000, CreditLimit: 200000, CreditDays: 30, GSTNumber: '27AAAPL1234C1Z5', PAN: 'AAAPL1234C', ContactPerson: 'Ramesh Shah', Phone: '9876543210', Email: 'ramesh@abcprint.com' },
    { LedgerID: 2, LedgerCode: 'CUS-002', LedgerName: 'XYZ Publications',       OpeningBalance: 25000, CreditLimit: 100000, CreditDays: 45, GSTNumber: '29BBBXYZ5678D2Z6', PAN: 'BBBXYZ5678D', ContactPerson: 'Priya Nair',  Phone: '9123456789', Email: 'priya@xyzpub.com' },
    { LedgerID: 3, LedgerCode: 'CUS-003', LedgerName: 'Global Packaging Ltd',   OpeningBalance: 75000, CreditLimit: 300000, CreditDays: 60, GSTNumber: '06CCCGPL9012E3Z7', PAN: 'CCCGPL9012E', ContactPerson: 'Suresh Kumar', Phone: '9988776655', Email: 'suresh@globalpack.com' },
  ],
  2: [ // Supplier
    { LedgerID: 4, LedgerCode: 'SUP-001', LedgerName: 'ABC Paper Mills',    OpeningBalance: -30000, GSTNumber: '27DDDPM1111F4Z8', PAN: 'DDDPM1111F', ContactPerson: 'Anil Joshi',  Phone: '9090909090', Email: 'anil@abcpaper.com',    PaymentTerms: 'Net 30' },
    { LedgerID: 5, LedgerCode: 'SUP-002', LedgerName: 'Sun Chemical India', OpeningBalance: -15000, GSTNumber: '06EEESC2222G5Z9', PAN: 'EEESC2222G', ContactPerson: 'Meena Gupta', Phone: '8080808080', Email: 'meena@sunchem.com',     PaymentTerms: 'Net 45' },
    { LedgerID: 6, LedgerCode: 'SUP-003', LedgerName: 'Fujifilm India',     OpeningBalance: -20000, GSTNumber: '29FFFFI3333H6Z0', PAN: 'FFFFI3333H', ContactPerson: 'Rohan Desai', Phone: '7070707070', Email: 'rohan@fujifilm.co.in', PaymentTerms: 'Net 60' },
  ],
  3: [ // Bank
    { LedgerID: 7,  LedgerCode: 'BNK-001', LedgerName: 'HDFC Bank - Current Account', AccountNumber: '50100123456789', BankName: 'HDFC Bank', BranchName: 'Andheri East', IFSCCode: 'HDFC0001234', OpeningBalance: 500000 },
    { LedgerID: 8,  LedgerCode: 'BNK-002', LedgerName: 'ICICI Bank - OD Account',     AccountNumber: '012345678901',   BankName: 'ICICI Bank', BranchName: 'Powai',       IFSCCode: 'ICIC0000123', OpeningBalance: 200000 },
  ],
  4: [ // Cash
    { LedgerID: 9,  LedgerCode: 'CSH-001', LedgerName: 'Petty Cash',  OpeningBalance: 10000 },
    { LedgerID: 10, LedgerCode: 'CSH-002', LedgerName: 'Office Cash', OpeningBalance: 5000 },
  ],
  5: [ // Expense
    { LedgerID: 11, LedgerCode: 'EXP-001', LedgerName: 'Salary Expense',      ExpenseCategory: 'Payroll',    OpeningBalance: 0 },
    { LedgerID: 12, LedgerCode: 'EXP-002', LedgerName: 'Electricity Expense', ExpenseCategory: 'Utilities',  OpeningBalance: 0 },
    { LedgerID: 13, LedgerCode: 'EXP-003', LedgerName: 'Rent Expense',        ExpenseCategory: 'Overheads',  OpeningBalance: 0 },
  ],
  6: [ // Income
    { LedgerID: 14, LedgerCode: 'INC-001', LedgerName: 'Printing Income',    IncomeCategory: 'Operations', OpeningBalance: 0 },
    { LedgerID: 15, LedgerCode: 'INC-002', LedgerName: 'Packaging Income',   IncomeCategory: 'Operations', OpeningBalance: 0 },
    { LedgerID: 16, LedgerCode: 'INC-003', LedgerName: 'Interest Income',    IncomeCategory: 'Financial',  OpeningBalance: 0 },
  ],
}

// ─── Grid Column Keys Per Group ───────────────────────────────────────────────

export const GROUP_COLUMNS: Record<number, Array<{ key: string; header: string }>> = {
  1: [
    { key: 'LedgerCode', header: 'Ledger Code' },
    { key: 'LedgerName', header: 'Ledger Name' },
    { key: 'OpeningBalance', header: 'Opening Balance' },
    { key: 'CreditLimit', header: 'Credit Limit' },
    { key: 'CreditDays', header: 'Credit Days' },
    { key: 'GSTNumber', header: 'GST Number' },
    { key: 'Phone', header: 'Phone' },
    { key: 'Email', header: 'Email' },
  ],
  2: [
    { key: 'LedgerCode', header: 'Ledger Code' },
    { key: 'LedgerName', header: 'Ledger Name' },
    { key: 'OpeningBalance', header: 'Opening Balance' },
    { key: 'GSTNumber', header: 'GST Number' },
    { key: 'Phone', header: 'Phone' },
    { key: 'PaymentTerms', header: 'Payment Terms' },
  ],
  3: [
    { key: 'LedgerCode', header: 'Ledger Code' },
    { key: 'LedgerName', header: 'Ledger Name' },
    { key: 'AccountNumber', header: 'Account Number' },
    { key: 'BankName', header: 'Bank Name' },
    { key: 'IFSCCode', header: 'IFSC Code' },
    { key: 'OpeningBalance', header: 'Opening Balance' },
  ],
  4: [
    { key: 'LedgerCode', header: 'Ledger Code' },
    { key: 'LedgerName', header: 'Ledger Name' },
    { key: 'OpeningBalance', header: 'Opening Balance' },
  ],
  5: [
    { key: 'LedgerCode', header: 'Ledger Code' },
    { key: 'LedgerName', header: 'Ledger Name' },
    { key: 'ExpenseCategory', header: 'Expense Category' },
    { key: 'OpeningBalance', header: 'Opening Balance' },
  ],
  6: [
    { key: 'LedgerCode', header: 'Ledger Code' },
    { key: 'LedgerName', header: 'Ledger Name' },
    { key: 'IncomeCategory', header: 'Income Category' },
    { key: 'OpeningBalance', header: 'Opening Balance' },
  ],
}

// ─── Dynamic Field Definitions Per Group ─────────────────────────────────────

function field(
  id: number,
  groupId: number,
  seq: number,
  name: string,
  displayName: string,
  type: string,
  dataType: string,
  required = false,
  defaultValue = '',
  description = '',
  unit: string | null = null
): DynamicField {
  return {
    LedgerGroupFieldID: id,
    LedgerGroupID: groupId,
    FieldName: name,
    FieldDataType: dataType,
    FieldDescription: description,
    IsDisplay: true,
    FieldDrawSequence: seq,
    FieldDefaultValue: defaultValue,
    FieldDisplayName: displayName,
    FieldType: type,
    SelectBoxQueryDB: null,
    SelectBoxDefault: null,
    IsRequiredFieldValidator: required,
    UnitMeasurement: unit,
    IsLocked: false,
    MinimumValue: 0,
    MaximumValue: 0,
  }
}

export const GROUP_FIELDS: Record<number, DynamicField[]> = {
  1: [ // Customer
    field(1,  1, 1,  'LedgerName',     'Ledger Name',      'text',      'varchar', true,  '', 'e.g. ABC Printers'),
    field(2,  1, 2,  'OpeningBalance', 'Opening Balance',  'number',    'decimal', false, '0', '', '₹'),
    field(3,  1, 3,  'CreditLimit',    'Credit Limit',     'number',    'decimal', false, '0', '', '₹'),
    field(4,  1, 4,  'CreditDays',     'Credit Days',      'number',    'int',     false, '0', '', 'Days'),
    field(5,  1, 5,  'GSTNumber',      'GST Number',       'text',      'varchar', false, ''),
    field(6,  1, 6,  'PAN',            'PAN',              'text',      'varchar', false, ''),
    field(7,  1, 7,  'ContactPerson',  'Contact Person',   'text',      'varchar', false, ''),
    field(8,  1, 8,  'Phone',          'Phone',            'text',      'varchar', false, ''),
    field(9,  1, 9,  'Email',          'Email',            'text',      'varchar', false, ''),
    { ...field(10, 1, 10, 'ActiveLedger', 'Active Ledger', 'checkbox', 'bit', false, 'true'), FieldDefaultValue: 'true' },
  ],
  2: [ // Supplier
    field(11, 2, 1,  'LedgerName',     'Ledger Name',      'text',      'varchar', true,  '', 'e.g. ABC Paper Mills'),
    field(12, 2, 2,  'OpeningBalance', 'Opening Balance',  'number',    'decimal', false, '0', '', '₹'),
    field(13, 2, 3,  'GSTNumber',      'GST Number',       'text',      'varchar', false, ''),
    field(14, 2, 4,  'PAN',            'PAN',              'text',      'varchar', false, ''),
    field(15, 2, 5,  'ContactPerson',  'Contact Person',   'text',      'varchar', false, ''),
    field(16, 2, 6,  'Phone',          'Phone',            'text',      'varchar', false, ''),
    field(17, 2, 7,  'Email',          'Email',            'text',      'varchar', false, ''),
    { ...field(18, 2, 8,  'PaymentTerms',  'Payment Terms',    'selectbox', 'varchar', false, 'Net 30'), SelectBoxQueryDB: 'PaymentTerms' },
    { ...field(19, 2, 9,  'ActiveLedger',  'Active Ledger',   'checkbox',  'bit',     false, 'true'), FieldDefaultValue: 'true' },
  ],
  3: [ // Bank
    field(20, 3, 1,  'LedgerName',     'Ledger Name',      'text',      'varchar', true,  '', 'e.g. HDFC Current Account'),
    field(21, 3, 2,  'AccountNumber',  'Account Number',   'text',      'varchar', true,  ''),
    field(22, 3, 3,  'BankName',       'Bank Name',        'text',      'varchar', true,  ''),
    field(23, 3, 4,  'BranchName',     'Branch Name',      'text',      'varchar', false, ''),
    field(24, 3, 5,  'IFSCCode',       'IFSC Code',        'text',      'varchar', true,  ''),
    field(25, 3, 6,  'OpeningBalance', 'Opening Balance',  'number',    'decimal', false, '0', '', '₹'),
  ],
  4: [ // Cash
    field(26, 4, 1,  'LedgerName',     'Ledger Name',      'text',      'varchar', true,  '', 'e.g. Petty Cash'),
    field(27, 4, 2,  'OpeningBalance', 'Opening Balance',  'number',    'decimal', false, '0', '', '₹'),
  ],
  5: [ // Expense
    field(28, 5, 1,  'LedgerName',      'Ledger Name',      'text',      'varchar', true,  ''),
    { ...field(29, 5, 2,  'ExpenseCategory', 'Expense Category', 'selectbox', 'varchar', false, 'Overheads'), SelectBoxQueryDB: 'ExpenseCategory' },
    field(30, 5, 3,  'OpeningBalance',  'Opening Balance',  'number',    'decimal', false, '0', '', '₹'),
  ],
  6: [ // Income
    field(31, 6, 1,  'LedgerName',     'Ledger Name',      'text',      'varchar', true,  ''),
    { ...field(32, 6, 2,  'IncomeCategory', 'Income Category', 'selectbox', 'varchar', false, 'Operations'), SelectBoxQueryDB: 'IncomeCategory' },
    field(33, 6, 3,  'OpeningBalance', 'Opening Balance',  'number',    'decimal', false, '0', '', '₹'),
  ],
}

// ─── Static Select Options ────────────────────────────────────────────────────

export const SELECT_OPTIONS: Record<string, { value: string; label: string }[]> = {
  PaymentTerms: [
    { value: 'Net 15', label: 'Net 15' },
    { value: 'Net 30', label: 'Net 30' },
    { value: 'Net 45', label: 'Net 45' },
    { value: 'Net 60', label: 'Net 60' },
    { value: 'Advance', label: 'Advance' },
  ],
  ExpenseCategory: [
    { value: 'Payroll', label: 'Payroll' },
    { value: 'Utilities', label: 'Utilities' },
    { value: 'Overheads', label: 'Overheads' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Maintenance', label: 'Maintenance' },
  ],
  IncomeCategory: [
    { value: 'Operations', label: 'Operations' },
    { value: 'Financial', label: 'Financial' },
    { value: 'Other', label: 'Other' },
  ],
}