import {isATemplateLoadingError} from "../../../error/loader";
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
export function source(template: TwingTemplate, name: string, ignoreMissing: boolean = false): Promise<string | null> {
    const environment = template.environment;
    const from = template.source;

    return environment.getLoader().getSourceContext(name, from)
        .then((source) => {
            return source?.code || null;
        })
        .catch((e) => {
            if (isATemplateLoadingError(e)) { // todo: most probably useless since loaders don't throw anymore
                if (!ignoreMissing) {
                    throw e;
                } else {
                    return null;
                }
            } else {
                throw e;
            }
        });
}
