import {createContext, TwingContext} from "./context";
import {TwingEnvironment} from "./environment";
import {createOutputBuffer, TwingOutputBuffer} from "./output-buffer";
import {TwingSourceMapRuntime} from "./source-map-runtime";
import {TwingTemplateNode} from "./node/template";
import {mergeIterables} from "./helpers/merge-iterables";
import {createRuntimeError} from "./error/runtime";
import {createNode, getChildren, getChildrenCount, TwingBaseNode} from "./node";
import {TwingError} from "./error";
import {createMarkup, isAMarkup, TwingMarkup} from "./markup";
import {createTemplateLoadingError, isATemplateLoadingError} from "./error/loader";
import {cloneMap} from "./helpers/clone-map";
import {iteratorToMap} from "./helpers/iterator-to-map";
import {createSource, TwingSource} from "./source";
import {TwingFilter} from "./filter";
import {TwingFunction} from "./function";
import {TwingTest} from "./test";
import {getFilter} from "./helpers/get-filter";
import {getTest} from "./helpers/get-test";
import {getFunction} from "./helpers/get-function";
import * as createHash from "create-hash";
import {TwingEscapingStrategy} from "./escaping-strategy";
import {getTraceableMethod} from "./helpers/traceable-method";
import {TwingConstantNode} from "./node/expression/constant";
import {executeNode, type TwingNodeExecutor} from "./node-executor";
import {getKeyValuePairs} from "./helpers/get-key-value-pairs";

export type TwingTemplateBlockMap = Map<string, [TwingTemplate, string]>;
export type TwingTemplateBlockHandler = (
    context: TwingContext<any, any>,
    outputBuffer: TwingOutputBuffer,
    blocks: TwingTemplateBlockMap,
    sandboxed: boolean,
    nodeExecutor: TwingNodeExecutor,
    sourceMapRuntime?: TwingSourceMapRuntime
) => Promise<void>;
export type TwingTemplateMacroHandler = (
    outputBuffer: TwingOutputBuffer,
    sandboxed: boolean,
    sourceMapRuntime: TwingSourceMapRuntime | undefined,
    nodeExecutor: TwingNodeExecutor,
    ...macroArguments: Array<any>
) => Promise<TwingMarkup>;

export type TwingTemplateAliases = TwingContext<string, TwingTemplate>;

export interface TwingTemplate {
    readonly aliases: TwingTemplateAliases;
    readonly ast: TwingTemplateNode;
    readonly blockHandlers: Map<string, TwingTemplateBlockHandler>;
    readonly canBeUsedAsATrait: boolean;
    readonly source: TwingSource;
    readonly macroHandlers: Map<string, TwingTemplateMacroHandler>;
    readonly name: string;

    /**
     * @param candidate
     * @param method
     *
     * @throws {@link TwingSandboxSecurityNotAllowedMethodError} When the method of the passed candidate is not allowed to be executed
     */
    checkMethodAllowed(candidate: any | TwingMarkup, method: string): void;

    /**
     * @param candidate
     * @param property
     *
     * @throws {@link TwingSandboxSecurityNotAllowedPropertyError} When the property of the passed candidate is not allowed to be accessed
     */
    checkPropertyAllowed(candidate: any | TwingMarkup, property: string): void;

    checkSecurity(tags: Array<string>, filters: Array<string>, functions: Array<string>): void;

    createTemplateFromString(content: string, name: string | null): Promise<TwingTemplate>;

    displayBlock(
        name: string,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TwingTemplateBlockMap,
        useBlocks: boolean,
        sandboxed: boolean,
        nodeExecutor: TwingNodeExecutor,
        sourceMapRuntime?: TwingSourceMapRuntime
    ): Promise<void>;

    escape(value: string | boolean | TwingMarkup | null | undefined, strategy: TwingEscapingStrategy | string, charset: string | null, autoEscape?: boolean): Promise<string | boolean | TwingMarkup>;

    execute(
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        childBlocks: TwingTemplateBlockMap,
        nodeExecutor: TwingNodeExecutor,
        options?: {
            sandboxed?: boolean,
            sourceMapRuntime?: TwingSourceMapRuntime
        }
    ): Promise<void>;

    getBlocks(): Promise<TwingTemplateBlockMap>;

    getFilter(name: string): TwingFilter | null;

    getFunction(name: string): TwingFunction | null;

    getParent(
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        sandboxed: boolean,
        nodeExecutor: TwingNodeExecutor,
        sourceMapRuntime?: TwingSourceMapRuntime
    ): Promise<TwingTemplate | null>;

