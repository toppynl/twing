import type {TwingNodeExecutor} from "../../node-executor";
import type {TwingParentFunctionNode} from "../../node/expression/parent-function";
import {getTraceableMethod} from "../../helpers/traceable-method";

export const executeParentFunction: TwingNodeExecutor<TwingParentFunctionNode> = (node, executionContext) => {
    const {template, outputBuffer} = executionContext;
    const {name} = node.attributes;
    const displayParentBlock = getTraceableMethod(template.displayParentBlock, node, template.source);
    
    outputBuffer.start();
    
    return displayParentBlock(executionContext, name).then(() => outputBuffer.getAndClean());
};
