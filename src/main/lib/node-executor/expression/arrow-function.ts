import {TwingNodeExecutor} from "../../node-executor";
import {TwingArrowFunctionNode} from "../../node/expression/arrow-function";

export const executeArrowFunctionNode: TwingNodeExecutor<TwingArrowFunctionNode> = (node, executionContext) => {
    const {context, nodeExecutor: execute} = executionContext;
    const {body, names} = node.children;
    const assignmentNodes = Object.values(names.children);

    return Promise.resolve((...functionArgs: Array<any>): Promise<any> => {
        let index = 0;

        for (const assignmentNode of assignmentNodes) {
            const {name} = assignmentNode.attributes;

            context.set(name, functionArgs[index]);

            index++;
        }

        return execute(body, executionContext);
    });
};
