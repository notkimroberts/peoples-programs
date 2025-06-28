import type { RequestEvent } from '@sveltejs/kit'
import { error, json } from '@sveltejs/kit'
import {
    and,
    asc,
    desc,
    eq,
    getTableName,
    gt,
    gte,
    inArray,
    isNotNull,
    isNull,
    like,
    lt,
    lte,
    ne,
    not,
    notInArray,
    sql,
} from 'drizzle-orm'
import type { PgTable, TableConfig } from 'drizzle-orm/pg-core'
import { isPlainObject, unset } from 'lodash-es'
import { getDb } from '.'
import { get, set } from '../../general/utils'
import * as tables from '../tables'

export function handleRequest<T extends PgTable<TableConfig>>(
    table: T,
    { utils = {}, prepared = {} } = {},
) {
    const tableName = getTableName(table)
    return async ({ request, params, url }: RequestEvent) => {
        const { method } = request
        const util = utils[url.searchParams.get('__util')] ?? ((arg: any) => Promise.resolve(arg))
        const prepare = prepared[url.searchParams.get('__prepared')]
        if (url.searchParams.get('__prepared') && !prepare) {
            return error(500, `Prepared statement ${url.searchParams.get('__prepared')} not found.`)
        }
        const db = getDb()
        const query = parseQueryFromUrl({ params, table, url })
        const { id } = params
        const body = request.body && (await request.json())
        let data
        let status = 200
        try {
            if (prepare) {
                data = await util(
                    prepare.execute({
                        id,
                        ...Object.fromEntries(url.searchParams.entries()),
                    }),
                )
                if (!data) {
                    const error = new Error('Not Found')
                    error.status = 404
                    throw error
                }
            } else if (method === 'POST') {
                data = await db.insert(table).values(body).returning()
                data = Array.isArray(body) ? data : data[0]
                status = 201
            } else if (method === 'PUT' || method === 'PATCH') {
                if (Array.isArray(body)) {
                    data = await db.transaction(async (tx) => {
                        return await Promise.all(
                            body.map((row) =>
                                tx.update(table).set(body).where(query.where).returning(),
                            ),
                        )
                    })
                } else {
                    data = await db.update(table).set(body).where(query.where).returning()
                    data = data[0]
                }
            } else if (id && method === 'DELETE') {
                data = await db.delete(table).where(query.where)
            } else if (id && method === 'GET') {
                data = await util(db.query[tableName].findMany({ ...query, limit: 1 }))
                data = data[0]
                if (!data) {
                    const error = new Error('Not Found')
                    error.status = 404
                    throw error
                }
                //parseParams(query, url.searchParams)
            } else if (method === 'GET') {
                data = await util(db.query[tableName].findMany(query))
            } else {
                const error = new Error('Bad Request')
                error.status = 400
                throw error
            }
        } catch (e) {
            console.error(e)
            return error(e.status ?? 500, e)
        }
        return json(data, { status })
    }
}

function parseQueryFromUrl({ params, table, url }) {
    const { id } = params
    const query = {
        wheres: [],
    }
    if (id) {
        query.wheres.push(eq(table.id, id))
    }
    for (const [key, value] of url.searchParams) {
        if (key.includes('__')) {
            const operator = key.slice(key.indexOf('__'))
            paramPlugins[operator]?.({ query, value, key, params, table })
        } else {
            const { relation, column, path } = parseSelector(table, key, 'wheres')
            if (value === '__NULL__') {
                set(query, path, [...(get(query, path) ?? []), isNull(relation[column], value)])
            } else if (value === '__NOT_NULL__') {
                set(query, path, [...(get(query, path) ?? []), isNotNull(relation[column], value)])
            } else if (value === 'true' || value === 'false') {
                set(query, path, [
                    ...(get(query, path) ?? []),
                    eq(relation[column], JSON.parse(value)),
                ])
            } else {
                set(query, path, [...(get(query, path) ?? []), eq(relation[column], value)])
            }
        }
    }
    replaceWheresWithWhere(query)
    return query
}

function replaceWheresWithWhere(query) {
    if (query?.wheres) {
        query.where = and(...query.wheres)
        delete query.wheres
    }
    if (isPlainObject(query)) {
        Object.values(query).forEach(replaceWheresWithWhere)
    }
    return query
}

