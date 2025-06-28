export function get<T extends Record<PropertyKey, any>, K extends keyof T>(key: K): (v: T) => T[K]
export function get<T extends Record<PropertyKey, any>, K extends keyof T>(value: T, key: K): T[K]
export function get<T extends Record<PropertyKey, any>, K extends keyof T>(value: T, key?: K) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'symbol') {
        return (v: T) => get(v, value as K)
    }
    if (typeof value === null || value === undefined || key === undefined) {
        return value
    }
    if (typeof key === 'number' || typeof key === 'symbol' || !key.includes('.')) {
        return value[key]
    }
    return key.split('.').reduce(get, value)
}
