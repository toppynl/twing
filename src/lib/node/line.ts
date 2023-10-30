import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";

export type LineNodeAttributes = BaseNodeAttributes & {
    data: number;
};

export interface LineNode extends BaseNode<"line", LineNodeAttributes> {
}

export const createLineNode = (
    data: number,
    line: number,
    column: number,
    tag: string | null = null
): LineNode => {
    const baseNode = createBaseNode("line", {
        data
    }, {}, line, column, tag);

    return {
        ...baseNode,
        compile: () => {
            // noop
        }
    };
};
