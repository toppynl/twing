import {
    BaseExpressionNode,
    BaseExpressionNodeAttributes,
    createBaseExpressionNode,
    ExpressionNode
} from "../expression";
import {BaseNode, getChildrenCount} from "../../node";
import {TwingErrorSyntax} from "../../error/syntax";
import {ConstantNode, createConstantNode} from "./constant";
import {createArrayNode} from "./array";
import {Compiler} from "../../compiler";
import {TwingCallableArgument} from "../../callable-wrapper";
import type {FilterNode} from "./call/filter";
import type {FunctionNode} from "./call/function";
import type {TestNode} from "./call/test";
import type {DefaultFilterNode} from "./call/filter/default";
import type {ConstantTestNode} from "./call/test/constant";
import type {DefinedTestNode} from "./call/test/defined";
import {ArgumentsNode} from "./arguments";

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
    is_defined_test: boolean;
    operatorName: string;
};

export type BaseCallNodeChildren<Operand extends BaseNode<any> | never = never> = {
    operand?: Operand;
    arguments: ArgumentsNode;
};

export interface BaseCallNode<
    Operand extends BaseNode<any> | never = never
> extends BaseExpressionNode<"call", BaseCallNodeAttributes, BaseCallNodeChildren<Operand>> {
    compileCallable: (
        compiler: Compiler,
        name: string,
        type: "filter" | "function" | "test",
        callable: string | Function,
        passedArguments: Array<any>,
        acceptedArgument: Array<TwingCallableArgument>,
        needsTemplate: boolean,
        needsContext: boolean,
        needsOutputBuffer: boolean,
        isVariadic: boolean
    ) => void;
}

export const createBaseCallNode = <
    Operand extends BaseNode<any> | never = never
>(
    attributes: BaseCallNodeAttributes,
    children: BaseCallNodeChildren<Operand>,
    line: number,
    column: number,
    tag: string | null = null
): BaseCallNode<Operand> => {
    const baseNode = createBaseExpressionNode<"call", BaseCallNodeAttributes, BaseCallNodeChildren<Operand>>("call", attributes, children, line, column, tag);

    const normalizeName = (name: string) => {
        return snakeCase(name).toLowerCase();
    };

    const compileCallable: BaseCallNode<Operand>["compileCallable"] = (
        compiler,
        name,
        type,
        callable,
        passedArguments,
        acceptedArguments,
        needsTemplate,
        needsContext,
        needsOutputBuffer,
        isVariadic
    ) => {
        if (typeof callable === 'string') {
            compiler.raw(callable);
        } else {
            compiler.raw(`await runtime.get${capitalize(type)}('${name}').traceableCallable(${baseNode.line}, template.source)`);
        }

        compiler.raw('(...[');

        compileArguments(compiler, callable, passedArguments, acceptedArguments, needsTemplate, needsContext, needsOutputBuffer, isVariadic);

        compiler.raw('])');
    };

    const getArguments = (
        callable: string | Function,
        argumentsNode: BaseNode<any>,
        acceptedArguments: Array<TwingCallableArgument>,
        isVariadic: boolean
    ): Array<BaseNode<any>> => {
        let callType = baseNode.attributes.type;
        let callName = baseNode.attributes.operatorName;

        let parameters: Map<string, ExpressionNode> = new Map();
        let named = false;

        for (let [name, node] of Object.entries(argumentsNode.children)) {
            if (Number.isNaN(Number.parseInt(name))) {
                named = true;
                name = normalizeName(name);
            } else if (named) {
                throw new TwingErrorSyntax(`Positional arguments cannot be used after named arguments for ${callType} "${callName}".`, baseNode.line);
            }

            parameters.set(name, node as any);
        }

        if (!named && !isVariadic) {
            return [...parameters.values()];
        }

        let message: string;

        if (!callable) {
            if (named) {
                message = `Named arguments are not supported for ${callType} "${callName}".`;
            } else {
                message = `Arbitrary positional arguments are not supported for ${callType} "${callName}".`;
            }

            throw new Error(message);
        }

        let callableParameters: TwingCallableArgument[] = acceptedArguments;

        let arguments_: Array<BaseNode<any>> = [];

        let names: Array<string> = [];
        let optionalArguments: Array<string | ConstantNode> = [];
        let pos = 0;

        for (let callableParameter of callableParameters) {
            let name = '' + normalizeName(callableParameter.name);

            names.push(name);

            const parameter = parameters.get(name);

            if (parameter) {
                if (parameters.has(`${pos}`)) {
                    throw new TwingErrorSyntax(`Argument "${name}" is defined twice for ${callType} "${callName}".`, baseNode.line);
                }

                arguments_ = array_merge(arguments_, optionalArguments);
                arguments_.push(parameter);
                parameters.delete(name);
                optionalArguments = [];
            } else {
                const parameter = parameters.get(`${pos}`);

                if (parameter) {
                    arguments_ = array_merge(arguments_, optionalArguments);
                    arguments_.push(parameter);
                    parameters.delete(`${pos}`);
                    optionalArguments = [];
                    ++pos;
                } else if (callableParameter.defaultValue !== undefined) {
                    optionalArguments.push(createConstantNode(callableParameter.defaultValue, -1, -1) as any);
                } else {
                    throw new TwingErrorSyntax(`Value for argument "${name}" is required for ${callType} "${callName}".`, baseNode.line);
                }
            }
        }

        if (isVariadic) {
            let arbitraryArguments = createArrayNode({}, -1, -1);

            let resolvedKeys: Array<any> = [];

            for (let [key, value] of parameters) {
                if (Number.isInteger(Number.parseFloat(key))) {
                    arbitraryArguments.addElement(value);
                } else {
                    arbitraryArguments.addElement(value, createConstantNode(key, -1, -1));
                }

                resolvedKeys.push(key);
            }

            for (let key of resolvedKeys) {
                parameters.delete(key);
            }

            if (getChildrenCount(arbitraryArguments)) {
                arguments_ = array_merge(arguments_, optionalArguments);
                arguments_.push(arbitraryArguments);
            }
        }

        if (parameters.size > 0) {
            let unknownParameter = [...parameters.values()][0];

            throw new TwingErrorSyntax(`Unknown argument${parameters.size > 1 ? 's' : ''} "${[...parameters.keys()].join('", "')}" for ${callType} "${callName}(${names.join(', ')})".`, unknownParameter ? unknownParameter.line : baseNode.line);
        }

        return arguments_;
    }

    const compileArguments = (
        compiler: Compiler,
        callable: string | Function,
        passedArguments: Array<any>,
        acceptedArguments: Array<TwingCallableArgument>,
        needsTemplate: boolean,
        needsContext: boolean,
        needsOutputBuffer: boolean,
        isVariadic: boolean
    ) => {
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

        for (const passedArgument of passedArguments) {
            if (!first) {
                compiler.raw(', ');
            }

            compiler.string(passedArgument);

            first = false;
        }

        if (baseNode.children.operand) {
            if (!first) {
                compiler.raw(', ');
            }

            compiler.subCompile(baseNode.children.operand);

            first = false;
        }

        if (baseNode.children.arguments) {
            let arguments_ = getArguments(
                callable,
                baseNode.children.arguments,
                acceptedArguments,
                isVariadic
            );

            for (let node of arguments_) {
                if (!first) {
                    compiler.raw(', ');
                }

                compiler.subCompile(node);

                first = false;
            }
        }
    }

    return {
        ...baseNode,
        compileCallable,
        clone: () => createBaseCallNode(attributes, children, line, column, tag)
    };
};
