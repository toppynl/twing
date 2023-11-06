import type {TwingCache} from "../cache";
import {dirname, join, resolve as resolvePath} from "path";

export interface TwingFilesystemCacheFilesystem {
    stat(path: string, callback: (error: Error | null, stats: {
        mtimeMs: number;
    }) => void): void
    
    mkdir(path: string, options: { 
        recursive: true; 
    },callback: (error: Error | null) => void): void
    
    readFile(path: string, callback: (error: Error | null, data: Buffer | null) => void): void;
    
    writeFile(path: string, data: Buffer, callback: (error: Error | null) => void): void;
}

export const createFilesystemCache = (
    directory: string,
    filesystem: TwingFilesystemCacheFilesystem
): TwingCache => {
    return {
        generateKey: (hash) => {
            return Promise.resolve(hash + '.js');
        },
        load: (key) => {
            const modulePath: string = resolvePath(directory, key);
            
            return new Promise<string>((resolve, reject) => {
                filesystem.stat(modulePath, (error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        filesystem.readFile(modulePath, (error, data) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(data!.toString());
                            }
                        });
                    }
                });
            }).catch(() => null);
        },
        write: (key, content) => {
            const path = join(directory, key);
            
            const ensureDirectory = (): Promise<void> => {
                const pathDirectory = dirname(path);
                
                return new Promise((resolve, reject) => {
                    filesystem.stat(pathDirectory, (error) => {
                        if (error) {
                            filesystem.mkdir(pathDirectory, {recursive: true}, (error) => {
                                if (error) {
                                    reject(error)
                                }
                                else {
                                    resolve();
                                }
                            });
                        }
                        else {
                            resolve();
                        }
                    });
                });
            };
            
            return ensureDirectory()
                .then(() => {
                    return new Promise<void>((resolve, reject) => {
                        filesystem.writeFile(path, Buffer.from(content, 'UTF-8'), (error) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }
                        });
                    });
                })
                .catch(() => {
                    throw new Error(`Failed to write cache file "${key}".`)
                });
        },
        getTimestamp: (key) => {
            return new Promise((resolve) => {
                filesystem.stat(key, (error, stats) => {
                    if (error) {
                        resolve(0);
                    }
                    else {
                        resolve(stats.mtimeMs);
                    }
                })
            });
        }
    };
};
