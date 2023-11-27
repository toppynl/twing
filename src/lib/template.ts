import {createContext, TwingContext} from "./context";
import {TwingEnvironment} from "./environment";
import {createOutputBuffer, TwingOutputBuffer} from "./output-buffer";
import {TwingSourceMapRuntime} from "./source-map-runtime";
import {TwingTemplateNode} from "./node/template";
import {mergeIterables} from "./helpers/merge-iterables";
import {createRuntimeError} from "./error/runtime";
import {getChildren, getChildrenCount, TwingBaseNode} from "./node";
import {isATwingError, TwingError} from "./error";
import {isAMapLike} from "./helpers/map-like";
import {createMarkup, TwingMarkup} from "./markup";
import {include} from "./extension/core/functions/include";
import {isATemplateLoadingError} from "./error/loader";
import {cloneMap} from "./helpers/clone-map";
import {createBodyNode} from "./node/body";
import {getKeyValuePairs} from "./node/expression/array";
import {iteratorToMap} from "./helpers/iterator-to-map";
import {TwingSource} from "./source";

export type TwingTemplateBlockMap = Map<string, [TwingTemplate, string]>;
export type BlockHandler = (context: TwingContext<any, any>, outputBuffer: TwingOutputBuffer, blocks: TwingTemplateBlockMap, sourceMapRuntime?: TwingSourceMapRuntime) => Promise<void>;
export type MacroHandler = (
    outputBuffer: TwingOutputBuffer,
    sourceMapRuntime: TwingSourceMapRuntime | undefined, ...args: Array<any>
) => Promise<TwingMarkup>;

export type TwingTemplateAliases = TwingContext<string, TwingTemplate>;

export interface TwingTemplate {
    readonly aliases: TwingTemplateAliases;
    readonly blockHandlers: Map<string, BlockHandler>;
    readonly canBeUsedAsATrait: boolean;
    readonly environment: TwingEnvironment;
    readonly macroHandlers: Map<string, MacroHandler>;
    readonly source: TwingSource;
    readonly templateName: string;

    assertToStringAllowed<T>(candidate: T): T;

    callMacro(
        template: TwingTemplate,
        name: string,
        outputBuffer: TwingOutputBuffer,
        args: Array<any>,
        line: number,
        column: number,
        context: TwingContext<any, any>,
        templateName: string,
        sourceMapRuntime?: TwingSourceMapRuntime
    ): Promise<TwingMarkup>;

    displayBlock(
        name: string,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TwingTemplateBlockMap,
        useBlocks: boolean,
        sourceMapRuntime?: TwingSourceMapRuntime
    ): Promise<void>;

    execute(
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks?: TwingTemplateBlockMap,
        sourceMapRuntime?: TwingSourceMapRuntime
    ): Promise<void>;

    getBlocks(): Promise<TwingTemplateBlockMap>;

    getParent(context: TwingContext<any, any>, outputBuffer: TwingOutputBuffer): Promise<TwingTemplate | null>;

    getTraceableMethod<M extends (...args: Array<any>) => Promise<any>>(method: M, line: number, column: number, templateName: string): M;

    getTraits(): Promise<TwingTemplateBlockMap>;

    hasBlock(
        name: string,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TwingTemplateBlockMap,
    ): Promise<boolean>;

    hasMacro(name: string): Promise<boolean>;

    include(
        template: TwingTemplate,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        sourceMapRunTime: TwingSourceMapRuntime | null,
        templates: string | Map<number, string | TwingTemplate> | TwingTemplate | null,
        variables: Map<string, any>,
        withContext: boolean,
        ignoreMissing: boolean,
        sandboxed: boolean,
        line: number,
        column: number
    ): Promise<TwingMarkup>;

    loadTemplate(
        token: TwingTemplate | string | Map<number, TwingTemplate | null>,
        line: number,
        column: number,
        index?: number
    ): Promise<TwingTemplate>;

    mergeGlobals(context: Map<any, any>): Map<any, any>;

    render(context: Record<string, any>, outputBuffer?: TwingOutputBuffer, sourceMapRuntime?: TwingSourceMapRuntime): Promise<string>;

