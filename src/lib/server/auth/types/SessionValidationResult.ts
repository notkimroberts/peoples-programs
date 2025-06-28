import type { validateSessionToken } from '$lib/server/auth/utils'

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>
