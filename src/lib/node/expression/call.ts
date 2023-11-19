import {
    TwingBaseExpressionNode,
    TwingBaseExpressionNodeAttributes,
    createBaseExpressionNode
} from "../expression";
import {TwingBaseNode} from "../../node";
import {TwingConstantNode, createConstantNode} from "./constant";
import {TwingArrayNode, getKeyValuePairs} from "./array";
import {TwingCompiler} from "../../compiler";
import {TwingCallableArgument, TwingCallableWrapper} from "../../callable-wrapper";
import type {TwingFilterNode} from "./call/filter";
import type {TwingFunctionNode} from "./call/function";
import type {TwingTestNode} from "./call/test";
import {TwingCompilationError} from "../../error/compilation";

export type TwingCallNode =
    | TwingFilterNode
    | TwingFunctionNode
    | TwingTestNode
    ;

const array_merge = require('locutus/php/array/array_merge');
const snakeCase = require('snake-case');
const capitalize = require('capitalize');

type BaseCallNodeAttributes = TwingBaseExpressionNodeAttributes & {
    type: 'filter' | 'function' | 'test';
    operatorName: string;
};

export type TwingBaseCallNodeChildren = {
    operand?: TwingBaseNode;
    arguments: TwingArrayNode;
};

export interface TwingBaseCallNode<Type extends string> extends TwingBaseExpressionNode<Type, BaseCallNodeAttributes, TwingBaseCallNodeChildren> {
    compileArguments: (
        compiler: TwingCompiler,
        nativeArguments: Array<string>,
        acceptedArguments: Array<TwingCallableArgument>,
        needsTemplate: boolean,
        needsContext: boolean,
        needsOutputBuffer: boolean,
        needsSourceMapRuntime: boolean,
        isVariadic: boolean
    ) => void;
    compileCallable: (
        compiler: TwingCompiler,
        name: string,
        type: "filter" | "function" | "test",
        callableWrapper: TwingCallableWrapper<any>
    ) => void;
}

export const createBaseCallNode = <Type extends string>(
    type: Type,
    attributes: BaseCallNodeAttributes,
    children: TwingBaseCallNodeChildren,
    line: number,
    column: number
): TwingBaseCallNode<Type> => {
    const baseNode = createBaseExpressionNode<Type, BaseCallNodeAttributes, TwingBaseCallNodeChildren>(type, attributes, children, line, column);

    const normalizeName = (name: string) => {
        return snakeCase(name).toLowerCase();
    };

    const getArguments = (
        argumentsNode: TwingArrayNode,
        acceptedArguments: Array<TwingCallableArgument>,
        isVariadic: boolean
    ): Array<TwingBaseNode> => {
        const callType = baseNode.attributes.type;
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
                throw new TwingCompilationError(`Positional arguments cannot be used after named arguments for ${callType} "${callName}".`, baseNode.line);
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
                    throw new TwingCompilationError(`Argument "${name}" is defined twice for ${callType} "${callName}".`, baseNode.line);
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
                    throw new TwingCompilationError(`Value for argument "${name}" is required for ${callType} "${callName}".`, baseNode.line);
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

            throw new TwingCompilationError(`Unknown argument${parameters.size > 1 ? 's' : ''} "${[...parameters.keys()].join('", "')}" for ${callType} "${callName}(${names.join(', ')})".`, unknownParameter.key.line);
        }

        return arguments_;
    }

    const compileCallable: TwingBaseCallNode<Type>["compileCallable"] = (
        compiler,
        name,
        type,
        callableWrapper
    ) => {
        const {nativeArguments, acceptedArguments, needsTemplate, needsContext, needsOutputBuffer, needsSourceMapRuntime, isVariadic} = callableWrapper;

        compiler
            .write(`await runtime.get${capitalize(type)}('${name}').getTraceableCallable(${baseNode.line}, template.source)`)
            .write('(...[\n')
        ;

        compileArguments(compiler, nativeArguments, acceptedArguments, needsTemplate, needsContext, needsOutputBuffer, needsSourceMapRuntime, isVariadic);

        compiler
            .write('\n')
            .write('])');
    };

    const compileArguments: TwingBaseCallNode<Type>["compileArguments"] = (
        compiler,
        nativeArguments,
        acceptedArguments,
        needsTemplate,
        needsContext,
        needsOutputBuffer,
        needsSourceMapRuntime,
        isVariadic
    ) => {
        const {operand, arguments: callArguments} = node.children;

        let first: boolean = true;

        if (needsTemplate) {
            compiler.write('template');

            first = false;
        }

        if (needsContext) {
            if (!first) {
                compiler.write(',\n');
            }

            compiler.write('context');

            first = false;
        }

        if (needsOutputBuffer) {
            if (!first) {
                compiler.write(',\n');
            }

            compiler.write('outputBuffer');

            first = false;
        }

        if (needsSourceMapRuntime) {
            if (!first) {
                compiler.write(',\n');
            }

            compiler.write('sourceMapRuntime');

            first = false;
        }

        for (const nativeArgument of nativeArguments) {
            if (!first) {
                compiler.write(',\n');
            }

            compiler.string(nativeArgument);

            first = false;
        }

        if (operand) {
            if (!first) {
                compiler.write(',\n');
            }

            compiler.subCompile(operand);

            first = false;
        }

        const argumentNodes = getArguments(
            callArguments,
            acceptedArguments,
            isVariadic
        );

        for (const node of argumentNodes) {
            if (!first) {
                compiler.write(',\n');
            }

            compiler.subCompile(node);

            first = false;
        }
    }

    const node = {
        ...baseNode,
        compileArguments,
        compileCallable
    };

    return node;
};
