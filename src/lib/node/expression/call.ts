import {
    BaseExpressionNode,
    BaseExpressionNodeAttributes,
    createBaseExpressionNode
} from "../expression";
import {BaseNode} from "../../node";
import {ConstantNode, createConstantNode} from "./constant";
import {ArrayNode, getKeyValuePairs} from "./array";
import {TwingCompiler} from "../../compiler";
import {TwingCallableArgument} from "../../callable-wrapper";
import type {FilterNode} from "./call/filter";
import type {FunctionNode} from "./call/function";
import type {TestNode} from "./call/test";
import type {DefaultFilterNode} from "./call/filter/default";
import type {ConstantTestNode} from "./call/test/constant";
import type {DefinedTestNode} from "./call/test/defined";
import {TwingCompilationError} from "../../error/compilation";

export type CallNode =
    | FilterNode
    | DefaultFilterNode
    | FunctionNode
    | TestNode
    | ConstantTestNode
    | DefinedTestNode
    ;

const array_merge = require('locutus/php/array/array_merge');
const snakeCase = require('snake-case');
const capitalize = require('capitalize');

type BaseCallNodeAttributes = BaseExpressionNodeAttributes & {
    type: 'filter' | 'function' | 'test';
    operatorName: string;
};

export type BaseCallNodeChildren = {
    operand?: BaseNode;
    arguments: ArrayNode;
};

export interface BaseCallNode extends BaseExpressionNode<"call", BaseCallNodeAttributes, BaseCallNodeChildren> {
    compileCallable: (
        compiler: TwingCompiler,
        name: string,
        type: "filter" | "function" | "test",
        nativeArguments: Array<string>,
        acceptedArgument: Array<TwingCallableArgument>,
        needsTemplate: boolean,
        needsContext: boolean,
        needsOutputBuffer: boolean,
        isVariadic: boolean
    ) => void;
}

export const createBaseCallNode = (
    attributes: BaseCallNodeAttributes,
    children: BaseCallNodeChildren,
    line: number,
    column: number
): BaseCallNode => {
    const baseNode = createBaseExpressionNode<"call", BaseCallNodeAttributes, BaseCallNodeChildren>("call", attributes, children, line, column);

    const normalizeName = (name: string) => {
        return snakeCase(name).toLowerCase();
    };

    const getArguments = (
        argumentsNode: ArrayNode,
        acceptedArguments: Array<TwingCallableArgument>,
        isVariadic: boolean
    ): Array<BaseNode> => {
        const callType = baseNode.attributes.type;
        const callName = baseNode.attributes.operatorName;
        const parameters: Map<string | number, BaseExpressionNode> = new Map();

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

            parameters.set(name, value);
        }

        const callableParameters = acceptedArguments;
        const names: Array<string> = [];

        let optionalArguments: Array<string | ConstantNode> = [];
        let arguments_: Array<BaseNode> = [];
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
                arguments_.push(parameter);
                parameters.delete(name);
                optionalArguments = [];
            } else {
                const parameter = parameters.get(position);

                if (parameter) {
                    arguments_ = array_merge(arguments_, optionalArguments);
                    arguments_.push(parameter);
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
            const arbitraryArguments: Array<BaseExpressionNode> = [];

            for (const [key, value] of parameters) {
                arbitraryArguments.push(value);

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

            throw new TwingCompilationError(`Unknown argument${parameters.size > 1 ? 's' : ''} "${[...parameters.keys()].join('", "')}" for ${callType} "${callName}(${names.join(', ')})".`, unknownParameter.line);
        }

        return arguments_;
    }

    const compileCallable: BaseCallNode["compileCallable"] = (
        compiler,
        name,
        type,
        nativeArguments,
        acceptedArguments,
        needsTemplate,
        needsContext,
        needsOutputBuffer,
        isVariadic
    ) => {
        compiler
            .raw(`await runtime.get${capitalize(type)}('${name}').getTraceableCallable(${baseNode.line}, template.source)`)
            .raw('(...[');

        compileArguments(compiler, nativeArguments, acceptedArguments, needsTemplate, needsContext, needsOutputBuffer, isVariadic);

        compiler.raw('])');
    };

    const compileArguments = (
        compiler: TwingCompiler,
        nativeArguments: Array<string>,
        acceptedArguments: Array<TwingCallableArgument>,
        needsTemplate: boolean,
        needsContext: boolean,
        needsOutputBuffer: boolean,
        isVariadic: boolean
    ) => {
        const {operand, arguments: callArguments} = node.children;

        let first: boolean = true;

        if (needsTemplate) {
            compiler.raw('template');

            first = false;
        }

        if (needsContext) {
            if (!first) {
                compiler.raw(', ');
            }

            compiler.raw('context');

            first = false;
        }

        if (needsOutputBuffer) {
            if (!first) {
                compiler.raw(', ');
            }

            compiler.raw('outputBuffer');

            first = false;
        }

        for (const nativeArgument of nativeArguments) {
            if (!first) {
                compiler.raw(', ');
            }

            compiler.string(nativeArgument);

            first = false;
        }

        if (operand) {
            if (!first) {
                compiler.raw(', ');
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
                compiler.raw(', ');
            }

            compiler.subCompile(node);

            first = false;
        }
    }

    const node = {
        ...baseNode,
        compileCallable
    };

    return node;
};
