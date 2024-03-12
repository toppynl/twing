import {createTemplateLoadingError} from "../../../error/loader";
import type {TwingCallable} from "../../../callable-wrapper";

/**
 * Returns a template content without rendering it.
 *
 * @param executionContext
 * @param name The template name
 * @param ignoreMissing Whether to ignore missing templates or not
 *
 * @return {Promise<string>} The template source
 */
export const source: TwingCallable<[
    name: string,
    ignoreMissing: boolean
], string | null> = (executionContext, name, ignoreMissing) => {
    const {template, environment} = executionContext;

    return environment.loadTemplate(name, template.name)
        .catch(() => {
            return null;
        })
        .then((template) => {
            if (!ignoreMissing && (template === null)) {
                throw createTemplateLoadingError([name]);
            }

            return template?.source.code || null;
        });
};
