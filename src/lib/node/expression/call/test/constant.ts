import {createTestNode, TestNode} from "../test";
import {BaseExpressionNode} from "../../../expression";
import type {ArrayNode} from "../../array";
import {getKeyValuePairs} from "../../array";

export interface ConstantTestNode extends TestNode {
}

export const createConstantTestNode = (
    operand: BaseExpressionNode,
    testArguments: ArrayNode,
    line: number,
    column: number
): ConstantTestNode => {
    const baseNode = createTestNode(operand, 'constant', testArguments, line, column);

    return {
        ...baseNode,
        compile: (compiler) => {
            const {arguments: testArguments} = baseNode.children;
            const keyValuePairs = getKeyValuePairs(testArguments);
            
            compiler
                .raw('(')
                .subCompile(baseNode.children.operand!)
                .raw(' === await runtime.constant(context, ')
                .subCompile(keyValuePairs[0].value);

            if (keyValuePairs.length > 1) {
                compiler
                    .raw(', ')
                    .subCompile(keyValuePairs[1].value);
            }

            compiler.raw('))');
        }
    };
};
