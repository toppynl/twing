import {BaseIncludeNode, BaseIncludeNodeAttributes, BaseIncludeNodeChildren, createBaseIncludeNode} from "../include";

export const includeNodeType = "include";

export interface IncludeNode extends BaseIncludeNode<typeof includeNodeType> {
}

export const createIncludeNode = (
    attributes: BaseIncludeNodeAttributes,
    children: BaseIncludeNodeChildren,
    line: number,
    column: number,
    tag: string | null = null
): IncludeNode => {
    const baseNode = createBaseIncludeNode(
        includeNodeType,
        attributes,
        children,
        (compiler, baseNode) => {
            const {expression} = baseNode.children;

            if (expression) {
                compiler.subCompile(expression);
            }
        },
        line,
        column,
        tag
    );

    const node = {
        ...baseNode
    };

    return node;
}
