import { user } from '$lib/server/db/tables/schema'

export type User = typeof user.$inferSelect
