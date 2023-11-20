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

const array_merge = require('locutus/php/array/array_merge');
const snakeCase = require('snake-case');
const capitalize = require('capitalize');

export type TwingCallNode =
    | TwingFilterNode
    | TwingFunctionNode
    | TwingTestNode
    ;

type CallType = "filter" | "function" | "test";

type TwingBaseCallNodeAttributes = TwingBaseExpressionNodeAttributes & {
    operatorName: string;
};

export type TwingBaseCallNodeChildren<OperandType extends TwingBaseNode | undefined> = {
    arguments: TwingArrayNode;
} & (OperandType extends TwingBaseNode ? {
    operand: OperandType;
} : {});

export interface TwingBaseCallNode<Type extends CallType, OperandType extends TwingBaseNode | undefined> extends TwingBaseExpressionNode<Type, TwingBaseCallNodeAttributes, TwingBaseCallNodeChildren<OperandType>> {

}

export const createBaseCallNode = <Type extends CallType, OperandType extends TwingBaseNode | undefined>(
    type: Type,
    operatorName: string,
    operand: OperandType,
    callArguments: TwingArrayNode,
    line: number,
    column: number
): TwingBaseCallNode<Type, OperandType> => {
    let children = {
        arguments: callArguments
    } as TwingBaseCallNodeChildren<OperandType>;
    
    if (operand !== undefined) {
        (children as TwingBaseCallNodeChildren<TwingBaseNode>).operand = operand;
    }
    
    const baseNode: TwingBaseExpressionNode<Type, TwingBaseCallNodeAttributes, typeof children> = createBaseExpressionNode(type, {
        type,
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

    const compileCallable = (
        compiler: TwingCompiler,
        callableWrapper: TwingCallableWrapper<any>
    ): void => {
        const {operatorName} = node.attributes;
        const {nativeArguments, acceptedArguments, needsTemplate, needsContext, needsOutputBuffer, needsSourceMapRuntime, isVariadic} = callableWrapper;

        compiler
            .write(`await runtime.get${capitalize(type)}('${operatorName}').getTraceableCallable(${baseNode.line}, template.source)`)
            .write('(...[\n')
        ;

        compileArguments(compiler, nativeArguments, acceptedArguments, needsTemplate, needsContext, needsOutputBuffer, needsSourceMapRuntime, isVariadic);

        compiler
            .write('\n')
            .write('])');
    };

    const compileArguments = (
        compiler: TwingCompiler,
        nativeArguments: Array<string>,
        acceptedArguments: Array<TwingCallableArgument>,
        needsTemplate: boolean,
        needsContext: boolean,
        needsOutputBuffer: boolean,
        needsSourceMapRuntime: boolean,
        isVariadic: boolean
    ): void => {
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
    };

    const node: TwingBaseCallNode<Type, OperandType> = {
        ...baseNode,
        compile: (compiler) => {
            const {operatorName} = node.attributes;
            const {environment} = compiler;

            let callableWrapper: TwingCallableWrapper<any> | null = null;

            switch (type) {
                case "filter":
                    callableWrapper = environment.getFilter(operatorName);
                    break;

                case "function":
                    callableWrapper = environment.getFunction(operatorName);
                    break;

                case "test":
                    callableWrapper = environment.getTest(operatorName);
                    break;
            }

            if (callableWrapper === null) {
                throw new TwingCompilationError(`Unknown ${type} "${operatorName}".`, baseNode.line);
            }

            compileCallable(
                compiler,
                callableWrapper
            );
        }
    };

    return node;
};
