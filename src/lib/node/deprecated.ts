import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";
import {ExpressionNode} from "./expression";

export interface DeprecatedNode extends BaseNode<"deprecated", BaseNodeAttributes, {
    expr: ExpressionNode;
}> {
}

export const createDeprecatedNode = (
    expr: ExpressionNode,
    line: number,
    column: number,
    tag: string = null
): DeprecatedNode => {
    const baseNode = createBaseNode("deprecated", {}, {
        expr
    }, line, column, tag);

    const node: DeprecatedNode = {
        ...baseNode,
        compile: (compiler) => {
            const {expr} = node.children;

            compiler
                .write('{\n')
                .indent();

            if (expr.type === "expression_constant") {
                compiler
                    .write('console.warn(')
                    .subCompile(expr)
                ;
            } else {
                compiler.write(`let message = `)
                    .subCompile(expr)
                    .raw(';\n')
                    .write(`console.warn(message`)
                ;
            }

            compiler
                .raw(' + ')
                .string(' ("')
                .raw(' + ')
                .raw('template.templateName')
                .raw(' + ')
                .string(`" at line ${node.line})`)
                .raw(');\n')
                .outdent()
                .write('}\n')
            ;
        }
    };
    
    return node;
};
