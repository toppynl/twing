import {TwingRuntimeError} from "./error/runtime";
import {Source} from "./source";
import {isATwingError, TwingError} from "./error";
import {TwingOutputBuffer} from './output-buffer';
import {iteratorToMap} from "./helpers/iterator-to-map";
import {merge} from "./helpers/merge";
import {TwingContext} from "./context";
import {isMap} from "./helpers/is-map";
import {Runtime} from "./runtime";
import {isATemplateLoadingError} from "./error/loader";

type TwingTemplateTraceableMethod<T> = (...args: Array<any>) => Promise<T>;

export type TwingTemplateBlocksMap = Map<string, [TwingTemplate, string]>;
// export type TwingTemplateBlockHandler = (context: any, outputBuffer: TwingOutputBuffer, blocks: TwingTemplateBlocksMap) => Promise<void>;
export type TwingTemplateMacroHandler = (outputBuffer: TwingOutputBuffer, ...args: Array<any>) => Promise<string>;

export type TemplateBlocksMap = Map<string, [TwingTemplate, string]>;
export type TemplateBlockHandler = (context: any, outputBuffer: TwingOutputBuffer, blocks: TemplateBlocksMap) => Promise<void>;
export type TemplateMacroHandler = (outputBuffer: TwingOutputBuffer, ...args: Array<any>) => Promise<string>;

type TemplateAliasesMap = TwingContext<string, TwingTemplate>;

export interface TwingTemplate {
    callMacro(
        template: TwingTemplate,
        name: string,
        outputBuffer: TwingOutputBuffer,
        args: Array<any>,
        lineno: number,
        context: TwingContext<any, any>,
        source: Source
    ): Promise<string>;

    display(
        context: Record<string, any>,
        blocks?: TemplateBlocksMap,
        outputBuffer?: TwingOutputBuffer
    ): Promise<void>;

    displayBlock(
        name: string,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TemplateBlocksMap,
        useBlocks: boolean
    ): Promise<void>;

    doDisplay(context: Record<string, any>, outputBuffer: TwingOutputBuffer, blocks: TemplateBlocksMap): Promise<void>;

    doGetParent(context: Record<string, any>): Promise<TwingTemplate | string | false>;

    doGetTraits(): Promise<TemplateBlocksMap>;

    getBlocks(): Promise<TemplateBlocksMap>;

    getParent(context: Record<string, any>): Promise<TwingTemplate | false>;

    getMacro(name: string): Promise<TwingTemplateMacroHandler | null>;

    hasBlock(name: string, context: any, blocks?: TwingTemplateBlocksMap): Promise<boolean>;

    hasMacro(name: string): Promise<boolean>;

    loadTemplate(templates: TwingTemplate | string | null | Map<number, TwingTemplate | null>, line?: number, index?: number): Promise<TwingTemplate | null>;

    render(context: Record<string, any>, outputBuffer?: TwingOutputBuffer): Promise<string>;

    traceableHasBlock(line: number, source: Source): TwingTemplateTraceableMethod<boolean>;

    traceableMethod<T>(method: Function, lineno: number, source: Source): TwingTemplateTraceableMethod<T>;

    traceableRenderBlock(lineno: number, source: Source): TwingTemplateTraceableMethod<string>;

    traceableRenderParentBlock(line: number, source: Source): TwingTemplateTraceableMethod<string>;

    readonly aliases: TemplateAliasesMap;
    readonly environment: Runtime;
    readonly source: Source;
    readonly blockHandlers: Map<string, TemplateBlockHandler>;
    readonly macroHandlers: Map<string, TemplateMacroHandler>;
    readonly templateName: string;
}

