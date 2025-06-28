import { SESSION_COOKIE_NAME } from '$lib/server/auth/constants'
import {
	setSessionTokenCookie,
	deleteSessionTokenCookie,
	validateSessionToken
} from '$lib/server/auth/utils'
import type { Handle } from '@sveltejs/kit'

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(SESSION_COOKIE_NAME)

	if (!sessionToken) {
		event.locals.user = null
		event.locals.session = null
		return resolve(event)
	}

	const { session, user } = await validateSessionToken(sessionToken)

	if (session) {
		setSessionTokenCookie(event, sessionToken, session.expiresAt)
	} else {
		deleteSessionTokenCookie(event)
	}

	event.locals.user = user
	event.locals.session = session
	return resolve(event)
}

export const handle: Handle = handleAuth
