import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {TwingBaseExpressionNode} from "./expression";
import {TwingCompiler} from "../compiler";

export type BaseIncludeNodeAttributes = TwingBaseNodeAttributes & {
    only: boolean;
    ignoreMissing: boolean;
};

export type BaseIncludeNodeChildren = {
    variables: TwingBaseExpressionNode;
};

export interface TwingBaseIncludeNode<
    Type extends string,
    Attributes extends BaseIncludeNodeAttributes = BaseIncludeNodeAttributes,
    Children extends BaseIncludeNodeChildren = BaseIncludeNodeChildren
> extends TwingBaseNode<Type, Attributes, Children> {
}

export const createBaseIncludeNode = <Type extends string, Attributes extends BaseIncludeNodeAttributes, Children extends BaseIncludeNodeChildren = BaseIncludeNodeChildren>(
    type: Type,
    attributes: Attributes,
    children: Children,
    addGetTemplate: (compiler: TwingCompiler) => void,
    line: number,
    column: number,
    tag: string
): TwingBaseIncludeNode<Type, Attributes, Children> => {
    const baseNode = createBaseNode(type, attributes, children, line, column, tag);

    const node: TwingBaseIncludeNode<Type, Attributes, Children> = {
        ...baseNode,
        compile: (compiler) => {
            const {variables} = baseNode.children;
            const {only, ignoreMissing} = node.attributes;

            compiler
                .write('outputBuffer.echo(').write('\n')
                .write('await runtime.include(').write('\n')
                .write('template,').write('\n')
                .write('context,').write('\n')
                .write('outputBuffer,').write('\n')
                .write('sourceMapRuntime,').write('\n')
            ;
            
            addGetTemplate(compiler);

            compiler
                .write(',').write('\n')
                .subCompile(variables).write(',').write('\n')
                .render(!only).write(',').write('\n')
                .render(ignoreMissing).write(',').write('\n')
                .render(false).write(',').write('\n')
                .render(baseNode.line).write('\n')
                .write(')\n')
                .write(');\n');
        }
    };

    return node;
};
