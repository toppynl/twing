import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode, TwingNode, createNode} from "../node";
import {createConstantNode} from "./expression/constant";

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
    const setNode = createBaseNode("set", {
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
    if (setNode.attributes.captures) {
        const values = setNode.children.values as TwingNode;

        if (values.type === "text") {
            setNode.children.values = createNode({
                0: createConstantNode(values.attributes.data, values.line, values.column)
            }, values.line, values.column);
            setNode.attributes.captures = false;
        }
    }
    
    return setNode;
};
