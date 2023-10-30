import {BaseExpressionNode, BaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";

export type ParentNodeAttributes = BaseExpressionNodeAttributes & {
    name: string;
};

export interface ParentNode extends BaseExpressionNode<"parent", ParentNodeAttributes> {
}

export const createParentNode = (
    name: string,
    line: number,
    column: number
): ParentNode => {
    const baseNode = createBaseExpressionNode("parent", {
        name,
        //output: false
    }, {}, line, column);

    return {
        ...baseNode,
        compile: (compiler) => {
            const {name} = baseNode.attributes;

            compiler
                .raw(`await template.traceableRenderParentBlock(${baseNode.line}, template.source)(`)
                .string(name)
                .raw(', context, outputBuffer, blocks)')
            ;
        }
    }
};
