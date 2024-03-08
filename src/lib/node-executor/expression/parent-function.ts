import type {TwingNodeExecutor} from "../../node-executor";
import type {TwingParentFunctionNode} from "../../node/expression/parent-function";
import {getTraceableMethod} from "../../helpers/traceable-method";

export const executeParentFunction: TwingNodeExecutor<TwingParentFunctionNode> = (node, executionContext) => {
    const {template, context, nodeExecutor: execute, outputBuffer, sandboxed, sourceMapRuntime,} = executionContext;
    const {name} = node.attributes;
    const renderParentBlock = getTraceableMethod(template.renderParentBlock, node.line, node.column, template.name);

    return renderParentBlock(name, context, outputBuffer, sandboxed, execute, sourceMapRuntime);
};
