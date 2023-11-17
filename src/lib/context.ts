import {iteratorToMap} from "./helpers/iterator-to-map";

export interface TwingContext<K, V> {
    readonly proxy: Map<K, V>;

    readonly size: number;

    [Symbol.iterator](): IterableIterator<[K, V]>;

    clone(): TwingContext<K, V>;

    delete(key: K): boolean;

    entries(): IterableIterator<[K, V]>;

    get(key: K): V;

    has(key: K): boolean;

    set(key: K, value: V): TwingContext<K, V>;
}

export const isAContext = (candidate: any): candidate is TwingContext<any, any> => {
    return candidate !== undefined
        && candidate !== null
        && (candidate as TwingContext<any, any>).proxy !== undefined
        && (candidate as TwingContext<any, any>).proxy instanceof Map;
};

export const createContext = <K, V>(
    container: Map<K, V> = new Map()
): TwingContext<K, V> => {
    const proxy = new Proxy(container, {
        set: (target: Map<any, any>, key: string | number | symbol, value: any): boolean => {
            target.set(key, value);

            return true;
        },
        get(target: Map<any, any>, key: string | number | symbol): any {
            return target.get(key);
        }
    });

    const context: TwingContext<K, V> = {
        get proxy() {
            return proxy;
        },
        get size() {
            return container.size;
        },
        [Symbol.iterator]: () => {
            return container[Symbol.iterator]();
        },
        clone: () => {
            const clonedContainer: Map<K, V> = new Map();

            for (const [key, value] of container) {
                clonedContainer.set(key, value);
            }

            return createContext(clonedContainer);
        },
        delete: (key) => {
            return container.delete(key);
        },
        entries: () => {
            return container.entries();
        },
        get: (key) => {
            let value: any = container.get(key);

            if (Array.isArray(value)) {
                value = iteratorToMap(value);
            }

            return value;
        },
        has: (key) => {
            return container.has(key);
        },
        set: (key, value) => {
            container.set(key, value);

            return context;
        }
    };

    return context;
};
