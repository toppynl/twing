import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";
import {isAttributeValue, isIterable} from "../html-attr/interfaces";
import {htmlAttrMerge} from "../html-attr/merge";
import {InlineStyle} from "../html-attr/inline-style";
import {SeparatedTokenList} from "../html-attr/separated-token-list";
import {escapeHtml, escapeHtmlAttrRelaxed} from "../html-attr/escape";

const mapValue = (input: unknown): unknown => {
    if (!isIterable(input)) return input;
    if (input instanceof Map) return Array.from(input.values());
    return Array.from(input);
};

const jsonEncode = (value: unknown): string => {
    const replacer = (_key: string, val: unknown): unknown => {
        if (val instanceof Map) {
            const obj: Record<string, unknown> = {};
            for (const [k, v] of val.entries()) obj[String(k)] = v;
            return obj;
        }
        return val;
    };
    return JSON.stringify(value, replacer);
};

const render = (merged: Map<string, unknown>): string => {
    let result = "";

    for (const [name, rawValue] of merged.entries()) {
        let value: unknown = rawValue;

        if (name.startsWith("aria-")) {
            if (value === true) value = "true";
            else if (value === false) value = "false";
        }

        if (name.startsWith("data-")) {
            if (!isAttributeValue(value) && value !== null && value !== undefined && typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
                try {
                    value = jsonEncode(value);
                } catch (e: any) {
                    throw new Error(`The "${name}" attribute value cannot be JSON encoded.`);
                }
            } else if (value === true) {
                value = "true";
            }
        }

        if (!isAttributeValue(value) && isIterable(value)) {
            if (name === "style") {
                value = new InlineStyle(value);
            } else {
                value = new SeparatedTokenList(value);
            }
        }

        if (isAttributeValue(value)) {
            value = value.getValue();
        }

        if (value === true) {
            value = "";
        }

        if (value === null || value === undefined || value === false) {
            continue;
        }

        if (typeof value === "object") {
            throw new Error(`The "${name}" attribute value should be a scalar, an iterable, or an object implementing an attribute-value interface.`);
        }

        result += escapeHtmlAttrRelaxed(name) + "=\"" + escapeHtml(String(value)) + "\" ";
    }

    return result.trim();
};

export const htmlAttr: TwingCallable<unknown[], string> = async (_executionContext, ...args) => {
    const merged = htmlAttrMerge(...args);
    return render(merged);
};

export const htmlAttrSynchronously: TwingSynchronousCallable<unknown[], string> = (_executionContext, ...args) => {
    const merged = htmlAttrMerge(...args);
    return render(merged);
};
