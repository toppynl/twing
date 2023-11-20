import {TwingRuntimeError} from "./error/runtime";
import {TwingSource} from "./source";
import {isATwingError, TwingError} from "./error";
import {createOutputBuffer, TwingOutputBuffer} from './output-buffer';
import {iteratorToMap} from "./helpers/iterator-to-map";
import {mergeIterables} from "./helpers/merge-iterables";
import {createContext, TwingContext} from "./context";
import {isMapLike} from "./helpers/map-like";
import {TwingRuntime} from "./runtime";
import {isATemplateLoadingError} from "./error/loader";
import {PassThrough, Readable, Writable} from "stream";
import {TwingSourceMapRuntime} from "./source-map-runtime";

export type TemplateBlocksMap = Map<string, [TwingTemplate, string]>;
export type TemplateBlockHandler = (context: Record<string, any>, outputBuffer: TwingOutputBuffer, blocks: TemplateBlocksMap, sourceMapRuntime?: TwingSourceMapRuntime) => Promise<void>;
export type TemplateMacroHandler = (outputBuffer: TwingOutputBuffer, sourceMapRuntime: TwingSourceMapRuntime | undefined, ...args: Array<any>) => Promise<string>;

type TemplateAliasesMap = TwingContext<string, TwingTemplate>;

export interface TwingTemplate {
    readonly aliases: TemplateAliasesMap;
    readonly blockHandlers: Map<string, TemplateBlockHandler>;
    readonly canBeUsedAsATrait: boolean;
    readonly macroHandlers: Map<string, TemplateMacroHandler>;
    readonly runtime: TwingRuntime;
    readonly source: TwingSource;
    readonly templateName: string;

    callMacro(
        template: TwingTemplate,
        name: string,
        outputBuffer: TwingOutputBuffer,
        args: Array<any>,
        line: number,
        context: TwingContext<any, any>,
        source: TwingSource,
        sourceMapRuntime?: TwingSourceMapRuntime
    ): Promise<string>;

    display(
        context: Record<string, any>,
        blocks?: TemplateBlocksMap,
        outputBuffer?: TwingOutputBuffer,
        sourceMapRuntime?: TwingSourceMapRuntime
    ): Readable;

    displayBlock(
        name: string,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TemplateBlocksMap,
        useBlocks: boolean,
        sourceMapRuntime?: TwingSourceMapRuntime
    ): Promise<void>;

    getBlocks(): Promise<TemplateBlocksMap>;

    getParent(context: Record<string, any>): Promise<TwingTemplate | null>;

    getTraceableHasBlock(line: number, source: TwingSource): TwingTemplate["hasBlock"];

    getTraceableMethod<M extends (...args: Array<any>) => Promise<any>>(method: M, line: number, source: TwingSource): M;

    getTraceableRenderBlock(lineno: number, source: TwingSource): TwingTemplate["renderBlock"];

    getTraceableRenderParentBlock(line: number, source: TwingSource): TwingTemplate["renderParentBlock"];

    hasBlock(
        name: string,
        context: TwingContext<any, any>,
        blocks?: TemplateBlocksMap,
    ): Promise<boolean>;

    hasMacro(name: string): Promise<boolean>;

    loadTemplate(
        templates: TwingTemplate | string | null | Map<number, TwingTemplate | null>,
        line: number,
        index?: number
    ): Promise<TwingTemplate | null>;
    
    render(context: Record<string, any>, outputBuffer?: TwingOutputBuffer, sourceMapRuntime?: TwingSourceMapRuntime): Promise<string>;

    renderBlock(
        name: string,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TemplateBlocksMap,
        useBlocks: boolean,
        sourceMapRuntime?: TwingSourceMapRuntime
    ): Promise<string>;

    renderParentBlock(
        name: string,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        sourceMapRuntime?: TwingSourceMapRuntime
    ): Promise<string>;
}

