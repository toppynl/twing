import {createContext, TwingContext} from "./context";
import {TwingEnvironment} from "./environment";
import {createOutputBuffer, TwingOutputBuffer} from "./output-buffer";
import {TwingSourceMapRuntime} from "./source-map-runtime";
import {TwingTemplateNode} from "./node/template";
import {mergeIterables} from "./helpers/merge-iterables";
import {createRuntimeError} from "./error/runtime";
import {createNode, getChildren, getChildrenCount, TwingBaseNode} from "./node";
import {TwingError} from "./error";
import {createMarkup, TwingMarkup} from "./markup";
import {createTemplateLoadingError, isATemplateLoadingError} from "./error/loader";
import {cloneMap} from "./helpers/clone-map";
import {iteratorToMap} from "./helpers/iterator-to-map";
import {TwingSource} from "./source";
import {getTraceableMethod} from "./helpers/traceable-method";
import {TwingConstantNode} from "./node/expression/constant";
import {executeNode, type TwingNodeExecutor} from "./node-executor";
import {getKeyValuePairs} from "./helpers/get-key-value-pairs";
import {createTemplateLoader, type TwingTemplateLoader} from "./template-loader";
import type {TwingExecutionContext} from "./execution-context";

export type TwingTemplateBlockMap = Map<string, [TwingTemplate, string]>;
export type TwingTemplateBlockHandler = (executionContent: TwingExecutionContext) => Promise<void>;
export type TwingTemplateMacroHandler = (
    executionContent: TwingExecutionContext,
    ...macroArguments: Array<any>
) => Promise<TwingMarkup>;

export type TwingTemplateAliases = TwingContext<string, TwingTemplate>;

/**
 * The shape of a template. A template
 */
export interface TwingTemplate {
    readonly aliases: TwingTemplateAliases;
    readonly ast: TwingTemplateNode;
    readonly blockHandlers: Map<string, TwingTemplateBlockHandler>;
    readonly canBeUsedAsATrait: boolean;
    readonly source: TwingSource;
    readonly macroHandlers: Map<string, TwingTemplateMacroHandler>;
    readonly name: string;

    displayBlock(
        executionContext: TwingExecutionContext,
        name: string,
        useBlocks: boolean
    ): Promise<void>;

    /**
     * Execute the template against an environment,
     * 
     * Theoretically speaking,
     * 
     * @param environment
     * @param context
     * @param outputBuffer
     * @param options
     */
    execute(
        environment: TwingEnvironment,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        options?: {
            blocks?: TwingTemplateBlockMap;
            nodeExecutor?: TwingNodeExecutor;
            sandboxed?: boolean;
            sourceMapRuntime?: TwingSourceMapRuntime;
            /**
             * Controls whether accessing invalid variables (variables and or attributes/methods that do not exist) triggers an error.
             *
             * When set to `true`, accessing invalid variables triggers an error.
             */
            strict?: boolean;
            templateLoader?: TwingTemplateLoader
        }
    ): Promise<void>;

    getBlocks(executionContext: TwingExecutionContext): Promise<TwingTemplateBlockMap>;

    getParent(executionContext: TwingExecutionContext): Promise<TwingTemplate | null>;

    getTraits(executionContext: TwingExecutionContext): Promise<TwingTemplateBlockMap>;

    hasBlock(
        executionContext: TwingExecutionContext,
        name: string,
        blocks: TwingTemplateBlockMap
    ): Promise<boolean>;

    hasMacro(name: string): Promise<boolean>;

    /**
     * @param index
     *
     * @throws {TwingTemplateLoadingError} When no embedded template exists for the passed index.
     */
    loadEmbeddedTemplate(
        index: number
    ): Promise<TwingTemplate>;

    /**
     * @throws {TwingTemplateLoadingError} When no embedded template exists for the passed identifier.
     */
    loadTemplate(
        executionContext: TwingExecutionContext,
        identifier: TwingTemplate | string | Array<TwingTemplate | null>,
    ): Promise<TwingTemplate>;

