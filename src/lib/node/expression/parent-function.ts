import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import {getTraceableMethod} from "../../helpers/traceable-method";

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
        execute: (executionContext) => {
            const {template, context, outputBuffer, sandboxed, sourceMapRuntime} = executionContext;
            const {name} = node.attributes;
            const renderParentBlock = getTraceableMethod(template.renderParentBlock, node.line, node.column, template.name);

            return renderParentBlock(name, context, outputBuffer, sandboxed, sourceMapRuntime);
        }
    };

    return node;
};
