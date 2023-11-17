import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {TwingBaseExpressionNode} from "./expression";

export interface TwingDeprecatedNode extends TwingBaseNode<"deprecated", TwingBaseNodeAttributes, {
    expr: TwingBaseExpressionNode;
}> {
}

export const createDeprecatedNode = (
    expr: TwingBaseExpressionNode,
    line: number,
    column: number,
    tag: string
): TwingDeprecatedNode => {
    const baseNode = createBaseNode("deprecated", {}, {
        expr
    }, line, column, tag);

    const node: TwingDeprecatedNode = {
        ...baseNode,
        compile: (compiler) => {
            const {expr} = node.children;

            compiler
                .write('{\n')
            ;

            if (expr.is("constant")) {
                compiler
                    .write('console.warn(')
                    .subCompile(expr)
                ;
            } else {
                compiler.write(`let message = `)
                    .subCompile(expr)
                    .write(';\n')
                    .write(`console.warn(message`)
                ;
            }

            compiler
                .write(' + ')
                .string(' ("')
                .write(' + ')
                .write('template.templateName')
                .write(' + ')
                .string(`" at line ${node.line})`)
                .write(');\n')
                .write('}\n')
            ;
        }
    };
    
    return node;
};
