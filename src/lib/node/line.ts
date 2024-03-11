import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";

export type TwingLineNodeAttributes = TwingBaseNodeAttributes & {
    data: number; // todo: rename to something meaningful
};

export interface TwingLineNode extends TwingBaseNode<"line", TwingLineNodeAttributes> {
}

export const createLineNode = (
    data: number,
    line: number,
    column: number,
    tag: string
): TwingLineNode => {
    return createBaseNode("line", {
        data
    }, {}, line, column, tag);
};