    getTemplateSource(name: string): Promise<TwingSource | null>;

    getTest(name: string): TwingTest | null;

    getTraits(): Promise<TwingTemplateBlockMap>;

    hasBlock(
        name: string,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TwingTemplateBlockMap,
        sandboxed: boolean,
        nodeExecutor: TwingNodeExecutor,
        sourceMapRuntime?: TwingSourceMapRuntime
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
     * @param identifier
     *
     * @throws {TwingTemplateLoadingError} When no embedded template exists for the passed identifier.
     */
    loadTemplate(
        identifier: TwingTemplate | string | Array<TwingTemplate | null>
    ): Promise<TwingTemplate>;

    render(
        context: Record<string, any>,
        options?: {
            nodeExecutor?: TwingNodeExecutor;
            outputBuffer?: TwingOutputBuffer;
            sandboxed?: boolean;
            sourceMapRuntime?: TwingSourceMapRuntime;
        }
    ): Promise<string>;

    renderBlock(
        name: string,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TwingTemplateBlockMap,
        useBlocks: boolean,
        sandboxed: boolean,
        nodeExecutor: TwingNodeExecutor,
        sourceMapRuntime?: TwingSourceMapRuntime
    ): Promise<string>;

    renderParentBlock(
        name: string,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        sandboxed: boolean,
        nodeExecutor: TwingNodeExecutor,
        sourceMapRuntime?: TwingSourceMapRuntime
    ): Promise<string>;

    /**
     * Tries to load templates consecutively from an array.
     *
     * Similar to loadTemplate() but it also accepts instances of TwingTemplate and an array of templates where each is tried to be loaded.
     *
     * @param names A template or an array of templates to try consecutively
     */
    resolveTemplate(names: Array<string | TwingTemplate | null>): Promise<TwingTemplate>;
}

export const createTemplate = (
    environment: TwingEnvironment,
    ast: TwingTemplateNode
): TwingTemplate => {
    const {charset, dateFormat, dateIntervalFormat, isStrictVariables, numberFormat, timezone} = environment

    // blocks
    const blockHandlers: Map<string, TwingTemplateBlockHandler> = new Map();

    let blocks: TwingTemplateBlockMap | null = null;

    const {blocks: blockNodes} = ast.children;

    for (const [name, blockNode] of getChildren(blockNodes)) {
        const blockHandler: TwingTemplateBlockHandler = (context, outputBuffer, blocks, sandboxed, nodeExecutor, sourceMapRuntime) => {
            const aliases = template.aliases.clone();

            return nodeExecutor(blockNode.children.body, {
                aliases,
                blocks,
                charset,
                context,
                dateFormat,
                dateIntervalFormat,
                isStrictVariables,
                nodeExecutor,
                numberFormat,
                outputBuffer,
                sandboxed,
                sourceMapRuntime,
                template,
                timezone
            });
        };

        blockHandlers.set(name, blockHandler);
    }

    // macros
    const macroHandlers: Map<string, TwingTemplateMacroHandler> = new Map();

    const {macros: macrosNode} = ast.children;

    for (const [name, macroNode] of Object.entries(macrosNode.children)) {
        const macroHandler: TwingTemplateMacroHandler = async (outputBuffer, sandboxed, sourceMapRuntime, nodeExecutor, ...args) => {
            const {body, arguments: macroArguments} = macroNode.children;
            const keyValuePairs = getKeyValuePairs(macroArguments);

            const aliases = template.aliases.clone();

            const localVariables: Map<string, any> = new Map();

            for (const {key: keyNode, value: defaultValueNode} of keyValuePairs) {
                const key = keyNode.attributes.value as string;
                const defaultValue = await nodeExecutor(defaultValueNode, {
                    aliases,
                    blocks: new Map(),
                    charset,
                    context: createContext(),
                    dateFormat,
                    dateIntervalFormat,
                    isStrictVariables,
                    nodeExecutor,
                    numberFormat,
                    outputBuffer,
                    sandboxed,
                    sourceMapRuntime,
                    template,
                    timezone
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
                aliases,
                blocks,
                charset,
                context,
                dateFormat,
                dateIntervalFormat,
                isStrictVariables,
                nodeExecutor,
                numberFormat,
                outputBuffer,
                sandboxed,
                sourceMapRuntime,
                template,
                timezone
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

    const displayParentBlock = (name: string, context: TwingContext<any, any>, outputBuffer: TwingOutputBuffer, blocks: TwingTemplateBlockMap, sandboxed: boolean, nodeExecutor: TwingNodeExecutor, sourceMapRuntime?: TwingSourceMapRuntime): Promise<void> => {
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
                        sandboxed,
                        nodeExecutor,
                        sourceMapRuntime
                    );
                }
                else {
                    return template.getParent(context, outputBuffer, sandboxed, nodeExecutor, sourceMapRuntime)
                        .then((parent) => {
                            if (parent !== null) {
                                return parent.displayBlock(name, context, outputBuffer, blocks, false, sandboxed, nodeExecutor, sourceMapRuntime);
                            }
                            else {
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
        checkMethodAllowed: environment.sandboxPolicy.checkMethodAllowed,
        checkPropertyAllowed: environment.sandboxPolicy.checkPropertyAllowed,
        checkSecurity: environment.sandboxPolicy.checkSecurity,
        createTemplateFromString: (code, name) => {
            const hash: string = createHash("sha256").update(code).digest("hex").toString();

            if (name !== null) {
                name = `${name} (string template ${hash})`;
            }
            else {
                name = `__string_template__${hash}`;
            }

            const ast = environment.parse(environment.tokenize(createSource(name, code)));
            const template = createTemplate(environment, ast);

            return Promise.resolve(template);
        },
        displayBlock: (name, context, outputBuffer, blocks, useBlocks, sandboxed, nodeExecutor, sourceMapRuntime) => {
            return template.getBlocks()
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
                        return blockHandler(context, outputBuffer, blocks, sandboxed, nodeExecutor, sourceMapRuntime);
                    }
                    else {
                        return template.getParent(context, outputBuffer, sandboxed, nodeExecutor, sourceMapRuntime).then((parent) => {
                            if (parent) {
                                return parent.displayBlock(name, context, outputBuffer, mergeIterables(ownBlocks, blocks), false, sandboxed, nodeExecutor, sourceMapRuntime);
                            }
                            else {
                                const block = blocks.get(name);

                                if (block) {
                                    const [blockTemplate] = block!;

                                    throw createRuntimeError(`Block "${name}" should not call parent() in "${blockTemplate.name}" as the block does not exist in the parent template "${template.name}".`, undefined, blockTemplate.name);
                                }
                                else {
                                    throw createRuntimeError(`Block "${name}" on template "${template.name}" does not exist.`, undefined, template.name);
                                }
                            }
                        });

                    }
                });
        },
        escape: (value, strategy, charset) => {
            if (typeof value === "boolean") {
                return Promise.resolve(value);
            }

            if (isAMarkup(value)) {
                return Promise.resolve(value);
            }

            let result: string;

            if ((value === null) || (value === undefined)) {
                result = '';
            }
            else {
                const strategyHandler = environment.escapingStrategyHandlers[strategy];

                if (strategyHandler === undefined) {
                    return Promise.reject(createRuntimeError(`Invalid escaping strategy "${strategy}" (valid ones: ${Object.keys(environment.escapingStrategyHandlers).sort().join(', ')}).`));
                }

                result = strategyHandler(value.toString(), charset || environment.charset, template.name);
            }

            return Promise.resolve(result);
        },
        execute: async (context, outputBuffer, childBlocks, nodeExecutor, options) => {
            const aliases = template.aliases.clone();

            const sandboxed = options?.sandboxed || false;
            const sourceMapRuntime = options?.sourceMapRuntime;

            return Promise.all([
                template.getParent(context, outputBuffer, sandboxed, nodeExecutor, sourceMapRuntime),
                template.getBlocks()
            ]).then(([parent, ownBlocks]) => {
                const blocks = mergeIterables(ownBlocks, childBlocks);

                return nodeExecutor(ast, {
                    aliases,
                    blocks,
                    charset,
                    context,
                    dateFormat,
                    dateIntervalFormat,
                    isStrictVariables,
                    nodeExecutor,
                    numberFormat,
                    outputBuffer,
                    sandboxed,
                    sourceMapRuntime,
                    template,
                    timezone
                }).then(() => {
                    if (parent) {
                        return parent.execute(context, outputBuffer, blocks, nodeExecutor, {
                            sandboxed,
                            sourceMapRuntime
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
        getBlocks: () => {
            if (blocks) {
                return Promise.resolve(blocks);
            }
            else {
                return template.getTraits()
                    .then((traits) => {
                        blocks = mergeIterables(traits, new Map([...blockHandlers.keys()].map((key) => {
                            return [key, [template, key]];
                        })));

                        return blocks;
                    });
            }
        },
        getFilter: (name) => {
            return getFilter(environment.filters, name);
        },
        getFunction: (name) => {
            return getFunction(environment.functions, name);
        },
        getParent: async (context, outputBuffer, sandboxed, nodeExecutor, sourceMapRuntime) => {
            if (parent !== null) {
                return Promise.resolve(parent);
            }

            const parentNode = ast.children.parent;

            if (parentNode) {
                return template.getBlocks()
                    .then(async (blocks) => {
                        const parentName = await nodeExecutor(parentNode, {
                            aliases: createContext(),
                            blocks,
                            charset,
                            context,
                            dateFormat,
                            dateIntervalFormat,
                            isStrictVariables,
                            nodeExecutor,
                            numberFormat,
                            outputBuffer,
                            sandboxed,
                            sourceMapRuntime,
                            template,
                            timezone
                        });

                        const loadTemplate = getTraceableMethod(
                            template.loadTemplate,
                            parentNode.line,
                            parentNode.column,
                            template.name
                        );

                        const loadedParent = await loadTemplate(parentName);

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
        getTemplateSource: (name) => {
            return environment.loader.getSource(name, template.name);
        },
        getTest: (name) => {
            return getTest(environment.tests, name);
        },
        getTraits: async () => {
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

                    const traitTemplate = await loadTemplate(templateName);

                    if (!traitTemplate.canBeUsedAsATrait) {
                        throw createRuntimeError(`Template ${templateName} cannot be used as a trait.`, templateNameNode, template.name);
                    }

                    const traitBlocks = cloneMap(await traitTemplate.getBlocks());

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
        hasBlock: (name, context, outputBuffer, blocks, sandboxed, nodeExecutor, sourceMapRuntime): Promise<boolean> => {
            if (blocks.has(name)) {
                return Promise.resolve(true);
            }
            else {
                return template.getBlocks()
                    .then((blocks) => {
                        if (blocks.has(name)) {
                            return Promise.resolve(true);
                        }
                        else {
                            return template.getParent(context, outputBuffer, sandboxed, nodeExecutor, sourceMapRuntime)
                                .then((parent) => {
                                    if (parent) {
                                        return parent.hasBlock(name, context, outputBuffer, blocks, sandboxed, nodeExecutor, sourceMapRuntime);
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
        loadEmbeddedTemplate: (index) => {
            const ast = embeddedTemplates.get(index);

            if (ast === undefined) {
                return Promise.reject(createTemplateLoadingError([`embedded#${index}`]));
            }

            return Promise.resolve(createTemplate(environment, ast));
        },
        loadTemplate: (identifier) => {
            let promise: Promise<TwingTemplate>;

            if (typeof identifier === "string") {
                promise = environment.loadTemplate(identifier, template.name);
            }
            else if (Array.isArray(identifier)) {
                promise = template.resolveTemplate(identifier);
            }
            else {
                promise = Promise.resolve(identifier);
            }

            return promise;
        },
        render: (context, options) => {
            const actualOutputBuffer: TwingOutputBuffer = options?.outputBuffer || createOutputBuffer();

            actualOutputBuffer.start();

            const nodeExecutor = options?.nodeExecutor || executeNode;

            return template.execute(
                createContext(iteratorToMap(context)),
                actualOutputBuffer,
                new Map(),
                nodeExecutor,
                {
                    sandboxed: options?.sandboxed,
                    sourceMapRuntime: options?.sourceMapRuntime
                }
            ).then(() => {
                return actualOutputBuffer.getAndFlush();
            });
        },
        renderBlock: (name, context, outputBuffer, blocks, useBlocks, sandboxed, nodeExecutor, sourceMapRuntime) => {
            outputBuffer.start();

            return template.displayBlock(name, context, outputBuffer, blocks, useBlocks, sandboxed, nodeExecutor, sourceMapRuntime).then(() => {
                return outputBuffer.getAndClean();
            });
        },
        renderParentBlock: (name, context, outputBuffer, sandboxed, nodeExecutor, sourceMapRuntime) => {
            outputBuffer.start();

            return template.getBlocks()
                .then((blocks) => {
                    return displayParentBlock(name, context, outputBuffer, blocks, sandboxed, nodeExecutor, sourceMapRuntime).then(() => {
                        return outputBuffer.getAndClean();
                    })
                });
        },
        resolveTemplate: (names) => {
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
                        return template.loadTemplate(name)
                            .catch(() => {
                                return loadTemplateAtIndex(index + 1);
                            });
                    }
                }
                else {
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
