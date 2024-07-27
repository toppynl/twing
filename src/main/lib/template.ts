import {createContext, TwingContext} from "./context";
import {TwingEnvironment, TwingSynchronousEnvironment} from "./environment";
import {createOutputBuffer, TwingOutputBuffer} from "./output-buffer";
import {TwingSourceMapRuntime} from "./source-map-runtime";
import {TwingTemplateNode} from "./node/template";
import {mergeIterables} from "./helpers/merge-iterables";
import {createRuntimeError} from "./error/runtime";
import {createNode, getChildren, getChildrenCount, TwingBaseNode} from "./node";
import {createMarkup, TwingMarkup} from "./markup";
import {createTemplateLoadingError} from "./error/loader";
import {cloneMap} from "./helpers/clone-map";
import {TwingSource} from "./source";
import {getSynchronousTraceableMethod, getTraceableMethod} from "./helpers/traceable-method";
import {TwingConstantNode} from "./node/expression/constant";
import {
    executeNode,
    executeNodeSynchronously,
    type TwingNodeExecutor,
    TwingSynchronousNodeExecutor
} from "./node-executor";
import {getKeyValuePairs} from "./helpers/get-key-value-pairs";
import {
    createSynchronousTemplateLoader,
    createTemplateLoader,
    TwingSynchronousTemplateLoader,
    type TwingTemplateLoader
} from "./template-loader";
import type {TwingExecutionContext, TwingSynchronousExecutionContext} from "./execution-context";
import {iteratorToMap} from "./helpers/iterator-to-map";

export type TwingTemplateBlockMap = Map<string, [template: TwingTemplate, name: string]>;
export type TwingSynchronousTemplateBlockMap = Map<string, [template: TwingSynchronousTemplate, name: string]>;

export type TwingTemplateBlockHandler = (executionContent: TwingExecutionContext) => Promise<void>;
export type TwingSynchronousTemplateBlockHandler = (executionContent: TwingSynchronousExecutionContext) => void;

export type TwingTemplateMacroHandler = (
    executionContent: TwingExecutionContext,
    ...macroArguments: Array<any>
) => Promise<TwingMarkup>;

export type TwingSynchronousTemplateMacroHandler = (
    executionContent: TwingSynchronousExecutionContext,
    ...macroArguments: Array<any>
) => TwingMarkup;

export type TwingTemplateAliases = TwingContext<string, TwingTemplate>;
export type TwingSynchronousTemplateAliases = Record<string, TwingSynchronousTemplate>;

/**
 * The shape of a template. A template
 */
export interface TwingTemplate {
    readonly aliases: TwingTemplateAliases;
    readonly ast: TwingTemplateNode;
    readonly blockHandlers: Map<string, TwingTemplateBlockHandler>;
    readonly canBeUsedAsATrait: boolean;
    readonly embeddedTemplates: Map<number, TwingTemplate>;
    readonly source: TwingSource;
    readonly macroHandlers: Map<string, TwingTemplateMacroHandler>;
    readonly name: string;

    displayBlock(
        executionContext: TwingExecutionContext,
        name: string,
        useBlocks: boolean
    ): Promise<void>;

    displayParentBlock(
        executionContext: TwingExecutionContext,
        name: string
    ): Promise<void>;

