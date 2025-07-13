import * as schema from '../tables'
import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http'
import { drizzle as drizzleNodePostgres } from 'drizzle-orm/node-postgres'

const { DATABASE_LOG, DATABASE_URL } = process.env

if (!DATABASE_URL) {
	throw Error('DATABASE_URL is not defined in .env')
}

const isLocal = DATABASE_URL.includes('localhost')
const config = {
	connection: {
		url: DATABASE_URL,
		tls: !isLocal
	},
	schema,
	logger: DATABASE_LOG === 'true'
}
const sql = neon(process.env.DATABASE_URL!)

const db = isLocal ? drizzleNodePostgres(config) : drizzleNeonHttp({ client: sql, ...config })

export function getDb() {
	return db
}
