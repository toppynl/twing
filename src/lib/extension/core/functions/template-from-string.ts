import type {Template} from "../../../template";

/**
 * Loads a template from a string.
 *
 * <pre>
 * {{ include(template_from_string("Hello {{ name }}")) }}
 * </pre>
 *
 * @param {TwingTemplate} template A TwingTemplate instance
 * @param {string} string A template as a string or object implementing toString()
 * @param {string} name An optional name for the template to be used in error messages
 *
 * @returns {Promise<TwingTemplate>}
 */
export function templateFromString(template: Template, string: string, name: string = null): Promise<Template> {
    return template.environment.createTemplate(string, name);
}
