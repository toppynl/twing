import {TwingErrorRuntime} from "./error/runtime";
import {TwingSource} from "./source";
import {TwingError} from "./error";
import {TwingOutputBuffer} from './output-buffer';
import {iteratorToMap} from "./helpers/iterator-to-map";
import {merge} from "./helpers/merge";
import {TwingContext} from "./context";
import {isMap} from "./helpers/is-map";
import {TwingMarkup} from "./markup";
import {TwingSandboxSecurityError} from "./sandbox/security-error";
import {TwingSandboxSecurityNotAllowedFilterError} from "./sandbox/security-not-allowed-filter-error";
import {TwingSandboxSecurityNotAllowedFunctionError} from "./sandbox/security-not-allowed-function-error";
import {TwingSandboxSecurityNotAllowedTagError} from "./sandbox/security-not-allowed-tag-error";
import {compare} from "./helpers/compare";
import {count} from "./helpers/count";
import {isCountable} from "./helpers/count";
import {isPlainObject} from "./helpers/is-plain-object";
import {iterate, IterateCallback} from "./helpers/iterate";
import {isIn} from "./helpers/is-in";
import {ensureTraversable} from "./helpers/ensure-traversable";
import {getAttribute} from "./helpers/get-attribute";
import {createRange} from "./helpers/create-range";
import {cloneMap} from "./helpers/clone-map";
import {parseRegularExpression} from "./helpers/parse-regular-expression";
import {get} from "./helpers/get";
import {include} from "./extension/core/functions/include";
import {isNullOrUndefined} from "util";
import {evaluate} from "./helpers/evaluate";
import {Runtime} from "./runtime";

type TwingTemplateMacrosMap = Map<string, TwingTemplateMacroHandler>;
type TwingTemplateAliasesMap = TwingContext<string, TwingTemplate>;
type TwingTemplateTraceableMethod<T> = (...args: Array<any>) => Promise<T>;

export type TwingTemplateBlocksMap = Map<string, [TwingTemplate, string]>;
export type TwingTemplateBlockHandler = (context: any, outputBuffer: TwingOutputBuffer, blocks: TwingTemplateBlocksMap) => Promise<void>;
export type TwingTemplateMacroHandler = (outputBuffer: TwingOutputBuffer, ...args: Array<any>) => Promise<string>;

export type TemplateBlocksMap = Map<string, [Template, string]>;
export type TemplateBlockHandler = (context: any, outputBuffer: TwingOutputBuffer, blocks: TemplateBlocksMap) => Promise<void>;
export type TemplateMacroHandler = (outputBuffer: TwingOutputBuffer, ...args: Array<any>) => Promise<string>;

type TemplateAliasesMap = TwingContext<string, TwingTemplate>;

