export function set<T = Record<string, any>>(source: T, path: string | number, value: any): T {
    if (typeof path === 'number' || !isNaN(Number(path)) || !path.includes('.')) {
        source[path] = value
        return source
    }
    return path.split('.').reduce((acc, key, i, keys) => {
        if (i === keys.length - 1) {
            return set(acc, key, value)
        }
        acc[key] ??= isNaN(Number(keys[i + 1])) ? {} : []
        return acc[key]
    }, source)
}
