import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../../node-executor";
import {TwingAttributeAccessorNode} from "../../node/expression/attribute-accessor";
import {getSynchronousTraceableMethod, getTraceableMethod} from "../../helpers/traceable-method";
import {getAttribute, getAttributeSynchronously} from "../../helpers/get-attribute";

export const executeAttributeAccessorNode: TwingNodeExecutor<TwingAttributeAccessorNode> = (node, executionContext) => {
    const {template, sandboxed, environment, nodeExecutor: execute, strict} = executionContext;
    const {target, attribute, arguments: methodArguments} = node.children;
    const {type, shouldIgnoreStrictCheck, shouldTestExistence, isNullSafe} = node.attributes;

    return Promise.all([
        execute(target, executionContext),
        execute(attribute, executionContext),
        execute(methodArguments, executionContext)
    ]).then(([target, attribute, methodArguments]) => {
        if (isNullSafe && (target === null || target === undefined)) {
            return null;
        }

        const traceableGetAttribute = getTraceableMethod(getAttribute, node, template.source);

        return traceableGetAttribute(
            environment,
            target,
            attribute,
            methodArguments,
            type,
            shouldTestExistence,
            shouldIgnoreStrictCheck || null,
            sandboxed,
            strict
        )
    })
};

export const executeAttributeAccessorNodeSynchronously: TwingSynchronousNodeExecutor<TwingAttributeAccessorNode> = (node, executionContext) => {
    const {template, sandboxed, environment, nodeExecutor: execute, strict} = executionContext;
    const {target: targetNode, attribute: attributeNode, arguments: argumentsNode} = node.children;
    const {type, shouldIgnoreStrictCheck, shouldTestExistence, isNullSafe} = node.attributes;

    const target = execute(targetNode, executionContext);

    if (isNullSafe && (target === null || target === undefined)) {
        return null;
    }

    const attribute = execute(attributeNode, executionContext);
    const methodArguments = execute(argumentsNode, executionContext);

    const traceableGetAttribute = getSynchronousTraceableMethod(getAttributeSynchronously, node, template.source);

    return traceableGetAttribute(
        environment,
        target,
        attribute,
        methodArguments,
        type,
        shouldTestExistence,
        shouldIgnoreStrictCheck || null,
        sandboxed,
        strict
    );
};
