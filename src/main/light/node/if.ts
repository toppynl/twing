import {TwingBaseNode, createBaseNode, TwingBaseNodeAttributes} from "../node";

export type TwingIfNodeChildren = {
    tests: TwingBaseNode;
    else?: TwingBaseNode;
};

export interface TwingIfNode extends TwingBaseNode<'if', TwingBaseNodeAttributes, TwingIfNodeChildren> {
}

export const createIfNode = (
    testNode: TwingBaseNode,
    elseNode: TwingBaseNode | null,
    line: number,
    column: number,
    tag: string | null = null
): TwingIfNode => {
    const children: TwingIfNodeChildren = {
        tests: testNode
    };

    if (elseNode) {
        children.else = elseNode;
    }

    return createBaseNode('if', {}, children, line, column, tag);
}
