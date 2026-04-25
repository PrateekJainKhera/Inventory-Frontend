// Main component barrel — mirrors migration's src/components/index.ts
export * from './ui'
export * from './layout'
export * from './datagrid'
export * from './modals'

// Direct exports for commonly used components
export { Dropdown, ComboBox } from './forms/dropdown'
export type { DropdownProps, DropdownOption, ComboBoxProps, ComboBoxOption } from './forms/dropdown'
export { DatePicker, DateTimePicker } from './forms/date-picker'
export type { DatePickerProps, DateRange, DateTimePickerProps } from './forms/date-picker'
export { FileAttachment } from './forms/file-attachment/FileAttachment'
export type { AttachedFile, FileAttachmentProps } from './forms/file-attachment/FileAttachment'