    /**
     * Semantically speaking, provide a closure to the template:
     *   * an environment providing the filters, functions, globals and tests;
     *   * a context providing the variables;
     *   * a block map providing the available blocks;
     *   * an output buffer providing the mean to output the result of an expression.
     *
     * Technically speaking, execute the template and stream the result to the output buffer.
     *
     * @param environment
     * @param context
     * @param blocks
     * @param outputBuffer
     * @param options
     */
    execute(
        environment: TwingEnvironment,
        context: TwingContext<any, any>,
        blocks: TwingTemplateBlockMap,
        outputBuffer: TwingOutputBuffer,
        options?: {
            nodeExecutor?: TwingNodeExecutor;
            sandboxed?: boolean;
            sourceMapRuntime?: TwingSourceMapRuntime;
            /**
             * Controls whether accessing invalid variables (variables and or attributes/methods that do not exist) triggers an error.
             *
             * When set to `true`, accessing invalid variables triggers an error.
             */
            strict?: boolean;
            templateLoader?: TwingTemplateLoader;
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
     * @throws {TwingTemplateLoadingError} When no embedded template exists for the passed identifier.
     */
    loadTemplate(
        executionContext: TwingExecutionContext,
        identifier: TwingTemplate | string | Array<string | TwingTemplate | null>,
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
            templateLoader?: TwingTemplateLoader;
        }
    ): Promise<string>;
}

export interface TwingSynchronousTemplate {
    readonly aliases: TwingSynchronousTemplateAliases;
    readonly ast: TwingTemplateNode;
    readonly blockHandlers: Map<string, TwingSynchronousTemplateBlockHandler>;
    readonly canBeUsedAsATrait: boolean;
    readonly embeddedTemplates: Map<number, TwingSynchronousTemplate>;
    readonly source: TwingSource;
    readonly macroHandlers: Map<string, TwingSynchronousTemplateMacroHandler>;
    readonly name: string;

    displayBlock(
        executionContext: TwingSynchronousExecutionContext,
        name: string,
        useBlocks: boolean
    ): void;

    displayParentBlock(
        executionContext: TwingSynchronousExecutionContext,
        name: string
    ): void;

    /**
     * Semantically speaking, provide a closure to the template:
     *   * an environment providing the filters, functions, globals and tests;
     *   * a context providing the variables;
     *   * a block map providing the available blocks;
     *   * an output buffer providing the mean to output the result of an expression.
     *
     * Technically speaking, execute the template and stream the result to the output buffer.
     *
     * @param environment
     * @param context
     * @param blocks
     * @param outputBuffer
     * @param options
     */
    execute(
        environment: TwingSynchronousEnvironment,
        context: Map<string, any>,
        blocks: TwingSynchronousTemplateBlockMap,
        outputBuffer: TwingOutputBuffer,
        options?: {
            nodeExecutor?: TwingSynchronousNodeExecutor;
            sandboxed?: boolean;
            sourceMapRuntime?: TwingSourceMapRuntime;
            /**
             * Controls whether accessing invalid variables (variables and or attributes/methods that do not exist) triggers an error.
             *
             * When set to `true`, accessing invalid variables triggers an error.
             */
            strict?: boolean;
            templateLoader?: TwingSynchronousTemplateLoader;
        }
    ): void;

    getBlocks(executionContext: TwingSynchronousExecutionContext): TwingSynchronousTemplateBlockMap;

    getParent(executionContext: TwingSynchronousExecutionContext): TwingSynchronousTemplate | null;

    getTraits(executionContext: TwingSynchronousExecutionContext): TwingSynchronousTemplateBlockMap;

    hasBlock(
        executionContext: TwingSynchronousExecutionContext,
        name: string,
        blocks: TwingSynchronousTemplateBlockMap
    ): boolean;

    hasMacro(name: string): boolean;

    /**
     * @throws {TwingTemplateLoadingError} When no embedded template exists for the passed identifier.
     */
    loadTemplate(
        executionContext: TwingSynchronousExecutionContext,
        identifier: TwingSynchronousTemplate | string | Array<string | TwingSynchronousTemplate | null>,
    ): TwingSynchronousTemplate;

    render(
        environment: TwingSynchronousEnvironment,
        context: Map<string, any>,
        options?: {
            nodeExecutor?: TwingSynchronousNodeExecutor;
            outputBuffer?: TwingOutputBuffer;
            sandboxed?: boolean;
            sourceMapRuntime?: TwingSourceMapRuntime;
            /**
             * Controls whether accessing invalid variables (variables and or attributes/methods that do not exist) triggers an error.
             *
             * When set to `true`, accessing invalid variables triggers an error.
             */
            strict?: boolean;
            templateLoader?: TwingSynchronousTemplateLoader;
        }
    ): string;
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
    const embeddedTemplates: Map<number, TwingTemplate> = new Map();

