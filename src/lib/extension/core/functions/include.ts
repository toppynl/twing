import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {mergeIterables} from "../../../helpers/merge-iterables";
import {isTraversable} from "../../../helpers/is-traversable";
import {createRuntimeError} from "../../../error/runtime";
import {isPlainObject} from "../../../helpers/is-plain-object";
import {createContext} from "../../../context";
import {createMarkup, TwingMarkup} from "../../../markup";
import type {TwingTemplate} from "../../../template";
import type {TwingCallable} from "../../../callable-wrapper";

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
    templates: string | TwingTemplate | null | Array<string | TwingTemplate | null> ,
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
    const {template, environment, context, nodeExecutor, outputBuffer, sourceMapRuntime} = executionContext;
    const from = template.name;

    if (!isPlainObject(variables) && !isTraversable(variables)) {
        const isVariablesNullOrUndefined = variables === null || variables === undefined;

        return Promise.reject(createRuntimeError(`Variables passed to the "include" function or tag must be iterable, got "${!isVariablesNullOrUndefined ? typeof variables : variables}".`, undefined, from));
    }

    variables = iteratorToMap(variables);

    if (withContext) {
        variables = mergeIterables(context, variables);
    }

    if (!Array.isArray(templates)) {
        templates =[templates];
    }
    
    const resolveTemplate = (templates: Array<string | TwingTemplate | null>): Promise<TwingTemplate | null> => {
        return template.resolveTemplate(environment, templates)
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
                return template.render(
                    environment,
                    createContext(variables),
                    {
                        nodeExecutor,
                        outputBuffer,
                        sandboxed,
                        sourceMapRuntime: sourceMapRuntime || undefined
                    }
                );
            }
            else {
                return Promise.resolve('');
            }
        })
        .then(() => {
            const result = outputBuffer.getAndClean();

            return createMarkup(result, environment.charset);
        });
}
