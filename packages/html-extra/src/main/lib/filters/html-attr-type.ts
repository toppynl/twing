import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";
import type {AttributeValueInterface} from "../html-attr/interfaces";
import {SeparatedTokenList} from "../html-attr/separated-token-list";
import {InlineStyle} from "../html-attr/inline-style";

const build = (value: unknown, type: string): AttributeValueInterface => {
    switch (type) {
        case "sst":
            return new SeparatedTokenList(value, " ");
        case "cst":
            return new SeparatedTokenList(value, ", ");
        case "style":
            return new InlineStyle(value);
        default:
            throw new Error(`Unknown attribute type "${type}" The only supported types are "sst", "cst" and "style".`);
    }
};

export const htmlAttrType: TwingCallable<[value: unknown, type?: string], AttributeValueInterface> = async (_executionContext, value, type = "sst") => {
    return build(value, type);
};

export const htmlAttrTypeSynchronously: TwingSynchronousCallable<[value: unknown, type?: string], AttributeValueInterface> = (_executionContext, value, type = "sst") => {
    return build(value, type);
};
