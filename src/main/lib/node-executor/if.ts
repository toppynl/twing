import {TwingNodeExecutor} from "../node-executor";
import {TwingIfNode} from "../node/if";
import {getChildrenCount} from "../node";
import {evaluate} from "../helpers/evaluate";

export const executeIfNode: TwingNodeExecutor<TwingIfNode> = async (node, executionContext) => {
    const {tests: testsNode, else: elseNode} = node.children;
    const count = getChildrenCount(testsNode);
    const {nodeExecutor: execute} = executionContext;

    let index: number = 0;

    while (index < count) {
        const condition = testsNode.children[index];
        const conditionResult = await execute(condition, executionContext);

        if (evaluate(conditionResult)) {
            // the condition is satisfied, we execute the belonging body and return the result
            const body = testsNode.children[index + 1];

            return execute(body, executionContext);
        }

        index += 2;
    }

    if (elseNode !== undefined) {
        return execute(elseNode, executionContext);
    }
};
