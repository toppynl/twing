import type {TwingLoader, TwingSynchronousLoader} from "../loader";
import {createSource} from "../source";

export interface TwingArrayLoader extends TwingLoader {
    setTemplate(name: string, template: string): void;
}

export interface TwingSynchronousArrayLoader extends TwingSynchronousLoader {
    setTemplate(name: string, template: string): void;
}

export const createArrayLoader = (
    templates: Record<string, string>
): TwingArrayLoader => {
    const loader: TwingArrayLoader = {
        setTemplate: (name, template) => {
            templates[name] = template;
        },
        getSource: (name, from) => {
            return loader.exists(name, from)
                .then((exists) => {
                    if (!exists) {
                        return null;
                    }

                    return createSource(name, templates[name]);
                });
        },
        exists(name) {
            return Promise.resolve(templates[name] !== undefined);
        },
        resolve: (name, from) => {
            return loader.exists(name, from)
                .then((exists) => {
                    if (!exists) {
                        return null;
                    }

                    return name;
                });
        },
        isFresh: () => {
            return Promise.resolve(true)
        }
    };

    return loader;
};

export const createSynchronousArrayLoader = (
    templates: Record<string, string>
): TwingSynchronousArrayLoader => {
    const loader: TwingSynchronousArrayLoader = {
        setTemplate: (name, template) => {
            templates[name] = template;
        },
        getSource: (name, from) => {
            if (loader.exists(name, from)) {
                return createSource(name, templates[name]);

            }

            return null;
        },
        exists(name) {
            return templates[name] !== undefined;
        },
        resolve: (name, from) => {
            if (loader.exists(name, from)) {
                return name;
            }

            return null;
        },
        isFresh: () => {
            return true;
        }
    };

    return loader;
};
