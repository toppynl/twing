import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode, TwingNode} from "../node";
import {createConstantNode} from "./expression/constant";
import {createWrapperNode} from "./wrapper";

export type TwingSetNodeAttributes = TwingBaseNodeAttributes & {
    captures: boolean;
};

export interface TwingSetNode extends TwingBaseNode<"set", TwingSetNodeAttributes, {
    names: TwingBaseNode;
    values: TwingBaseNode;
}> {
}

export const createSetNode = (
    captures: boolean,
    names: TwingSetNode["children"]["names"],
    values: TwingSetNode["children"]["values"],
    line: number,
    column: number,
    tag: string
): TwingSetNode => {
    const baseNode = createBaseNode("set", {
        captures
    }, {
        names,
        values
    }, line, column, tag);

    /*
     * Optimizes the node when capture is used for a large block of text.
     *
     * {% set foo %}foo{% endset %} is compiled to $context['foo'] = new Twig_Markup("foo");
     */
    if (baseNode.attributes.captures) {
        const values = baseNode.children.values as TwingNode;

        if (values.type === "text") {
            baseNode.children.values = createWrapperNode({
                0: createConstantNode(values.attributes.data, values.line, values.column)
            }, values.line, values.column);
            baseNode.attributes.captures = false;
        }
    }

    const setNode: TwingSetNode = {
        ...baseNode,
        execute: async (executionContext) => {
            const {context, outputBuffer} = executionContext;
            const {names: namesNode, values: valuesNode} = setNode.children;
            const {captures} = setNode.attributes;

            const names: Array<string> = await namesNode.execute(executionContext);

            if (captures) {
                outputBuffer.start();

                await valuesNode.execute(executionContext);

                const value = outputBuffer.getAndClean();

                for (const name of names) {
                    context.set(name, value);
                }
            }
            else {
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

    return setNode;
};