    for (const embeddedTemplate of ast.embeddedTemplates) {
        embeddedTemplates.set(embeddedTemplate.attributes.index, createTemplate(embeddedTemplate));
    }

    // parent
    let parent: TwingTemplate | null = null;

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

    /**
     * Tries to load templates consecutively from an array.
     *
     * Similar to loadTemplate() but it also accepts instances of TwingTemplate and an array of templates where each is tried to be loaded.
     *
     * @param executionContext
     * @param names A template or an array of templates to try consecutively
     */
    const resolveTemplate = (
        executionContext: TwingExecutionContext,
        names: Array<string | TwingTemplate | null>
    ) => {
        const loadTemplateAtIndex = (index: number): Promise<TwingTemplate> => {
            if (index < names.length) {
                const name = names[index];

                if (name === null) {
                    return loadTemplateAtIndex(index + 1);
                }
                else if (typeof name !== "string") {
                    return Promise.resolve(name);
                }
                else {
                    return template.loadTemplate(executionContext, name)
                        .catch(() => {
                            return loadTemplateAtIndex(index + 1);
                        });
                }
            }
            else {
                // todo: use traceable method?
                return Promise.reject(createTemplateLoadingError((names as Array<string | null>).map((name) => {
                    if (name === null) {
                        return '';
                    }

                    return name;
                })));
            }
        };

        return loadTemplateAtIndex(0);
    };

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
        get embeddedTemplates() {
            return embeddedTemplates;
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
                    }
                    else if ((block = ownBlocks.get(name)) !== undefined) {
                        const [blockTemplate, blockName] = block;

                        blockHandler = blockTemplate.blockHandlers.get(blockName);
                    }

