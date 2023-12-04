import {TwingBaseNode, TwingBaseNodeAttributes, TwingBaseNodeChildren, createBaseNode} from "../node";

export interface TwingBaseOutputNode<
    Type extends string, 
    Attributes extends TwingBaseNodeAttributes = TwingBaseNodeAttributes, 
    Children extends TwingBaseNodeChildren = TwingBaseNodeChildren
> extends TwingBaseNode<Type, Attributes, Children> {
    
}

export const createBaseOutputNode = <Type extends string, Attributes extends TwingBaseNodeAttributes, Children extends TwingBaseNodeChildren>(
    type: Type,
    attributes: Attributes,
    children: Children,
    line: number,
    column: number,
    tag: string | null
): TwingBaseOutputNode<Type, Attributes, Children> => {
    const baseNode = createBaseNode(type, attributes, children, line, column, tag);
    
    return {
        ...baseNode,
        isAnOutputNode: true
    };
};
