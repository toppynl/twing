import type {TwingSource} from "../source";
import {TwingLoader} from "../loader";
import {isAbsolute, join, dirname, resolve as pathResolve} from "path";
import {createSource} from "../source";

/**
 * Loads template from the filesystem relatively to the template that initiated the load.
 */
export interface TwingRelativeFilesystemLoader extends TwingLoader {
}

interface Stats {
    isDirectory(): boolean;

    isFile(): boolean;

    readonly mtime: Date;
}

export interface TwingRelativeFilesystemLoaderFilesystem {
    stat(path: string, callback: (error: Error | null, stats: Stats | null) => void): void;

    readFile(path: string, callback: (error: Error | null, data: Buffer | null) => void): void;
}

export const createRelativeFilesystemLoader = (
    filesystem: TwingRelativeFilesystemLoaderFilesystem
): TwingRelativeFilesystemLoader => {
    let cache: Map<string, string> = new Map();

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

    const getSourceContext: TwingLoader["getSourceContext"] = (name, from) => {
        return findTemplate(name, from)
            .then((path) => {
                if (path === null) {
                    return null;
                } else {
                    return new Promise<TwingSource>((resolve, reject) => {
                        filesystem.readFile(path!, (error, data) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(createSource(name, data!.toString(), path!));
                            }
                        });
                    });
                }
            });
    };

    const getCacheKey: TwingLoader["getCacheKey"] = (name, from) => {
        return Promise.resolve(normalizeName(resolvePathFromSource(name, from)));
    };

    const exists: TwingLoader["exists"] = (name, from) => {
        name = normalizeName(resolvePathFromSource(name, from));

        if (cache.has(name)) {
            return Promise.resolve(true);
        }

        return findTemplate(name, from).then((name) => {
            return name !== null;
        });
    }

    const isFresh: TwingLoader["isFresh"] = (name, time, from) => {
        return findTemplate(name, from)
            .then((name) => {
                if (name === null) {
                    return true;
                } else {
                    return stat(name)
                        .then((stats) => {
                            return stats!.mtime.getTime() <= time;
                        });
                }
            });
    };

    /**
     * Checks if the template can be found.
     *
     * @param {string} name  The template name
     * @param {TwingSource} from The source that initiated the template loading
     *
     * @returns {Promise<string>} The template name or null
     */
    const findTemplate = (name: string, from: string | null): Promise<string | null> => {
        let _do = (): Promise<string | null> => {
            name = normalizeName(resolvePathFromSource(name, from));

            const template = cache.get(name);

            if (template) {
                return Promise.resolve(template);
            }

            return stat(name)
                .then((stats) => {
                    if (stats?.isFile()) {
                        const templatePath = pathResolve(name);

                        cache.set(name, templatePath);

                        return templatePath;
                    } else {
                        return null;
                    }
                });
        };

        return _do();
    };

    const normalizeName = (name: string) => {
        return name.replace(/\\/g, '/').replace(/\/{2,}/g, '/')
    };

    const resolve: TwingLoader["resolve"] = (name, from) => {
        return findTemplate(name, from);
    };

    const resolvePathFromSource = (name: string, from: string | null): string => {
        if (name && from && !isAbsolute(name)) {
            name = join(dirname(from), name);
        }

        return name;
    };

    return {
        exists,
        isFresh,
        getCacheKey,
        getSourceContext,
        resolve
    };
}
