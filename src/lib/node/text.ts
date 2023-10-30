import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";

export const textNodeType = "text";

export type BaseTextNodeAttributes = BaseNodeAttributes & {
    data: string;
};

export interface BaseTextNode<Type extends string> extends BaseNode<Type, BaseTextNodeAttributes> {
}

export interface TextNode extends BaseTextNode<typeof textNodeType> {
}

export const createBaseTextNode = <Type extends string>(
    type: Type,
    data: string,
    line: number,
    column: number,
    tag: string | null = null
): BaseTextNode<Type> => {
    const baseNode = createBaseNode(type,{
        data
    }, {}, line, column, tag);

    const node: BaseTextNode<Type> = {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .addSourceMapEnter(node)
                .write('outputBuffer.echo(')
                .string(node.attributes.data)
                .raw(");\n")
                .addSourceMapLeave()
            ;
        },
        isAnOutputNode: true,
        clone: () => createBaseTextNode(type, data, line, column, tag)
    };

    return node;
};

export const createTextNode = (
    data: string,
    line: number,
    column: number,
    tag: string | null = null
): TextNode => createBaseTextNode(textNodeType, data, line, column, tag);
