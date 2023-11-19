import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import type {TwingArrayNode} from "./array";
import {getKeyValuePairs} from "./array";
import {TwingBaseNode} from "../../node";

export const methodCallNodeType = "method_call";

export type TwingMethodCallNodeAttributes = TwingBaseExpressionNodeAttributes & {
    methodName: string;
    shouldTestExistence: boolean;
};

type NodeWithName = TwingBaseNode<any, {
    name: string;
}>;

export interface TwingMethodCallNode extends TwingBaseExpressionNode<typeof methodCallNodeType, TwingMethodCallNodeAttributes, {
    operand: NodeWithName;
    arguments: TwingArrayNode;
}> {
}

export const createMethodCallNode = (
    operand: NodeWithName,
    methodName: string,
    methodArguments: TwingArrayNode,
    line: number,
    column: number
): TwingMethodCallNode => {
    const baseNode = createBaseExpressionNode(methodCallNodeType, {
        methodName,
        shouldTestExistence: false
    }, {
        operand,
        arguments: methodArguments
    }, line, column);

    return {
        ...baseNode,
        compile: (compiler) => {
            const {methodName, shouldTestExistence} = baseNode.attributes;
            const {operand, arguments: methodArguments} = baseNode.children;

            if (shouldTestExistence) {
                compiler
                    .write('(await aliases.proxy[')
                    .render(operand.attributes.name)
                    .write('].hasMacro(').write('\n')
                    .render(methodName).write('\n')
                    .write('))')
                ;
            } else {
                compiler
                    .write('await template.callMacro(').write('\n')
                    .write('aliases.proxy[')
                    .render(operand.attributes.name)
                    .write('],').write('\n')
                    .render(methodName).write(',').write('\n')
                    .write('outputBuffer,').write('\n')
                    .write('[').write('\n')
                ;
                let first = true;

                for (const {value} of getKeyValuePairs(methodArguments)) {
                    if (!first) {
                        compiler.write(',').write('\n');
                    }

                    first = false;

                    compiler.subCompile(value);
                }

                compiler
                    .write('],').write('\n')
                    .render(baseNode.line).write(',').write('\n')
                    .write('context,').write('\n')
                    .write('template.source,').write('\n')
                    .write('sourceMapRuntime').write('\n')
                    .write(')')
                ;
            }
        }
    };
};

export const cloneMethodCallNode = (
    node: TwingMethodCallNode
): TwingMethodCallNode => {
    return createMethodCallNode(
        node.children.operand,
        node.attributes.methodName,
        node.children.arguments,
        node.line,
        node.column
    );
};