export const createTemplate = (
    runtime: TwingRuntime,
    source: TwingSource,
    blockHandlers: Map<string, TemplateBlockHandler>,
    macroHandlers: Map<string, TemplateMacroHandler>,
    display: (context: Record<string, any>, outputBuffer: TwingOutputBuffer, blocks: TemplateBlocksMap, sourceMapRuntime?: TwingSourceMapRuntime) => Promise<void>,
    getParent: (context: Record<string, any>) => Promise<TwingTemplate | null>,
    getTraits: () => Promise<TemplateBlocksMap>,
    canBeUsedAsATrait: boolean
): TwingTemplate => {
    let blocks: TemplateBlocksMap | null = null;

    const loadTemplate: TwingTemplate["loadTemplate"] = (templates, line, index = 0) => {
        let promise: Promise<TwingTemplate | null>;

        if (typeof templates === 'string') {
            promise = runtime.loadTemplate(templates, index, source);
        } else if (isMapLike(templates)) {
            promise = runtime.resolveTemplate([...templates.values()], source);
        } else {
            promise = Promise.resolve(templates);
        }

        return promise.catch((error: TwingError) => {
            if (error.line === undefined) {
                error.line = line;
            }

            throw error;
        });
    }

    const displayWithErrorHandling = (
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TemplateBlocksMap,
        sourceMapRunTime?: TwingSourceMapRuntime
    ): Promise<void> => {
        return display(context, outputBuffer, blocks, sourceMapRunTime)
            .catch((error: any) => {
                if (isATwingError(error)) {
                    if (!error.source) {
                        error.source = source;
                    }

                    if (isATemplateLoadingError(error)) {
                        error = new TwingRuntimeError(error.message, error.line, error.source, error);
                    }
                } else {
                    error = new TwingRuntimeError(`An exception has been thrown during the rendering of a template ("${error.message}").`, undefined, source, error);
                }

                throw error;
            });
    };

    const displayParentBlock = (name: string, context: any, outputBuffer: TwingOutputBuffer, blocks: TemplateBlocksMap, sourceMapRuntime?: TwingSourceMapRuntime): Promise<void> => {
        return getTraits().then((traits) => {
            if (traits.has(name)) {
                const [blockTemplate, blockName] = traits.get(name)!;

                return blockTemplate.displayBlock(
                    blockName, 
                    context, 
                    outputBuffer, 
                    blocks, 
                    false, 
                    sourceMapRuntime
                );
            } else {
                return template.getParent(context)
                    .then((parent) => {
                        if (parent !== null) {
                            return parent.displayBlock(name, context, outputBuffer, blocks, false, sourceMapRuntime);
                        } else {
                            throw new TwingRuntimeError(`The template has no parent and no traits defining the "${name}" block.`, undefined, source);
                        }
                    });
            }
        });
    };

    const aliases: TemplateAliasesMap = createContext();

    const displayWithOutputBuffer = (context: Record<string, any>, blocks: TemplateBlocksMap, outputBuffer: TwingOutputBuffer, sourceMapRunTime?: TwingSourceMapRuntime): Readable => {
        const stream = new PassThrough();

        outputBuffer.outputStream.pipe(stream);

        template.getBlocks()
            .then((ownBlocks) => {
                return displayWithErrorHandling(
                    createContext(runtime.mergeGlobals(iteratorToMap(context))),
                    outputBuffer!,
                    mergeIterables(ownBlocks, blocks),
                    sourceMapRunTime
                );
            })
            .catch((error: Error) => {
                stream.emit("error", error);
            })
            .finally(() => {
                stream.end();
            });

        return stream;
    };

    const template: TwingTemplate = {
        get aliases() {
            return aliases;
        },
        get blockHandlers() {
            return blockHandlers;
        },
        get canBeUsedAsATrait() {
            return canBeUsedAsATrait;
        },
        get macroHandlers() {
            return macroHandlers;
        },
        get runtime() {
            return runtime;
        },
        get source() {
            return source;
        },
        get templateName() {
            return source.name;
        },
        callMacro: (template, name, outputBuffer, args, line, context, source, sourceMapRuntime) => {
            const getHandler = (template: TwingTemplate): Promise<TemplateMacroHandler | null> => {
                if (template.macroHandlers.has(name)) {
                    return Promise.resolve(template.macroHandlers.get(name)!);
                } else {
                    return template.getParent(context).then((parent) => {
                        if (parent) {
                            return getHandler(parent);
                        } else {
                            return null;
                        }
                    });
                }
            };

            return getHandler(template).then((handler) => {
                if (handler) {
                    return handler(outputBuffer, sourceMapRuntime, ...args);
                } else {
                    throw new TwingRuntimeError(`Macro "${name}" is not defined in template "${template.templateName}".`, line, source);
                }
            });
        },
        display: (context, blocks = new Map(), outputBuffer, sourceMapRuntime) => {
            if (!outputBuffer) {
                outputBuffer = createOutputBuffer();
                outputBuffer.start();
            }

            return displayWithOutputBuffer(context, blocks, outputBuffer, sourceMapRuntime);
        },
        displayBlock: (name, context, outputBuffer, blocks, useBlocks, sourceMapRuntime) => {
            return template.getBlocks().then((ownBlocks) => {
                let blockHandler: TemplateBlockHandler | undefined;

                let block: [TwingTemplate, string] | undefined;
                
                if (useBlocks && (block = blocks.get(name)) !== undefined) {
                    const [blockTemplate, blockName] = block;

                    blockHandler = blockTemplate.blockHandlers.get(blockName);
                } else if ((block = ownBlocks.get(name)) !== undefined) {
                    const [blockTemplate, blockName] = block;

                    blockHandler = blockTemplate.blockHandlers.get(blockName);
                }

                if (blockHandler) {
                    return blockHandler(context, outputBuffer, blocks, sourceMapRuntime);
                } else {
                    return template.getParent(context).then((parent) => {
                        if (parent) {
                            return parent.displayBlock(name, context, outputBuffer, mergeIterables(ownBlocks, blocks), false, sourceMapRuntime);
                        } else if (blocks.has(name)) {
                            const [blockTemplate] = blocks.get(name)!;

                            throw new TwingRuntimeError(`Block "${name}" should not call parent() in "${blockTemplate.templateName}" as the block does not exist in the parent template "${template.templateName}".`, undefined, blockTemplate.source);
                        } else {
                            throw new TwingRuntimeError(`Block "${name}" on template "${template.templateName}" does not exist.`, undefined, template.source);
                        }
                    });

                }
            });
        },
        getBlocks: () => {
            if (blocks) {
                return Promise.resolve(blocks);
            } else {
                return getTraits().then((traits) => {
                    blocks = mergeIterables(traits, new Map([...template.blockHandlers.keys()].map((key) => [key, [template, key]])));

                    return blocks;
                });
            }
        },
        getParent,
        getTraceableHasBlock: (line, source) => {
            return template.getTraceableMethod(template.hasBlock, line, source);
        },
        getTraceableMethod: (method, line, source) => {
            return ((...args: Array<any>) => {
                return method(...args).catch((error) => {
                    if (isATwingError(error)) {
                        if (error.line === undefined) {
                            error.line = line;
                            error.source = source;
                        }
                    } else {
                        throw new TwingRuntimeError(`An exception has been thrown during the rendering of a template ("${error.message}").`, line, source, error);
                    }

                    throw error;
                });
            }) as typeof method;
        },
        getTraceableRenderBlock: (line, source) => {
            return template.getTraceableMethod(template.renderBlock, line, source);
        },
        getTraceableRenderParentBlock: (line, source) => {
            return template.getTraceableMethod(template.renderParentBlock, line, source);
        },
        hasBlock: (name, context, blocks = new Map()): Promise<boolean> => {
            if (blocks.has(name)) {
                return Promise.resolve(true);
            } else {
                return template.getBlocks().then((blocks) => {
                    if (blocks.has(name)) {
                        return Promise.resolve(true);
                    } else {
                        return template.getParent(context).then((parent) => {
                            if (parent) {
                                return parent.hasBlock(name, context, blocks);
                            } else {
                                return false;
                            }
                        });
                    }
                })
            }
        },
        hasMacro: (name) => {
            // @see https://github.com/twigphp/Twig/issues/3174 as to why we don't check macro existence in parents
            return Promise.resolve(template.macroHandlers.has(name));
        },
        loadTemplate,
        render: (context, outputBuffer, sourceMapRuntime) => {
            return new Promise((resolve, reject) => {
                const actualOutputBuffer: TwingOutputBuffer = outputBuffer || createOutputBuffer();

                actualOutputBuffer.start();

                const stream = template.display(context, undefined, actualOutputBuffer, sourceMapRuntime);

                stream.on("error", (error) => {
                    reject(error);
                });

                stream.on("end", () => {
                    const data = actualOutputBuffer.getAndClean()

                    resolve(data);
                });

                stream.pipe(new Writable());
            });
        },
        renderBlock: (name, context, outputBuffer, blocks, useBlocks, sourceMapRuntime) => {
            outputBuffer.start();

            return template.displayBlock(name, context, outputBuffer, blocks, useBlocks, sourceMapRuntime).then(() => {
                return outputBuffer.getAndClean();
            });
        },
        renderParentBlock: (name, context, outputBuffer, sourceMapRuntime) => {
            outputBuffer.start();

            return template.getBlocks().then((blocks) => {
                return displayParentBlock(name, context, outputBuffer, blocks, sourceMapRuntime).then(() => {
                    return outputBuffer.getAndClean();
                })
            });
        }
    };

    return template;
};
