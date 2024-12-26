import {AnyObject} from "./object";

export const arrayToObjectBy = <T extends AnyObject>(array: T[], target: keyof T): AnyObject<T> => {
    return array.reduce((acc, curr) => {
        const key = curr[target];

        acc[key] = curr;

        return acc
    }, {} as AnyObject<T>)
}