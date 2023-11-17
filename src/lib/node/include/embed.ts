import {TwingBaseIncludeNode, BaseIncludeNodeAttributes, BaseIncludeNodeChildren, createBaseIncludeNode} from "../include";

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
        (compiler) => {
            const {templateName, index} = node.attributes;

            compiler
                .write('await template.loadTemplate(').write('\n')
                .string(templateName).write(', ').write('\n')
                .render(node.line).write(', ').write('\n')
                .string(index).write('\n')
                .write(')')
            ;
        },
        line,
        column,
        tag
    );

    const node: TwingEmbedNode = Object.assign(baseNode, {});

    return node;
};
