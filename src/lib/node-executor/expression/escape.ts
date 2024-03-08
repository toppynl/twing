import {TwingNodeExecutor} from "../../node-executor";
import {TwingEscapeNode} from "../../node/expression/escape";
import {getTraceableMethod} from "../../helpers/traceable-method";

export const executeEscapeNode: TwingNodeExecutor<TwingEscapeNode> = (node, executionContext) => {
    const {template, nodeExecutor: execute} = executionContext;
    const {strategy} = node.attributes;
    const {body} = node.children;

    return execute(body, executionContext)
        .then((value) => {
            const escape = getTraceableMethod(template.escape, node.line, node.column, template.name);

            return escape(value, strategy, null, true);
        });
};
