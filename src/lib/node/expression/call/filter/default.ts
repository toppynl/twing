import {createFilterNode, FilterNode} from "../filter";
import {BaseNode} from "../../../../node";
import {createConstantNode} from "../../constant";
import {createDefinedTestNode} from "../test/defined";
import {createConditionalNode} from "../../conditional";
import type {ArrayNode} from "../../array";
import {createArrayNode, getKeyValuePairs} from "../../array";

export interface DefaultFilterNode extends FilterNode {
}

export const createDefaultFilterNode = (
    operand: BaseNode,
    methodArguments: ArrayNode,
    line: number,
    column: number
): DefaultFilterNode => {
    const defaultNode = createFilterNode(
        operand,
        'default',
        methodArguments,
        line,
        column
    );
    
    let actualOperand: BaseNode;

    if (operand.is("name") || operand.is("get_attribute")) {
        const testNode = createDefinedTestNode(
            operand,
            createArrayNode([], line, column),
            line,
            column
        );

        const values = getKeyValuePairs(methodArguments).map(({value}) => value);
        const falseNode = values.length > 0 ? values[0] : createConstantNode('', line, column);

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
            const {operand} = node.children;
            
            compiler.subCompile(operand!);
        }
    };

    return node;
};