                    if (blockHandler) {
                        return blockHandler(executionContext);
                    }
                    else {
                        return template.getParent(executionContext).then((parent) => {
                            if (parent) {
                                return parent.displayBlock(executionContext, name, false);
                            }
                            else {
                                const block = blocks.get(name);

                                if (block) {
                                    const [blockTemplate] = block!;

                                    throw new Error(`Block "${name}" should not call parent() in "${blockTemplate.name}" as the block does not exist in the parent template "${template.name}".`);
                                }
                                else {
                                    throw new Error(`Block "${name}" on template "${template.name}" does not exist.`);
                                }
                            }
                        });

                    }
                });
        },
        displayParentBlock: (executionContext: TwingExecutionContext, name: string): Promise<void> => {
            return template.getTraits(executionContext)
                .then((traits) => {
                    const trait = traits.get(name);

                    if (trait) {
                        const [blockTemplate, blockName] = trait;

                        return blockTemplate.displayBlock(executionContext, blockName, false);
                    }
                    else {
                        return template.getParent(executionContext)
                            .then((parent) => {
                                if (parent !== null) {
                                    return parent.displayBlock(executionContext, name, false);
                                }
                                else {
                                    throw new Error(`The template has no parent and no traits defining the "${name}" block.`);
                                }
                            });
                    }
                });

        },
        execute: async (environment, context, blocks, outputBuffer, options) => {
            const aliases = template.aliases.clone();
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
                blocks = mergeIterables(ownBlocks, blocks);

                return nodeExecutor(ast, {
                    ...executionContext,
                    blocks
                }).then(() => {
                    if (parent) {
                        return parent.execute(environment, context, blocks, outputBuffer, options);
                    }
                });
            });
        },
        getBlocks: (executionContext) => {
            if (blocks) {
                return Promise.resolve(blocks);
            }
            else {
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
                            parentNode,
                            template.source
                        );

                        const loadedParent = await loadTemplate(executionContext, parentName);

                        if (parentNode.type === "constant") {
                            parent = loadedParent;
                        }

                        return loadedParent;
                    });
            }
            else {
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
                        templateNameNode,
                        template.source
                    );

                    const traitTemplate = await loadTemplate(executionContext, templateName);

                    if (!traitTemplate.canBeUsedAsATrait) {
                        throw createRuntimeError(`Template ${templateName} cannot be used as a trait.`, templateNameNode, template.source);
                    }

                    const traitBlocks = cloneMap(await traitTemplate.getBlocks(executionContext));

                    for (const [key, target] of getChildren(targets)) {
                        const traitBlock = traitBlocks.get(key);

                        if (!traitBlock) {
                            throw createRuntimeError(`Block "${key}" is not defined in trait "${templateName}".`, templateNameNode, template.source);
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
            }
            else {
                return template.getBlocks(executionContext)
                    .then((blocks) => {
                        if (blocks.has(name)) {
                            return Promise.resolve(true);
                        }
                        else {
                            return template.getParent(executionContext)
                                .then((parent) => {
                                    if (parent) {
                                        return parent.hasBlock(executionContext, name, blocks);
                                    }
                                    else {
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
            }
            else if (Array.isArray(identifier)) {
                promise = resolveTemplate(executionContext, identifier);
            }
            else {
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
                new Map(),
                outputBuffer,
                options
            ).then(() => {
                return outputBuffer.getAndFlush();
            });
        }
    };

    const aliases: TwingTemplateAliases = createContext();

    aliases.set(`_self`, template);

    return template;
};

export const createSynchronousTemplate = (
    ast: TwingTemplateNode
): TwingSynchronousTemplate => {
    // blocks
    const blockHandlers: Map<string, TwingSynchronousTemplateBlockHandler> = new Map();

    let blocks: TwingSynchronousTemplateBlockMap | null = null;

    const {blocks: blockNodes} = ast.children;

    for (const [name, blockNode] of getChildren(blockNodes)) {
        const blockHandler: TwingSynchronousTemplateBlockHandler = (executionContent) => {
            const aliases = {...template.aliases};

            return executionContent.nodeExecutor(blockNode.children.body, {
                ...executionContent,
                aliases,
                template
            });
        };

        blockHandlers.set(name, blockHandler);
    }

    // macros
    const macroHandlers: Map<string, TwingSynchronousTemplateMacroHandler> = new Map();

    const {macros: macrosNode} = ast.children;

    for (const [name, macroNode] of Object.entries(macrosNode.children)) {
        const macroHandler: TwingSynchronousTemplateMacroHandler = (executionContent, ...args) => {
            const {environment, nodeExecutor, outputBuffer} = executionContent;
            const {body, arguments: macroArguments} = macroNode.children;
            const keyValuePairs = getKeyValuePairs(macroArguments);

            const aliases = {...template.aliases};

            const localVariables: Map<string, any> = new Map();

            for (const {key: keyNode, value: defaultValueNode} of keyValuePairs) {
                const key = keyNode.attributes.value as string;
                const defaultValue = nodeExecutor(defaultValueNode, {
                    ...executionContent,
                    aliases,
                    blocks: new Map(),
                    context: new Map()
                });

                let value = args.shift();

                if (value === undefined) {
                    value = defaultValue;
                }

                localVariables.set(key, value);
            }

            localVariables.set('varargs', args);

            const context = localVariables;
            const blocks = new Map();

            outputBuffer.start();

            try {
                nodeExecutor(body, {
                    ...executionContent,
                    aliases,
                    blocks,
                    context,
                    template
                });

                const content = outputBuffer.getContents();

                return createMarkup(content, environment.charset);
            } finally {
                outputBuffer.endAndClean();
            }
        };

        macroHandlers.set(name, macroHandler);
    }

    // traits
    let traits: TwingSynchronousTemplateBlockMap | null = null;

    // embedded templates
    const embeddedTemplates: Map<number, TwingSynchronousTemplate> = new Map();

    for (const embeddedTemplate of ast.embeddedTemplates) {
        embeddedTemplates.set(embeddedTemplate.attributes.index, createSynchronousTemplate(embeddedTemplate));
    }

    // parent
    let parent: TwingSynchronousTemplate | null = null;

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

    /**
     * Tries to load templates consecutively from an array.
     *
     * Similar to loadTemplate() but it also accepts instances of TwingTemplate and an array of templates where each is tried to be loaded.
     *
     * @param executionContext
     * @param names A template or an array of templates to try consecutively
     */
    const resolveTemplate = (
        executionContext: TwingSynchronousExecutionContext,
        names: Array<string | TwingSynchronousTemplate | null>
    ) => {
        const loadTemplateAtIndex = (index: number): TwingSynchronousTemplate => {
            if (index < names.length) {
                const name = names[index];

                if (name === null) {
                    return loadTemplateAtIndex(index + 1);
                }
                else if (typeof name !== "string") {
                    return name;
                }
                else {
                    try {
                        return template.loadTemplate(executionContext, name);
                    } catch (error) {
                        return loadTemplateAtIndex(index + 1);
                    }
                }
            }
            else {
                throw createTemplateLoadingError((names as Array<string | null>).map((name) => {
                    if (name === null) {
                        return '';
                    }

                    return name;
                }));
            }
        };

        return loadTemplateAtIndex(0);
    };

    const template: TwingSynchronousTemplate = {
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
        get embeddedTemplates() {
            return embeddedTemplates;
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

            const ownBlocks = template.getBlocks(executionContext);

            let blockHandler: TwingSynchronousTemplateBlockHandler | undefined;
            let block: [TwingSynchronousTemplate, string] | undefined;

            if (useBlocks && (block = blocks.get(name)) !== undefined) {
                const [blockTemplate, blockName] = block;

                blockHandler = blockTemplate.blockHandlers.get(blockName);
            }
            else if ((block = ownBlocks.get(name)) !== undefined) {
                const [blockTemplate, blockName] = block;

                blockHandler = blockTemplate.blockHandlers.get(blockName);
            }

            if (blockHandler) {
                return blockHandler(executionContext);
            }
            else {
                const parent = template.getParent(executionContext);

                if (parent) {
                    return parent.displayBlock(executionContext, name, false);
                }
                else {
                    const block = blocks.get(name);

                    if (block) {
                        const [blockTemplate] = block!;

                        throw new Error(`Block "${name}" should not call parent() in "${blockTemplate.name}" as the block does not exist in the parent template "${template.name}".`);
                    }
                    else {
                        throw new Error(`Block "${name}" on template "${template.name}" does not exist.`);
                    }
                }
            }
        },
        displayParentBlock: (executionContext: TwingSynchronousExecutionContext, name: string): void => {
            const traits = template.getTraits(executionContext);

            const trait = traits.get(name);

            if (trait) {
                const [blockTemplate, blockName] = trait;

                return blockTemplate.displayBlock(executionContext, blockName, false);
            }
            else {
                const parent = template.getParent(executionContext);

                if (parent !== null) {
                    return parent.displayBlock(executionContext, name, false);
                }
                else {
                    throw new Error(`The template has no parent and no traits defining the "${name}" block.`);
                }
            }
        },
        execute: (environment, context, blocks, outputBuffer, options) => {
            const aliases = {...template.aliases};
            const nodeExecutor = options?.nodeExecutor || executeNodeSynchronously;
            const sandboxed = options?.sandboxed || false;
            const sourceMapRuntime = options?.sourceMapRuntime;
            const templateLoader = options?.templateLoader || createSynchronousTemplateLoader(environment);

            const executionContext: TwingSynchronousExecutionContext = {
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

            const parent = template.getParent(executionContext);
            const ownBlocks = template.getBlocks(executionContext);

            blocks = mergeIterables(ownBlocks, blocks);

            nodeExecutor(ast, {
                ...executionContext,
                blocks
            });

            if (parent) {
                return parent.execute(environment, context, blocks, outputBuffer, options);
            }
        },
        getBlocks: (executionContext) => {
            if (blocks !== null) {
                return blocks;
            }

            const traits = template.getTraits(executionContext);

            blocks = mergeIterables(traits, new Map([...blockHandlers.keys()].map((key) => {
                return [key, [template, key]];
            })));

            return blocks;
        },
        getParent: (executionContext) => {
            if (parent !== null) {
                return parent;
            }

            const parentNode = ast.children.parent;

            if (parentNode) {
                const {nodeExecutor} = executionContext;

                const blocks = template.getBlocks(executionContext);

                const parentName = nodeExecutor(parentNode, {
                    ...executionContext,
                    aliases: {},
                    blocks
                });

                const loadTemplate = getSynchronousTraceableMethod(
                    template.loadTemplate,
                    parentNode,
                    template.source
                );

                const loadedParent = loadTemplate(executionContext, parentName);

                if (parentNode.type === "constant") {
                    parent = loadedParent;
                }

                return loadedParent;
            }
            else {
                return null;
            }
        },
        getTraits: (executionContext) => {
            if (traits === null) {
                traits = new Map();

                const {traits: traitsNode} = ast.children;

                for (const [, traitNode] of getChildren(traitsNode)) {
                    const {template: templateNameNode, targets} = traitNode.children;
                    const templateName = templateNameNode.attributes.value as string;

                    const loadTemplate = getSynchronousTraceableMethod(
                        template.loadTemplate,
                        templateNameNode,
                        template.source
                    );

                    const traitTemplate = loadTemplate(executionContext, templateName);

                    if (!traitTemplate.canBeUsedAsATrait) {
                        throw createRuntimeError(`Template ${templateName} cannot be used as a trait.`, templateNameNode, template.source);
                    }

                    const traitBlocks = cloneMap(traitTemplate.getBlocks(executionContext));

                    for (const [key, target] of getChildren(targets)) {
                        const traitBlock = traitBlocks.get(key);

                        if (!traitBlock) {
                            throw createRuntimeError(`Block "${key}" is not defined in trait "${templateName}".`, templateNameNode, template.source);
                        }

                        const targetValue = (target as TwingConstantNode<string>).attributes.value;

                        traitBlocks.set(targetValue, traitBlock);
                        traitBlocks.delete((key as string));
                    }

                    traits = mergeIterables(traits, traitBlocks);
                }
            }

            return traits;
        },
        hasBlock: (executionContext, name, blocks): boolean => {
            if (blocks.has(name)) {
                return true;
            }
            else {
                const blocks = template.getBlocks(executionContext);

                if (blocks.has(name)) {
                    return true;
                }
                else {
                    const parent = template.getParent(executionContext)
                    if (parent) {
                        return parent.hasBlock(executionContext, name, blocks);
                    }
                    else {
                        return false;
                    }
                }
            }
        },
        hasMacro: (name) => {
            // @see https://github.com/twigphp/Twig/issues/3174 as to why we don't check macro existence in parents
            return template.macroHandlers.has(name);
        },
        loadTemplate: (executionContext, identifier) => {
            if (typeof identifier === "string") {
                const loadedTemplate = executionContext.templateLoader(identifier, template.name);

                if (loadedTemplate === null) {
                    throw createTemplateLoadingError([identifier]);
                }

                return loadedTemplate;
            }
            else if (Array.isArray(identifier)) {
                return resolveTemplate(executionContext, identifier);
            }
            else {
                return identifier;
            }
        },
        render: (environment, context, options) => {
            const outputBuffer = options?.outputBuffer || createOutputBuffer();

            outputBuffer.start();
            
            template.execute(
                environment,
                context,
                new Map(),
                outputBuffer,
                options
            );

            return outputBuffer.getAndFlush();
        }
    };

    const aliases: TwingSynchronousTemplateAliases = {};

    aliases[`_self`] = template;

    return template;
};
