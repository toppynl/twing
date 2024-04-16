import type {TwingNodeExecutor} from "../node-executor";
import type {TwingTemplateNode} from "../node/template";

export const executeTemplateNode: TwingNodeExecutor<TwingTemplateNode> = (node, executionContext) => {
    const {template, nodeExecutor: execute, outputBuffer, sourceMapRuntime} = executionContext;
    const {securityCheck, body} = node.children;

    return execute(securityCheck, executionContext)
        .then(() => {
            sourceMapRuntime?.enterSourceMapBlock(node.line, node.column, node.type, template.source, outputBuffer);

            return execute(body, executionContext).then(() => {
                sourceMapRuntime?.leaveSourceMapBlock(outputBuffer);
            });
        });
};
