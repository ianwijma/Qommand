export type AnyObject<T extends any = any> = Record<string | number, T>

export const sortByKey = <T extends AnyObject>(object: T): T => {
    return Object.keys(object).sort().reduce(
        (obj, key: keyof T) => {
            obj[key] = object[key];
            return obj;
        },
        {} as T
    );
}