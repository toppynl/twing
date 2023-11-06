import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";
import {BaseExpressionNode} from "./expression";
import {TwingCompiler} from "../compiler";

export type BaseIncludeNodeAttributes = BaseNodeAttributes & {
    only: boolean;
    ignoreMissing: boolean;
};

export type BaseIncludeNodeChildren = {
    expression?: BaseExpressionNode;
    variables: BaseExpressionNode;
};

export interface BaseIncludeNode<
    Type extends string,
    Attributes extends BaseIncludeNodeAttributes = BaseIncludeNodeAttributes
> extends BaseNode<Type, Attributes, BaseIncludeNodeChildren> {
}

export const createBaseIncludeNode = <Type extends string, Attributes extends BaseIncludeNodeAttributes>(
    type: Type,
    attributes: Attributes,
    children: BaseIncludeNodeChildren,
    addGetTemplate: (compiler: TwingCompiler, baseNode: BaseIncludeNode<Type, Attributes>) => void,
    line: number,
    column: number,
    tag: string
): BaseIncludeNode<Type, Attributes> => {
    const baseNode = createBaseNode(type, attributes, children, line, column, tag);

    const node: BaseIncludeNode<Type, Attributes> = {
        ...baseNode,
        compile: (compiler) => {
            const {variables} = baseNode.children;
            const {only, ignoreMissing} = node.attributes;

            compiler
                .write('outputBuffer.echo(await runtime.include(template, context, outputBuffer, ');

            addGetTemplate(compiler, node);

            compiler
                .raw(', ')
                .subCompile(variables)
                .raw(', ')
                .render(!only)
                .raw(', ')
                .render(ignoreMissing)
                .raw(', ')
                .render(baseNode.line)
                .raw(')')
                .raw(');\n');
        }
    };

    return node;
};
