import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";

export type BlockNodeAttributes = BaseNodeAttributes & {
    name: string;
};

export interface BlockNode extends BaseNode<"block", BlockNodeAttributes, {
    body: BaseNode;
}> {
}

export const createBlockNode = (
    name: string,
    body: BaseNode,
    line: number,
    column: number,
    tag: string | null = null
): BlockNode => {
    const baseNode = createBaseNode("block", {name}, {body}, line, column, tag);

    const node: BlockNode = {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .raw(`async (context, outputBuffer, blocks = new Map()) => {\n`)
                .indent()
                .write('const aliases = template.aliases.clone();\n')
            ;

            compiler
                .subCompile(baseNode.children.body)
                .outdent()
                .write("}")
            ;
        }
    };

    return node;
};
