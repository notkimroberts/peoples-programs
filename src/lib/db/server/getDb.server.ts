import * as schema from '../tables'
import { drizzle as neon } from 'drizzle-orm/neon-http'
import { drizzle as local } from 'drizzle-orm/postgres-js'

const { DATABASE_LOG, DATABASE_URL } = process.env

if (!DATABASE_URL) {
	throw Error('DATABASE_URL is not defined in .env')
}

const isLocal = DATABASE_URL.includes('localhost')
const config = {
	connection: {
		url: DATABASE_URL
	},
	schema,
	logger: DATABASE_LOG === 'true'
}

const db = isLocal ? local(config) : neon(DATABASE_URL)

export function getDb() {
	return db
}
