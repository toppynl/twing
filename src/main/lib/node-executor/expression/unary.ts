import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../../node-executor";
import type {TwingBaseUnaryNode} from "../../node/expression/unary";
import {createRuntimeError} from "../../error/runtime";

export const executeUnaryNode: TwingNodeExecutor<TwingBaseUnaryNode<any>> = (node, executionContext) => {
    const {operand} = node.children;
    const {nodeExecutor: execute, template} = executionContext;

    switch (node.type) {
        case "negative": {
            return execute(operand, executionContext).then((value) => -(value));
        }
        case "not": {
            return execute(operand, executionContext).then((value) => !(value));
        }
        case "positive": {
            return execute(operand, executionContext).then((value) => +(value));
        }
    }

    return Promise.reject(createRuntimeError(`Unrecognized unary node of type "${node.type}"`, node, template.source));
};

export const executeUnaryNodeSynchronously: TwingSynchronousNodeExecutor<TwingBaseUnaryNode<any>> = (node, executionContext) => {
    const {operand} = node.children;
    const {nodeExecutor: execute, template} = executionContext;

    switch (node.type) {
        case "negative": {
            return -execute(operand, executionContext);
        }
        case "not": {
            return !execute(operand, executionContext);
        }
        case "positive": {
            return +execute(operand, executionContext);
        }
    }

    throw createRuntimeError(`Unrecognized unary node of type "${node.type}"`, node, template.source);
};
