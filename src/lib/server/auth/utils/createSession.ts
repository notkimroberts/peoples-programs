import { getDb } from '$lib/db/server/getDb.server'
import { session } from '$lib/db/tables'
import { DAY_IN_MS } from '$lib/server/auth/constants'
import { sha256 } from '@oslojs/crypto/sha2'
import { encodeHexLowerCase } from '@oslojs/encoding'

const db = getDb()

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	const sessionValue = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	}
	await db.insert(session).values(sessionValue)
	return sessionValue
}
