import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import type {TwingBaseExpressionNode} from "./expression";
import type {TwingAssignmentNode} from "./expression/assignment";
import type {TwingTemplate} from "../template";

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

    const node: TwingImportNode = {
        ...baseNode,
        execute: async (...args) => {
            const [template, , , , aliases] = args;
            const {var: varName, expr} = baseNode.children;

            const {global} = baseNode.attributes;

            let aliasValue: TwingTemplate;

            if (expr.is("name") && expr.attributes.name === '_self') {
                aliasValue = template;
            } else {
                const templateName = await expr.execute(...args);

                aliasValue = (await template.loadTemplate(
                    templateName,
                    node.line,
                    node.column
                ))!; // todo: handle null
            }

            aliases.set(varName.attributes.name, aliasValue);

            if (global) {
                template.aliases.set(varName.attributes.name, aliasValue);
            }
        }
    };

    return node;
};