    render(
        environment: TwingEnvironment,
        context: Record<string, any>,
        options?: {
            nodeExecutor?: TwingNodeExecutor;
            outputBuffer?: TwingOutputBuffer;
            sandboxed?: boolean;
            sourceMapRuntime?: TwingSourceMapRuntime;
            /**
             * Controls whether accessing invalid variables (variables and or attributes/methods that do not exist) triggers an error.
             *
             * When set to `true`, accessing invalid variables triggers an error.
             */
            strict?: boolean;
        }
    ): Promise<string>;

    renderBlock(
        executionContext: TwingExecutionContext,
        name: string,
        useBlocks: boolean
    ): Promise<string>;

    renderParentBlock(
        executionContext: TwingExecutionContext,
        name: string
    ): Promise<string>;

    /**
     * Tries to load templates consecutively from an array.
     *
     * Similar to loadTemplate() but it also accepts instances of TwingTemplate and an array of templates where each is tried to be loaded.
     *
     * @param executionContext
     * @param names A template or an array of templates to try consecutively
     */
    resolveTemplate(
        executionContext: TwingExecutionContext,
        names: Array<string | TwingTemplate | null>
    ): Promise<TwingTemplate>;
}

export const createTemplate = (
    ast: TwingTemplateNode
): TwingTemplate => {
    // blocks
    const blockHandlers: Map<string, TwingTemplateBlockHandler> = new Map();

    let blocks: TwingTemplateBlockMap | null = null;

    const {blocks: blockNodes} = ast.children;

    for (const [name, blockNode] of getChildren(blockNodes)) {
        const blockHandler: TwingTemplateBlockHandler = (executionContent) => {
            const aliases = template.aliases.clone();

            return executionContent.nodeExecutor(blockNode.children.body, {
                ...executionContent,
                aliases,
                template
            });
        };

        blockHandlers.set(name, blockHandler);
    }

    // macros
    const macroHandlers: Map<string, TwingTemplateMacroHandler> = new Map();

    const {macros: macrosNode} = ast.children;

    for (const [name, macroNode] of Object.entries(macrosNode.children)) {
        const macroHandler: TwingTemplateMacroHandler = async (executionContent, ...args) => {
            const {environment, nodeExecutor, outputBuffer} = executionContent;
            const {body, arguments: macroArguments} = macroNode.children;
            const keyValuePairs = getKeyValuePairs(macroArguments);

            const aliases = template.aliases.clone();

            const localVariables: Map<string, any> = new Map();

            for (const {key: keyNode, value: defaultValueNode} of keyValuePairs) {
                const key = keyNode.attributes.value as string;
                const defaultValue = await nodeExecutor(defaultValueNode, {
                    ...executionContent,
                    aliases,
                    blocks: new Map(),
                    context: createContext()
                });

                let value = args.shift();

                if (value === undefined) {
                    value = defaultValue;
                }

                localVariables.set(key, value);
            }

            localVariables.set('varargs', args);

            const context = createContext(localVariables);
            const blocks = new Map();

            outputBuffer.start();

            return await nodeExecutor(body, {
                ...executionContent,
                aliases,
                blocks,
                context,
                template
            })
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

    // traits
    let traits: TwingTemplateBlockMap | null = null;

    // embedded templates
    const embeddedTemplates: Map<number, TwingTemplateNode> = new Map();

    for (const embeddedTemplate of ast.embeddedTemplates) {
        embeddedTemplates.set(embeddedTemplate.attributes.index, embeddedTemplate);
    }

    // parent
    let parent: TwingTemplate | null = null;

    const displayParentBlock = (executionContext: TwingExecutionContext, name: string): Promise<void> => {
        return template.getTraits(executionContext)
            .then((traits) => {
                const trait = traits.get(name);

                if (trait) {
                    const [blockTemplate, blockName] = trait;

                    return blockTemplate.displayBlock(executionContext, blockName, false);
                } else {
                    return template.getParent(executionContext)
                        .then((parent) => {
                            if (parent !== null) {
                                return parent.displayBlock(executionContext, name, false);
                            } else {
                                throw createRuntimeError(`The template has no parent and no traits defining the "${name}" block.`, undefined, template.name);
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
        let node: TwingBaseNode = body;

        if (getChildrenCount(body) === 0) {
            node = createNode({body}, line, column);
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
        get ast() {
            return ast;
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
        get name() {
            return template.source.name;
        },
        get source() {
            return ast.attributes.source;
        },
        displayBlock: (executionContext, name, useBlocks) => {
            const {blocks} = executionContext;

            return template.getBlocks(executionContext)
                .then((ownBlocks) => {
                    let blockHandler: TwingTemplateBlockHandler | undefined;
                    let block: [TwingTemplate, string] | undefined;

                    if (useBlocks && (block = blocks.get(name)) !== undefined) {
                        const [blockTemplate, blockName] = block;

                        blockHandler = blockTemplate.blockHandlers.get(blockName);
                    } else if ((block = ownBlocks.get(name)) !== undefined) {
                        const [blockTemplate, blockName] = block;

                        blockHandler = blockTemplate.blockHandlers.get(blockName);
                    }

                    if (blockHandler) {
                        return blockHandler(executionContext);
                    } else {
                        return template.getParent(executionContext).then((parent) => {
                            if (parent) {
                                return parent.displayBlock(executionContext, name, false);
                            } else {
                                const block = blocks.get(name);

                                if (block) {
                                    const [blockTemplate] = block!;

                                    throw createRuntimeError(`Block "${name}" should not call parent() in "${blockTemplate.name}" as the block does not exist in the parent template "${template.name}".`, undefined, blockTemplate.name);
                                } else {
                                    throw createRuntimeError(`Block "${name}" on template "${template.name}" does not exist.`, undefined, template.name);
                                }
                            }
                        });

                    }
                });
        },
        execute: async (environment, context, outputBuffer, options) => {
            const aliases = template.aliases.clone();
            const childBlocks = options?.blocks || new Map();
            const nodeExecutor = options?.nodeExecutor || executeNode;
            const sandboxed = options?.sandboxed || false;
            const sourceMapRuntime = options?.sourceMapRuntime;
            const templateLoader = options?.templateLoader || createTemplateLoader(environment);

            const executionContext: TwingExecutionContext = {
                aliases,
                blocks: new Map(),
                context,
                environment,
                nodeExecutor,
                outputBuffer,
                sandboxed,
                sourceMapRuntime,
                strict: options?.strict || false,
                template,
                templateLoader
            };

            return Promise.all([
                template.getParent(executionContext),
                template.getBlocks(executionContext)
            ]).then(([parent, ownBlocks]) => {
                const blocks = mergeIterables(ownBlocks, childBlocks);

                return nodeExecutor(ast, {
                    ...executionContext,
                    blocks
                }).then(() => {
                    if (parent) {
                        return parent.execute(environment, context, outputBuffer, {
                            ...options,
                            blocks
                        });
                    }
                });
            }).catch((error: TwingError) => {
                if (!error.source) {
                    error.source = template.name;
                }

                if (isATemplateLoadingError(error)) {
                    error = createRuntimeError(error.rootMessage, error.location, error.source, error);
                }

                throw error;
            });
        },
        getBlocks: (executionContext) => {
            if (blocks) {
                return Promise.resolve(blocks);
            } else {
                return template.getTraits(executionContext)
                    .then((traits) => {
                        blocks = mergeIterables(traits, new Map([...blockHandlers.keys()].map((key) => {
                            return [key, [template, key]];
                        })));

                        return blocks;
                    });
            }
        },
        getParent: async (executionContext) => {
            if (parent !== null) {
                return Promise.resolve(parent);
            }

            const parentNode = ast.children.parent;

            if (parentNode) {
                const {nodeExecutor} = executionContext;

                return template.getBlocks(executionContext)
                    .then(async (blocks) => {
                        const parentName = await nodeExecutor(parentNode, {
                            ...executionContext,
                            aliases: createContext(),
                            blocks
                        });

                        const loadTemplate = getTraceableMethod(
                            template.loadTemplate,
                            parentNode.line,
                            parentNode.column,
                            template.name
                        );

                        const loadedParent = await loadTemplate(executionContext, parentName);

                        if (parentNode.type === "constant") {
                            parent = loadedParent;
                        }

                        return loadedParent;
                    });
            } else {
                return Promise.resolve(null);
            }
        },
        getTraits: async (executionContext) => {
            if (traits === null) {
                traits = new Map();

                const {traits: traitsNode} = ast.children;

                for (const [, traitNode] of getChildren(traitsNode)) {
                    const {template: templateNameNode, targets} = traitNode.children;
                    const templateName = templateNameNode.attributes.value as string;

                    const loadTemplate = getTraceableMethod(
                        template.loadTemplate,
                        templateNameNode.line,
                        templateNameNode.column,
                        template.name
                    );

                    const traitTemplate = await loadTemplate(executionContext, templateName);

                    if (!traitTemplate.canBeUsedAsATrait) {
                        throw createRuntimeError(`Template ${templateName} cannot be used as a trait.`, templateNameNode, template.name);
                    }

                    const traitBlocks = cloneMap(await traitTemplate.getBlocks(executionContext));

                    for (const [key, target] of getChildren(targets)) {
                        const traitBlock = traitBlocks.get(key);

                        if (!traitBlock) {
                            throw createRuntimeError(`Block "${key}" is not defined in trait "${templateName}".`, templateNameNode, template.name);
                        }

                        const targetValue = (target as TwingConstantNode<string>).attributes.value;

                        traitBlocks.set(targetValue, traitBlock);
                        traitBlocks.delete((key as string));
                    }

                    traits = mergeIterables(traits, traitBlocks);
                }
            }

            return Promise.resolve(traits);
        },
        hasBlock: (executionContext, name, blocks): Promise<boolean> => {
            if (blocks.has(name)) {
                return Promise.resolve(true);
            } else {
                return template.getBlocks(executionContext)
                    .then((blocks) => {
                        if (blocks.has(name)) {
                            return Promise.resolve(true);
                        } else {
                            return template.getParent(executionContext)
                                .then((parent) => {
                                    if (parent) {
                                        return parent.hasBlock(executionContext, name, blocks);
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
        loadEmbeddedTemplate: (index) => {
            const ast = embeddedTemplates.get(index);

            if (ast === undefined) {
                return Promise.reject(createTemplateLoadingError([`embedded#${index}`]));
            }

            return Promise.resolve(createTemplate(ast));
        },
        loadTemplate: (executionContext, identifier) => {
            let promise: Promise<TwingTemplate>;

            if (typeof identifier === "string") {
                promise = executionContext.templateLoader(identifier, template.name)
                    .then((template) => {
                        if (template === null) {
                            throw createTemplateLoadingError([identifier]);
                        }
                        
                        return template;
                    });
            } else if (Array.isArray(identifier)) {
                promise = template.resolveTemplate(executionContext, identifier);
            } else {
                promise = Promise.resolve(identifier);
            }

            return promise;
        },
        render: (environment, context, options) => {
            const outputBuffer = options?.outputBuffer || createOutputBuffer();

            outputBuffer.start();

            return template.execute(
                environment,
                createContext(iteratorToMap(context)),
                outputBuffer,
                options
            ).then(() => {
                return outputBuffer.getAndFlush();
            });
        },
        renderBlock: (executionContext, name, useBlocks) => {
            const {outputBuffer} = executionContext;

            outputBuffer.start();

            return template.displayBlock(executionContext, name, useBlocks).then(() => {
                return outputBuffer.getAndClean();
            });
        },
        renderParentBlock: (executionContext, name) => {
            const {outputBuffer} = executionContext;

            outputBuffer.start();

            return template.getBlocks(executionContext)
                .then((blocks) => {
                    return displayParentBlock({
                        ...executionContext,
                        blocks
                    }, name).then(() => {
                        return outputBuffer.getAndClean();
                    })
                });
        },
        resolveTemplate: (executionContext, names) => {
            const loadTemplateAtIndex = (index: number): Promise<TwingTemplate> => {
                if (index < names.length) {
                    const name = names[index];

                    if (name === null) {
                        return loadTemplateAtIndex(index + 1);
                    } else if (typeof name !== "string") {
                        return Promise.resolve(name);
                    } else {
                        return template.loadTemplate(executionContext, name)
                            .catch(() => {
                                return loadTemplateAtIndex(index + 1);
                            });
                    }
                } else {
                    return Promise.reject(createTemplateLoadingError((names as Array<string | null>).map((name) => {
                        if (name === null) {
                            return '';
                        }

                        return name;
                    }), undefined, template.name));
                }
            };

            return loadTemplateAtIndex(0);
        }
    };

    const aliases: TwingTemplateAliases = createContext();

    aliases.set(`_self`, template);

    return template;
};
