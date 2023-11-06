import {createTestNode, TestNode} from "../test";
import {BaseExpressionNode} from "../../../expression";
import {TwingParsingError} from "../../../../error/parsing";
import type {ArrayNode} from "../../array";

export interface DefinedTestNode extends TestNode {
}

export const createDefinedTestNode = (
    operand: BaseExpressionNode,
    testArguments: ArrayNode,
    line: number,
    column: number
): DefinedTestNode => {
    if (
        !operand.is("name") &&
        !operand.is("get_attribute") &&
        !operand.is("block_reference_expression") &&
        !operand.is("constant") &&
        !operand.is("array") &&
        !operand.is("method_call") &&
        !((operand.is("call")) && (operand.attributes.type === "function") && (operand.attributes.operatorName === 'constant'))
    ) {
        throw new TwingParsingError('The "defined" test only works with simple variables.', line);
    }

    const baseNode = createTestNode(operand, 'defined', testArguments, line, column);

    const node: DefinedTestNode = {
        ...baseNode,
        compile: (compiler) => {
            const {operand} = node.children;
            
            const isAGetAttribute = operand!.is("get_attribute");
            
            compiler.subCompile(operand!, {
                isDefinedTest: true,
                ignoreStrictCheck: isAGetAttribute,
                optimizable: !isAGetAttribute
            });
        }
    };

    return node;
};
