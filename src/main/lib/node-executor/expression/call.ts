import type {TwingNodeExecutor} from "../../node-executor";
import type {TwingBaseCallNode} from "../../node/expression/call";
import {TwingCallableArgument, TwingCallableWrapper} from "../../callable-wrapper";
import {createRuntimeError} from "../../error/runtime";
import {getTraceableMethod} from "../../helpers/traceable-method";
import {TwingArrayNode} from "../../node/expression/array";
import {TwingBaseNode} from "../../node";
import {createConstantNode, TwingConstantNode} from "../../node/expression/constant";
import {TwingBaseExpressionNode} from "../../node/expression";
import {getKeyValuePairs} from "../../helpers/get-key-value-pairs";
import {getTest} from "../../helpers/get-test";
import {getFunction} from "../../helpers/get-function";
import {getFilter} from "../../helpers/get-filter";
import type {TwingTemplate} from "../../template";

const array_merge = require('locutus/php/array/array_merge');
const snakeCase = require('snake-case');

const normalizeName = (name: string) => {
    return snakeCase(name).toLowerCase();
};

const getArguments = (
    node: TwingBaseCallNode<any>,
    template: TwingTemplate,
    argumentsNode: TwingArrayNode,
    acceptedArguments: Array<TwingCallableArgument>,
    isVariadic: boolean
): Array<TwingBaseNode> => {
    const callType = node.type;
    const callName = node.attributes.operatorName;
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
        }
        else if (named) {
            throw createRuntimeError(`Positional arguments cannot be used after named arguments for ${callType} "${callName}".`, node, template.source);
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
                throw createRuntimeError(`Argument "${name}" is defined twice for ${callType} "${callName}".`, node, template.source);
            }

            arguments_ = array_merge(arguments_, optionalArguments);
            arguments_.push(parameter.value);
            parameters.delete(name);
            optionalArguments = [];
        }
        else {
            const parameter = parameters.get(position);

            if (parameter) {
                arguments_ = array_merge(arguments_, optionalArguments);
                arguments_.push(parameter.value);
                parameters.delete(position);
                optionalArguments = [];
                ++position;
            }
            else if (callableParameter.defaultValue !== undefined) {
                arguments_.push(createConstantNode(callableParameter.defaultValue, node.line, node.column));
            }
            else {
                throw createRuntimeError(`Value for argument "${name}" is required for ${callType} "${callName}".`, node, template.source);
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

        throw createRuntimeError(`Unknown argument${parameters.size > 1 ? 's' : ''} "${[...parameters.keys()].join('", "')}" for ${callType} "${callName}(${names.join(', ')})".`, unknownParameter.key, template.source);
    }

    return arguments_;
}

export const executeCallNode: TwingNodeExecutor<TwingBaseCallNode<any>> = async (node, executionContext) => {
    const {type} = node;
    const {template, environment, nodeExecutor: execute} = executionContext
    const {operatorName} = node.attributes;

    let callableWrapper: TwingCallableWrapper | null;

    switch (type) {
        case "filter":
            callableWrapper = getFilter(environment.filters, operatorName);
            break;

        case "function":
            callableWrapper = getFunction(environment.functions, operatorName);
            break;

        // for some reason, using `case "test"` makes the compiler assume that callableWrapper is used
        // before it is assigned a value; this is probably a bug of the compiler
        default:
            callableWrapper = getTest(environment.tests, operatorName);
            break;
    }

    if (callableWrapper === null) {
        throw createRuntimeError(`Unknown ${type} "${operatorName}".`, node, template.source);
    }

    const {operand, arguments: callArguments} = node.children;

    const argumentNodes = getArguments(
        node,
        template,
        callArguments,
        callableWrapper.acceptedArguments,
        callableWrapper.isVariadic
    );
    
    const actualArguments: Array<any> = [];

    actualArguments.push(...callableWrapper!.nativeArguments);

    if (operand) {
        actualArguments.push(await execute(operand, executionContext));
    }

    const providedArguments = await Promise.all([
        ...argumentNodes.map((node) => execute(node, executionContext))
    ]);

    actualArguments.push(...providedArguments);

    const traceableCallable = getTraceableMethod(callableWrapper.callable, node, template.source);

    return traceableCallable(executionContext, ...actualArguments).then((value) => {
        return value;
    });
};
