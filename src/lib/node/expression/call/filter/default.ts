import {createFilterNode, FilterNode} from "../filter";
import {createBaseNode, getChildrenCount, Node} from "../../../../node";
import {createConstantNode} from "../../constant";
import {createDefinedTestNode} from "../test/defined";
import {createConditionalNode} from "../../conditional";
import type {ArgumentsNode} from "../../arguments";

export interface DefaultFilterNode extends FilterNode {
}

export const createDefaultFilterNode = (
    operand: Node,
    methodArguments: ArgumentsNode,
    line: number,
    column: number,
    tag?: string
): DefaultFilterNode => {
    const defaultNode = createFilterNode(
        operand,
        'default',
        methodArguments,
        line,
        column,
        tag
    );

    let actualOperand: Node;

    if (operand.is("name") || operand.is("get_attribute")) {
        const testNode = createDefinedTestNode(
            operand.clone(),
            createBaseNode(null),
            line,
            column
        );

        const falseNode = getChildrenCount(methodArguments) > 0 ? methodArguments.children[0] : createConstantNode('', line, column);

        actualOperand = createConditionalNode(testNode, defaultNode, falseNode, line, column);
    } else {
        actualOperand = defaultNode;
    }

    const baseNode = createFilterNode(
        actualOperand,
        'default',
        methodArguments,
        1, 1
    );

    const node: DefaultFilterNode = {
        ...baseNode,
        compile: (compiler) => {
            compiler.subCompile(node.children.operand);
        }
    };

    return node;
};
