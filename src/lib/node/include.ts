import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";
import {ExpressionNode} from "./expression";
import {Compiler} from "../compiler";

export type BaseIncludeNodeAttributes = BaseNodeAttributes & {
    only: boolean;
    ignoreMissing: boolean;
};

export type BaseIncludeNodeChildren = {
    expression?: ExpressionNode;
    variables: ExpressionNode;
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
    addGetTemplate: (compiler: Compiler, baseNode: BaseIncludeNode<Type, Attributes>) => void,
    line: number,
    column: number,
    tag: string | null = null
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

            compiler.raw(', ');

            if (variables) {
                compiler.subCompile(variables);
            } else {
                compiler.render(undefined)
            }

            compiler
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
