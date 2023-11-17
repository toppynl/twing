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
        compile: (compiler) => {
            compiler.write('async (');

            let i: number = 0;

            const assignmentNodes = Object.values(baseNode.children.names.children);

            for (const assignmentNode of assignmentNodes) {
                if (i > 0) {
                    compiler.write(', ');
                }

                compiler
                    .write('$__')
                    .write(assignmentNode.attributes.name)
                    .write('__');

                i++;
            }

            compiler
                .write(') => {')
            ;

            for (const nameNode of assignmentNodes) {
                compiler
                    .write('context.proxy[\'')
                    .write(nameNode.attributes.name)
                    .write('\'] = $__')
                    .write(nameNode.attributes.name)
                    .write('__; ');
            }

            compiler
                .write('return ')
                .subCompile(baseNode.children.expr)
                .write(';}');
        }
    };
};
