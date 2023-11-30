import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {mergeIterables} from "../../../helpers/merge-iterables";
import {isTraversable} from "../../../helpers/is-traversable";
import {createRuntimeError} from "../../../error/runtime";
import {isPlainObject} from "../../../helpers/is-plain-object";
import {TwingOutputBuffer} from "../../../output-buffer";
import {createContext, TwingContext} from "../../../context";
import {isAMapLike} from "../../../helpers/map-like";
import {createMarkup, TwingMarkup} from "../../../markup";
import {TwingSourceMapRuntime} from "../../../source-map-runtime";
import {TwingTemplate} from "../../../template";

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
 * @returns {Promise<TwingMarkup>} The rendered template
 */
export function include(
    template: TwingTemplate,
    context: TwingContext<any, any>,
    outputBuffer: TwingOutputBuffer,
    sourceMapRuntime: TwingSourceMapRuntime | null,
    templates: string | Map<number, string | TwingTemplate | null> | TwingTemplate | null,
    variables: Map<string, any>,
    withContext: boolean,
    ignoreMissing: boolean,
    sandboxed: boolean
): Promise<TwingMarkup> {
    const from = template.name;

    if (!isPlainObject(variables) && !isTraversable(variables)) {
        const isVariablesNullOrUndefined = variables === null || variables === undefined;

        return Promise.reject(createRuntimeError(`Variables passed to the "include" function or tag must be iterable, got "${!isVariablesNullOrUndefined ? typeof variables : variables}".`, undefined, from));
    }

    variables = iteratorToMap(variables);

    if (withContext) {
        variables = mergeIterables(context, variables);
    }

    if (!isAMapLike(templates)) {
        templates = new Map([[0, templates]]);
    }

    const resolveTemplate = (templates: Map<number, string | TwingTemplate | null>): Promise<TwingTemplate | null> => {
        return template.resolveTemplate([...templates.values()])
            .catch((error) => {
                if (!ignoreMissing) {
                    throw error;
                } else {
                    return null;
                }
            });
    };

    const {charset} = template;

    return resolveTemplate(templates)
        .then((template) => {
            outputBuffer.start();
            
            if (template) {
                return template.render(
                    createContext(variables),
                    {
                        outputBuffer,
                        sandboxed,
                        sourceMapRuntime: sourceMapRuntime || undefined
                    }
                );
            } else {
                return Promise.resolve('');
            }
        })
        .then(() => {
            const result = outputBuffer.getAndClean();
            
            return createMarkup(result, charset);
        });
}
