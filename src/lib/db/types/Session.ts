import { session } from '$lib/server/db/tables/schema'

export type Session = typeof session.$inferSelect
