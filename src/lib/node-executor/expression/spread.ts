import {TwingNodeExecutor} from "../../node-executor";
import {TwingSpreadNode} from "../../node/expression/spread";

export const executeSpreadNode: TwingNodeExecutor<TwingSpreadNode> = (node, executionContext) => {
    const {iterable} = node.children;
    const {nodeExecutor: execute} = executionContext;

    return execute(iterable, executionContext);
};
