import {TwingNodeVisitor} from "../node-visitor";
import {
    cloneGetAttributeNode,
    TwingAttributeAccessorNode
} from "../node/expression/attribute-accessor";
import {cloneNameNode} from "../node/expression/name";
import {cloneBlockReferenceExpressionNode} from "../node/expression/block-function";
import {createConstantNode} from "../node/expression/constant";
import {cloneMethodCallNode} from "../node/expression/method-call";
import {TwingBaseExpressionNode} from "../node/expression";
import {createParsingError} from "../error/parsing";
import {createTestNode, TwingTestNode} from "../node/expression/call/test";
import {createArrayNode} from "../node/expression/array";
import {createConditionalNode} from "../node/expression/conditional";
import {TwingFilterNode} from "../node/expression/call/filter";
import type {TwingNode} from "../node";
import {getKeyValuePairs} from "../helpers/get-key-value-pairs";
import type {TwingSource} from "../source";

export const createCoreNodeVisitor = (): TwingNodeVisitor => {
    const enteredNodes: Array<TwingBaseExpressionNode> = [];

    const enterDefaultFilterNode = (node: TwingFilterNode): TwingBaseExpressionNode => {
        const {line, column} = node;
        const {arguments: methodArguments} = node.children;
        const operand = node.children.operand!;

        let newNode: TwingBaseExpressionNode;

        if (operand.type === "name" || operand.type === "attribute_accessor") {
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

        }
        else {
            newNode = node;
        }

        return newNode;
    };

    const enterDefinedTestNode = (node: TwingTestNode, source: TwingSource): TwingTestNode => {
        const operand = node.children.operand! as TwingNode;
        
        if (
            operand.type !== "name" &&
            operand.type !== "attribute_accessor" &&
            operand.type !== "block_function" &&
            operand.type !== "constant" &&
            operand.type !== "array" &&
            operand.type !== "hash" &&
            operand.type !== "method_call" &&
            !(operand.type === "function" && operand.attributes.operatorName === 'constant')
        ) {
            throw createParsingError('The "defined" test only works with simple variables.', node, source);
        }

        let newOperand: TwingBaseExpressionNode;

        if (operand.type === "block_function") {
            const blockReferenceExpressionNode = cloneBlockReferenceExpressionNode(operand);

            blockReferenceExpressionNode.attributes.shouldTestExistence = true;

            newOperand = blockReferenceExpressionNode;
        }
        else if (operand.type === "constant" || operand.type === "array") {
            newOperand = createConstantNode(true, operand.line, operand.column);
        }
        else if (operand.type === "name") {
            const nameNode = cloneNameNode(operand);

            nameNode.attributes.shouldTestExistence = true;

            newOperand = nameNode;
        }
        else if (operand.type === "method_call") {
            const methodCallNode = cloneMethodCallNode(operand);

            methodCallNode.attributes.shouldTestExistence = true;

            newOperand = methodCallNode;
        }
        else if (operand.type === "attribute_accessor") {
            const getAttributeNode = cloneGetAttributeNode(operand);

            getAttributeNode.attributes.shouldTestExistence = true;

            const traverse = (node: TwingAttributeAccessorNode) => {
                node.attributes.isOptimizable = false;
                node.attributes.shouldIgnoreStrictCheck = true;

                if (node.children.target.type === "attribute_accessor") {
                    const clonedTarget = cloneGetAttributeNode(node.children.target);

                    traverse(clonedTarget);

                    node.children.target = clonedTarget;
                }
            }

            traverse(getAttributeNode);

            newOperand = getAttributeNode;
        }
        else {
            newOperand = operand;
        }

        node.children.operand = newOperand;

        return node;
    };

    const leaveGetAttributeNode = (node: TwingAttributeAccessorNode): TwingAttributeAccessorNode => {
        const {shouldIgnoreStrictCheck} = node.attributes;
        const {target} = node.children;

        if (shouldIgnoreStrictCheck) {
            if (target.type === "name") {
                const nameNode = cloneNameNode(target);

                nameNode.attributes.shouldIgnoreStrictCheck = true;

                node.children.target = nameNode;
            }
        }

        return node;
    };

    return {
        enterNode: (node: TwingNode, source) => {
            if (!enteredNodes.includes(node)) {
                enteredNodes.push(node);

                if (node.type === "filter") {
                    if (node.attributes.operatorName === "default") {
                        return enterDefaultFilterNode(node);
                    }
                }

                if (node.type === "test") {
                    if (node.attributes.operatorName === "defined") {
                        return enterDefinedTestNode(node, source);
                    }
                }
            }

            return node;
        },
        leaveNode: (node: TwingNode) => {
            if (node.type === "attribute_accessor") {
                return leaveGetAttributeNode(node);
            }

            return node;
        }
    };
};
