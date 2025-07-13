import { user } from '$lib/db/tables'

export type User = typeof user.$inferSelect
