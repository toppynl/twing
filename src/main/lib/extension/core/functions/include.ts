import {isTraversable} from "../../../helpers/is-traversable";
import {isPlainObject} from "../../../helpers/is-plain-object";
import {createContext, TwingContext2} from "../../../context";
import {createMarkup, TwingMarkup} from "../../../markup";
import type {TwingSynchronousTemplate, TwingTemplate} from "../../../template";
import type {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";
import {iterableToMap, iteratorToMap} from "../../../helpers/iterator-to-map";
import {mergeIterables} from "../../../helpers/merge-iterables";

/**
 * Renders a template.
 *
 * @param executionContext
 * @param templates The template to render or an array of templates to try consecutively
 * @param variables The variables to pass to the template
 * @param withContext
 * @param ignoreMissing Whether to ignore missing templates or not
 * @param sandboxed
 *
 * @returns {Promise<TwingMarkup>} The rendered template
 */
export const include: TwingCallable<[
    templates: string | TwingTemplate | null | Array<string | TwingTemplate | null>,
    variables: Map<string, any>,
    withContext: boolean,
    ignoreMissing: boolean,
    sandboxed: boolean
]> = (
    executionContext,
    templates,
    variables,
    withContext,
    ignoreMissing,
    sandboxed
): Promise<TwingMarkup> => {
    const {
        template,
        environment,
        templateLoader,
        context,
        nodeExecutor,
        outputBuffer,
        sourceMapRuntime,
        strict
    } = executionContext;
    if (!isPlainObject(variables) && !isTraversable(variables)) {
        const isVariablesNullOrUndefined = variables === null || variables === undefined;

        return Promise.reject(new Error(`Variables passed to the "include" function or tag must be iterable, got "${!isVariablesNullOrUndefined ? typeof variables : variables}".`));
    }

    variables = iteratorToMap(variables);

    if (withContext) {
        variables = mergeIterables(context, variables);
    }

    if (!Array.isArray(templates)) {
        templates = [templates];
    }

    const resolveTemplate = (templates: Array<string | TwingTemplate | null>): Promise<TwingTemplate | null> => {
        return template.loadTemplate(executionContext, templates)
            .catch((error) => {
                if (!ignoreMissing) {
                    throw error;
                }
                else {
                    return null;
                }
            });
    };

    return resolveTemplate(templates)
        .then((template) => {
            outputBuffer.start();

            if (template) {
                return template.execute(
                    environment,
                    createContext(iterableToMap(variables)),
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
            }
            else {
                return Promise.resolve();
            }
        })
        .then(() => {
            const result = outputBuffer.getAndClean();

            return createMarkup(result, environment.charset);
        });
}

export const includeSynchronously: TwingSynchronousCallable<[
    templates: string | TwingSynchronousTemplate | null | Array<string | TwingSynchronousTemplate | null>,
    variables: TwingContext2,
    withContext: boolean,
    ignoreMissing: boolean,
    sandboxed: boolean
]> = (
    executionContext,
    templates,
    variables,
    withContext,
    ignoreMissing,
    sandboxed
): TwingMarkup => {
    const {
        template,
        environment,
        templateLoader,
        context,
        nodeExecutor,
        outputBuffer,
        sourceMapRuntime,
        strict
    } = executionContext;
    
    if (!isPlainObject(variables) && !isTraversable(variables)) {
        const isVariablesNullOrUndefined = variables === null || variables === undefined;

        throw new Error(`Variables passed to the "include" function or tag must be iterable, got "${!isVariablesNullOrUndefined ? typeof variables : variables}".`);
    }
    
    variables = iteratorToMap(variables);

    if (withContext) {
        variables = new Map([
            ...context.entries(),
            ...variables.entries()
        ]);
    }

    if (!Array.isArray(templates)) {
        templates = [templates];
    }

    const resolveTemplate = (templates: Array<string | TwingSynchronousTemplate | null>): TwingSynchronousTemplate | null => {
        try {
            return template.loadTemplate(executionContext, templates);
        } catch (error) {
            if (!ignoreMissing) {
                throw error;
            }
            else {
                return null;
            }
        }
    };

    const resolvedTemplate = resolveTemplate(templates);

    outputBuffer.start();

    if (resolvedTemplate) {
        resolvedTemplate.execute(
            environment,
            variables,
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
    }
            
    const result = outputBuffer.getAndClean();

    return createMarkup(result, environment.charset);
}
