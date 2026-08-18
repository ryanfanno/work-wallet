export type Document = {
  id: string
  user_id: string
  name: string
  category: string
  storage_path: string
  expiry_date: string | null
  uploaded_at: string
}

export type ShareLink = {
  id: string
  user_id: string
  public_token: string
  display_name: string | null
  created_at: string
  active: boolean
}

export const CATEGORIES = [
  'Resume',
  'Identification',
  'Work Rights',
  'Qualifications',
  'Licences',
  'Site Requirements',
  'Medical & Compliance',
  'Police & Security',
  'Payroll & Employment',
  'General',
] as const

export type ExpiryStatus = 'valid' | 'expiring' | 'expired' | 'none'

export function getExpiryStatus(expiryDate: string | null): ExpiryStatus {
  if (!expiryDate) return 'none'
  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysUntil = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (daysUntil < 0) return 'expired'
  if (daysUntil <= 30) return 'expiring'
  return 'valid'
}

export const statusColor: Record<ExpiryStatus, string> = {
  valid: 'bg-valid',
  expiring: 'bg-expiring',
  expired: 'bg-expired',
  none: 'bg-charcoal/20',
}

export const statusLabel: Record<ExpiryStatus, string> = {
  valid: 'Valid',
  expiring: 'Expiring soon',
  expired: 'Expired',
  none: 'No expiry',
}
