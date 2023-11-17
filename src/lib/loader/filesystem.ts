import type {TwingLoader} from "../loader";
import type {TwingSource} from "../source";
import {resolve, join, isAbsolute, relative} from "path";
import {createSource} from "../source";

const rtrim = require('locutus/php/strings/rtrim');

export const MAIN_NAMESPACE = '__main__';

interface Stats {
    isDirectory(): boolean;

    isFile(): boolean;

    readonly mtime: Date;
}

export interface TwingFilesystemLoaderFilesystem {
    stat(path: string, callback: (error: Error | null, stats: Stats | null) => void): void;

    readFile(path: string, callback: (error: Error | null, data: Buffer | null) => void): void;
}

export interface TwingFilesystemLoader extends TwingLoader {
    /**
     * Adds a path where templates are stored.
     *
     * @param {string} path A path where to look for templates
     * @param {string} namespace A path namespace
     */
    addPath(path: string, namespace?: string): void;

    /**
     * Returns the path namespaces.
     *
     * The main namespace is always defined.
     *
     * @returns Array<string> The array of defined namespaces
     */
    getNamespaces(): Array<string>;

    /**
     * Returns the paths to the templates.
     *
     * @param {string} namespace A path namespace
     *
     * @returns Array<string> The array of paths where to look for templates
     */
    getPaths(namespace?: string): Array<string>;

    /**
     * Prepends a path where templates are stored.
     *
     * @param {string} path A path where to look for templates
     * @param {string} namespace A path namespace
     */
    prependPath(path: string, namespace?: string): void;

    /**
     * Sets the paths where templates are stored.
     *
     * @param {string|Array<string>} paths A path or an array of paths where to look for templates
     * @param {string} namespace A path namespace
     */
    setPaths(paths: string | Array<string>, namespace?: string): void,
}

export const createFilesystemLoader = (
    filesystem: TwingFilesystemLoaderFilesystem,
    paths: string | Array<string> = [],
    rootPath: string | null = null
): TwingFilesystemLoader => {
    const pathsByNamespace: Map<string, Array<string>> = new Map();

    let cache: Map<string, string> = new Map();

    const actualRootPath = rootPath || '.';

    const stat = (path: string): Promise<Stats | null> => {
        return new Promise((resolve) => {
            filesystem.stat(path, (error, stats) => {
                if (error) {
                    resolve(null);
                } else {
                    resolve(stats);
                }
            });
        });
    };

    const findTemplate = (name: string): Promise<string | null> => {
        name = normalizeName(name);

        const cacheEntry = cache.get(name);

        if (cacheEntry) {
            return Promise.resolve(cacheEntry);
        }

        const [namespace, shortname] = parseName(name);

        const paths = pathsByNamespace.get(namespace);
        
        if (!paths) {
            return Promise.resolve(null);
        }

        const findTemplateInPathAtIndex = async (index: number): Promise<string | null> => {
            if (index < paths.length) {
                let path = paths[index];

                if (!isAbsolute(path)) {
                    path = join(actualRootPath, path);
                }
                
                const stats = await stat(join(path, shortname));

                if (stats && stats.isFile()) {
                    const templatePath = resolve(join(path, shortname));

                    cache.set(name, templatePath);

                    return Promise.resolve(templatePath);
                } else {
                    // let's continue searching
                    return findTemplateInPathAtIndex(index + 1);
                }
            } else {
                return Promise.resolve(null);
            }
        };

        return findTemplateInPathAtIndex(0);
    };

    const getNamespaces: TwingFilesystemLoader["getNamespaces"] = () => {
        return [...pathsByNamespace.keys()];
    };
    
    const normalizeName = (name: string) => {
        return name.replace(/\\/g, '/').replace(/\/{2,}/g, '/')
    };

    const parseName = (name: string, default_: string = MAIN_NAMESPACE) => {
        if (name[0] === '@') {
            let pos = name.indexOf('/');

            if (pos >= 0) {
                let namespace = name.substr(1, pos - 1);
                let shortname = name.substr(pos + 1);

                return [namespace, shortname];
            }
        }

        return [default_, name];
    };

    const addPath: TwingFilesystemLoader["addPath"] = (path, namespace = MAIN_NAMESPACE) => {
        // invalidate the cache
        cache = new Map();

        let namespacePaths = pathsByNamespace.get(namespace);

        if (!namespacePaths) {
            namespacePaths = [];

            pathsByNamespace.set(namespace, namespacePaths);
        }

        namespacePaths.push(rtrim(path, '\/\\\\'));
    }

    const getPaths: TwingFilesystemLoader["getPaths"] = (namespace = MAIN_NAMESPACE) => {
        const namespacePaths = pathsByNamespace.get(namespace);

        return namespacePaths || [];
    };

    const prependPath: TwingFilesystemLoader["prependPath"] = (path, namespace = MAIN_NAMESPACE) => {
        // invalidate the cache
        cache = new Map();

        path = rtrim(path, '\/\\\\');

        const namespacePaths = pathsByNamespace.get(namespace);

        if (!namespacePaths) {
            pathsByNamespace.set(namespace, [path]);
        } else {
            namespacePaths.unshift(path);
        }
    }

    const setPaths: TwingFilesystemLoader["setPaths"] = (paths, namespace = MAIN_NAMESPACE) => {
        if (!Array.isArray(paths)) {
            paths = [paths as string];
        }

        pathsByNamespace.set(namespace, []);

        for (const path of paths) {
            addPath(path, namespace);
        }
    };

    setPaths(paths);

    return {
        addPath,
        exists: (name) => {
            name = normalizeName(name);

            if (cache.has(name)) {
                return Promise.resolve(true);
            }

            return findTemplate(name)
                .then((path) => {
                    return path !== null;
                });
        },
        getCacheKey: (name) => {
            return findTemplate(name)
                .then((path) => {
                    if (path === null) {
                        return null;
                    }

                    return relative(actualRootPath, path);
                });
        },
        getNamespaces,
        getPaths,
        getSourceContext: (name) => {
            return findTemplate(name)
                .then((path) => {
                    if (path === null) {
                        return null;
                    } else {
                        return new Promise<TwingSource | null>((resolve, reject) => {
                            filesystem.readFile(path, (error, data) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(createSource(data!.toString(), name, path));
                                }
                            });
                        });
                    }
                });
        },
        isFresh: (name, time) => {
            return findTemplate(name)
                .then((path) => {
                    if (path === null) {
                        return true;
                    } else {
                        return stat(path)
                            .then((stats) => {
                                return stats!.mtime.getTime() <= time
                            });
                    }
                });
        },
        prependPath,
        resolve(name) {
            return findTemplate(name);
        },
        setPaths
    };
};
