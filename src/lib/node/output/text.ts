import {TwingBaseNodeAttributes} from "../../node";
import {TwingBaseOutputNode, createBaseOutputNode} from "../output";

export const textNodeType = "text";

export type BaseTextNodeAttributes = TwingBaseNodeAttributes & {
    data: string;
};

export interface BaseTextNode<Type extends string> extends TwingBaseOutputNode<Type, BaseTextNodeAttributes> {
}

export interface TwingTextNode extends BaseTextNode<typeof textNodeType> {
}

export const createBaseTextNode = <Type extends string>(
    type: Type,
    data: string,
    line: number,
    column: number,
    tag: string | null = null
): BaseTextNode<Type> => {
    const outputNode = createBaseOutputNode(type, {
        data
    }, {}, (compiler) => {
        compiler
            .string(node.attributes.data)
        ;
    }, line, column, tag);

    const node: BaseTextNode<Type> = {
        ...outputNode,
        compile: (compiler) => {
            compiler.addSourceMapEnter(node);
            
            outputNode.compile(compiler);
            
            compiler
                .write(';\n')
                .addSourceMapLeave();
        }
    };

    return node;
};

export const createTextNode = (
    data: string,
    line: number,
    column: number
): TwingTextNode => createBaseTextNode(textNodeType, data, line, column);
