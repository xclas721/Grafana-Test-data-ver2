const ADMIN_ROLES = ['ADMIN', 'EDITOR', 'VIEWER'] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]
export type FrontRole = 'MEMBER'

const parseJwtRole = (token: string): string | null => {
  const parts = token.split('.')
  if (parts.length !== 3 || !parts[1]) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const payload = JSON.parse(atob(padded)) as { role?: unknown }
    return typeof payload.role === 'string' ? payload.role : null
  } catch {
    return null
  }
}

export const parseAdminRoleFromToken = (token: string | null): AdminRole | null => {
  if (!token) return null

  const jwtRole = parseJwtRole(token)
  if (jwtRole && (ADMIN_ROLES as readonly string[]).includes(jwtRole)) {
    return jwtRole as AdminRole
  }

  if (token.startsWith('demo-') || token.startsWith('user-')) {
    return 'ADMIN'
  }

  return null
}

export const parseFrontRoleFromToken = (token: string | null): FrontRole | null => {
  if (!token) return null

  const jwtRole = parseJwtRole(token)
  if (jwtRole === 'MEMBER') return 'MEMBER'

  if (token.startsWith('front-demo-') || token.startsWith('front-user-')) {
    return 'MEMBER'
  }

  return null
}
