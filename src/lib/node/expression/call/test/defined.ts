import {createTestNode, TestNode} from "../test";
import {ExpressionNode} from "../../../expression";
import {createConstantNode} from "../../constant";
import {TwingErrorSyntax} from "../../../../error/syntax";
import type {ArgumentsNode} from "../../arguments";
import {GetAttributeNode} from "../../get-attribute";
import {isAnArrayNode} from "../../array";

export interface DefinedTestNode extends TestNode {
}

export const createDefinedTestNode = (
    operand: ExpressionNode,
    testArguments: ArgumentsNode,
    line: number,
    column: number,
    tag: string | null = null
): DefinedTestNode => {
    const setAsIgnoreStrictCheck = (node: GetAttributeNode): void => {
        node.attributes.optimizable = false;
        node.attributes.ignore_strict_check = true;

        const {target} = node.children;

        if (target.is("get_attribute")) {
            setAsIgnoreStrictCheck(target);
        }
    };
    
    if (operand.is("name")) {
        operand.attributes.is_defined_test = true;
    } else if (operand.is("get_attribute")) {
        operand.attributes.is_defined_test = true;
        setAsIgnoreStrictCheck(operand);
    } else if (operand.is("block_reference_expression")) {
        operand.attributes.is_defined_test = true;
    } else if ((operand.is("call")) && (operand.attributes.type === "function") && (operand.attributes.operatorName === 'constant')) {
        operand.attributes.is_defined_test = true;
    } else if (operand.is("expression_constant") || isAnArrayNode(operand)) {
        operand = createConstantNode(true, operand.line, operand.column);
    } else if (operand.is("method_call")) {
        operand.attributes.is_defined_test = true;
    } else {
        throw new TwingErrorSyntax('The "defined" test only works with simple variables.', line);
    }
    
    const baseNode = createTestNode(operand, 'defined', testArguments, line, column, tag);

    const node: DefinedTestNode = {
        ...baseNode,
        compile: (compiler) => {
            const {operand} = node.children;

            if (operand) {
                compiler.subCompile(operand);
            }
        }
    };
    
    return node;
};
