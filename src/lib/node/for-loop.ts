import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";

export type TwingForLoopNodeAttributes = TwingBaseNodeAttributes & {
    hasAnIf: boolean;
    hasAnElse: boolean;
};

export interface TwingForLoopNode extends TwingBaseNode<"for_loop", TwingForLoopNodeAttributes> {
}

export const createForLoopNode = (
    line: number,
    column: number,
    tag: string
): TwingForLoopNode => {
    return createBaseNode("for_loop", {
        hasAnIf: false,
        hasAnElse: false
    }, {}, line, column, tag);
};
