import type {TwingLoader} from "../loader";
import {iteratorToMap} from "../helpers/iterator-to-map";
import {createSource} from "../source";

export interface TwingArrayLoader extends TwingLoader {
    setTemplate(name: string, template: string): void;
}

export const createArrayLoader = (
    templates: Record<string, string>
): TwingArrayLoader => {
    const registry = iteratorToMap(templates);

    const loader: TwingArrayLoader = {
        setTemplate: (name, template) => {
            registry.set(name, template);
        },
        getSourceContext: (name, from) => {
            return loader.exists(name, from)
                .then((exists) => {
                    if (!exists) {
                        return null;
                    }

                    return createSource(name, registry.get(name));
                });
        },
        exists(name) {
            return Promise.resolve(registry.has(name));
        },
        getCacheKey: (name, from) => {
            return loader.exists(name, from)
                .then((exists) => {
                    if (!exists) {
                        return null;
                    }

                    return name + ':' + registry.get(name);
                });
        },
        isFresh: () => {
            return Promise.resolve(true)
        },
        resolve: (name, from) => {
            return loader.exists(name, from)
                .then((exists) => {
                    if (exists) {
                        return name;
                    }

                    return null;
                });
        }
    };

    return loader;
};
