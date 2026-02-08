import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {TwingArrayNode} from "./expression/array";

export const VARARGS_NAME = 'varargs';

export type TwingMacroNodeAttributes = TwingBaseNodeAttributes & {
    name: string;
};

export interface TwingMacroNode extends TwingBaseNode<"macro", TwingMacroNodeAttributes, {
    body: TwingBaseNode;
    arguments: TwingArrayNode;
}> {
}

export const createMacroNode = (
    name: string,
    body: TwingBaseNode,
    macroArguments: TwingArrayNode,
    line: number,
    column: number,
    tag: string
): TwingMacroNode => {
    return createBaseNode("macro", {
        name
    }, {
        body,
        arguments: macroArguments
    }, line, column, tag);
};
