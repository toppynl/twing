import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";
import {BaseExpressionNode} from "./expression";
import type {AssignNameNode} from "./expression/assign-name";

export type ImportNodeAttributes = BaseNodeAttributes & {
    global: boolean;
};

export interface ImportNode extends BaseNode<"import", ImportNodeAttributes, {
    expr: BaseExpressionNode;
    var: AssignNameNode;
}> {
}

export const createImportNode = (
    expression: BaseExpressionNode,
    aliasName: AssignNameNode,
    global: boolean,
    line: number,
    column: number,
    tag: string
): ImportNode => {
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
                .raw('] = ')
            ;

            if (global) {
                compiler
                    .raw('template.aliases.proxy[')
                    .render(varName.attributes.name)
                    .raw('] = ')
                ;
            }

            if (expr.is("name") && expr.attributes.name === '_self') {
                compiler.raw('template');
            } else {
                compiler
                    .raw('await template.loadTemplate(')
                    .subCompile(expr)
                    .raw(', ')
                    .render(baseNode.line)
                    .raw(')')
                ;
            }

            compiler.raw(";\n");
        }
    };
};
