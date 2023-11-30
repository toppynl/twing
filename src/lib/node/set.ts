import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {createConstantNode} from "./expression/constant";
import {textNodeType} from "./output/text";
import {createArgumentsNode} from "./expression/arguments";

export type SetNodeAttributes = TwingBaseNodeAttributes & {
    capture: boolean; // todo: rename
};

export interface TwingSetNode extends TwingBaseNode<"set", SetNodeAttributes, {
    names: TwingBaseNode;
    values: TwingBaseNode;
}> {
}

export const createSetNode = (
    capture: boolean,
    names: TwingSetNode["children"]["names"],
    values: TwingSetNode["children"]["values"],
    line: number,
    column: number,
    tag: string
): TwingSetNode => {
    const baseNode = createBaseNode("set", {
        capture
    }, {
        names,
        values
    }, line, column, tag);

    /*
     * Optimizes the node when capture is used for a large block of text.
     *
     * {% set foo %}foo{% endset %} is compiled to $context['foo'] = new Twig_Markup("foo");
     */
    if (baseNode.attributes.capture) {
        const {values} = baseNode.children;

        if (values.is(textNodeType)) {
            baseNode.children.values = createArgumentsNode({
                0: createConstantNode(values.attributes.data, values.line, values.column)
            }, values.line, values.column);
            baseNode.attributes.capture = false;
        }
    }

    const node: TwingSetNode = {
        ...baseNode,
        execute: async (executionContext) => {
            const {context, outputBuffer} = executionContext;
            const {names: namesNode, values: valuesNode} = node.children;
            const {capture} = node.attributes;

            const names: Array<string> = await namesNode.execute(executionContext);

            if (capture) {
                outputBuffer.start();

                await valuesNode.execute(executionContext);

                const value = outputBuffer.getAndClean();

                for (const name of names) {
                    context.set(name, value);
                }
            } else {
                const values: Array<any> = await valuesNode.execute(executionContext);

                let index = 0;

                for (const name of names) {
                    const value = values[index];

                    context.set(name, value);

                    index++;
                }
            }
        },
        isACaptureNode: true
    };

    return node;
};
