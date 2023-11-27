import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {EscapingStrategy} from "../escaping-strategy";

export const autoEscapeNodeType = "auto_escape";

export type TwingAutoEscapeNodeAttributes = TwingBaseNodeAttributes & {
    strategy: EscapingStrategy | string | false;
}

export interface TwingAutoEscapeNode extends TwingBaseNode<typeof autoEscapeNodeType, TwingAutoEscapeNodeAttributes, {
    body: TwingBaseNode;
}> {
}

export const createAutoEscapeNode = (
    strategy: EscapingStrategy | string | false,
    body: TwingBaseNode,
    line: number,
    column: number,
    tag: string
): TwingAutoEscapeNode => {
    const baseNode = createBaseNode(autoEscapeNodeType, {
        strategy
    }, {
        body
    }, line, column, tag);

    return {
        ...baseNode
    };
};
