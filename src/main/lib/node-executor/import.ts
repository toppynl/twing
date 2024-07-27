import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
import type {TwingImportNode} from "../node/import";
import type {TwingSynchronousTemplate, TwingTemplate} from "../template";
import {getSynchronousTraceableMethod, getTraceableMethod} from "../helpers/traceable-method";
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

        const loadTemplate = getTraceableMethod(template.loadTemplate, node, template.source);

        aliasValue = await loadTemplate(executionContext, templateName);
    }

    aliases.set(aliasNode.attributes.name, aliasValue);

    if (global) {
        template.aliases.set(aliasNode.attributes.name, aliasValue);
    }
};

export const executeImportNodeSynchronously: TwingSynchronousNodeExecutor<TwingImportNode> = (node, executionContext) => {
    const {template, aliases, nodeExecutor: execute,} = executionContext;
    const {alias: aliasNode, templateName: templateNameNode} = node.children;

    const {global} = node.attributes;

    let aliasValue: TwingSynchronousTemplate;

    if (templateNameNode.type === "name" && (templateNameNode as TwingNameNode).attributes.name === '_self') {
        aliasValue = template;
    } else {
        const templateName = execute(templateNameNode, executionContext);

        const loadTemplate = getSynchronousTraceableMethod(template.loadTemplate, node, template.source);

        aliasValue = loadTemplate(executionContext, templateName);
    }

    aliases[aliasNode.attributes.name] = aliasValue;

    if (global) {
        template.aliases[aliasNode.attributes.name] = aliasValue;
    }
};
