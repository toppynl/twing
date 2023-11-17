import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";

export type TwingAutoEscapeNodeAttributes = TwingBaseNodeAttributes & {
    strategy: string | true | null;
}

export interface TwingAutoEscapeNode extends TwingBaseNode<"auto_escape", TwingAutoEscapeNodeAttributes, {
    body: TwingBaseNode;
}> {
}

export const createAutoEscapeNode = (
    strategy: string | true | null,
    body: TwingBaseNode,
    line: number,
    column: number,
    tag: string
): TwingAutoEscapeNode => {
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
