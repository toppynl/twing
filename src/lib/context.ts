export interface TwingContext<K, V> {
    readonly size: number;

    [Symbol.iterator](): IterableIterator<[K, V]>;

    clone(): TwingContext<K, V>;

    delete(key: K): boolean;

    entries(): IterableIterator<[K, V]>;

    get(key: K): V | undefined;

    has(key: K): boolean;

    set(key: K, value: V): TwingContext<K, V>;
    
    values(): IterableIterator<V>;
}

export const createContext = <K extends string, V>(
    container: Map<K, V> = new Map()
): TwingContext<K, V> => {
    const context: TwingContext<K, V> = {
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
            return container.get(key);
        },
        has: (key) => {
            return container.has(key);
        },
        set: (key, value) => {
            container.set(key, value);

            return context;
        },
        values: () => {
            return container.values();
        }
    };

    return context;
};
