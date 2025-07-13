import { session } from '$lib/db/tables'

export type Session = typeof session.$inferSelect
