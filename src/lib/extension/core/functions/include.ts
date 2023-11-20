import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {mergeIterables} from "../../../helpers/merge-iterables";
import {isATemplateLoadingError} from "../../../error/loader";
import type {TwingTemplate} from "../../../template";
import {isTraversable} from "../../../helpers/is-traversable";
import {createRuntimeError} from "../../../error/runtime";
import {isPlainObject} from "../../../helpers/is-plain-object";
import {TwingOutputBuffer} from "../../../output-buffer";
import {TwingContext} from "../../../context";
import {isMapLike} from "../../../helpers/map-like";
import {createMarkup, TwingMarkup} from "../../../markup";
import {TwingSourceMapRuntime} from "../../../source-map-runtime";

/**
 * Renders a template.
 *
 * @param {TwingTemplate} template
 * @param {TwingContext<any, any>} context
 * @param {TwingSource} from
 * @param {TwingOutputBuffer} outputBuffer
 * @param {string | Map<number, string | TwingTemplate>} templates The template to render or an array of templates to try consecutively
 * @param {any} variables The variables to pass to the template
 * @param {boolean} withContext
 * @param {boolean} ignoreMissing Whether to ignore missing templates or not
 * @param {boolean} sandboxed Whether to sandbox the template or not
 *
 * @returns {Promise<string>} The rendered template
 */
export function include(
    template: TwingTemplate, 
    context: TwingContext<any, any>, 
    outputBuffer: TwingOutputBuffer, 
    sourceMapRuntime: TwingSourceMapRuntime,
    templates: string | Map<number, string | TwingTemplate> | TwingTemplate, 
    variables: any, 
    withContext: boolean, 
    ignoreMissing: boolean,
    sandboxed: boolean
): Promise<TwingMarkup> {
    const runtime = template.runtime;
    const from = template.source;
    const alreadySandboxed = runtime.isSandboxed;

    if (!isPlainObject(variables) && !isTraversable(variables)) {
        const isVariablesNullOrUndefined = variables === null || variables === undefined;
        
        return Promise.reject(createRuntimeError(`Variables passed to the "include" function or tag must be iterable, got "${!isVariablesNullOrUndefined ? typeof variables : variables}".`, undefined, from));
    }

    variables = iteratorToMap(variables);

    if (withContext) {
        variables = mergeIterables(context, variables);
    }

    if (sandboxed) {
        if (!alreadySandboxed) {
            runtime.isSandboxed = true;
        }
    }

    if (!isMapLike(templates)) {
        templates = new Map([[0, templates]]);
    }

    const restoreSandbox = (): void => {
        if (sandboxed && !alreadySandboxed) {
            runtime.isSandboxed = false;
        }
    };

    const resolveTemplate = (templates: Map<number, string | TwingTemplate>): Promise<TwingTemplate | null> => {
        return runtime.resolveTemplate([...templates.values()], from).catch((error) => {
            if (isATemplateLoadingError(error)) {
                if (!ignoreMissing) {
                    throw error;
                } else {
                    return null;
                }
            } else {
                throw error;
            }
        });
    };

    return resolveTemplate(templates)
        .then((template) => {
            const promise = template ? template.render(variables, outputBuffer, sourceMapRuntime) : Promise.resolve('');

            return promise.then((result) => {
                return createMarkup(result);
            });
        })
        .finally(() => {
            restoreSandbox();
        });
}
