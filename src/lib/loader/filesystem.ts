import type {TwingLoader} from "../loader";
import type {TwingSource} from "../source";
import {join, isAbsolute, dirname, normalize} from "path";
import {createSource} from "../source";

const rtrim = require('locutus/php/strings/rtrim');

interface Stats {
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
    addPath(path: string, namespace: string): void;

    /**
     * Prepends a path where templates are stored.
     *
     * @param {string} path A path where to look for templates
     * @param {string} namespace A path namespace
     */
    prependPath(path: string, namespace: string): void;
}

export const createFilesystemLoader = (
    filesystem: TwingFilesystemLoaderFilesystem
): TwingFilesystemLoader => {
    const namespacedPaths: Map<string, Array<string>> = new Map();
    
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

    const resolvePathFromSource = (name: string, from: string): string => {
        if (name && !isAbsolute(name) && name.startsWith('.')) {
            name = join(dirname(from), name);
        }

        return name;
    };

    // todo: rework
    // * if no slash, resolve from "from"
    // * if contains a slash, extract namespace and check if registered:
    //   * if so, resolve from namespace
    // * if not found yet, resolve from "from"
    const resolve = (name: string, from: string | null): Promise<string | null> => {
        name = normalize(from ? resolvePathFromSource(name, from) : name);

        const findTemplateInPath = async (path: string): Promise<string | null> => {
            const stats = await stat(path);
            
            if (stats && stats.isFile()) {
                return Promise.resolve(path);
            } else {
                return Promise.resolve(null);
            }
        };

        // first search for the template from its fully qualified name
        return findTemplateInPath(name)
            .then((templatePath) => {
                if (templatePath) {
                    return templatePath;
                } else {
                    // then, search for the template from its namespaced name
                    const [namespace, shortname] = parseName(name);
                    
                    const paths = (namespace && namespacedPaths.get(namespace)) || ['.'];

                    const findTemplateInPathAtIndex = async (index: number): Promise<string | null> => {
                        if (index < paths.length) {
                            const path = paths[index];
                            const templatePath = await findTemplateInPath(join(path, shortname));

                            if (templatePath) {
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
                }
            });
    };

    const parseName = (name: string): [string | null, string] => {
        // only non-relative names can be namespace references
        if (name[0] !== '.') {
            const position = name.indexOf('/');

            if (position >= 0) {
                const namespace = name.substring(0, position);
                const shortname = name.substring(position + 1);

                return [namespace, shortname];
            }
        }

        return [null, name];
    };

    const addPath: TwingFilesystemLoader["addPath"] = (path, namespace) => {
        let namespacePaths = namespacedPaths.get(namespace);

        if (!namespacePaths) {
            namespacePaths = [];

            namespacedPaths.set(namespace, namespacePaths);
        }

        namespacePaths.push(rtrim(path, '\/\\\\'));
    }

    const prependPath: TwingFilesystemLoader["prependPath"] = (path, namespace) => {
        path = rtrim(path, '\/\\\\');

        const namespacePaths = namespacedPaths.get(namespace);

        if (!namespacePaths) {
            namespacedPaths.set(namespace!, [path]);
        } else {
            namespacePaths.unshift(path);
        }
    }

    return {
        addPath,
        exists: (name, from) => {
            return resolve(name, from)
                .then((path) => {
                    return path !== null;
                });
        },
        resolve,
        getSource: (name, from) => {
            return resolve(name, from)
                .then((path) => {
                    if (path === null) {
                        return null;
                    } else {
                        return new Promise<TwingSource | null>((resolve, reject) => {
                            filesystem.readFile(path, (error, data) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(createSource(path, data!.toString()));
                                }
                            });
                        });
                    }
                });
        },
        isFresh: (name, time, from) => {
            return resolve(name, from)
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
        prependPath
    };
};
