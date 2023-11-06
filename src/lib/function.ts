import {createFunctionNode, FunctionNode} from "./node/expression/call/function";
import {
    TwingCallableWrapperOptions,
    TwingCallableArgument,
    TwingCallable, TwingCallableWrapper, createCallableWrapper
} from "./callable-wrapper";
import type {ArrayNode} from "./node/expression/array";

type Factory = (name: string, argumentsNode: ArrayNode, line: number, column: number) => FunctionNode;

export interface TwingFunction extends TwingCallableWrapper<any, Factory> {
    
}

export const createFunction = (
    name: string, 
    callable: TwingCallable<any>, 
    acceptedArguments: TwingCallableArgument[], 
    options: TwingCallableWrapperOptions & {
        expression_factory?: Factory;
    } = {}
): TwingFunction => {
    const expressionFactory = options.expression_factory || ((name, argumentsNode, line, column) => {
        return createFunctionNode(name, argumentsNode, line, column);
    });

    const callableWrapper = createCallableWrapper(name, callable, acceptedArguments, expressionFactory, options);
    
    return callableWrapper;
};
