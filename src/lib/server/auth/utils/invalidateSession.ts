import { getDb } from '$lib/db/server'
import { session } from '$lib/db/tables'
import { eq } from 'drizzle-orm'

const db = getDb()

export async function invalidateSession(sessionId: string) {
	await db.delete(session).where(eq(session.id, sessionId))
}
