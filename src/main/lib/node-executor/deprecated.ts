import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
import {TwingDeprecatedNode} from "../node/deprecated";

export const executeDeprecatedNode: TwingNodeExecutor<TwingDeprecatedNode> = (node, executionContext) => {
    const {template, nodeExecutor: execute} = executionContext;
    const {message} = node.children;

    return execute(message, executionContext)
        .then((message) => {
            console.warn(`${message} ("${template.name}" at line ${node.line}, column ${node.column})`);
        });
};

export const executeDeprecatedNodeSynchronously: TwingSynchronousNodeExecutor<TwingDeprecatedNode> = (node, executionContext) => {
    const {template, nodeExecutor: execute} = executionContext;
    const {message: messageNode} = node.children;

    const message = execute(messageNode, executionContext);
    
    console.warn(`${message} ("${template.name}" at line ${node.line}, column ${node.column})`);
};
