import type {AttributeValueInterface, MergeableInterface} from "./interfaces";
import {isIterable} from "./interfaces";

const toValues = (value: unknown): unknown[] => {
    if (isIterable(value)) {
        if (value instanceof Map) {
            return Array.from(value.values());
        }
        return Array.from(value);
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return [value];
    }

    throw new Error("SeparatedTokenList can only be constructed from iterable or scalar values.");
};

export class SeparatedTokenList implements AttributeValueInterface, MergeableInterface {
    private readonly values: unknown[];

    constructor(value: unknown, private readonly separator: string = " ") {
        this.values = toValues(value);
    }

    mergeInto(previous: unknown): SeparatedTokenList {
        if (previous instanceof SeparatedTokenList && previous.separator === this.separator) {
            return new SeparatedTokenList([...previous.values, ...this.values], this.separator);
        }

        if (isIterable(previous)) {
            const prev = previous instanceof Map ? Array.from(previous.values()) : Array.from(previous);
            return new SeparatedTokenList([...prev, ...this.values], this.separator);
        }

        throw new Error("SeparatedTokenList can only be merged with iterables or other SeparatedTokenList instances using the same separator.");
    }

    appendFrom(newValue: unknown): SeparatedTokenList {
        if (!isIterable(newValue)) {
            throw new Error("Only iterable values can be appended to SeparatedTokenList.");
        }

        const next = newValue instanceof Map ? Array.from(newValue.values()) : Array.from(newValue);
        return new SeparatedTokenList([...this.values, ...next], this.separator);
    }

    getValue(): string | null {
        const filtered = this.values.filter((v) => v !== null && v !== false && v !== undefined);

        if (filtered.length === 0) {
            return null;
        }

        return filtered.filter((v) => v !== true).map((v) => String(v)).join(this.separator).trim();
    }
}
