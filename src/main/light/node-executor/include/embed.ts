import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../../node-executor";
import {TwingEmbedNode} from "../../node/include/embed";
import {executeBaseIncludeNode, executeBaseIncludeNodeSynchronously} from "../include";
import {getSynchronousTraceableMethod, getTraceableMethod} from "../../helpers/traceable-method";

export const executeEmbedNode: TwingNodeExecutor<TwingEmbedNode> = (node, executionContext) => {
    return executeBaseIncludeNode(node, executionContext, ({template}) => {
        const {index} = node.attributes;

        const loadEmbeddedTemplate = getTraceableMethod(() => {
            const {embeddedTemplates} = template;

            // by design, it is guaranteed that an embed node is always executed with an index that corresponds to an existing embedded template
            const embeddedTemplate = embeddedTemplates.get(index)!;

            return Promise.resolve(embeddedTemplate);
        }, node, template.source);

        return loadEmbeddedTemplate();
    })
};

export const executeEmbedNodeSynchronously: TwingSynchronousNodeExecutor<TwingEmbedNode> = (node, executionContext) => {
    return executeBaseIncludeNodeSynchronously(node, executionContext, ({template}) => {
        const {index} = node.attributes;

        const loadEmbeddedTemplate = getSynchronousTraceableMethod(() => {
            const {embeddedTemplates} = template;

            // by design, it is guaranteed that an embed node is always executed with an index that corresponds to an existing embedded template
            const embeddedTemplate = embeddedTemplates.get(index)!;

            return embeddedTemplate;
        }, node, template.source);

        return loadEmbeddedTemplate();
    })
};
