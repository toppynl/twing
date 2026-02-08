import {createBaseNode, TwingBaseNodeAttributes, TwingBaseNode} from "../node";

export type TwingBaseTextNodeAttributes = TwingBaseNodeAttributes & {
    data: string;
};

export interface TwingBaseTextNode<Type extends string> extends TwingBaseNode<Type, TwingBaseTextNodeAttributes> {
}

export interface TwingTextNode extends TwingBaseTextNode<"text"> {
}

export const createBaseTextNode = <Type extends string>(
    type: Type,
    data: string,
    line: number,
    column: number,
    tag: string | null = null
): TwingBaseTextNode<Type> => {
    return  createBaseNode(type, {
        data
    }, {}, line, column, tag);
};

export const createTextNode = (
    data: string,
    line: number,
    column: number
): TwingTextNode => createBaseTextNode("text", data, line, column);
