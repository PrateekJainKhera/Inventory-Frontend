/**
 * Get module name dynamically based on current route
 * Maps route paths to module names for draft system
 */
export function getModuleName(pathname: string): string {
  // Remove leading/trailing slashes and normalize
  const cleanPath = pathname.replace(/^\/+|\/+$/g, '').toLowerCase()

  // Route to Module mapping
  const routeModuleMap: Record<string, string> = {
    'estimation': 'Quotation',
    'quote-panel': 'Quote Panel',
    'enquiry': 'Enquiry',
    'job-card': 'Job Card',
    'production': 'Production',
    'purchase-order': 'Purchase Order',
    'purchase-grn': 'Purchase GRN',
    'grn-approval': 'GRN Approval',
    'invoice': 'Invoice',
    'delivery': 'Delivery',
  }

  // Find matching route
  for (const [route, module] of Object.entries(routeModuleMap)) {
    if (cleanPath.includes(route)) {
      return module
    }
  }

  // Default fallback
  return 'General'
}