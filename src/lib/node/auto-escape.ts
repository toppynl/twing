import {BaseNode, BaseNodeAttributes, createBaseNode, Node} from "../node";

export type AutoEscapeNodeAttributes = BaseNodeAttributes & {
    strategy: string | false;
}

export interface AutoEscapeNode extends BaseNode<"auto_escape", AutoEscapeNodeAttributes, {
    body: Node;
}> {
}

export const createAutoEscapeNode = (
    strategy: string | false,
    body: Node,
    line: number,
    column: number,
    tag = 'autoescape'
): AutoEscapeNode => {
    const baseNode = createBaseNode("auto_escape", {
        strategy
    }, {
        body
    }, line, column, tag);

    return {
        ...baseNode,
        compile: (compiler) => {
            compiler.subCompile(baseNode.children.body);
        }
    };
};
