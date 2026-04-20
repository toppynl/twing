import type {AttributeValueInterface, MergeableInterface} from "./interfaces";
import {isIterable} from "./interfaces";

type Entry = [string | number, unknown];

const toEntries = (value: unknown): Entry[] => {
    if (!isIterable(value)) {
        throw new Error("InlineStyle can only be created from iterable values.");
    }

    if (value instanceof Map) {
        return Array.from(value.entries()) as Entry[];
    }

    if (Array.isArray(value)) {
        return value.map((v, i) => [i, v] as Entry);
    }

    const result: Entry[] = [];
    let i = 0;
    for (const v of value) {
        result.push([i++, v]);
    }
    return result;
};

const trimSemiAndSpace = (value: string): string => {
    return value.replace(/^[;\s]+|[;\s]+$/g, "");
};

export class InlineStyle implements AttributeValueInterface, MergeableInterface {
    private readonly entries: Entry[];

    constructor(value: unknown) {
        this.entries = toEntries(value);
    }

    mergeInto(previous: unknown): InlineStyle {
        if (previous instanceof InlineStyle) {
            return new InlineStyle([...previous.entries.map(([, v]) => v), ...this.entries.map(([, v]) => v)]);
        }

        if (isIterable(previous)) {
            const prev = previous instanceof Map ? Array.from(previous.entries()) as Entry[] : toEntries(previous);
            return new InlineStyle(mergeEntries(prev, this.entries));
        }

        throw new Error("Attributes using InlineStyle can only be merged with iterables or other InlineStyle instances.");
    }

    appendFrom(newValue: unknown): InlineStyle {
        if (!isIterable(newValue)) {
            throw new Error("Only iterable values can be appended to InlineStyle.");
        }

        const next = newValue instanceof Map ? Array.from(newValue.entries()) as Entry[] : toEntries(newValue);
        return new InlineStyle(mergeEntries(this.entries, next));
    }

    getValue(): string | null {
        let style = "";

        for (const [name, value] of this.entries) {
            if (value === undefined || value === null || value === "" || value === 0 || value === false || value === "0") {
                continue;
            }
            if (value === true) continue;

            if (typeof name === "number") {
                style += trimSemiAndSpace(String(value)) + "; ";
            } else {
                style += `${name}: ${value}; `;
            }
        }

        const trimmed = style.trim();
        return trimmed === "" ? null : trimmed;
    }
}

const mergeEntries = (a: Entry[], b: Entry[]): Map<string | number, unknown> => {
    const merged = new Map<string | number, unknown>();
    let nextNumeric = 0;

    for (const entries of [a, b]) {
        for (const [key, value] of entries) {
            if (typeof key === "number") {
                merged.set(nextNumeric++, value);
            } else {
                merged.set(key, value);
            }
        }
    }

    return merged;
};
