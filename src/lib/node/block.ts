import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";

export type TwingBlockNodeAttributes = TwingBaseNodeAttributes & {
    name: string;
};

export interface TwingBlockNode extends TwingBaseNode<"block", TwingBlockNodeAttributes, {
    body: TwingBaseNode;
}> {
}

export const createBlockNode = (
    name: string,
    body: TwingBaseNode,
    line: number,
    column: number,
    tag: string | null = null
): TwingBlockNode => {
    const baseNode = createBaseNode("block", {name}, {body}, line, column, tag);

    const node: TwingBlockNode = {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .write(`async (context, outputBuffer, blocks = new Map(), sourceMapRuntime) => {\n`)
                .write('const aliases = template.aliases.clone();\n')
            ;

            compiler
                .subCompile(baseNode.children.body)
                .write("}")
            ;
        }
    };

    return node;
};
