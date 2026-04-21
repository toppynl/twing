import type {TwingExtension, TwingLoader, TwingSynchronousExtension, TwingSynchronousLoader} from "@toppynl/twing";
import {createSource} from "@toppynl/twing";
import {createPropsTagHandler} from "./tag-handler/props";
import {createComponentTagHandler} from "./tag-handler/component";
import {createComponentFunction, createSynchronousComponentFunction} from "./function/component";
import {preLexComponents} from "./pre-lexer";

export const packageName = "@toppynl/twing-components";

export {ComponentAttributes} from "./component-attributes";
export {preLexComponents} from "./pre-lexer";

export type ComponentsExtensionOptions = {
    templateFinder?: (name: string) => string;
};

export const defaultTemplateFinder = (name: string): string => `components/${name}.html.twig`;

export const createComponentsExtension = (options: ComponentsExtensionOptions = {}): TwingExtension => {
    const templateFinder = options.templateFinder ?? defaultTemplateFinder;

    return {
        filters: [],
        functions: [createComponentFunction(templateFinder)],
        nodeVisitors: [],
        operators: [],
        tagHandlers: [
            createPropsTagHandler(),
            createComponentTagHandler(templateFinder)
        ],
        tests: []
    };
};

export const createSynchronousComponentsExtension = (options: ComponentsExtensionOptions = {}): TwingSynchronousExtension => {
    const templateFinder = options.templateFinder ?? defaultTemplateFinder;

    return {
        filters: [],
        functions: [createSynchronousComponentFunction(templateFinder)],
        nodeVisitors: [],
        operators: [],
        tagHandlers: [
            createPropsTagHandler(),
            createComponentTagHandler(templateFinder)
        ],
        tests: []
    };
};

export const wrapLoaderWithPreLexer = (loader: TwingLoader): TwingLoader => {
    return {
        resolve: loader.resolve.bind(loader),
        isFresh: loader.isFresh.bind(loader),
        exists: loader.exists.bind(loader),
        getSource: async (name, from) => {
            const source = await loader.getSource(name, from);

            if (source === null) {
                return null;
            }

            return createSource(source.name, preLexComponents(source.code));
        }
    };
};

export const wrapSynchronousLoaderWithPreLexer = (loader: TwingSynchronousLoader): TwingSynchronousLoader => {
    return {
        resolve: loader.resolve.bind(loader),
        isFresh: loader.isFresh.bind(loader),
        exists: loader.exists.bind(loader),
        getSource: (name, from) => {
            const source = loader.getSource(name, from);

            if (source === null) {
                return null;
            }

            return createSource(source.name, preLexComponents(source.code));
        }
    };
};
