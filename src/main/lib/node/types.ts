import {TwingBaseNode, createBaseNode} from "../node";

export interface TwingTypesNode extends TwingBaseNode<"types"> {
}

export const createTypesNode = (
    line: number,
    column: number,
    tag?: string
): TwingTypesNode => {
    return createBaseNode("types", {}, {}, line, column, tag);
};
