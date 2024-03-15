import {createTemplate, type TwingTemplate} from "./template";
import type {TwingTemplateNode} from "./node/template";
import type {TwingEnvironment} from "./environment";

/**
 * Loads a template by its name.
 *
 * @param name The name of the template to load
 * @param from The name of the template that requested the load
 */
export type TwingTemplateLoader = (name: string, from?: string | null) => Promise<TwingTemplate | null>;

export const createTemplateLoader = (environment: TwingEnvironment): TwingTemplateLoader => {
    const registry: Map<string, TwingTemplate> = new Map();

    return async (name, from = null) => {
        const {loader} = environment;

        let templateFqn = await loader.resolve(name, from) || name;
        let loadedTemplate = registry.get(templateFqn);

        if (loadedTemplate) {
            return Promise.resolve(loadedTemplate);
        } else {
            const {cache} = environment;
            const timestamp = cache ? await cache.getTimestamp(templateFqn) : 0;

            const getAstFromCache = async (): Promise<TwingTemplateNode | null> => {
                if (cache === null) {
                    return Promise.resolve(null);
                }

                let content: TwingTemplateNode | null;

                const isFresh = await loader.isFresh(name, timestamp, from);

                if (isFresh) {
                    content = await cache.load(name);
                } else {
                    content = null;
                }

                return content;
            };

            const getAstFromLoader = async (): Promise<TwingTemplateNode | null> => {
                const source = await loader.getSource(name, from);

                if (source === null) {
                    return null;
                }

                const ast = environment.parse(environment.tokenize(source));

                if (cache !== null) {
                    await cache.write(name, ast);
                }

                return ast;
            };

            let ast = await getAstFromCache();

            if (ast === null) {
                ast = await getAstFromLoader();
            }

            if (ast === null) {
                return null;
            }

            const template = createTemplate(ast);

            registry.set(templateFqn, template);

            return template;
        }
    }
};
