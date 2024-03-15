import type {TwingNodeExecutor} from "../node-executor";
import type {TwingImportNode} from "../node/import";
import type {TwingTemplate} from "../template";
import {getTraceableMethod} from "../helpers/traceable-method";
import type {TwingNameNode} from "../node/expression/name";

export const executeImportNode: TwingNodeExecutor<TwingImportNode> = async (node, executionContext) => {
    const {template, aliases, nodeExecutor: execute,} = executionContext;
    const {alias: aliasNode, templateName: templateNameNode} = node.children;

    const {global} = node.attributes;

    let aliasValue: TwingTemplate;

    if (templateNameNode.type === "name" && (templateNameNode as TwingNameNode).attributes.name === '_self') {
        aliasValue = template;
    } else {
        const templateName = await execute(templateNameNode, executionContext);

        const loadTemplate = getTraceableMethod(template.loadTemplate, node.line, node.column, template.name);

        aliasValue = await loadTemplate(executionContext, templateName);
    }

    aliases.set(aliasNode.attributes.name, aliasValue);

    if (global) {
        console.log('executeImportNode', template.name, template.aliases.has('macros'));

        template.aliases.set(aliasNode.attributes.name, aliasValue);
        
        console.log('>>> executeImportNode', template.name, template.aliases.has('macros'));
    }
};