export const createBaseTemplate = (
    runtime: Runtime,
    source: Source,
    blockHandlers: Map<string, TemplateBlockHandler>,
    macroHandlers: Map<string, TemplateMacroHandler>
): TwingTemplate => {
    const parents: Map<TwingTemplate | string, TwingTemplate> = new Map();

    let blocks: TemplateBlocksMap | null = null;
    let traits: TemplateBlocksMap | null = null;
    let parent: TwingTemplate | false = false;
    
    const loadTemplate: TwingTemplate["loadTemplate"] = (templates, line, index = 0) => {
        let promise: Promise<TwingTemplate | null>;

        if (typeof templates === 'string') {
            promise = runtime.loadTemplate(templates, index, source);
        } else if (isMap(templates)) {
            promise = runtime.resolveTemplate([...templates.values()], source);
        } else {
            promise = Promise.resolve(templates);
        }

        return promise.catch((error: TwingError) => {
            if (error.line !== undefined) {
                throw error;
            }

            if (line) {
                error.line = line;
            }

            throw error;
        });
    }

    const displayWithErrorHandling = (
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TemplateBlocksMap = new Map()
    ): Promise<void> => {
        return template.doDisplay(context, outputBuffer, blocks).catch((error) => {
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
    }

    const getTraits = (): Promise<TemplateBlocksMap> => {
        if (traits) {
            return Promise.resolve(traits);
        } else {
            return template.doGetTraits().then((resolvedTraits) => {
                traits = resolvedTraits;

                return traits;
            });
        }
    };

    const renderBlock = (
        name: string,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TemplateBlocksMap = new Map(),
        useBlocks = true
    ): Promise<string> => {
        outputBuffer.start();

        return displayBlock(name, context, outputBuffer, blocks, useBlocks).then(() => {
            return outputBuffer.getAndClean() as string;
        });
    };

    const renderParentBlock = (name: string, context: any, outputBuffer: TwingOutputBuffer): Promise<string> => {
        outputBuffer.start();

        return template.getBlocks().then((blocks) => {
            return displayParentBlock(name, context, outputBuffer, blocks).then(() => {
                return outputBuffer.getAndClean() as string;
            })
        });
    }

    const displayBlock = (
        name: string,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TemplateBlocksMap,
        useBlocks: boolean
    ): Promise<void> => {
        return template.getBlocks().then((ownBlocks) => {
            let blockHandler: TemplateBlockHandler | undefined;

            if (useBlocks && blocks.has(name)) {
                const [template, blockHandlerName] = blocks.get(name)!;
                
                blockHandler = template.blockHandlers.get(blockHandlerName);
            } else if (ownBlocks.has(name)) {
                const [template, blockHandlerName] = ownBlocks.get(name)!;

                blockHandler = template.blockHandlers.get(blockHandlerName);
            }

            if (blockHandler) {
                return blockHandler(context, outputBuffer, blocks);
            } else {
                return template.getParent(context).then((parent) => {
                    if (parent) {
                        return parent.displayBlock(name, context, outputBuffer, merge(ownBlocks, blocks), false);
                    } else if (blocks.has(name)) {
                        const [blockTemplate] = blocks.get(name)!;
                        
                        throw new TwingRuntimeError(`Block "${name}" should not call parent() in "${blockTemplate.templateName}" as the block does not exist in the parent template "${template.templateName}".`, undefined, blockTemplate.source);
                    } else {
                        throw new TwingRuntimeError(`Block "${name}" on template "${template.templateName}" does not exist.`, undefined, template.source);
                    }
                });

            }
        });
    };

    const displayParentBlock = (name: string, context: any, outputBuffer: TwingOutputBuffer, blocks: TemplateBlocksMap): Promise<void> => {
        return getTraits().then((traits) => {
            if (traits.has(name)) {
                const [blockTemplate, blockName] = traits.get(name)!;
                
                return blockTemplate.displayBlock(blockName, context, outputBuffer, blocks, false);
            } else {
                return template.getParent(context).then((template) => {
                    if (template !== false) {
                        return template.displayBlock(name, context, outputBuffer, blocks, false);
                    } else {
                        throw new TwingRuntimeError(`The template has no parent and no traits defining the "${name}" block.`, undefined, source);
                    }
                });
            }
        });
    };

    const traceableMethod = <T>(method: Function, line: number, source: Source): TwingTemplateTraceableMethod<T> => {
        return function () {
            return (method.apply(null, arguments) as Promise<T>).catch((error) => {
                if (isATwingError(error)) {
                    if (error.line === undefined) {
                        error.line = line;
                        error.source = source;
                    }
                } else {
                    console.log(error);

                    throw new TwingRuntimeError(`An exception has been thrown during the rendering of a template ("${error.message}").`, line, source, error);
                }

                throw error;
            });
        }
    }

    const aliases: TemplateAliasesMap = new TwingContext();

    const template: TwingTemplate = {
        get aliases() {
            return aliases;
        },
        get environment() {
            return runtime;
        },
        get blockHandlers() {
            return blockHandlers;
        },
        callMacro: (template, name, outputBuffer, args, line, context, source) => {
            const getHandler = (template: TwingTemplate): Promise<TwingTemplateMacroHandler | null> => {
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
                    return handler(outputBuffer, ...args);
                } else {
                    throw new TwingRuntimeError(`Macro "${name}" is not defined in template "${template.templateName}".`, line, source);
                }
            });
        },
        display: (context, blocks = new Map(), outputBuffer?) => {
            return template.getBlocks().then((ownBlocks) => {
                if (!outputBuffer) {
                    outputBuffer = new TwingOutputBuffer();
                }
                
                return displayWithErrorHandling(
                    new TwingContext(runtime.mergeGlobals(iteratorToMap(context))),
                    outputBuffer,
                    merge(ownBlocks, blocks)
                )
            });
        },
        displayBlock: (name, context, outputBuffer, blocks, useBlocks) => {
            return template.getBlocks().then((ownBlocks) => {
                let blockHandler: TemplateBlockHandler | undefined;

                if (useBlocks && blocks.has(name)) {
                    const [blockTemplate, blockName] = blocks.get(name)!;
                    
                    blockHandler = blockTemplate.blockHandlers.get(blockName);
                } else if (ownBlocks.has(name)) {
                    const [blockTemplate, blockName] = ownBlocks.get(name)!;

                    blockHandler = blockTemplate.blockHandlers.get(blockName);
                }

                if (blockHandler) {
                    return blockHandler(context, outputBuffer, blocks);
                } else {
                    return template.getParent(context).then((parent) => {
                        if (parent) {
                            return parent.displayBlock(name, context, outputBuffer, merge(ownBlocks, blocks), false);
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
        doDisplay: () => {
            return Promise.resolve()
        },
        doGetParent: () => {
            return Promise.resolve(false);
        },
        getBlocks: () => {
            if (blocks) {
                return Promise.resolve(blocks);
            } else {
                return getTraits().then((traits) => {
                    blocks = merge(traits, new Map([...template.blockHandlers.keys()].map((key) => [key, [template, key]])));

                    return blocks;
                });
            }
        },
        doGetTraits: () => {
            return Promise.resolve(new Map());
        },
        getMacro: (name) => {
            return template.hasMacro(name)
                .then((hasMacro) => {
                    if (hasMacro) {
                        return template.macroHandlers.get(name)!;
                    } else {
                        return null;
                    }
                })
        },
        getParent: (context) => {
            if (parent) {
                return Promise.resolve(parent);
            }

            return template.doGetParent(context)
                .then((parent) => {
                    if (parent === false || typeof parent !== "string") {
                        if (parent !== false) {
                            parents.set(parent.source.name, parent);
                        }

                        return parent;
                    }

                    // parent is a string
                    if (!parents.has(parent)) {
                        return loadTemplate(parent)
                            .then((template) => {
                                if (template === null) {
                                    return false;
                                }
                                
                                parents.set(parent, template);

                                return template;
                            });
                    } else {
                        return parents.get(parent)!;
                    }
                });
        },
        hasBlock: (name: string, context: any, blocks: TwingTemplateBlocksMap = new Map()): Promise<boolean> => {
            if (blocks.has(name)) {
                return Promise.resolve(true);
            } else {
                return template.getBlocks().then((blocks) => {
                    if (blocks.has(name)) {
                        return Promise.resolve(true);
                    } else {
                        return template.getParent(context).then((parent) => {
                            if (parent) {
                                return parent.hasBlock(name, context);
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
        get macroHandlers() {
            return macroHandlers;
        },
        render: (context, outputBuffer?) => {
            if (!outputBuffer) {
                outputBuffer = new TwingOutputBuffer();
            }

            const level = outputBuffer.getLevel();

            outputBuffer.start();

            return template.display(context, undefined, outputBuffer)
                .then(() => {
                    return outputBuffer!.getAndClean();
                })
                .catch((error) => {
                    while (outputBuffer!.getLevel() > level) {
                        outputBuffer!.endAndClean();
                    }

                    throw error;
                })
        },
        get source() {
            return source;
        },
        get templateName() {
            return source.name;
        },
        traceableHasBlock(lineno: number, source: Source): TwingTemplateTraceableMethod<boolean> {
            return traceableMethod(template.hasBlock.bind(this), lineno, source);
        },
        traceableMethod,
        traceableRenderBlock: (lineno, source) => {
            return traceableMethod(renderBlock.bind(this), lineno, source);
        },
        traceableRenderParentBlock: (line, source) => {
            return template.traceableMethod(renderParentBlock, line, source);
        }
    };

    return template;
};
