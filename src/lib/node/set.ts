import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {createConstantNode} from "./expression/constant";
import {textNodeType} from "./output/text";
import {createMarkup} from "../markup";
import {createArgumentsNode} from "./expression/arguments";

export type SetNodeAttributes = TwingBaseNodeAttributes & {
    capture: boolean; // todo: rename
    safe: boolean;
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
        capture,
        safe: false
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
        baseNode.attributes.safe = true;

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
        execute: async (...args) => {
            const [template, context, outputBuffer] = args;
            const {environment} = template;
            const {names: namesNode, values: valuesNode} = node.children;
            const {capture, safe} = node.attributes;

            const names: Array<string> = await namesNode.execute(...args);

            const getSafeValue = (value: any) => {
                if (safe && value !== '') {
                    return createMarkup(value, environment.charset);
                } else {
                    return value;
                }
            }

            if (capture) {
                outputBuffer.start();

                await valuesNode.execute(...args);

                const value = outputBuffer.getAndClean();

                for (const name of names) {
                    context.set(name, getSafeValue(value));
                }
            } else {
                const values: Array<any> = await valuesNode.execute(...args);

                let index = 0;

                for (const name of names) {
                    const value = values[index];

                    context.set(name, getSafeValue(value));

                    index++;
                }
            }
        },
        isACaptureNode: true
    };

    return node;
};
