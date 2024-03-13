import {TwingNodeExecutor} from "../../node-executor";
import {TwingAttributeAccessorNode} from "../../node/expression/attribute-accessor";
import {getTraceableMethod} from "../../helpers/traceable-method";
import {getAttribute} from "../../helpers/get-attribute";

export const executeAttributeAccessorNode: TwingNodeExecutor<TwingAttributeAccessorNode> = (node, executionContext) => {
    const {template, sandboxed, environment, nodeExecutor: execute} = executionContext;
    const {target, attribute, arguments: methodArguments} = node.children;
    const {type, shouldIgnoreStrictCheck, shouldTestExistence} = node.attributes;

    return Promise.all([
        execute(target, executionContext),
        execute(attribute, executionContext),
        execute(methodArguments, executionContext)
    ]).then(([target, attribute, methodArguments]) => {
        const traceableGetAttribute = getTraceableMethod(getAttribute, node.line, node.column, template.name);

        return traceableGetAttribute(
            environment,
            target,
            attribute,
            methodArguments,
            type,
            shouldTestExistence,
            shouldIgnoreStrictCheck || null,
            sandboxed
        )
    })
};
