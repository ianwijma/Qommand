export type AnyObjectKey = string | number | symbol
export type AnyObject<K extends AnyObjectKey = AnyObjectKey, V extends any = any> = Record<K, V>

export const sortByKey = <T extends AnyObject>(object: T): T => {
    return Object.keys(object).sort().reduce(
        (obj, key: keyof T) => {
            obj[key] = object[key];
            return obj;
        },
        {} as T
    );
}