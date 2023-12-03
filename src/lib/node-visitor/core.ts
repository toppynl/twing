import {TwingNodeVisitor} from "../node-visitor";
import {cloneGetAttributeNode, TwingAttributeAccessorNode} from "../node/expression/attribute-accessor";
import {cloneNameNode, nameNodeType} from "../node/expression/name";
import {blockFunctionNodeType, cloneBlockReferenceExpressionNode} from "../node/expression/block-function";
import {constantNodeType, createConstantNode} from "../node/expression/constant";
import {cloneMethodCallNode, methodCallNodeType} from "../node/expression/method-call";
import {TwingBaseExpressionNode} from "../node/expression";
import {createParsingError} from "../error/parsing";
import {createTestNode, testNodeType, TwingTestNode} from "../node/expression/call/test";
import {createArrayNode, getKeyValuePairs} from "../node/expression/array";
import {createConditionalNode} from "../node/expression/conditional";
import {functionNodeType} from "../node/expression/call/function";
import {filterNodeType, TwingFilterNode} from "../node/expression/call/filter";
import {hashNodeType} from "../node/expression/hash";

export const createCoreNodeVisitor = (): TwingNodeVisitor => {
    const enteredNodes: Array<TwingBaseExpressionNode> = [];

    const enterDefaultFilterNode = (node: TwingFilterNode): TwingBaseExpressionNode => {
        const {line, column} = node;
        const {arguments: methodArguments} = node.children;
        const operand = node.children.operand!;

        let newNode: TwingBaseExpressionNode;

        if (operand.is("name") || operand.is("get_attribute")) {
            const testNode = createTestNode(
                operand,
                "defined",
                createArrayNode([], line, column),
                line,
                column
            );

            const values = getKeyValuePairs(methodArguments).map(({value}) => value);
            const falseNode = values.length > 0 ? values[0] : createConstantNode('', line, column);

            newNode = createConditionalNode(testNode, node, falseNode, line, column);

        } else {
            newNode = node;
        }

        return newNode;
    };

    const enterDefinedTestNode = (node: TwingTestNode): TwingTestNode => {
        const operand = node.children.operand!;

        if (
            !operand.is(nameNodeType) &&
            !operand.is("get_attribute") &&
            !operand.is(blockFunctionNodeType) &&
            !operand.is(constantNodeType) &&
            !operand.is("array") &&
            !operand.is(hashNodeType) &&
            !operand.is(methodCallNodeType) &&
            !(operand.is(functionNodeType) && (operand.attributes.operatorName === 'constant'))
        ) {
            throw createParsingError('The "defined" test only works with simple variables.', node);
        }

        let newOperand: TwingBaseExpressionNode;

        if (operand.is(blockFunctionNodeType)) {
            const blockReferenceExpressionNode = cloneBlockReferenceExpressionNode(operand);

            blockReferenceExpressionNode.attributes.shouldTestExistence = true;

            newOperand = blockReferenceExpressionNode;
        } else if (operand.is("constant") || operand.is("array")) {
            newOperand = createConstantNode(true, operand.line, operand.column);
        } else if (operand.is("name")) {
            const nameNode = cloneNameNode(operand);

            nameNode.attributes.shouldTestExistence = true;

            newOperand = nameNode;
        } else if (operand.is("method_call")) {
            const methodCallNode = cloneMethodCallNode(operand);

            methodCallNode.attributes.shouldTestExistence = true;

            newOperand = methodCallNode;
        } else if (operand.is("get_attribute")) {
            const getAttributeNode = cloneGetAttributeNode(operand);

            getAttributeNode.attributes.shouldTestExistence = true;

            const traverse = (node: TwingAttributeAccessorNode) => {
                node.attributes.isOptimizable = false;
                node.attributes.shouldIgnoreStrictCheck = true;

                if (node.children.target.is("get_attribute")) {
                    const clonedTarget = cloneGetAttributeNode(node.children.target);

                    traverse(clonedTarget);

                    node.children.target = clonedTarget;
                }
            }

            traverse(getAttributeNode);

            newOperand = getAttributeNode;
        } else {
            newOperand = operand;
        }

        node.children.operand = newOperand;

        return node;
    };

    const leaveGetAttributeNode = (node: TwingAttributeAccessorNode): TwingAttributeAccessorNode => {
        const {shouldIgnoreStrictCheck} = node.attributes;
        const {target} = node.children;

        if (shouldIgnoreStrictCheck) {
            if (target.is("name")) {
                const nameNode = cloneNameNode(target);

                nameNode.attributes.shouldIgnoreStrictCheck = true;

                node.children.target = nameNode;
            }
        }

        return node;
    };

    return {
        enterNode: (node) => {
            if (!enteredNodes.includes(node)) {
                enteredNodes.push(node);

                if (node.is(filterNodeType)) {
                    if (node.attributes.operatorName === "default") {
                        return enterDefaultFilterNode(node);
                    }
                }

                if (node.is(testNodeType)) {
                    if (node.attributes.operatorName === "defined") {
                        return enterDefinedTestNode(node);
                    }
                }
            }

            return node;
        },
        leaveNode: (node) => {
            if (node.is("get_attribute")) {
                return leaveGetAttributeNode(node);
            }

            return node;
        }
    };
};
