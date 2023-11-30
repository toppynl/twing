import {createBaseNode, TwingBaseNode, TwingBaseNodeAttributes, TwingBaseNodeChildren} from "../node";
import {getKeyValuePairs, TwingArrayNode} from "./expression/array";
import {createFilterNode} from "./expression/call/filter";
import {createConstantNode} from "./expression/constant";

export const applyNodeType = "apply";

export type TwingApplyNodeAttributes = TwingBaseNodeAttributes & {};

export type TwingApplyNodeChildren = TwingBaseNodeChildren & {
    body: TwingBaseNode;
    filters: TwingArrayNode;
};

export interface TwingApplyNode extends TwingBaseNode<typeof applyNodeType, TwingApplyNodeAttributes, TwingApplyNodeChildren> {

}

export const createApplyNode = (
    filters: TwingArrayNode,
    body: TwingBaseNode,
    line: number,
    column: number
): TwingApplyNode => {
    const baseNode = createBaseNode(applyNodeType, {}, {
        body,
        filters
    }, line, column, 'apply');

    const node: TwingApplyNode = {
        ...baseNode,
        execute: async (executionContext) => {
            const {outputBuffer} = executionContext;
            const {body, filters} = node.children;
            const {line, column} = node;

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

    return node;
};
