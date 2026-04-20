import {escapeHtml, escapeHtmlAttrRelaxed, isAttributeValue} from "@toppynl/twing-html-extra";
import type {AttributeValueInterface} from "@toppynl/twing-html-extra";

const NESTED_REGEX = /^([\w-]+):(.+)$/;
const ALPINE_REGEX = /^x-([a-z]+):[^:]+$/;
const VUE_REGEX = /^v-([a-z]+):[^:]+$/;

const PREPEND_KEYS = ["class", "data-controller", "data-action"] as const;

const stripAllowed = (input: string, allowed: string[]): string => {
    let result = input;

    for (const char of allowed) {
        result = result.split(char).join("");
    }

    return result;
};

const isCtypeAlnum = (input: string): boolean => {
    if (input.length === 0) {
        return false;
    }

    return /^[A-Za-z0-9]+$/.test(input);
};

const isPlainScalar = (value: unknown): value is string | number | boolean => {
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
};

const coerceToString = (value: unknown): string => {
    if (typeof value === "string") {
        return value;
    }

    return String(value);
};

export class ComponentAttributes {
    private readonly rendered: Set<string> = new Set();
    private readonly attributes: Record<string, unknown>;

    constructor(attributes: Record<string, unknown> | Map<string, unknown> = {}) {
        if (attributes instanceof Map) {
            const plain: Record<string, unknown> = {};

            for (const [key, value] of attributes) {
                plain[key] = value;
            }

            this.attributes = plain;
        } else {
            this.attributes = {...attributes};
        }
    }

    all(): Record<string, unknown> {
        return {...this.attributes};
    }

    has(key: string): boolean {
        return Object.prototype.hasOwnProperty.call(this.attributes, key);
    }

    count(): number {
        return Object.keys(this.attributes).length;
    }

    only(...keys: string[]): ComponentAttributes {
        const next: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(this.attributes)) {
            if (keys.includes(key)) {
                next[key] = value;
            }
        }

        return new ComponentAttributes(next);
    }

    without(...keys: string[]): ComponentAttributes {
        const next: Record<string, unknown> = {...this.attributes};

        for (const key of keys) {
            delete next[key];
        }

        return new ComponentAttributes(next);
    }

    remove(key: string): ComponentAttributes {
        return this.without(key);
    }

    defaults(defaults: Record<string, unknown> | Map<string, unknown> | Iterable<[string, unknown]>): ComponentAttributes {
        const plainDefaults: Record<string, unknown> = {};

        if (defaults instanceof Map) {
            for (const [key, value] of defaults) {
                plainDefaults[key] = value;
            }
        } else if (typeof (defaults as Iterable<[string, unknown]>)[Symbol.iterator] === "function" && !(defaults instanceof Object && defaults.constructor === Object)) {
            for (const [key, value] of defaults as Iterable<[string, unknown]>) {
                plainDefaults[key] = value;
            }
        } else {
            Object.assign(plainDefaults, defaults as Record<string, unknown>);
        }

        const merged: Record<string, unknown> = {...plainDefaults};

        for (const [key, value] of Object.entries(this.attributes)) {
            if (PREPEND_KEYS.includes(key as typeof PREPEND_KEYS[number]) && key in merged) {
                merged[key] = `${merged[key]} ${value}`;
                continue;
            }

            merged[key] = value;
        }

        for (const rendered of this.rendered) {
            delete merged[rendered];
        }

        return new ComponentAttributes(merged);
    }

    nested(namespace: string): ComponentAttributes {
        const next: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(this.attributes)) {
            if (!key.includes(":")) {
                continue;
            }

            const match = NESTED_REGEX.exec(key);

            if (match && match[1] === namespace) {
                next[match[2]] = value;
            }
        }

        return new ComponentAttributes(next);
    }

    render(attribute: string): string | null {
        let value: unknown = this.attributes[attribute];

        if (value === undefined || value === null) {
            return null;
        }

        if (value === true && attribute.startsWith("aria-")) {
            value = "true";
        }

        if (typeof value !== "string") {
            if (isPlainScalar(value)) {
                value = String(value);
            } else {
                throw new Error(`Can only get string attributes (${attribute} is a "${typeof value}").`);
            }
        }

        this.rendered.add(attribute);

        return value as string;
    }

    [Symbol.iterator](): IterableIterator<[string, unknown]> {
        return Object.entries(this.attributes)[Symbol.iterator]();
    }

    toString(): string {
        let output = "";

        for (const [rawKey, rawValue] of Object.entries(this.attributes)) {
            if (this.rendered.has(rawKey)) {
                continue;
            }

            if (rawValue === null) {
                throw new Error('Attribute values cannot be null. If you want to remove an attribute, use the "remove()" method.');
            }

            if (rawValue === false) {
                continue;
            }

            if (
                rawKey.includes(":")
                && NESTED_REGEX.test(rawKey)
                && !ALPINE_REGEX.test(rawKey)
                && !VUE_REGEX.test(rawKey)
            ) {
                continue;
            }

            let value: unknown = rawValue;

            if (isAttributeValue(value)) {
                value = (value as AttributeValueInterface).getValue();

                if (value === null) {
                    continue;
                }
            }

            if (!isPlainScalar(value)) {
                throw new Error(`A "${rawKey}" prop was passed when creating the component. No matching "${rawKey}" property or mount() argument was found, so we attempted to use this as an HTML attribute. But, the value is not a scalar (it's a "${typeof value}"). Did you mean to pass this to your component or is there a typo on its name?`);
            }

            if (value === true && rawKey.startsWith("aria-")) {
                value = "true";
            }

            let key = rawKey;

            if (!isCtypeAlnum(stripAllowed(key, ["-", "_", ":", "@", "."]))) {
                key = escapeHtmlAttrRelaxed(key);
            }

            if (value === true) {
                output += ` ${key}`;
            } else {
                let printed = coerceToString(value);

                if (!isCtypeAlnum(stripAllowed(printed, ["-", "_"]))) {
                    printed = escapeHtml(printed);
                }

                output += ` ${key}="${printed}"`;
            }
        }

        return output;
    }
}
