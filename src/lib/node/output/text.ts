import {TwingBaseNodeAttributes} from "../../node";
import {TwingBaseOutputNode, createBaseOutputNode} from "../output";

export type TwingBaseTextNodeAttributes = TwingBaseNodeAttributes & {
    data: string;
};

export interface TwingBaseTextNode<Type extends string> extends TwingBaseOutputNode<Type, TwingBaseTextNodeAttributes> {
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
    const outputNode = createBaseOutputNode(type, {
        data
    }, {}, line, column, tag);

    const textNode: TwingBaseTextNode<Type> = {
        ...outputNode,
        execute(executionContext) {
            const {template, outputBuffer, sourceMapRuntime} = executionContext;

            sourceMapRuntime?.enterSourceMapBlock(textNode.line, textNode.column, textNode.type, template.source, outputBuffer);

            outputBuffer.echo(textNode.attributes.data);

            sourceMapRuntime?.leaveSourceMapBlock(outputBuffer);

            return Promise.resolve();
        }
    };

    return textNode;
};

export const createTextNode = (
    data: string,
    line: number,
    column: number
): TwingTextNode => createBaseTextNode("text", data, line, column);
