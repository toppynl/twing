import {BaseNode, BaseNodeAttributes, createBaseNode, Node} from "../node";

export interface InlinePrintNode extends BaseNode<"inline_print", BaseNodeAttributes, {
    node: Node
}> {
}

export const createInlinePrintNode = (
    node: Node,
    line: number,
    column: number,
    tag: string | null = null
): InlinePrintNode => {
    const baseNode = createBaseNode("inline_print", {}, {
        node
    }, line, column, tag);

    return {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .raw('outputBuffer.echo(')
                .subCompile(baseNode.children.node)
                .raw(')')
            ;
        }
    };
};
