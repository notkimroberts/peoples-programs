import { SESSION_COOKIE_NAME } from '../constants/SESSION_COOKIE_NAME'
import type { RequestEvent } from '@sveltejs/kit'

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(SESSION_COOKIE_NAME, token, {
		expires: expiresAt,
		path: '/'
	})
}
