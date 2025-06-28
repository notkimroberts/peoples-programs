import { SESSION_COOKIE_NAME } from '../constants/SESSION_COOKIE_NAME'
import type { RequestEvent } from '@sveltejs/kit'

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(SESSION_COOKIE_NAME, {
		path: '/'
	})
}
