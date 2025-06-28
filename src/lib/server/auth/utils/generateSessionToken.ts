import { encodeBase64url } from '@oslojs/encoding'

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18))
	const token = encodeBase64url(bytes)
	return token
}
