import {isAttributeValue, isIterable, isMergeable} from "./interfaces";

export const htmlAttrMerge = (...arrays: unknown[]): Map<string, unknown> => {
    const result = new Map<string, unknown>();

    for (const array of arrays) {
        if (!array) {
            continue;
        }

        if (typeof array === "string") {
            throw new Error("Only empty strings may be passed as string arguments to html_attr_merge. This is to support the implicit else clause for ternary operators.");
        }

        const entries = array instanceof Map
            ? array.entries()
            : Array.isArray(array)
                ? (array as Array<[string, unknown]>).entries()
                : Object.entries(array as Record<string, unknown>);

        for (const entry of entries as Iterable<[string | number, unknown]>) {
            const key = String(entry[0]);
            const value = entry[1];

            if (!result.has(key)) {
                result.set(key, value);
                continue;
            }

            const existing = result.get(key);

            if (isMergeable(value)) {
                result.set(key, value.mergeInto(existing));
            } else if (isMergeable(existing)) {
                result.set(key, existing.appendFrom(value));
            } else if (isIterable(existing) && isIterable(value)) {
                const merged = new Map<string | number, unknown>();
                let nextNumeric = 0;

                const addEntries = (source: unknown) => {
                    if (source instanceof Map) {
                        for (const [k, v] of source.entries()) {
                            if (typeof k === "number") {
                                merged.set(nextNumeric++, v);
                            } else {
                                merged.set(String(k), v);
                            }
                        }
                    } else if (Array.isArray(source)) {
                        for (const v of source) {
                            merged.set(nextNumeric++, v);
                        }
                    } else if (isIterable(source)) {
                        for (const v of source) {
                            merged.set(nextNumeric++, v);
                        }
                    }
                };

                addEntries(existing);
                addEntries(value);

                result.set(key, merged);
            } else {
                const existingScalar = existing === null || ["string", "number", "boolean"].includes(typeof existing) || isAttributeValue(existing) || typeof existing === "object";
                const valueScalar = value === null || ["string", "number", "boolean"].includes(typeof value) || isAttributeValue(value) || typeof value === "object";
                if (existingScalar && valueScalar) {
                    result.set(key, value);
                } else {
                    throw new Error(`Cannot merge incompatible values for key "${key}".`);
                }
            }
        }
    }

    return result;
};
