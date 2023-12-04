import {createBaseNode, TwingBaseNode, TwingBaseNodeAttributes} from "../node";
import {getKeyValuePairs, TwingArrayNode} from "./expression/array";
import {createFilterNode} from "./expression/call/filter";
import {createConstantNode} from "./expression/constant";

export type TwingApplyNodeAttributes = TwingBaseNodeAttributes & {};

export type TwingApplyNodeChildren = {
    body: TwingBaseNode;
    filters: TwingArrayNode;
};

export interface TwingApplyNode extends TwingBaseNode<"apply", TwingApplyNodeAttributes, TwingApplyNodeChildren> {

}

export const createApplyNode = (
    filters: TwingArrayNode,
    body: TwingBaseNode,
    line: number,
    column: number
): TwingApplyNode => {
    const baseNode = createBaseNode("apply", {}, {
        body,
        filters
    }, line, column, 'apply');

    const applyNode: TwingApplyNode = {
        ...baseNode,
        execute: async (executionContext) => {
            const {outputBuffer} = executionContext;
            const {body, filters} = applyNode.children;
            const {line, column} = applyNode;

            outputBuffer.start();

            return body.execute(executionContext)
                .then(async () => {
                    let content = outputBuffer.getAndClean();

                    const keyValuePairs = getKeyValuePairs(filters);

                    while (keyValuePairs.length > 0) {
                        const {key, value: filterArguments} = keyValuePairs.pop()!;

                        const filterName = key.attributes.value as string;
                        const filterNode = createFilterNode(createConstantNode(content, line, column), filterName, filterArguments, line, column);

                        content = await filterNode.execute(executionContext);
                    }

                    outputBuffer.echo(content);
                });
        }
    };

    return applyNode;
};
