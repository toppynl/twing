import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {TwingBodyNode} from "./body";
import {TwingArrayNode} from "./expression/array";

export const VARARGS_NAME = 'varargs';

export type TwingMacroNodeAttributes = TwingBaseNodeAttributes & {
    name: string;
};

export interface TwingMacroNode extends TwingBaseNode<"macro", TwingMacroNodeAttributes, {
    body: TwingBodyNode;
    arguments: TwingArrayNode;
}> {
}

export const createMacroNode = (
    name: string,
    body: TwingBodyNode,
    macroArguments: TwingArrayNode,
    line: number,
    column: number,
    tag: string
): TwingMacroNode => {
    const baseNode = createBaseNode("macro", {
        name
    }, {
        body,
        arguments: macroArguments
    }, line, column, tag);

    return {
        ...baseNode
    }
};
