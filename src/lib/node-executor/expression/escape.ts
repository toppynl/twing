import {TwingNodeExecutor} from "../../node-executor";
import {TwingEscapeNode} from "../../node/expression/escape";
import {getTraceableMethod} from "../../helpers/traceable-method";
import {escapeValue} from "../../helpers/escape-value";

export const executeEscapeNode: TwingNodeExecutor<TwingEscapeNode> = (node, executionContext) => {
    const {template, environment, nodeExecutor: execute} = executionContext;
    const {strategy} = node.attributes;
    const {body} = node.children;

    return execute(body, executionContext)
        .then((value) => {
            const traceableEscape = getTraceableMethod(escapeValue, node.line, node.column, template.name);

            return traceableEscape(template, environment, value, strategy, null);
        });
};
