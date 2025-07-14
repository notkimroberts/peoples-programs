import * as schema from '../tables'
import { drizzle } from 'drizzle-orm/postgres-js'

const { DATABASE_LOG, DATABASE_URL } = process.env

if (!DATABASE_URL) {
	throw Error('DATABASE_URL is not defined in .env')
}

const db = drizzle({
	connection: {
		url: DATABASE_URL
	},
	schema,
	logger: DATABASE_LOG === 'true'
})

export function getDb() {
	return db
}
