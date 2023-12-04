import type {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes} from "../expression";
import type {TwingBaseNode} from "../../node";
import type {TwingAssignmentNode} from "./assignment";
import {createBaseExpressionNode} from "../expression";

export interface TwingArrowFunctionNode extends TwingBaseExpressionNode<"arrow_function", TwingBaseExpressionNodeAttributes, {
    expr: TwingBaseExpressionNode;
    names: TwingBaseNode<any, any, Record<string, TwingAssignmentNode>>;
}> {

}

export const createArrowFunctionNode = (
    expr: TwingBaseExpressionNode,
    names: TwingBaseNode<any, any, Record<any, TwingAssignmentNode>>,
    line: number,
    column: number
): TwingArrowFunctionNode => {
    const baseNode = createBaseExpressionNode("arrow_function", {}, {
        expr,
        names
    }, line, column);

    return {
        ...baseNode,
        execute: (executionContext) => {
            const {context} = executionContext;
            const {expr} = baseNode.children;
            const assignmentNodes = Object.values(baseNode.children.names.children);
            
            return Promise.resolve((...functionArgs: Array<any>): Promise<any> => {
                let index = 0;

                for (const assignmentNode of assignmentNodes) {
                    const {name} = assignmentNode.attributes;

                    context.set(name, functionArgs[index]);

                    index++;
                }
                
                return expr.execute(executionContext);
            });
        }
    };
};