export interface Template {
    callMacro(
        template: Template,
        name: string,
        outputBuffer: TwingOutputBuffer,
        args: Array<any>,
        lineno: number,
        context: TwingContext<any, any>,
        source: TwingSource
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

    doGetParent(context: Record<string, any>): Promise<Template | string | false>;

    doGetTraits(): Promise<TemplateBlocksMap>;

    getBlocks(): Promise<TemplateBlocksMap>;

    getParent(context?: Record<string, any>): Promise<Template | false>;

    getMacro(name: string): Promise<TwingTemplateMacroHandler>;

    hasBlock(name: string, context: any, blocks?: TwingTemplateBlocksMap): Promise<boolean>;

    hasMacro(name: string): Promise<boolean>;

    loadTemplate(templates: Template | Map<number, Template> | string, line: number, index: number): Promise<Template>;
    
    render: TwingTemplate["render"];

    traceableHasBlock(line: number, source: TwingSource): TwingTemplateTraceableMethod<boolean>;

    traceableMethod<T>(method: Function, lineno: number, source: TwingSource): TwingTemplateTraceableMethod<T>;

    traceableRenderBlock: TwingTemplate["traceableRenderBlock"];

    traceableRenderParentBlock(line: number, source: TwingSource): TwingTemplateTraceableMethod<string>;

    readonly aliases: TwingTemplate["aliases"];
    readonly environment: TwingTemplate["environment"];
    readonly source: TwingSource;
    readonly blockHandlers: Map<string, TemplateBlockHandler>;
    readonly macroHandlers: Map<string, TemplateMacroHandler>;
    readonly templateName: string;
}

export const createBaseTemplate = (
    runtime: Runtime,
    source: TwingSource,
    blockHandlers: Map<string, TemplateBlockHandler>,
    macroHandlers: Map<string, TemplateMacroHandler>
): Template => {
    const parents: Map<Template | string, Template> = new Map();

    let blocks: TemplateBlocksMap | null = null;
    let traits: TemplateBlocksMap | null = null;
    let parent: Template | false = false;

    const loadTemplate = (templates: Template | Map<number, Template> | string, line: number = null, index: number = 0): Promise<Template> => {
        let promise: Promise<Template>;

        if (typeof templates === 'string') {
            promise = runtime.loadTemplate(templates, index, source);
        } else if (isMap(templates)) {
            promise = runtime.resolveTemplate([...templates.values()], source);
        } else {
            promise = Promise.resolve(templates);
        }

        return promise.catch((e: TwingError) => {
            if (e.getTemplateLine() !== -1) {
                throw e;
            }

            if (line) {
                e.setTemplateLine(line);
            }

            throw e;
        });
    }

    const displayWithErrorHandling = (
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TemplateBlocksMap = new Map()
    ): Promise<void> => {
        return template.doDisplay(context, outputBuffer, blocks).catch((e) => {
            if (e instanceof TwingError) {
                if (!e.getSourceContext()) {
                    e.setSourceContext(source);
                }
            } else {
                e = new TwingErrorRuntime(`An exception has been thrown during the rendering of a template ("${e.message}").`, -1, source, e);
            }

            throw e;
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
            let blockHandler: TemplateBlockHandler;

            if (useBlocks && blocks.has(name)) {
                blockHandler = blocks.get(name)[0].blockHandlers.get(blocks.get(name)[1]);
            } else if (ownBlocks.has(name)) {
                blockHandler = ownBlocks.get(name)[0].blockHandlers.get(ownBlocks.get(name)[1]);
            }

            if (blockHandler) {
                return blockHandler(context, outputBuffer, blocks);
            } else {
                return template.getParent(context).then((parent) => {
                    if (parent) {
                        return parent.displayBlock(name, context, outputBuffer, merge(ownBlocks, blocks), false);
                    } else if (blocks.has(name)) {
                        throw new TwingErrorRuntime(`Block "${name}" should not call parent() in "${blocks.get(name)[0].templateName}" as the block does not exist in the parent template "${template.templateName}".`, -1, blocks.get(name)[0].source);
                    } else {
                        throw new TwingErrorRuntime(`Block "${name}" on template "${template.templateName}" does not exist.`, -1, template.source);
                    }
                });

            }
        });
    };

    const displayParentBlock = (name: string, context: any, outputBuffer: TwingOutputBuffer, blocks: TemplateBlocksMap): Promise<void> => {
        return getTraits().then((traits) => {
            if (traits.has(name)) {
                return traits.get(name)[0].displayBlock(traits.get(name)[1], context, outputBuffer, blocks, false);
            } else {
                return template.getParent(context).then((template) => {
                    if (template !== false) {
                        return template.displayBlock(name, context, outputBuffer, blocks, false);
                    } else {
                        throw new TwingErrorRuntime(`The template has no parent and no traits defining the "${name}" block.`, -1, source);
                    }
                });
            }
        });
    };

    const traceableMethod = <T>(method: Function, lineno: number, source: TwingSource): TwingTemplateTraceableMethod<T> => {
        return function () {
            return (method.apply(null, arguments) as Promise<T>).catch((e) => {
                if (e instanceof TwingError) {
                    if (e.getTemplateLine() === -1) {
                        e.setTemplateLine(lineno);
                        e.setSourceContext(source);
                    }
                } else {
                    throw new TwingErrorRuntime(`An exception has been thrown during the rendering of a template ("${e.message}").`, lineno, source, e);
                }

                throw e;
            });
        }
    }

    const aliases: TemplateAliasesMap = new TwingContext();

    const template: Template = {
        get aliases() {
            return aliases;
        },
        get environment() {
            return runtime;
        },
        get blockHandlers() {
            return blockHandlers;
        },
        callMacro: (template, name, outputBuffer, args, lineno, context, source) => {
            const getHandler = (template: Template): Promise<TwingTemplateMacroHandler> => {
                if (template.macroHandlers.has(name)) {
                    return Promise.resolve(template.macroHandlers.get(name));
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
                    throw new TwingErrorRuntime(`Macro "${name}" is not defined in template "${template.templateName}".`, lineno, source);
                }
            });
        },
        display: (context, blocks = new Map(), outputBuffer?) => {
            if (!outputBuffer) {
                outputBuffer = new TwingOutputBuffer();
            }

            return template.getBlocks().then((ownBlocks) => displayWithErrorHandling(
                new TwingContext(runtime.mergeGlobals(iteratorToMap(context))),
                outputBuffer,
                merge(ownBlocks, blocks)
            ));
        },
        displayBlock: (name, context, outputBuffer, blocks, useBlocks) => {
            return template.getBlocks().then((ownBlocks) => {
                let blockHandler: TemplateBlockHandler;

                if (useBlocks && blocks.has(name)) {
                    blockHandler = blocks.get(name)[0].blockHandlers.get(blocks.get(name)[1]);
                } else if (ownBlocks.has(name)) {
                    blockHandler = ownBlocks.get(name)[0].blockHandlers.get(ownBlocks.get(name)[1]);
                }

                if (blockHandler) {
                    return blockHandler(context, outputBuffer, blocks);
                } else {
                    return template.getParent(context).then((parent) => {
                        if (parent) {
                            return parent.displayBlock(name, context, outputBuffer, merge(ownBlocks, blocks), false);
                        } else if (blocks.has(name)) {
                            throw new TwingErrorRuntime(`Block "${name}" should not call parent() in "${blocks.get(name)[0].templateName}" as the block does not exist in the parent template "${template.templateName}".`, -1, blocks.get(name)[0].source);
                        } else {
                            throw new TwingErrorRuntime(`Block "${name}" on template "${template.templateName}" does not exist.`, -1, template.source);
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
                        return template.macroHandlers.get(name);
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
                            parents.set(parent.source.getName(), parent);
                        }

                        return parent;
                    }

                    // parent is a string
                    if (!parents.has(parent)) {
                        return loadTemplate(parent)
                            .then((template) => {
                                parents.set(parent, template);

                                return template;
                            });
                    } else {
                        return parents.get(parent);
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

            let level = outputBuffer.getLevel();

            outputBuffer.start();

            return template.display(context, undefined, outputBuffer)
                .then(() => {
                    return outputBuffer.getAndClean() as string;
                })
                .catch((e) => {
                    while (outputBuffer.getLevel() > level) {
                        outputBuffer.endAndClean();
                    }

                    throw e;
                })
        },
        get source() {
            return source;
        },
        get templateName() {
            return source.getName();
        },
        traceableHasBlock(lineno: number, source: TwingSource): TwingTemplateTraceableMethod<boolean> {
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

/**
 * Default base class for compiled templates.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingTemplate {
    private _source: TwingSource;

    protected parent: TwingTemplate | false;
    protected parents: Map<TwingTemplate | string, TwingTemplate>;
    protected blocks: TwingTemplateBlocksMap;
    protected blockHandlers: Map<string, TwingTemplateBlockHandler>;
    protected macroHandlers: Map<string, TwingTemplateMacroHandler>;
    protected traits: TwingTemplateBlocksMap;
    protected macros: TwingTemplateMacrosMap;
    protected aliases: TwingTemplateAliasesMap;

    constructor(readonly environment: Runtime) {
        this.parents = new Map();
        this.aliases = new TwingContext();
        this.blockHandlers = new Map();
        this.macroHandlers = new Map();
    }

    /**
     * @returns {TwingSource}
     */
    get source(): TwingSource {
        return this._source;
    }

    /**
     * Returns the template name.
     *
     * @returns {string} The template name
     */
    get templateName(): string {
        return this.source.getName();
    }

    get isTraitable(): boolean {
        return true;
    }

    /**
     * Returns the parent template.
     *
     * @param {any} context
     *
     * @returns {Promise<TwingTemplate|false>} The parent template or false if there is no parent
     */
    public getParent(context: any = {}): Promise<TwingTemplate | false> {
        if (this.parent) {
            return Promise.resolve(this.parent);
        }

        return this.doGetParent(context)
            .then((parent) => {
                if (parent === false || typeof parent !== "string") {
                    if (parent !== false) {
                        this.parents.set(parent.source.getName(), parent);
                    }

                    return parent;
                }

                // parent is a string
                if (!this.parents.has(parent)) {
                    return this.loadTemplate(parent)
                        .then((template: TwingTemplate) => {
                            this.parents.set(parent, template);

                            return template;
                        });
                } else {
                    return this.parents.get(parent);
                }
            });
    }

    /**
     * Returns template blocks.
     *
     * @returns {Promise<TwingTemplateBlocksMap>} A map of blocks
     */
    public getBlocks(): Promise<TwingTemplateBlocksMap> {
        if (this.blocks) {
            return Promise.resolve(this.blocks);
        } else {
            return this.getTraits().then((traits) => {
                this.blocks = merge(traits, new Map([...this.blockHandlers.keys()].map((key) => [key, [this, key]])));

                return this.blocks;
            });
        }
    }

    /**
     * Displays a block.
     *
     * @param {string} name The block name to display
     * @param {any} context The context
     * @param {TwingOutputBuffer} outputBuffer
     * @param {TwingTemplateBlocksMap} blocks The active set of blocks
     * @param {boolean} useBlocks Whether to use the active set of blocks
     *
     * @returns {Promise<void>}
     */
    protected displayBlock(name: string, context: any, outputBuffer: TwingOutputBuffer, blocks: TwingTemplateBlocksMap, useBlocks: boolean): Promise<void> {
        return this.getBlocks().then((ownBlocks) => {
            let blockHandler: TwingTemplateBlockHandler;

            if (useBlocks && blocks.has(name)) {
                blockHandler = blocks.get(name)[0].blockHandlers.get(blocks.get(name)[1]);
            } else if (ownBlocks.has(name)) {
                blockHandler = ownBlocks.get(name)[0].blockHandlers.get(ownBlocks.get(name)[1]);
            }

            if (blockHandler) {
                return blockHandler(context, outputBuffer, blocks);
            } else {
                return this.getParent(context).then((parent) => {
                    if (parent) {
                        return parent.displayBlock(name, context, outputBuffer, merge(ownBlocks, blocks), false);
                    } else if (blocks.has(name)) {
                        throw new TwingErrorRuntime(`Block "${name}" should not call parent() in "${blocks.get(name)[0].templateName}" as the block does not exist in the parent template "${this.templateName}".`, -1, blocks.get(name)[0].source);
                    } else {
                        throw new TwingErrorRuntime(`Block "${name}" on template "${this.templateName}" does not exist.`, -1, this.source);
                    }
                });

            }
        });
    }

    /**
     * Displays a parent block.
     *
     * @param {string} name The block name to display from the parent
     * @param {any} context The context
     * @param {TwingOutputBuffer} outputBuffer
     * @param {TwingTemplateBlocksMap} blocks The active set of blocks
     *
     * @returns {Promise<void>}
     */
    protected displayParentBlock(name: string, context: any, outputBuffer: TwingOutputBuffer, blocks: TwingTemplateBlocksMap): Promise<void> {
        return this.getTraits().then((traits) => {
            if (traits.has(name)) {
                return traits.get(name)[0].displayBlock(traits.get(name)[1], context, outputBuffer, blocks, false);
            } else {
                return this.getParent(context).then((template) => {
                    if (template !== false) {
                        return template.displayBlock(name, context, outputBuffer, blocks, false);
                    } else {
                        throw new TwingErrorRuntime(`The template has no parent and no traits defining the "${name}" block.`, -1, this.source);
                    }
                });
            }
        });
    }

    /**
     * Renders a parent block.
     *
     * @param {string} name The block name to display from the parent
     * @param {*} context The context
     * @param {TwingOutputBuffer} outputBuffer
     * @param {TwingTemplateBlocksMap} blocks The active set of blocks
     *
     * @returns {Promise<string>} The rendered block
     */
    protected renderParentBlock(name: string, context: any, outputBuffer: TwingOutputBuffer, _blocks: TwingTemplateBlocksMap): Promise<string> {
        outputBuffer.start();

        return this.getBlocks().then((blocks) => {
            return this.displayParentBlock(name, context, outputBuffer, blocks).then(() => {
                return outputBuffer.getAndClean() as string;
            })
        });
    }

    /**
     * Renders a block.
     *
     * @param {string} name The block name to display
     * @param {any} context The context
     * @param {TwingOutputBuffer} outputBuffer
     * @param {TwingTemplateBlocksMap} blocks The active set of blocks
     * @param {boolean} useBlocks Whether to use the active set of blocks
     *
     * @return {Promise<string>} The rendered block
     */
    protected renderBlock(name: string, context: any, outputBuffer: TwingOutputBuffer, blocks: TwingTemplateBlocksMap = new Map(), useBlocks = true): Promise<string> {
        outputBuffer.start();

        return this.displayBlock(name, context, outputBuffer, blocks, useBlocks).then(() => {
            return outputBuffer.getAndClean() as string;
        });
    }

    /**
     * Returns whether a block exists or not in the active context of the template.
     *
     * This method checks blocks defined in the active template or defined in "used" traits or defined in parent templates.
     *
     * @param {string} name The block name
     * @param {any} context The context
     * @param {TwingTemplateBlocksMap} blocks The active set of blocks
     *
     * @return {Promise<boolean>} true if the block exists, false otherwise
     */
    public hasBlock(name: string, context: any, blocks: TwingTemplateBlocksMap = new Map()): Promise<boolean> {
        if (blocks.has(name)) {
            return Promise.resolve(true);
        } else {
            return this.getBlocks().then((blocks) => {
                if (blocks.has(name)) {
                    return Promise.resolve(true);
                } else {
                    return this.getParent(context).then((parent) => {
                        if (parent) {
                            return parent.hasBlock(name, context);
                        } else {
                            return false;
                        }
                    });
                }
            })
        }
    }

    /**
     * @param {string} name The name of the macro
     *
     * @return {Promise<boolean>}
     */
    public hasMacro(name: string): Promise<boolean> {
        // @see https://github.com/twigphp/Twig/issues/3174 as to why we don't check macro existence in parents
        return Promise.resolve(this.macroHandlers.has(name));
    }

    /**
     * @param name The name of the macro
     */
    public getMacro(name: string): Promise<TwingTemplateMacroHandler> {
        return this.hasMacro(name).then((hasMacro) => {
            if (hasMacro) {
                return this.macroHandlers.get(name);
            } else {
                return null;
            }
        })
    }

    public loadTemplate(templates: TwingTemplate | Map<number, TwingTemplate> | string, line: number = null, index: number = 0): Promise<TwingTemplate> {
        let promise: Promise<TwingTemplate>;

        if (typeof templates === 'string') {
            // @ts-ignore
            promise = this.environment.loadTemplate(templates, index, this.source);
        } else if (isMap(templates)) {
            // @ts-ignore
            promise = this.environment.resolveTemplate([...templates.values()], this.source);
        } else {
            promise = Promise.resolve(templates);
        }

        return promise.catch((e: TwingError) => {
            if (e.getTemplateLine() !== -1) {
                throw e;
            }

            if (line) {
                e.setTemplateLine(line);
            }

            throw e;
        });
    }

    /**
     * Returns template traits.
     *
     * @returns {Promise<TwingTemplateBlocksMap>} A map of traits
     */
    public getTraits(): Promise<TwingTemplateBlocksMap> {
        if (this.traits) {
            return Promise.resolve(this.traits);
        } else {
            return this.doGetTraits().then((traits) => {
                this.traits = traits;

                return traits;
            });
        }
    }

    protected doGetTraits(): Promise<TwingTemplateBlocksMap> {
        return Promise.resolve(new Map());
    };

    public display(context: Record<string, any>, blocks: TwingTemplateBlocksMap = new Map(), outputBuffer?: TwingOutputBuffer): Promise<void> {
        if (!outputBuffer) {
            outputBuffer = new TwingOutputBuffer();
        }

        return this.getBlocks().then((ownBlocks) => this.displayWithErrorHandling(
            new TwingContext(iteratorToMap(context)),
            outputBuffer,
            merge(ownBlocks, blocks))
        );
    }

    protected displayWithErrorHandling(context: TwingContext<any, any>, outputBuffer: TwingOutputBuffer, blocks: TwingTemplateBlocksMap = new Map()): Promise<void> {
        return this.doDisplay(context, outputBuffer, blocks).catch((e) => {
            if (e instanceof TwingError) {
                if (!e.getSourceContext()) {
                    e.setSourceContext(this.source);
                }
            } else {
                e = new TwingErrorRuntime(`An exception has been thrown during the rendering of a template ("${e.message}").`, -1, this.source, e);
            }

            throw e;
        });
    }

    public render(context: Record<string, any>, outputBuffer?: TwingOutputBuffer): Promise<string> {
        if (!outputBuffer) {
            outputBuffer = new TwingOutputBuffer();
        }

        let level = outputBuffer.getLevel();

        outputBuffer.start();

        return this.display(context, undefined, outputBuffer)
            .then(() => {
                return outputBuffer.getAndClean() as string;
            })
            .catch((e) => {
                while (outputBuffer.getLevel() > level) {
                    outputBuffer.endAndClean();
                }

                throw e;
            })
    }

    /**
     * Auto-generated method to display the template with the given context.
     *
     * @param {any} context An array of parameters to pass to the template
     * @param {TwingOutputBuffer} outputBuffer
     * @param {TwingTemplateBlocksMap} blocks
     */
    protected doDisplay(_context: any, _outputBuffer: TwingOutputBuffer, _blocks: TwingTemplateBlocksMap): Promise<void> {
        return Promise.resolve();
    }

    protected doGetParent(_context: any): Promise<TwingTemplate | string | false> {
        return Promise.resolve(false);
    }

    protected callMacro(template: TwingTemplate, name: string, outputBuffer: TwingOutputBuffer, args: any[], lineno: number, context: TwingContext<any, any>, source: TwingSource): Promise<string> {
        let getHandler = (template: TwingTemplate): Promise<TwingTemplateMacroHandler> => {
            if (template.macroHandlers.has(name)) {
                return Promise.resolve(template.macroHandlers.get(name));
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
                throw new TwingErrorRuntime(`Macro "${name}" is not defined in template "${template.templateName}".`, lineno, source);
            }
        });
    }

    public traceableMethod<T>(method: Function, lineno: number, source: TwingSource): TwingTemplateTraceableMethod<T> {
        return function () {
            return (method.apply(null, arguments) as Promise<T>).catch((e) => {
                if (e instanceof TwingError) {
                    if (e.getTemplateLine() === -1) {
                        e.setTemplateLine(lineno);
                        e.setSourceContext(source);
                    }
                } else {
                    throw new TwingErrorRuntime(`An exception has been thrown during the rendering of a template ("${e.message}").`, lineno, source, e);
                }

                throw e;
            });
        }
    }

    public traceableRenderBlock(lineno: number, source: TwingSource): TwingTemplateTraceableMethod<string> {
        return this.traceableMethod(this.renderBlock.bind(this), lineno, source);
    }

    public traceableRenderParentBlock(lineno: number, source: TwingSource): TwingTemplateTraceableMethod<string> {
        return this.traceableMethod(this.renderParentBlock.bind(this), lineno, source);
    }

    public traceableHasBlock(lineno: number, source: TwingSource): TwingTemplateTraceableMethod<boolean> {
        return this.traceableMethod(this.hasBlock.bind(this), lineno, source);
    }

    protected concatenate(object1: any, object2: any): string {
        if (isNullOrUndefined(object1)) {
            object1 = '';
        }

        if (isNullOrUndefined(object2)) {
            object2 = '';
        }

        return String(object1) + String(object2);
    }

    protected get cloneMap(): <K, V>(m: Map<K, V>) => Map<K, V> {
        return cloneMap;
    }

    protected get compare(): (a: any, b: any) => boolean {
        return compare;
    }

    protected get constant(): (name: string, object: any) => any {
        return (name: string) => {
            return name;
        }
    }

    protected get convertToMap(): (iterable: any) => Map<any, any> {
        return iteratorToMap;
    }

    protected get count(): (a: any) => number {
        return count;
    }

    protected get createRange(): (low: any, high: any, step: number) => Map<number, any> {
        return createRange;
    }

    protected get ensureTraversable(): <T>(candidate: T[]) => T[] | [] {
        return ensureTraversable;
    }

    protected get get(): (object: any, property: any) => any {
        return (object, property) => {
            if (isMap(object) || isPlainObject(object)) {
                return get(object, property);
            }
        };
    }

    protected get getAttribute(): (env: Runtime, object: any, item: any, _arguments: Map<any, any>, type: string, isDefinedTest: boolean, ignoreStrictCheck: boolean, sandboxed: boolean) => any {
        return getAttribute;
    }

    protected get include(): (context: any, outputBuffer: TwingOutputBuffer, templates: string | Map<number, string | TwingTemplate> | TwingTemplate, variables: any, withContext: boolean, ignoreMissing: boolean, line: number) => Promise<string> {
        return (context, outputBuffer, templates, variables, withContext, ignoreMissing, line) => {
            // @ts-ignore
            return include(this, context, outputBuffer, templates, variables, withContext, ignoreMissing).catch((e: TwingError) => {
                if (e.getTemplateLine() === -1) {
                    e.setTemplateLine(line);
                }

                throw e;
            });
        }
    }

    protected get isCountable(): (candidate: any) => boolean {
        return isCountable;
    }

    protected get isIn(): (a: any, b: any) => boolean {
        return isIn;
    }

    protected get iterate(): (it: any, cb: IterateCallback) => Promise<void> {
        return iterate;
    }

    protected get merge(): <V>(iterable1: Map<any, V>, iterable2: Map<any, V>) => Map<any, V> {
        return merge;
    }

    protected get parseRegExp(): (input: string) => RegExp {
        return parseRegularExpression;
    }

    protected get evaluate(): (a: any) => boolean {
        return evaluate;
    }

    protected get Context(): typeof TwingContext {
        return TwingContext;
    }

    protected get Markup(): typeof TwingMarkup {
        return TwingMarkup;
    }

    protected get RuntimeError(): typeof TwingErrorRuntime {
        return TwingErrorRuntime;
    }

    protected get SandboxSecurityError(): typeof TwingSandboxSecurityError {
        return TwingSandboxSecurityError;
    }

    protected get SandboxSecurityNotAllowedFilterError(): typeof TwingSandboxSecurityNotAllowedFilterError {
        return TwingSandboxSecurityNotAllowedFilterError;
    }

    protected get SandboxSecurityNotAllowedFunctionError(): typeof TwingSandboxSecurityNotAllowedFunctionError {
        return TwingSandboxSecurityNotAllowedFunctionError;
    }

    protected get SandboxSecurityNotAllowedTagError(): typeof TwingSandboxSecurityNotAllowedTagError {
        return TwingSandboxSecurityNotAllowedTagError;
    }

    protected get Source(): typeof TwingSource {
        return TwingSource;
    }
}