    renderBlock(
        name: string,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TwingTemplateBlockMap,
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
    environment: TwingEnvironment,
    ast: TwingTemplateNode
): TwingTemplate => {
    let blockHandlers: Map<string, BlockHandler> = new Map();
    let macroHandlers: Map<string, MacroHandler> = new Map();

    let blocks: TwingTemplateBlockMap | null = null;
    let parent: TwingTemplate | null = null;

    // handle blocks
    const {blocks: blockNodes} = ast.children;

    for (const [name, blockNode] of getChildren(blockNodes)) {
        const blockHandler: BlockHandler = (context, outputBuffer, blocks, sourceMapRuntime) => {
            const aliases = template.aliases.clone();

            return blockNode.children.body.execute(template, context, outputBuffer, blocks, aliases, sourceMapRuntime);
        };

        blockHandlers.set(name, blockHandler);
    }

    // handle macros
    const {macros: macrosNode} = ast.children;

    for (const [name, macroNode] of Object.entries(macrosNode.children)) {
        const macroHandler: MacroHandler = async (outputBuffer, sourceMapRuntime, ...args) => {
            const {body, arguments: macroArguments} = macroNode.children;
            const keyValuePairs = getKeyValuePairs(macroArguments);

            const aliases = template.aliases.clone();

            const localVariables: Map<string, any> = new Map();

            for (const {key: keyNode, value: defaultValueNode} of keyValuePairs) {
                const key = keyNode.attributes.value as string;
                const defaultValue = await defaultValueNode.execute(template, createContext(), outputBuffer, new Map(), aliases, sourceMapRuntime);

                let value = args.shift();

                if (value === undefined) {
                    value = defaultValue;
                }

                localVariables.set(key, value);
            }

            localVariables.set('varargs', args);

            const context = createContext(template.mergeGlobals(localVariables));
            const blocks = new Map();

            outputBuffer.start();

            return await body.execute(template, context, outputBuffer, blocks, aliases, sourceMapRuntime)
                .then(() => {
                    const content = outputBuffer.getContents();

                    return createMarkup(content, environment.charset);
                })
                .finally(() => {
                    outputBuffer.endAndClean();
                });
        };

        macroHandlers.set(name, macroHandler);
    }

    // handle traits
    let traits: TwingTemplateBlockMap | null = null;

    // handle embedded templates
    const embeddedTemplates: Map<number, TwingTemplateNode> = new Map();

    for (const embeddedTemplate of ast.embeddedTemplates) {
        embeddedTemplates.set(embeddedTemplate.attributes.index, embeddedTemplate);
    }

    const displayParentBlock = (name: string, context: TwingContext<any, any>, outputBuffer: TwingOutputBuffer, blocks: TwingTemplateBlockMap, sourceMapRuntime?: TwingSourceMapRuntime): Promise<void> => {
        return template.getTraits()
            .then((traits) => {
                const trait = traits.get(name);

                if (trait) {
                    const [blockTemplate, blockName] = trait;

                    return blockTemplate.displayBlock(
                        blockName,
                        context,
                        outputBuffer,
                        blocks,
                        false,
                        sourceMapRuntime
                    );
                } else {
                    return template.getParent(context, outputBuffer)
                        .then((parent) => {
                            if (parent !== null) {
                                return parent.displayBlock(name, context, outputBuffer, blocks, false, sourceMapRuntime);
                            } else {
                                throw createRuntimeError(`The template has no parent and no traits defining the "${name}" block.`, undefined, template.templateName);
                            }
                        });
                }
            });

    };

    // A template can be used as a trait if:
    //   * it has no parent
    //   * it has no macros
    //   * it has no body
    //
    // Put another way, a template can be used as a trait if it
    // only contains blocks and use statements.
    const {parent: parentNode, macros, body} = ast.children;
    const {line, column} = ast;

    let canBeUsedAsATrait = (parentNode === undefined) && (getChildrenCount(macros) === 0);

    if (canBeUsedAsATrait) {
        let node: TwingBaseNode = body.children.content;

        if (getChildrenCount(node) === 0) {
            node = createBodyNode(node, line, column);
        }

        for (const [, child] of Object.entries(node.children)) {
            if (getChildrenCount(child) === 0) {
                continue;
            }

            canBeUsedAsATrait = false;

            break;
        }
    }

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
        get environment() {
            return environment;
        },
        get macroHandlers() {
            return macroHandlers;
        },
        get source() {
            return ast.attributes.source;
        },
        get templateName() {
            return template.source.name;
        },
        assertToStringAllowed: (candidate) => {
            if (environment.isSandboxed && typeof candidate === 'object') {
                environment.sandboxPolicy.checkMethodAllowed(candidate, 'toString');
            }

            return candidate;
        },
        callMacro: (template, name, outputBuffer, args, line, column, context, templateName, sourceMapRuntime) => {
            const getHandler = (template: TwingTemplate): Promise<MacroHandler | null> => {
                const macroHandler = template.macroHandlers.get(name);

                if (macroHandler) {
                    return Promise.resolve(macroHandler);
                } else {
                    return template.getParent(context, outputBuffer)
                        .then((parent) => {
                            if (parent) {
                                return getHandler(parent);
                            } else {
                                return null;
                            }
                        });
                }
            };

            return getHandler(template)
                .then((handler) => {
                    if (handler) {
                        return handler(outputBuffer, sourceMapRuntime, ...args);
                    } else {
                        throw createRuntimeError(`Macro "${name}" is not defined in template "${template.templateName}".`, {
                            line,
                            column
                        }, templateName);
                    }
                });
        },
        displayBlock: (name, context, outputBuffer, blocks, useBlocks, sourceMapRuntime) => {
            return template.getBlocks()
                .then((ownBlocks) => {
                    let blockHandler: BlockHandler | undefined;
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
                        return template.getParent(context, outputBuffer).then((parent) => {
                            if (parent) {
                                return parent.displayBlock(name, context, outputBuffer, mergeIterables(ownBlocks, blocks), false, sourceMapRuntime);
                            } else {
                                const block = blocks.get(name);

                                if (block) {
                                    const [blockTemplate] = block!;

                                    throw createRuntimeError(`Block "${name}" should not call parent() in "${blockTemplate.templateName}" as the block does not exist in the parent template "${template.templateName}".`, undefined, blockTemplate.templateName);
                                } else {
                                    throw createRuntimeError(`Block "${name}" on template "${template.templateName}" does not exist.`, undefined, template.templateName);
                                }
                            }
                        });

                    }
                });
        },
        execute: async (context, outputBuffer, blocks = new Map(), sourceMapRuntime) => {
            const aliases = template.aliases.clone();

            return Promise.all([
                template.getParent(context, outputBuffer),
                template.getBlocks()
            ]).then(([parent, ownBlocks]) => {
                return ast.execute(
                    template,
                    context,
                    outputBuffer,
                    mergeIterables(ownBlocks, blocks),
                    aliases,
                    sourceMapRuntime
                ).then(() => {
                    if (parent) {
                        const parentBlocks = mergeIterables(ownBlocks, blocks)

                        return parent.execute(context, outputBuffer, parentBlocks, sourceMapRuntime);
                    }
                });
            }).catch((error: TwingError) => {
                if (!error.source) {
                    error.source = template.templateName;
                }

                if (isATemplateLoadingError(error)) {
                    error = createRuntimeError(error.rootMessage, error.location, error.source, error);
                }

                throw error;
            });
        },
        getBlocks: () => {
            if (blocks) {
                return Promise.resolve(blocks);
            } else {
                return template.getTraits()
                    .then((traits) => {
                        blocks = mergeIterables(traits, new Map([...blockHandlers.keys()].map((key) => {
                            return [key, [template, key]];
                        })));

                        return blocks;
                    });
            }
        },
        getParent: async (context, outputBuffer) => {
            if (parent !== null) {
                return Promise.resolve(parent);
            }

            const parentNode = ast.children.parent;

            if (parentNode) {
                return template.getBlocks()
                    .then(async (blocks) => {
                        const parentName = await parentNode.execute(template, context, outputBuffer, blocks, createContext());
                        const loadedParent = await template.loadTemplate(parentName, parentNode.line, parentNode.column);

                        if (parentNode.is("constant")) {
                            parent = loadedParent;
                        }

                        return loadedParent;
                    });
            } else {
                return Promise.resolve(null);
            }
        },
        getTraceableMethod: (method, line, column, templateName) => {
            return ((...args: Array<any>) => {
                return method(...args)
                    .catch((error) => {
                        if (isATwingError(error)) {
                            if (error.location === undefined) {
                                error.location = {line, column};
                                error.source = templateName;
                            }
                        } else {
                            throw createRuntimeError(`An exception has been thrown during the rendering of a template ("${error.message}").`, {
                                line,
                                column
                            }, templateName, error);
                        }

                        throw error;
                    });
            }) as typeof method;
        },
        getTraits: async () => {
            if (traits === null) {
                traits = new Map();

                const {traits: traitsNode} = ast.children;

                for (const [, traitNode] of getChildren(traitsNode)) {
                    const {template: templateNameNode, targets} = traitNode.children;
                    const templateName = templateNameNode.attributes.value as string;

                    const traitExecutionContext = (await template.loadTemplate(
                        templateName,
                        templateNameNode.line,
                        templateNameNode.column
                    ));

                    if (!traitExecutionContext.canBeUsedAsATrait) {
                        throw createRuntimeError(`Template ${templateName} cannot be used as a trait.`, templateNameNode, template.templateName);
                    }

                    const traitBlocks = cloneMap(await traitExecutionContext.getBlocks());

                    for (const [key, target] of getChildren(targets)) {
                        const traitBlock = traitBlocks.get(key);

                        if (!traitBlock) {
                            throw createRuntimeError(`Block "${key}" is not defined in trait "${templateName}".`, templateNameNode, template.templateName);
                        }

                        const targetValue = target.attributes.value;

                        traitBlocks.set(targetValue, traitBlock);
                        traitBlocks.delete(key);
                    }

                    traits = mergeIterables(traits, traitBlocks);
                }
            }

            return Promise.resolve(traits);
        },
        hasBlock: (name, context, outputBuffer, blocks): Promise<boolean> => {
            if (blocks.has(name)) {
                return Promise.resolve(true);
            } else {
                return template.getBlocks()
                    .then((blocks) => {
                        if (blocks.has(name)) {
                            return Promise.resolve(true);
                        } else {
                            return template.getParent(context, outputBuffer)
                                .then((parent) => {
                                    if (parent) {
                                        return parent.hasBlock(name, context, outputBuffer, blocks);
                                    } else {
                                        return false;
                                    }
                                });
                        }
                    });
            }
        },
        hasMacro: (name) => {
            // @see https://github.com/twigphp/Twig/issues/3174 as to why we don't check macro existence in parents
            return Promise.resolve(template.macroHandlers.has(name));
        },
        include: (
            template,
            context,
            outputBuffer,
            sourceMapRunTime,
            templates,
            variables,
            withContext,
            ignoreMissing,
            sandboxed,
            line,
            column
        ) => {
            return include(template, context, outputBuffer, sourceMapRunTime, templates, variables, withContext, ignoreMissing, sandboxed)
                .catch((error: TwingError) => {
                    if (error.location === undefined) {
                        error.location = {line, column};
                    }

                    throw error;
                });
        },
        loadTemplate: (identifier, line, column, index) => {
            let promise: Promise<TwingTemplate>;

            if (index !== undefined) {
                // this is an attempt to load an embedded template
                const ast = embeddedTemplates.get(index)!; // it can't happen that the embedded template is not present in the register, by nature

                promise = Promise.resolve(createTemplate(environment, ast));
            } else {
                if (typeof identifier === "string") {
                    promise = environment.loadTemplate(identifier);
                } else if (isAMapLike(identifier)) {
                    promise = environment.resolveTemplate([...identifier.values()], template.templateName);
                } else {
                    promise = Promise.resolve(identifier);
                }
            }

            return promise
                .catch((error: TwingError) => {
                    if (error.location === undefined) {
                        error.location = {line, column};
                    }

                    throw error;
                });
        },
        mergeGlobals: environment.mergeGlobals,
        render: (context, outputBuffer, sourceMapRuntime) => {
            const actualOutputBuffer: TwingOutputBuffer = outputBuffer || createOutputBuffer();

            actualOutputBuffer.start();

            return template.execute(
                createContext(environment.mergeGlobals(iteratorToMap(context))),
                actualOutputBuffer,
                undefined,
                sourceMapRuntime
            ).then(() => {
                return actualOutputBuffer.getAndFlush();
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

            return template.getBlocks()
                .then((blocks) => {
                    return displayParentBlock(name, context, outputBuffer, blocks, sourceMapRuntime).then(() => {
                        return outputBuffer.getAndClean();
                    })
                });
        }
    };

    const aliases: TwingTemplateAliases = createContext();

    aliases.set(`_self`, template);

    return template;
};
