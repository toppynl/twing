import {BaseExpressionNode, BaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import type {ArrayNode} from "./array";
import type {Node} from "../../node";
import type {BaseNameNode} from "./name";
import {getKeyValuePairs} from "./array";

export type MethodCallNodeAttributes = BaseExpressionNodeAttributes & {
    methodName: string;
    safe: boolean;
};

export interface MethodCallNode extends BaseExpressionNode<"method_call", MethodCallNodeAttributes, {
    operand: Node;
    arguments: ArrayNode;
}> {
}

export const createMethodCallNode = (
    operand: BaseNameNode<any>,
    methodName: string,
    methodArguments: ArrayNode,
    line: number,
    column: number
): MethodCallNode => {
    const baseNode = createBaseExpressionNode("method_call", {
        methodName,
        safe: false
    }, {
        operand, arguments: methodArguments
    }, line, column);

    return {
        ...baseNode,
        compile: (compiler, flags) => {
            const {methodName} = baseNode.attributes;
            const {operand, arguments: methodArguments} = baseNode.children;

            if (flags?.isDefinedTest) {
                compiler
                    .raw('(await aliases.proxy[')
                    .render(operand.attributes.name)
                    .raw('].hasMacro(')
                    .render(methodName)
                    .raw('))')
                ;
            } else {
                compiler
                    .raw('await template.callMacro(aliases.proxy[')
                    .render(operand.attributes.name)
                    .raw('], ')
                    .render(methodName)
                    .raw(', outputBuffer')
                    .raw(', [')
                ;
                let first = true;
                
                for (const {value} of getKeyValuePairs(methodArguments)) {
                    if (!first) {
                        compiler.raw(', ');
                    }

                    first = false;

                    compiler.subCompile(value);
                }

                compiler
                    .raw('], ')
                    .render(baseNode.line)
                    .raw(', context, template.source)');
            }
        }
    };
};
