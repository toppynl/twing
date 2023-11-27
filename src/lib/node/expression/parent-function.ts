import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";

export const parentFunctionNodeType = "parent_function";

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

    const node: TwingParentFunctionNode = {
        ...baseNode,
        execute: (...args) => {
            const [template, context, outputBuffer, , , sourceMapRuntime] = args;
            const {name} = node.attributes;
            const renderParentBlock = template.getTraceableMethod(template.renderParentBlock, node.line, node.column, template.templateName);

            return renderParentBlock(name, context, outputBuffer, sourceMapRuntime);
        }
    };

    return node;
};
