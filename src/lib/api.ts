// Frontend-only stub — no backend, no API calls.
// Provides the same types and exports that migration's @/lib/api exposes,
// so copied components compile without modification.

// ─── Navigation types (from utility/menu.ts) ─────────────────────────────────

export interface DynamicModule {
  ModuleHeadName: string
  ModuleDisplayName: string
  SetGroupIndex: number
  NumberOfChild: number
  ModuleName: string
  ModuleDisplayOrder: number
  ParentModuleName?: string
  children?: DynamicModule[]
}

export interface GroupedModule {
  groupName: string
  modules: DynamicModule[]
  groupIndex: number
}

export async function getDynamicNavigation(
  _companyId?: number,
  _userId?: number
): Promise<GroupedModule[]> {
  return []
}

// ─── API config stubs (used by api-config-modal / global-api-config-modal) ────

export interface APIConfig {
  baseUrl: string
  username?: string
  password?: string
}

export function getAuthAPIConfig(): APIConfig | null { return null }
export function setAuthAPIConfig(_cfg: APIConfig): void {}
export function clearAuthAPIConfig(): void {}

export function getGlobalAPIConfig(): APIConfig | null { return null }
export function setGlobalAPIConfig(_cfg: APIConfig): void {}
export function clearGlobalAPIConfig(): void {}
export function isAPIConfigured(): boolean { return false }

export async function pingAPI(_url: string): Promise<boolean> { return false }

// ─── Currency types (from utility/currency.ts) ────────────────────────────────

export interface CurrencyInfo {
  code: string
  name: string
  symbol: string
  flag: string
  decimal: number
}

export interface ExchangeRates {
  [key: string]: number
}

const STUB_CURRENCIES: CurrencyInfo[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', decimal: 2 },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', decimal: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', decimal: 2 },
]

export const currencyAPI = {
  async fetchCurrencies(): Promise<CurrencyInfo[]> {
    return STUB_CURRENCIES
  },
  async fetchExchangeRates(_base?: string): Promise<ExchangeRates> {
    return { INR: 1, USD: 0.012, EUR: 0.011 }
  },
}