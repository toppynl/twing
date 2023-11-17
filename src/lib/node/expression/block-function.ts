import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import {TwingBaseNode} from "../../node";
import {TwingCompiler} from "../../compiler";

type TwingBlockFunctionNodeAttributes = TwingBaseExpressionNodeAttributes & {
    shouldTestExistence: boolean;
};

type TwingBlockFunctionNodeChildren = {
    name: TwingBaseNode;
    template?: TwingBaseNode;
};

export interface TwingBlockFunctionNode extends TwingBaseExpressionNode<"block_reference_expression", TwingBlockFunctionNodeAttributes, TwingBlockFunctionNodeChildren> {
}

export const createBlockFunctionNode = (
    name: TwingBaseNode,
    template: TwingBaseNode | null,
    line: number,
    column: number,
    tag?: string
): TwingBlockFunctionNode => {
    const children: TwingBlockFunctionNodeChildren = {
        name
    };

    if (template) {
        children.template = template;
    }

    const baseNode = createBaseExpressionNode("block_reference_expression", {
        shouldTestExistence: false
    }, children, line, column, tag);

    const compileTemplateCall = (compiler: TwingCompiler, method: string, needsOutputBuffer: boolean): TwingCompiler => {
        compiler.write('await ');

        if (!node.children.template) {
            compiler.write('template');
        } else {
            compiler
                .write('(await template.loadTemplate(')
                .subCompile(node.children.template)
                .write(', ')
                .render(node.line)
                .write('))')
            ;
        }

        compiler.write(`.${method}(${node.line}, template.source)`);

        compileBlockArguments(compiler, needsOutputBuffer);

        return compiler;
    }

    const compileBlockArguments = (compiler: TwingCompiler, needsOutputBuffer: boolean) => {
        compiler
            .write('(')
            .subCompile(node.children.name)
            .write(', context.clone()');

        if (needsOutputBuffer) {
            compiler.write(', outputBuffer');
        }

        if (!baseNode.children.template) {
            compiler.write(', blocks');
        }

        return compiler.write(')');
    }

    const node: TwingBlockFunctionNode = {
        ...baseNode,
        compile: (compiler) => {
            if (node.attributes.shouldTestExistence) {
                compileTemplateCall(compiler, 'getTraceableHasBlock', false);
            } else {
                compileTemplateCall(compiler, 'getTraceableRenderBlock', true);
            }
        }
    };

    return node;
};

export const cloneBlockReferenceExpressionNode = (
    node: TwingBlockFunctionNode
): TwingBlockFunctionNode => {
    return createBlockFunctionNode(
        node.children.name,
        node.children.template || null,
        node.line,
        node.column
    );
};
