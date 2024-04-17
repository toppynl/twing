import {TwingNodeExecutor} from "../node-executor";
import {TwingApplyNode} from "../node/apply";
import {getKeyValuePairs} from "../helpers/get-key-value-pairs";
import {createFilterNode} from "../node/expression/call/filter";
import {createConstantNode} from "../node/expression/constant";

export const executeApplyNode: TwingNodeExecutor<TwingApplyNode> = (node, executionContext) => {
    const {outputBuffer, nodeExecutor: execute} = executionContext;
    const {body, filters} = node.children;
    const {line, column} = node;

    outputBuffer.start();

    return execute(body, executionContext)
        .then(async () => {
            let content = outputBuffer.getAndClean();

            const keyValuePairs = getKeyValuePairs(filters);

            while (keyValuePairs.length > 0) {
                const {key, value: filterArguments} = keyValuePairs.pop()!;

                const filterName = key.attributes.value as string;
                const filterNode = createFilterNode(createConstantNode(content, line, column), filterName, filterArguments, line, column);

                content = await execute(filterNode, executionContext);
            }

            outputBuffer.echo(content);
        });
};
