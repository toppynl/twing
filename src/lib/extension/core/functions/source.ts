import {createTemplateLoadingError} from "../../../error/loader";
import {TwingTemplate} from "../../../template";

/**
 * Returns a template content without rendering it.
 *
 * @param {TwingTemplate} template
 * @param {string} name The template name
 * @param {boolean} ignoreMissing Whether to ignore missing templates or not
 *
 * @return {Promise<string>} The template source
 */
export const source = (template: TwingTemplate, name: string, ignoreMissing: boolean): Promise<string | null> => {
    return template.getTemplateSource(name)
        .then((source) => {
            if (!ignoreMissing && (source === null)) {
                throw createTemplateLoadingError([name]);
            }

            return source?.code || null;
        });
};
