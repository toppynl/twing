import {
    TwingBaseIncludeNode,
    BaseIncludeNodeAttributes,
    BaseIncludeNodeChildren,
    createBaseIncludeNode
} from "../include";

export const embedNodeType = "embed";

type TwingEmbedNodeAttributes = BaseIncludeNodeAttributes & {
    templateName: string;
    index: number;
};

export interface TwingEmbedNode extends TwingBaseIncludeNode<typeof embedNodeType, TwingEmbedNodeAttributes> {
}

export const createEmbedNode = (
    attributes: TwingEmbedNodeAttributes,
    children: Omit<BaseIncludeNodeChildren, "expression">,
    line: number,
    column: number,
    tag: string
): TwingEmbedNode => {
    const baseNode = createBaseIncludeNode(
        embedNodeType,
        attributes,
        children,
        (template) => {
            const {templateName, index} = node.attributes;

            return template.loadTemplate(templateName, node.line, node.column, index);
        },
        line,
        column,
        tag
    );

    const node: TwingEmbedNode = Object.assign(baseNode, {});

    return node;
};
