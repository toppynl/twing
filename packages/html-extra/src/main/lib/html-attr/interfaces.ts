export interface AttributeValueInterface {
    getValue(): string | null;
}

export interface MergeableInterface {
    mergeInto(previous: unknown): unknown;
    appendFrom(newValue: unknown): unknown;
}

export const isAttributeValue = (value: unknown): value is AttributeValueInterface => {
    return typeof value === "object"
        && value !== null
        && typeof (value as AttributeValueInterface).getValue === "function";
};

export const isMergeable = (value: unknown): value is MergeableInterface => {
    return typeof value === "object"
        && value !== null
        && typeof (value as MergeableInterface).mergeInto === "function"
        && typeof (value as MergeableInterface).appendFrom === "function";
};

export const isIterable = (value: unknown): value is Iterable<unknown> => {
    if (value === null || value === undefined) return false;
    if (Array.isArray(value)) return true;
    if (value instanceof Map) return true;
    if (typeof value === "string") return false;
    return typeof (value as any)[Symbol.iterator] === "function";
};
