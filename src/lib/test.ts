import {BaseExpressionNode} from "./node/expression";
import {
    TwingCallableWrapper, createCallableWrapper,
    TwingCallable,
    TwingCallableArgument,
    TwingCallableWrapperOptions
} from "./callable-wrapper";
import {createTestNode, TestNode} from "./node/expression/call/test";
import type {ArrayNode} from "./node/expression/array";

type Factory = (node: BaseExpressionNode, name: string, argumentsNode: ArrayNode, line: number, column: number) => TestNode;

export interface TwingTest extends TwingCallableWrapper<any, Factory> {

}

/**
 * Creates a template test.
 *
 * @param {string} name Name of the test
 * @param {TwingCallable<boolean>} callable A callable implementing the test. If null, you need to overwrite the "node_class" option to customize compilation.
 * @param {TwingCallableArgument[]} acceptedArguments
 * @param {TwingCallableWrapperOptions} options Options
 */
export const createTest = (
    name: string,
    callable: TwingCallable<boolean> | null,
    acceptedArguments: TwingCallableArgument[],
    options: TwingCallableWrapperOptions & {
        expression_factory?: Factory;
    } = {}
): TwingTest => {
    const expressionFactory = options.expression_factory || ((node, name, argumentsNode, line, column) => {
        return createTestNode(node, name, argumentsNode, line, column);
    });

    return createCallableWrapper(name, callable, acceptedArguments, expressionFactory, options);
};
