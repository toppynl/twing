import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../../node-executor";
import {TwingEscapeNode} from "../../node/expression/escape";
import {getSynchronousTraceableMethod, getTraceableMethod} from "../../helpers/traceable-method";
import {escapeValue, escapeValueSynchronously} from "../../helpers/escape-value";

export const executeEscapeNode: TwingNodeExecutor<TwingEscapeNode> = (node, executionContext) => {
    const {template, environment, nodeExecutor: execute} = executionContext;
    const {strategy} = node.attributes;
    const {body} = node.children;

    return execute(body, executionContext)
        .then((value) => {
            const traceableEscape = getTraceableMethod(escapeValue, node, template.source);

            return traceableEscape(template, environment, value, strategy, null);
        });
};

export const executeEscapeNodeSynchronously: TwingSynchronousNodeExecutor<TwingEscapeNode> = (node, executionContext) => {
    const {template, environment, nodeExecutor: execute} = executionContext;
    const {strategy} = node.attributes;
    const {body} = node.children;

    const value = execute(body, executionContext);
    
    const traceableEscape = getSynchronousTraceableMethod(escapeValueSynchronously, node, template.source);

    return traceableEscape(template, environment, value, strategy, null);
};
