import {
    TwingBaseIncludeNode,
    BaseIncludeNodeAttributes,
    BaseIncludeNodeChildren,
    createBaseIncludeNode
} from "../include";
import {includeNodeType} from "./include";
import {getTraceableMethod} from "../../helpers/traceable-method";

export const embedNodeType = "embed";

type TwingEmbedNodeAttributes = BaseIncludeNodeAttributes & {
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
        ({template}) => {
            const {index} = node.attributes;

            const loadTemplate = getTraceableMethod(template.loadEmbeddedTemplate, node.line, node.column, template.name);

            return loadTemplate(index);
        },
        line,
        column,
        tag
    );

    const node: TwingEmbedNode = Object.assign(baseNode, <Partial<TwingEmbedNode>>{
        is: (type) => {
            return type === embedNodeType || type === includeNodeType; // todo: this should probably be handled by the base include node
        }
    });

    return node;
};