const paramPlugins = {
    __offset({ query, value }) {
        query.offset = Number(value)
    },
    __limit({ query, value }) {
        query.limit = Number(value)
    },
    __orderBy({ query, table, value }) {
        const orders = { asc, desc }
        for (const order of value.split(',')) {
            const [selector, sort = 'asc'] = order.split('|')
            const { relation, column, path } = parseSelector(table, selector, 'orderBy')
            set(query, path, [...(get(query, path) ?? []), orders[sort](relation[column])])
        }
    },
    __page({ query, value, params, key }) {
        const perpage = params.get('__perpage')
        if (perpage) {
            const column1 = key.replace(/\.?__page/, '')
            const path1 = buildQueryPath(column1, 'limit')
            set(query, path1, perpage)
            const column2 = key.replace(/\.?__perpage/, '')
            const path2 = buildQueryPath(column2, 'offset')
            set(query, path2, (value - 1) * perpage)
        }
    },
    __like({ query, value, key, table }) {
        const { relation, column, path } = parseSelector(table, key, 'wheres')
        set(query, path, [...(get(query, path) ?? []), like(relation[column], `%${value}%`)])
    },
    __not_like({ query, value, key, table }) {
        const { relation, column, path } = parseSelector(table, key, 'wheres')
        set(query, path, [...(get(query, path) ?? []), not(like(relation[column], `%${value}%`))])
    },
    __lt({ query, value, key, table }) {
        const { relation, column, path } = parseSelector(table, key, 'wheres')
        set(query, path, [...(get(query, path) ?? []), lt(relation[column], value)])
    },
    __lte({ query, value, key, table }) {
        const { relation, column, path } = parseSelector(table, key, 'wheres')
        set(query, path, [...(get(query, path) ?? []), lte(relation[column], value)])
    },
    __gt({ query, value, key, table }) {
        const { relation, column, path } = parseSelector(table, key, 'wheres')
        set(query, path, [...(get(query, path) ?? []), gt(relation[column], value)])
    },
    __gte({ query, value, key, table }) {
        const { relation, column, path } = parseSelector(table, key, 'wheres')
        set(query, path, [...(get(query, path) ?? []), gte(relation[column], value)])
    },
    __not({ query, value, key, table }) {
        const { relation, column, path } = parseSelector(table, key, 'wheres')
        set(query, path, [...(get(query, path) ?? []), ne(relation[column], value)])
    },
    __in({ query, value, key, table }) {
        const { relation, column, path } = parseSelector(table, key, 'wheres')
        set(query, path, [...(get(query, path) ?? []), inArray(relation[column], value.split(','))])
    },
    __not_in({ query, value, key, table }) {
        const { relation, column, path } = parseSelector(table, key, 'wheres')
        set(query, path, [
            ...(get(query, path) ?? []),
            notInArray(relation[column], value.split(',')),
        ])
    },
    __null({ query, key, table }) {
        const { relation, column, path } = parseSelector(table, key, 'wheres')
        set(query, path, [...(get(query, path) ?? []), isNull(relation[column])])
    },
    __not_null({ query, key, table }) {
        const column = selector.split('.').at(-1)
        const path = buildQueryPath(selector, 'wheres')
        table = tables[key.split('.').at(-2)] ?? table
        set(query, path, [...(get(query, path) ?? []), isNotNull(table[column])])
    },
    __select({ query, value, table }) {
        const columns = value.split(',')
        for (let selector of columns) {
            const { column, path } = parseSelector(table, selector)
            if (column === '*') {
                if (get(query, path)) {
                    unset(query, path)
                } else {
                    set(query, path, true)
                }
            } else if (column === 'count') {
                set(query, path, { ...(get(query, path) ?? {}), columns: {} })
                set(query, path, {
                    ...(get(query, path) ?? {}),
                    count: sql`count(1) over()`.mapWith(Number).as('count'),
                })
            } else {
                set(query, path, {
                    ...(get(query, path) ?? {}),
                    [column]: true,
                })
            }
        }
    },
}

function parseSelector(table, selector, field) {
    if (!selector) {
        return field
    }
    const parts = selector.replace(/__.+/, '').split('.')
    const column = parts.pop()
    const relationName = parts.at(-1)
    const relation = tables[relationName] ?? table
    const pathWithoutField = parts.map((relation) => `with.${relation}`).join('.')
    let path = pathWithoutField
    if (path) {
        if (field) {
            path = `${path}.${field}`
        }
    } else {
        path = field
    }
    return { relation, column, path }
}
