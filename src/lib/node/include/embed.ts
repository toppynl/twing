import {
    TwingBaseIncludeNode,
    TwingBaseIncludeNodeAttributes,
    TwingBaseIncludeNodeChildren,
    createBaseIncludeNode
} from "../include";
import {getTraceableMethod} from "../../helpers/traceable-method";

export type TwingEmbedNodeAttributes = TwingBaseIncludeNodeAttributes & {
    index: number;
};

export interface TwingEmbedNode extends TwingBaseIncludeNode<"embed", TwingEmbedNodeAttributes> {
}

export const createEmbedNode = (
    attributes: TwingEmbedNodeAttributes,
    children: Omit<TwingBaseIncludeNodeChildren, "expression">,
    line: number,
    column: number,
    tag: string
): TwingEmbedNode => {
    const embedNode: TwingEmbedNode = createBaseIncludeNode(
        "embed",
        attributes,
        children,
        ({template}) => {
            const {index} = embedNode.attributes;

            const loadTemplate = getTraceableMethod(template.loadEmbeddedTemplate, embedNode.line, embedNode.column, template.name);

            return loadTemplate(index);
        },
        line,
        column,
        tag
    );

    return embedNode;
};
