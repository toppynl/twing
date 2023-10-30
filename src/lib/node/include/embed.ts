import {BaseIncludeNode, BaseIncludeNodeAttributes, BaseIncludeNodeChildren, createBaseIncludeNode} from "../include";

export const embedNodeType = "embed";

type EmbedNodeAttributes = BaseIncludeNodeAttributes & {
    templateName: string;
    index: number;
};

export interface EmbedNode extends BaseIncludeNode<typeof embedNodeType, EmbedNodeAttributes> {
}

export const createEmbedNode = (
    attributes: EmbedNodeAttributes,
    children: Omit<BaseIncludeNodeChildren, "expression">,
    line: number,
    column: number,
    tag: string
): EmbedNode => {
    const baseNode = createBaseIncludeNode(
        embedNodeType,
        attributes,
        children,
        (compiler, baseNode) => {
            const {templateName, index} = node.attributes;

            compiler
                .raw('await template.loadTemplate(')
                .string(templateName)
                .raw(', ')
                .render(baseNode.line)
                .raw(', ')
                .string(index)
                .raw(')')
            ;
        },
        line,
        column,
        tag
    );

    const node = Object.assign(baseNode, {});

    return node;
};
