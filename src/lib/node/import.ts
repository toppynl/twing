import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import type {TwingBaseExpressionNode, TwingExpressionNode} from "./expression";
import type {TwingAssignmentNode} from "./expression/assignment";
import type {TwingTemplate} from "../template";
import {getTraceableMethod} from "../helpers/traceable-method";

export type TwingImportNodeAttributes = TwingBaseNodeAttributes & {
    global: boolean;
};

export interface TwingImportNode extends TwingBaseNode<"import", TwingImportNodeAttributes, {
    templateName: TwingBaseExpressionNode;
    alias: TwingAssignmentNode;
}> {
}

export const createImportNode = (
    templateName: TwingExpressionNode,
    alias: TwingAssignmentNode,
    global: boolean,
    line: number,
    column: number,
    tag: string
): TwingImportNode => {
    const baseNode = createBaseNode("import", {
        global
    }, {
        templateName,
        alias
    }, line, column, tag);

    const importNode: TwingImportNode = {
        ...baseNode,
        execute: async (executionContext) => {
            const {template, aliases} = executionContext;
            const {alias: aliasNode, templateName: templateNameNode} = baseNode.children;

            const {global} = baseNode.attributes;

            let aliasValue: TwingTemplate;

            if (templateNameNode.type === "name" && templateNameNode.attributes.name === '_self') {
                aliasValue = template;
            } else {
                const templateName = await templateNameNode.execute(executionContext);

                const loadTemplate = getTraceableMethod(template.loadTemplate, importNode.line, importNode.column, template.name);

                aliasValue = await loadTemplate(templateName);
            }

            aliases.set(aliasNode.attributes.name, aliasValue);

            if (global) {
                template.aliases.set(aliasNode.attributes.name, aliasValue);
            }
        }
    };

    return importNode;
};
