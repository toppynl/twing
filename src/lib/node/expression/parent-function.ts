import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import {getTraceableMethod} from "../../helpers/traceable-method";

export type ParentNodeAttributes = TwingBaseExpressionNodeAttributes & {
    name: string;
};

export interface TwingParentFunctionNode extends TwingBaseExpressionNode<"parent_function", ParentNodeAttributes> {
}

export const createParentFunctionNode = (
    name: string,
    line: number,
    column: number
): TwingParentFunctionNode => {
    const baseNode = createBaseExpressionNode("parent_function", {
        name,
        //output: false
    }, {}, line, column);

    const parentFunctionNode: TwingParentFunctionNode = {
        ...baseNode,
        execute: (executionContext) => {
            const {template, context, outputBuffer, sandboxed, sourceMapRuntime} = executionContext;
            const {name} = parentFunctionNode.attributes;
            const renderParentBlock = getTraceableMethod(template.renderParentBlock, parentFunctionNode.line, parentFunctionNode.column, template.name);

            return renderParentBlock(name, context, outputBuffer, sandboxed, sourceMapRuntime);
        }
    };

    return parentFunctionNode;
};
