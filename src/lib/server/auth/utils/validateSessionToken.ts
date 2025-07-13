import { getDb } from '$lib/db/server'
import { session, user } from '$lib/db/tables'
import { DAY_IN_MS } from '$lib/server/auth/constants'
import { sha256 } from '@oslojs/crypto/sha2'
import { encodeHexLowerCase } from '@oslojs/encoding'
import { eq } from 'drizzle-orm'

const db = getDb()

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: { id: user.id, username: user.username },
			session: session
		})
		.from(session)
		.innerJoin(user, eq(session.userId, user.id))
		.where(eq(session.id, sessionId))

	if (!result) {
		return { session: null, user: null }
	}
	const { session: sessionResult, user: userResult } = result

	const sessionExpired = Date.now() >= sessionResult.expiresAt.getTime()
	if (sessionExpired) {
		await db.delete(session).where(eq(session.id, session.id))
		return { session: null, user: null }
	}

	const renewSession = Date.now() >= sessionResult.expiresAt.getTime() - DAY_IN_MS * 15
	if (renewSession) {
		sessionResult.expiresAt = new Date(Date.now() + DAY_IN_MS * 30)
		await db.update(session).set({ expiresAt: session.expiresAt }).where(eq(session.id, session.id))
	}

	return { session: sessionResult, user: userResult }
}
