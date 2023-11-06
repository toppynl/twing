import {BaseExpressionNode, BaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import {Node} from "../../node";
import {TwingCompiler} from "../../compiler";

type BlockReferenceExpressionNodeAttributes = BaseExpressionNodeAttributes & {
    output: boolean;
};

type BlockReferenceExpressionNodeChildren = {
    name: Node;
    template?: Node;
};

export interface BlockReferenceExpressionNode extends BaseExpressionNode<"block_reference_expression", BlockReferenceExpressionNodeAttributes, BlockReferenceExpressionNodeChildren> {
}

export const createBlockReferenceExpressionNode = (
    name: Node,
    template: Node | null,
    line: number,
    column: number,
    tag?: string
): BlockReferenceExpressionNode => {
    const children: BlockReferenceExpressionNodeChildren = {
        name
    };

    if (template) {
        children.template = template;
    }

    const baseNode = createBaseExpressionNode("block_reference_expression", {
        output: false
    }, children, line, column, tag);

    const compileTemplateCall = (compiler: TwingCompiler, method: string, needsOutputBuffer: boolean): TwingCompiler => {
        compiler.write('await ');

        if (!node.children.template) {
            compiler.raw('template');
        } else {
            compiler
                .raw('(await template.loadTemplate(')
                .subCompile(node.children.template)
                .raw(', ')
                .render(node.line)
                .raw('))')
            ;
        }

        compiler.raw(`.${method}(${node.line}, template.source)`);

        compileBlockArguments(compiler, needsOutputBuffer);

        return compiler;
    }

    const compileBlockArguments = (compiler: TwingCompiler, needsOutputBuffer: boolean) => {
        compiler
            .raw('(')
            .subCompile(node.children.name)
            .raw(', context.clone()');

        if (needsOutputBuffer) {
            compiler.raw(', outputBuffer');
        }

        if (!baseNode.children.template) {
            compiler.raw(', blocks');
        }

        return compiler.raw(')');
    }

    const node: BlockReferenceExpressionNode = {
        ...baseNode,
        compile: (compiler, flags) => {
            if (flags?.isDefinedTest) {
                compileTemplateCall(compiler, 'traceableHasBlock', false);
            } else {
                compileTemplateCall(compiler, 'traceableRenderBlock', true);
            }
        }
    };

    return node;
};
