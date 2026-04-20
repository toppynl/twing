import type {TwingFunction, TwingSynchronousFunction} from "twing";
import {
    createFunction,
    createMarkup,
    createSynchronousFunction,
    iteratorToMap
} from "twing";
import {ComponentAttributes} from "../component-attributes";
import type {ComponentTemplateFinder} from "../tag-handler/component";

const toMap = (value: unknown): Map<string, any> => {
    if (value instanceof Map) {
        return new Map(value);
    }

    if (value === null || value === undefined) {
        return new Map();
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

export const createComponentFunction = (templateFinder: ComponentTemplateFinder): TwingFunction => {
    return createFunction(
        "component",
        async (executionContext, name, variables) => {
            const {environment, outputBuffer, nodeExecutor, sandboxed, sourceMapRuntime, strict, templateLoader, template} = executionContext;

            const templateName = templateFinder(String(name));
            const loaded = await template.loadTemplate(executionContext, templateName);

            const variablesMap = toMap(variables);
            const attributes = new ComponentAttributes(variablesMap);
            variablesMap.set("attributes", attributes);

            outputBuffer.start();

            await loaded.execute(
                environment,
                variablesMap,
                new Map(),
                outputBuffer,
                {
                    nodeExecutor,
                    sandboxed,
                    sourceMapRuntime: sourceMapRuntime || undefined,
                    strict,
                    templateLoader
                }
            );

            const result = outputBuffer.getAndClean();

            return createMarkup(result, environment.charset);
        },
        [
            {name: "name"},
            {name: "variables", defaultValue: null}
        ]
    );
};

export const createSynchronousComponentFunction = (templateFinder: ComponentTemplateFinder): TwingSynchronousFunction => {
    return createSynchronousFunction(
        "component",
        (executionContext, name, variables) => {
            const {environment, outputBuffer, nodeExecutor, sandboxed, sourceMapRuntime, strict, templateLoader, template} = executionContext;

            const templateName = templateFinder(String(name));
            const loaded = template.loadTemplate(executionContext, templateName);

            const variablesMap = toMap(variables);
            const attributes = new ComponentAttributes(variablesMap);
            variablesMap.set("attributes", attributes);

            outputBuffer.start();

            loaded.execute(
                environment,
                variablesMap,
                new Map(),
                outputBuffer,
                {
                    nodeExecutor,
                    sandboxed,
                    sourceMapRuntime: sourceMapRuntime || undefined,
                    strict,
                    templateLoader
                }
            );

            const result = outputBuffer.getAndClean();

            return createMarkup(result, environment.charset);
        },
        [
            {name: "name"},
            {name: "variables", defaultValue: null}
        ]
    );
};
