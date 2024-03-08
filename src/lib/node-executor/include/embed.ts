import {TwingNodeExecutor} from "../../node-executor";
import {TwingEmbedNode} from "../../node/include/embed";
import {executeBaseIncludeNode} from "../include";
import {getTraceableMethod} from "../../helpers/traceable-method";

export const executeEmbedNode: TwingNodeExecutor<TwingEmbedNode> = (node, executionContext) => {
    return executeBaseIncludeNode(node, executionContext, ({template}) => {
        const {index} = node.attributes;

        const loadTemplate = getTraceableMethod(template.loadEmbeddedTemplate, node.line, node.column, template.name);

        return loadTemplate(index);
    })
};
