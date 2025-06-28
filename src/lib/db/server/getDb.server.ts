import * as schema from '../tables'
import { drizzle } from 'drizzle-orm/bun-sql'

const { DATABASE_LOG, DATABASE_URL } = process.env

if (!DATABASE_URL) {
	throw Error('DATABASE_URL is not defined in .env')
}

const tls = !DATABASE_URL.includes('localhost')

const db = drizzle({
	connection: {
		url: DATABASE_URL,
		tls
	},
	schema,
	logger: DATABASE_LOG === 'true'
})

export function getDb() {
	return db
}
