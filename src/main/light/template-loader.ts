import {createSynchronousTemplate, createTemplate, TwingSynchronousTemplate, type TwingTemplate} from "./template";
import type {TwingTemplateNode} from "./node/template";
import type {TwingEnvironment, TwingSynchronousEnvironment} from "./environment";

/**
 * Loads a template by its name.
 *
 * @param name The name of the template to load
 * @param from The name of the template that requested the load
 */
export type TwingTemplateLoader = (name: string, from: string | null) => Promise<TwingTemplate | null>;

export type TwingSynchronousTemplateLoader = (name: string, from: string | null) => TwingSynchronousTemplate | null;

export const createTemplateLoader = (environment: TwingEnvironment): TwingTemplateLoader => {
    const registry: Map<string, TwingTemplate> = new Map();

    return async (name, from) => {
        const {loader} = environment;

        let templateFqn = await loader.resolve(name, from) || name;
        let loadedTemplate = registry.get(templateFqn);

        if (loadedTemplate) {
            return Promise.resolve(loadedTemplate);
        }
        else {
            const {cache} = environment;
            const timestamp = cache ? await cache.getTimestamp(templateFqn) : 0;

            const getAstFromCache = async (): Promise<TwingTemplateNode | null> => {
                if (cache === null) {
                    return Promise.resolve(null);
                }

                let content: TwingTemplateNode | null;

                const isFresh = await loader.isFresh(name, timestamp, from);

                if (isFresh) {
                    content = await cache.load(templateFqn);
                }
                else {
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
                    await cache.write(templateFqn, ast);
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

export const createSynchronousTemplateLoader = (environment: TwingSynchronousEnvironment): TwingSynchronousTemplateLoader => {
    const registry: Map<string, TwingSynchronousTemplate> = new Map();

    return (name, from) => {
        const {loader} = environment;

        let templateFqn = loader.resolve(name, from) || name;
        let loadedTemplate = registry.get(templateFqn);

        if (loadedTemplate) {
            return loadedTemplate;
        }
        else {
            const {cache} = environment;
            const timestamp = cache ? cache.getTimestamp(templateFqn) : 0;

            const getAstFromCache = (): TwingTemplateNode | null => {
                if (cache === null) {
                    return null;
                }

                let content: TwingTemplateNode | null;

                const isFresh = loader.isFresh(name, timestamp, from);

                if (isFresh) {
                    content = cache.load(templateFqn);
                }
                else {
                    content = null;
                }

                return content;
            };

            const getAstFromLoader = (): TwingTemplateNode | null => {
                const source = loader.getSource(name, from);

                if (source === null) {
                    return null;
                }

                const ast = environment.parse(environment.tokenize(source));

                if (cache !== null) {
                    cache.write(templateFqn, ast);
                }

                return ast;
            };

            let ast = getAstFromCache();

            if (ast === null) {
                ast = getAstFromLoader();
            }

            if (ast === null) {
                return null;
            }

            const template = createSynchronousTemplate(ast);

            registry.set(templateFqn, template);

            return template;
        }
    }
};
