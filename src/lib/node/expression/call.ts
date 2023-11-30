import {
    TwingBaseExpressionNode,
    TwingBaseExpressionNodeAttributes,
    createBaseExpressionNode
} from "../expression";
import {TwingBaseNode} from "../../node";
import {TwingConstantNode, createConstantNode} from "./constant";
import {TwingArrayNode, getKeyValuePairs} from "./array";
import {TwingCallableArgument, TwingCallableWrapper} from "../../callable-wrapper";
import type {TwingFilterNode} from "./call/filter";
import type {TwingFunctionNode} from "./call/function";
import type {TwingTestNode} from "./call/test";
import {createRuntimeError} from "../../error/runtime";

const array_merge = require('locutus/php/array/array_merge');
const snakeCase = require('snake-case');

export type TwingCallNode =
    | TwingFilterNode
    | TwingFunctionNode
    | TwingTestNode
    ;

type CallType = "filter" | "function" | "test";

type TwingBaseCallNodeAttributes = TwingBaseExpressionNodeAttributes & {
    operatorName: string;
};

export type TwingBaseCallNodeChildren = {
    arguments: TwingArrayNode;
    operand?: TwingBaseNode;
};

export interface TwingBaseCallNode<Type extends CallType> extends TwingBaseExpressionNode<Type, TwingBaseCallNodeAttributes, TwingBaseCallNodeChildren> {

}

export const createBaseCallNode = <Type extends CallType>(
    type: Type,
    operatorName: string,
    operand: TwingBaseNode | null,
    callArguments: TwingArrayNode,
    line: number,
    column: number
): TwingBaseCallNode<typeof type> => {
    let children: TwingBaseCallNodeChildren = {
        arguments: callArguments
    };

    if (operand !== null) {
        children.operand = operand;
    }

    const baseNode: TwingBaseExpressionNode<typeof type, TwingBaseCallNodeAttributes, typeof children> = createBaseExpressionNode(type, {
        operatorName
    }, children, line, column);

    const normalizeName = (name: string) => {
        return snakeCase(name).toLowerCase();
    };

    const getArguments = (
        argumentsNode: TwingArrayNode,
        acceptedArguments: Array<TwingCallableArgument>,
        isVariadic: boolean
    ): Array<TwingBaseNode> => {
        const callType = type;
        const callName = baseNode.attributes.operatorName;
        const parameters: Map<string | number, {
            key: TwingConstantNode;
            value: TwingBaseExpressionNode;
        }> = new Map();

        let named = false;

        const keyPairs = getKeyValuePairs(argumentsNode);

        for (let {key, value} of keyPairs) {
            let name = key.attributes.value as string | number;

            if (typeof name === "string") {
                named = true;
                name = normalizeName(name);
            } else if (named) {
                throw createRuntimeError(`Positional arguments cannot be used after named arguments for ${callType} "${callName}".`, baseNode);
            }

            parameters.set(name, {
                key,
                value
            });
        }

        const callableParameters = acceptedArguments;
        const names: Array<string> = [];

        let optionalArguments: Array<string | TwingConstantNode> = [];
        let arguments_: Array<TwingBaseNode> = [];
        let position = 0;

        for (const callableParameter of callableParameters) {
            const name = '' + normalizeName(callableParameter.name);

            names.push(name);

            const parameter = parameters.get(name);

            if (parameter) {
                if (parameters.has(position)) {
                    throw createRuntimeError(`Argument "${name}" is defined twice for ${callType} "${callName}".`, baseNode);
                }

                arguments_ = array_merge(arguments_, optionalArguments);
                arguments_.push(parameter.value);
                parameters.delete(name);
                optionalArguments = [];
            } else {
                const parameter = parameters.get(position);

                if (parameter) {
                    arguments_ = array_merge(arguments_, optionalArguments);
                    arguments_.push(parameter.value);
                    parameters.delete(position);
                    optionalArguments = [];
                    ++position;
                } else if (callableParameter.defaultValue !== undefined) {
                    arguments_.push(createConstantNode(callableParameter.defaultValue, line, column));
                } else {
                    throw createRuntimeError(`Value for argument "${name}" is required for ${callType} "${callName}".`, baseNode);
                }
            }
        }

        if (isVariadic) {
            const resolvedKeys: Array<any> = [];
            const arbitraryArguments: Array<TwingBaseExpressionNode> = [];

            for (const [key, value] of parameters) {
                arbitraryArguments.push(value.value);

                resolvedKeys.push(key);
            }

            for (const key of resolvedKeys) {
                parameters.delete(key);
            }

            if (arbitraryArguments.length) {
                arguments_ = array_merge(arguments_, optionalArguments);
                arguments_.push(...arbitraryArguments);
            }
        }

        if (parameters.size > 0) {
            const unknownParameter = [...parameters.values()][0];

            throw createRuntimeError(`Unknown argument${parameters.size > 1 ? 's' : ''} "${[...parameters.keys()].join('", "')}" for ${callType} "${callName}(${names.join(', ')})".`, unknownParameter.key);
        }

        return arguments_;
    }

    const node: TwingBaseCallNode<typeof type> = {
        ...baseNode,
        execute: async (executionContext) => {
            const {template, context, outputBuffer, sourceMapRuntime} = executionContext
            const {operatorName} = node.attributes;

            let callableWrapper: TwingCallableWrapper<any> | null;

            switch (type) {
                case "filter":
                    callableWrapper = template.getFilter(operatorName);
                    break;

                case "function":
                    callableWrapper = template.getFunction(operatorName);
                    break;

                // for some reason, using `case "test"` makes the compiler assume that callableWrapper is used
                // before it is assigned a value; this is probably a bug of the compiler
                default:
                    callableWrapper = template.getTest(operatorName);
                    break;
            }

            if (callableWrapper === null) {
                throw createRuntimeError(`Unknown ${type} "${operatorName}".`, baseNode);
            }

            const {operand, arguments: callArguments} = node.children;

            const argumentNodes = getArguments(
                callArguments,
                callableWrapper.acceptedArguments,
                callableWrapper.isVariadic
            );

            const actualArguments: Array<any> = [];

            if (callableWrapper!.needsTemplate) {
                actualArguments.push(template);
            }

            if (callableWrapper!.needsContext) {
                actualArguments.push(context);
            }

            if (callableWrapper!.needsOutputBuffer) {
                actualArguments.push(outputBuffer);
            }

            if (callableWrapper!.needsSourceMapRuntime) {
                actualArguments.push(sourceMapRuntime);
            }

            actualArguments.push(...callableWrapper!.nativeArguments);

            if (operand) {
                actualArguments.push(await operand.execute(executionContext));
            }

            const providedArguments = await Promise.all([
                ...argumentNodes.map((node) => node.execute(executionContext))
            ]);

            actualArguments.push(...providedArguments);

            const traceableCallable = callableWrapper.getTraceableCallable(node.line, node.column, template.name);

            return traceableCallable(...actualArguments);
        }
    };

    return node;
};
