import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";

export const parentFunctionNodeType = "parent";

export type ParentNodeAttributes = TwingBaseExpressionNodeAttributes & {
    name: string;
};

export interface TwingParentFunctionNode extends TwingBaseExpressionNode<typeof parentFunctionNodeType, ParentNodeAttributes> {
}

export const createParentFunctionNode = (
    name: string,
    line: number,
    column: number
): TwingParentFunctionNode => {
    const baseNode = createBaseExpressionNode(parentFunctionNodeType, {
        name,
        //output: false
    }, {}, line, column);

    return {
        ...baseNode,
        compile: (compiler) => {
            const {name} = baseNode.attributes;

            compiler
                .write(`await template.getTraceableRenderParentBlock(${baseNode.line}, template.source)(`)
                .string(name)
                .write(', context, outputBuffer, blocks)')
            ;
        }
    }
};
