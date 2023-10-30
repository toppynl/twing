import {createTestNode, TestNode} from "../test";
import {ExpressionNode} from "../../../expression";
import type {ArgumentsNode} from "../../arguments";

export interface ConstantTestNode extends TestNode {
}

export const createConstantTestNode = (
    operand: ExpressionNode,
    testArguments: ArgumentsNode,
    line: number,
    column: number,
    tag: string = null
): ConstantTestNode => {
    const baseNode = createTestNode(operand, 'constant', testArguments, line, column, tag);

    return {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .raw('(')
                .subCompile(baseNode.children.operand)
                .raw(' === await runtime.constant(context, ')
                .subCompile(baseNode.children.arguments.children[0]);

            if (baseNode.children.arguments.children[1]) {
                compiler
                    .raw(', ')
                    .subCompile(baseNode.children.arguments.children[1]);
            }

            compiler.raw('))');
        }
    };
};
