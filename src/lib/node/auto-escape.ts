import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {TwingEscapingStrategy} from "../escaping-strategy";

export type TwingAutoEscapeNodeAttributes = TwingBaseNodeAttributes & {
    strategy: TwingEscapingStrategy | string | false;
}

export interface TwingAutoEscapeNode extends TwingBaseNode<"auto_escape", TwingAutoEscapeNodeAttributes, {
    body: TwingBaseNode;
}> {
}

export const createAutoEscapeNode = (
    strategy: TwingEscapingStrategy | string | false,
    body: TwingBaseNode,
    line: number,
    column: number,
    tag: string
): TwingAutoEscapeNode => {
    const baseNode = createBaseNode("auto_escape", {
        strategy
    }, {
        body
    }, line, column, tag);

    return {
        ...baseNode
    };
};
