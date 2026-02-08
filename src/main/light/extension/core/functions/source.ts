import {createTemplateLoadingError} from "../../../error/loader";
import type {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";
import {TwingSynchronousTemplate} from "../../../template";

/**
 * Returns a template content without rendering it.
 *
 * @param executionContext
 * @param name The template name
 * @param ignoreMissing Whether to ignore missing templates or not
 *
 * @return The template source
 */
export const source: TwingCallable<[
    name: string,
    ignoreMissing: boolean
], string | null> = (executionContext, name, ignoreMissing) => {
    const {template} = executionContext;

    return template.loadTemplate(executionContext, name)
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

export const sourceSynchronously: TwingSynchronousCallable<[
    name: string,
    ignoreMissing: boolean
], string | null> = (executionContext, name, ignoreMissing) => {
    const {template} = executionContext;

    let loadedTemplate: TwingSynchronousTemplate | null;
    
    try {
        loadedTemplate = template.loadTemplate(executionContext, name)
    }
    catch (error) {
        loadedTemplate = null;
    }

    if (!ignoreMissing && (loadedTemplate === null)) {
        throw createTemplateLoadingError([name]);
    }

    return loadedTemplate?.source.code || null;
};
