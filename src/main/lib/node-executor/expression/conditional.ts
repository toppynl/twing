import {TwingNodeExecutor} from "../../node-executor";
import {TwingBaseConditionalNode} from "../../node/expression/conditional";

export const executeConditionalNode: TwingNodeExecutor<TwingBaseConditionalNode<any>> = async (node, executionContext) => {
    const {expr1, expr2, expr3} = node.children;
    const {nodeExecutor: execute} = executionContext;

    return (await execute(expr1, executionContext)) ? execute(expr2, executionContext) : execute(expr3, executionContext);
};
