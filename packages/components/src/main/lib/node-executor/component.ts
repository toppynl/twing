import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "twing";
import {
    getSynchronousTraceableMethod,
    getTraceableMethod,
    include,
    includeSynchronously,
    iteratorToMap
} from "twing";
import type {ComponentNode} from "../node/component";
import {ComponentAttributes} from "../component-attributes";

const toMap = (value: unknown): Map<string, any> => {
    if (value instanceof Map) {
        return new Map(value);
    }

    if (Array.isArray(value)) {
        const result = new Map<string, any>();
        for (let i = 0; i < value.length; i++) {
            result.set(String(i), value[i]);
        }
        return result;
    }

    return iteratorToMap(value as any);
};

export const executeComponentNode: TwingNodeExecutor<ComponentNode> = async (node, executionContext) => {
    const {nodeExecutor: execute, outputBuffer, sandboxed, template} = executionContext;
    const {variables: variablesNode} = node.children;
    const {only, index} = node.attributes;

    const evaluated = await execute(variablesNode, executionContext);
    const variables = toMap(evaluated);

    const attributes = new ComponentAttributes(variables);
    variables.set("attributes", attributes);

    const loadEmbeddedTemplate = getTraceableMethod(() => {
        const {embeddedTemplates} = template;
        const embeddedTemplate = embeddedTemplates.get(index)!;

        return Promise.resolve(embeddedTemplate);
    }, node, template.source);

    const embeddedTemplate = await loadEmbeddedTemplate();

    const traceableInclude = getTraceableMethod(include, node, template.source);

    const output = await traceableInclude(
        executionContext,
        embeddedTemplate,
        variables,
        !only,
        false,
        sandboxed
    );

    outputBuffer.echo(output);
};

export const executeComponentNodeSynchronously: TwingSynchronousNodeExecutor<ComponentNode> = (node, executionContext) => {
    const {nodeExecutor: execute, outputBuffer, sandboxed, template} = executionContext;
    const {variables: variablesNode} = node.children;
    const {only, index} = node.attributes;

    const evaluated = execute(variablesNode, executionContext);
    const variables = toMap(evaluated);

    const attributes = new ComponentAttributes(variables);
    variables.set("attributes", attributes);

    const loadEmbeddedTemplate = getSynchronousTraceableMethod(() => {
        const {embeddedTemplates} = template;
        const embeddedTemplate = embeddedTemplates.get(index)!;

        return embeddedTemplate;
    }, node, template.source);

    const embeddedTemplate = loadEmbeddedTemplate();

    const traceableInclude = getSynchronousTraceableMethod(includeSynchronously, node, template.source);

    const output = traceableInclude(
        executionContext,
        embeddedTemplate,
        variables,
        !only,
        false,
        sandboxed
    );

    outputBuffer.echo(output);
};
