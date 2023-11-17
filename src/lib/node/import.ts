import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {TwingBaseExpressionNode} from "./expression";
import type {TwingAssignmentNode} from "./expression/assignment";

export type TwingImportNodeAttributes = TwingBaseNodeAttributes & {
    global: boolean;
};

export interface TwingImportNode extends TwingBaseNode<"import", TwingImportNodeAttributes, {
    expr: TwingBaseExpressionNode;
    var: TwingAssignmentNode;
}> {
}

export const createImportNode = (
    expression: TwingBaseExpressionNode,
    aliasName: TwingAssignmentNode,
    global: boolean,
    line: number,
    column: number,
    tag: string
): TwingImportNode => {
    const baseNode = createBaseNode("import", {
        global
    }, {
        expr: expression,
        var: aliasName
    }, line, column, tag);

    return {
        ...baseNode,
        compile: (compiler) => {
            const {var: varName, expr} = baseNode.children;
            const {global} = baseNode.attributes;

            compiler
                .write('aliases.proxy[')
                .render(varName.attributes.name)
                .write('] = ')
            ;

            if (global) {
                compiler
                    .write('template.aliases.proxy[')
                    .render(varName.attributes.name)
                    .write('] = ')
                ;
            }

            if (expr.is("name") && expr.attributes.name === '_self') {
                compiler.write('template');
            } else {
                compiler
                    .write('await template.loadTemplate(')
                    .subCompile(expr)
                    .write(', ')
                    .render(baseNode.line)
                    .write(')')
                ;
            }

            compiler.write(";\n");
        }
    };
};
