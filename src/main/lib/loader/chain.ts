import type {TwingLoader, TwingSynchronousLoader} from "../loader";
import type {TwingSource} from "../source";

export interface TwingChainLoader extends TwingLoader {
    readonly loaders: Array<TwingLoader>;

    addLoader(loader: TwingLoader): void;
}

export interface TwingSynchronousChainLoader extends TwingSynchronousLoader {
    readonly loaders: Array<TwingSynchronousLoader>;

    addLoader(loader: TwingSynchronousLoader): void;
}

export const createChainLoader = (
    loaders: Array<TwingLoader>
): TwingChainLoader => {
    let existsCache: Map<string, boolean> = new Map();

    const addLoader: TwingChainLoader["addLoader"] = (loader) => {
        loaders.push(loader);
        existsCache = new Map();
    };

    const loader: TwingChainLoader = {
        get loaders() {
            return loaders
        },
        addLoader,
        exists: (name, from) => {
            const cachedResult = existsCache.get(name);
            
            if (cachedResult) {
                return Promise.resolve(cachedResult);
            }

            const existsAtIndex = (index: number): Promise<boolean> => {
                if (index < loaders.length) {
                    const loader = loaders[index];

                    return loader.exists(name, from)
                        .then((exists) => {
                            existsCache.set(name, exists);

                            if (!exists) {
                                return existsAtIndex(index + 1);
                            } else {
                                return true;
                            }
                        });
                } else {
                    return Promise.resolve(false);
                }
            };

            return existsAtIndex(0).then((exists) => {
                existsCache.set(name, exists);

                return exists;
            })
        },
        resolve: (name, from) => {
            const resolveAtIndex = (index: number): Promise<string | null> => {
                if (index < loaders.length) {
                    const loader = loaders[index];

                    return loader.exists(name, from)
                        .then((exists) => {
                            if (!exists) {
                                return resolveAtIndex(index + 1);
                            } else {
                                return loader.resolve(name, from);
                            }
                        })
                        .then((key) => {
                            if (key === null) {
                                return resolveAtIndex(index + 1);
                            }

                            return key;
                        });
                } else {
                    return Promise.resolve(null);
                }
            };

            return resolveAtIndex(0)
                .then((key) => {
                    if (key) {
                        return key;
                    } else {
                        return null;
                    }
                });
        },
        getSource: (name, from) => {
            const getSourceContextAtIndex = (index: number): Promise<TwingSource | null> => {
                if (index < loaders.length) {
                    let loader = loaders[index];

                    return loader.getSource(name, from)
                        .then((source) => {
                            if (source === null) {
                                return getSourceContextAtIndex(index + 1);
                            }

                            return source;
                        });
                } else {
                    return Promise.resolve(null);
                }
            };

            return getSourceContextAtIndex(0)
                .then((source) => {
                    if (source) {
                        return source;
                    } else {
                        return null;
                    }
                });
        },
        isFresh: (name, time, from) => {
            const isFreshAtIndex = (index: number): Promise<boolean | null> => {
                if (index < loaders.length) {
                    const loader = loaders[index];

                    return loader.isFresh(name, time, from)
                        .then((isFresh) => {
                            if (isFresh === null) {
                                return isFreshAtIndex(index + 1);
                            }
                            
                            return isFresh;
                        });
                } else {
                    return Promise.resolve(null);
                }
            };

            return isFreshAtIndex(0);
        }
    };

    return loader;
};

export const createSynchronousChainLoader = (
    loaders: Array<TwingSynchronousLoader>
): TwingSynchronousChainLoader => {
    let existsCache: Map<string, boolean> = new Map();

    const addLoader: TwingSynchronousChainLoader["addLoader"] = (loader) => {
        loaders.push(loader);
        existsCache = new Map();
    };

    const loader: TwingSynchronousChainLoader = {
        get loaders() {
            return loaders
        },
        addLoader,
        exists: (name, from) => {
            const cachedResult = existsCache.get(name);

            if (cachedResult) {
                return cachedResult;
            }

            const existsAtIndex = (index: number): boolean => {
                if (index < loaders.length) {
                    const loader = loaders[index];

                    const exists = loader.exists(name, from);

                    existsCache.set(name, exists);

                    if (!exists) {
                        return existsAtIndex(index + 1);
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            };

            const exists = existsAtIndex(0);
            
            existsCache.set(name, exists);

            return exists;
        },
        resolve: (name, from) => {
            const resolveAtIndex = (index: number): string | null => {
                if (index < loaders.length) {
                    const loader = loaders[index];

                    const exists = loader.exists(name, from);
                    
                    const key = exists ? loader.resolve(name, from) : resolveAtIndex(index + 1);
                    
                    if (key === null) {
                        return resolveAtIndex(index + 1);
                    }

                    return key;
                } else {
                    return null;
                }
            };

            const key = resolveAtIndex(0);
            
            if (key) {
                return key;
            } else {
                return null;
            }
        },
        getSource: (name, from) => {
            const getSourceContextAtIndex = (index: number): TwingSource | null => {
                if (index < loaders.length) {
                    let loader = loaders[index];

                    const source = loader.getSource(name, from);
                    
                    if (source === null) {
                        return getSourceContextAtIndex(index + 1);
                    }

                    return source;
                } else {
                    return null;
                }
            };

            const source = getSourceContextAtIndex(0);
            
            if (source) {
                return source;
            } else {
                return null;
            }
        },
        isFresh: (name, time, from) => {
            const isFreshAtIndex = (index: number): boolean | null => {
                if (index < loaders.length) {
                    const loader = loaders[index];

                    const isFresh = loader.isFresh(name, time, from);
                    
                    if (isFresh === null) {
                        return isFreshAtIndex(index + 1);
                    }

                    return isFresh;
                } else {
                    return null;
                }
            };

            return isFreshAtIndex(0);
        }
    };

    return loader;
};
