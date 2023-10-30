import {BaseExpressionNode, BaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import {Node} from "../../node";
import {Compiler} from "../../compiler";

type BlockReferenceExpressionNodeAttributes = BaseExpressionNodeAttributes & {
    is_defined_test: boolean;
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
        is_defined_test: false,
        output: false
    }, children, line, column, tag);

    const compileTemplateCall = (compiler: Compiler, method: string, needsOutputBuffer: boolean): Compiler => {
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

    const compileBlockArguments = (compiler: Compiler, needsOutputBuffer: boolean) => {
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
        compile: (compiler) => {
            if (node.attributes.is_defined_test) {
                compileTemplateCall(compiler, 'traceableHasBlock', false);
            } else {
                compileTemplateCall(compiler, 'traceableRenderBlock', true);
            }
        }
    };
    
    return node;
};
