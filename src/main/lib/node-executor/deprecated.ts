import {TwingNodeExecutor} from "../node-executor";
import {TwingDeprecatedNode} from "../node/deprecated";

export const executeDeprecatedNode: TwingNodeExecutor<TwingDeprecatedNode> = (node, executionContext) => {
    const {template, nodeExecutor: execute} = executionContext;
    const {message} = node.children;

    return execute(message, executionContext)
        .then((message) => {
            console.warn(`${message} ("${template.name}" at line ${node.line}, column ${node.column})`);
        });
};
