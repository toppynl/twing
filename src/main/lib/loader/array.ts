import type {TwingLoader} from "../loader";
import {createSource} from "../source";

export interface TwingArrayLoader extends TwingLoader {
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
