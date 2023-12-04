import {TwingTagHandler} from "./tag-handler";
import {TwingNodeVisitor} from "./node-visitor";
import {createExtensionSet} from "./extension-set";
import {TwingFilter} from "./filter";
import {createParser, TwingParser, TwingParserOptions} from "./parser";
import {TwingLoader} from "./loader";
import {TwingTest} from "./test";
import {TwingFunction} from "./function";
import {TwingOperator} from "./operator";
import {TwingEscapingStrategy, TwingEscapingStrategyHandler} from "./escaping-strategy";
import {createHtmlEscapingStrategyHandler} from "./escaping-stragegy/html";
import {createCssEscapingStrategyHandler} from "./escaping-stragegy/css";
import {createJsEscapingStrategyHandler} from "./escaping-stragegy/js";
import {createUrlEscapingStrategyHandler} from "./escaping-stragegy/url";
import {createHtmlAttributeEscapingStrategyHandler} from "./escaping-stragegy/html-attribute";
import {TwingSource} from "./source";
import {createTokenStream, TwingTokenStream} from "./token-stream";
import {TwingExtension} from "./extension";
import {TwingTemplateNode} from "./node/template";
import {RawSourceMap} from "source-map";
import {createSourceMapRuntime} from "./source-map-runtime";
import {createSandboxSecurityPolicy, TwingSandboxSecurityPolicy} from "./sandbox/security-policy";
import {createTemplate, TwingTemplate} from "./template";
import {Settings as DateTimeSettings} from "luxon";
import {EventEmitter} from "events";
import {createTemplateLoadingError} from "./error/loader";
import {TwingParsingError} from "./error/parsing";
import {createLexer, TwingLexer} from "./lexer";
import {TwingCache} from "./cache";
import {createCoreExtension} from "./extension/core";
import {createAutoEscapeNode} from "../lib";

export type TwingNumberFormat = {
    numberOfDecimals: number;
    decimalPoint: string;
    thousandSeparator: string;
};

export type TwingEnvironmentOptions = {
    /**
     * The implicit auto-escaping strategy to apply to the templates.
     *
     * Analogous to adding an `autoescape` tag at the top of each loaded template.
     */
    autoEscapingStrategy?: string;

    /**
     * Controls whether the templates are recompiled whenever their content changes or not.
     *
     * When set to `true`, templates are recompiled whenever their content changes instead of fetching them from the persistent cache. Note that this won't invalidate the environment inner cache but only the cache passed using the `cache` option. Defaults to `false`.
     */
    autoReload?: boolean;
    /**
     * The persistent cache instance.
     */
    cache?: TwingCache;
    /**
     * The default charset. Defaults to "UTF-8".
     */
    charset?: string;
    dateFormat?: string;
    dateIntervalFormat?: string;
    numberFormat?: TwingNumberFormat;
    parserOptions?: TwingParserOptions;
    sandboxed?: boolean;
    sandboxPolicy?: TwingSandboxSecurityPolicy;
    /**
     * Controls whether accessing invalid variables (variables and or attributes/methods that do not exist) triggers a runtime error.
     *
     * When set to `true`, accessing invalid variables triggers a runtime error.
     * When set to `false`, accessing invalid variables returns `null`.
     *
     * Defaults to `false`.
     */
    strictVariables?: boolean;
    timezone?: string;
};

export interface TwingEnvironment {
    readonly charset: string;
    readonly dateFormat: string;
    readonly dateIntervalFormat: string;
    readonly escapingStrategyHandlers: Record<TwingEscapingStrategy, TwingEscapingStrategyHandler>;
    readonly numberFormat: TwingNumberFormat;
    readonly filters: Map<string, TwingFilter>;
    readonly functions: Map<string, TwingFunction>;
    readonly isStrictVariables: boolean;
    readonly loader: TwingLoader;
    readonly sandboxPolicy: TwingSandboxSecurityPolicy;
    readonly tests: Map<string, TwingTest>;
    readonly timezone: string;

    /**
     * Convenient method...
     *
     * @param extension
     */
    addExtension(extension: TwingExtension): void;

    addFilter(filter: TwingFilter): void;

    addFunction(aFunction: TwingFunction): void;

    addNodeVisitor(visitor: TwingNodeVisitor): void;

    addOperator(operator: TwingOperator): void;

    addTagHandler(parser: TwingTagHandler): void;

    addTest(test: TwingTest): void;

    /**
     * Loads a template by its name.
     *
     * @param name The name of the template to load
     * @param from The name of the template that requested the load
     *
     * @throws {TwingTemplateLoadingError}  When the template cannot be found
     * @throws {TwingParsingError} When an error occurred during the parsing of the source
     *
     * @return
     */
    loadTemplate(name: string, from?: string | null): Promise<TwingTemplate>;

    /**
     * Register the passed listener...
     *
     * When a template is encountered, Twing environment emits a `template` event with the name of the encountered template and the source of the template that initiated the loading.
     */
    on(eventName: "load", listener: (name: string, from: TwingSource | null) => void): void;

    /**
     * Converts a token list to a template.
     *
     * @param {TwingTokenStream} stream
     * @param {TwingParserOptions} options
     * *
     * @throws {TwingParsingError} When the token stream is syntactically or semantically wrong
     */
    parse(stream: TwingTokenStream, options?: TwingParserOptions): TwingTemplateNode;

    /**
     * Convenient method that renders a template from its name.
     */
    render(name: string, context: Record<string, any>): Promise<string>;

    /**
     * Convenient method that renders a template from its name and returns both the render result and its belonging source map.
     */
    renderWithSourceMap(name: string, context: Record<string, any>): Promise<{
        data: string;
        sourceMap: RawSourceMap;
    }>;

    registerEscapingStrategy(handler: TwingEscapingStrategyHandler, name: string): void;

    /**
     * Tokenizes a source code.
     *
     * @param {TwingSource} source The source to tokenize
     * @return {TwingTokenStream}
     */
    tokenize(source: TwingSource): TwingTokenStream;
}

/**
 * Creates an instance of {@link TwingEnvironment} backed by the passed loader.
 *
 * @param loader
 * @param options
 */
export const createEnvironment = (
    loader: TwingLoader,
    options?: TwingEnvironmentOptions
): TwingEnvironment => {
    const cssEscapingStrategy = createCssEscapingStrategyHandler();
    const htmlEscapingStrategy = createHtmlEscapingStrategyHandler();
    const htmlAttributeEscapingStrategy = createHtmlAttributeEscapingStrategyHandler();
    const jsEscapingStrategy = createJsEscapingStrategyHandler();
    const urlEscapingStrategy = createUrlEscapingStrategyHandler();

    const escapingStrategyHandlers: Record<TwingEscapingStrategy, TwingEscapingStrategyHandler> = {
        css: cssEscapingStrategy,
        html: htmlEscapingStrategy,
        html_attr: htmlAttributeEscapingStrategy,
        js: jsEscapingStrategy,
        url: urlEscapingStrategy
    };
    const extensionSet = createExtensionSet();

    extensionSet.addExtension(createCoreExtension());

    const shouldAutoReload = options?.autoReload || false;
    const cache: TwingCache | null = options?.cache || null;
    const charset = options?.charset || 'UTF-8';
    const dateFormat = options?.dateFormat || 'F j, Y H:i';
    const dateIntervalFormat = options?.dateIntervalFormat || '%d days';
    const numberFormat: TwingNumberFormat = options?.numberFormat || {
        decimalPoint: '.',
        numberOfDecimals: 0,
        thousandSeparator: ','
    };
    const eventEmitter = new EventEmitter();
    const sandboxPolicy = options?.sandboxPolicy || createSandboxSecurityPolicy();

    let isSandboxed = options?.sandboxed ? true : false;
    let lexer: TwingLexer;
    let parser: TwingParser;

    const loadedTemplates: Map<string, TwingTemplate> = new Map();

    const environment: TwingEnvironment = {
        get charset() {
            return charset;
        },
        get dateFormat() {
            return dateFormat;
        },
        get dateIntervalFormat() {
            return dateIntervalFormat;
        },
        get escapingStrategyHandlers() {
            return escapingStrategyHandlers;
        },
        get filters() {
            return extensionSet.filters;
        },
        get functions() {
            return extensionSet.functions;
        },
        get isStrictVariables() {
            return options?.strictVariables ? true : false;
        },
        get loader() {
            return loader;
        },
        get numberFormat() {
            return numberFormat;
        },
        get sandboxPolicy() {
            return sandboxPolicy;
        },
        get tests() {
            return extensionSet.tests;
        },
        get timezone() {
            return options?.timezone || DateTimeSettings.defaultZoneName
        },
        addExtension: extensionSet.addExtension,
        addFilter: extensionSet.addFilter,
        addFunction: extensionSet.addFunction,
        addNodeVisitor: extensionSet.addNodeVisitor,
        addOperator: extensionSet.addOperator,
        addTagHandler: extensionSet.addTagHandler,
        addTest: extensionSet.addTest,
        loadTemplate: async (name, from = null) => {
            eventEmitter.emit('load', name, from);

            let templateFqn = await loader.resolve(name, from) || name;
            let loadedTemplate = loadedTemplates.get(templateFqn);

            if (loadedTemplate) {
                return Promise.resolve(loadedTemplate);
            }
            else {
                const timestamp = cache ? await cache.getTimestamp(templateFqn) : 0;

                const getAstFromCache = async (): Promise<TwingTemplateNode | null> => {
                    if (cache === null) {
                        return Promise.resolve(null);
                    }

                    let content: TwingTemplateNode | null;

                    /**
                     * When auto-reload is disabled, we always challenge the cache
                     * When auto-reload is enabled, we challenge the cache only if the template is considered as fresh by the loader
                     */
                    if (shouldAutoReload) {
                        const isFresh = await loader.isFresh(name, timestamp, from);

                        if (isFresh) {
                            content = await cache.load(name);
                        }
                        else {
                            content = null;
                        }
                    }
                    else {
                        content = await cache.load(name);
                    }

                    return content;
                };

                const getAstFromLoader = async (): Promise<TwingTemplateNode | null> => {
                    const source = await loader.getSource(name, from);

                    if (source === null) {
                        return null;
                    }

                    const ast = environment.parse(environment.tokenize(source));

                    if (cache !== null) {
                        await cache.write(name, ast);
                    }

                    return ast;
                };

                let ast = await getAstFromCache();

                if (ast === null) {
                    ast = await getAstFromLoader();
                }

                if (ast === null) {
                    throw createTemplateLoadingError([name]);
                }

                const template = createTemplate(environment, ast);

                loadedTemplates.set(templateFqn, template);

                return template;
            }
        },
        on: (eventName, listener) => {
            eventEmitter.on(eventName, listener);
        },
        registerEscapingStrategy: (handler, name) => {
            escapingStrategyHandlers[name] = handler;
        },
        parse: (stream, parserOptions) => {
            if (!parser) {
                const visitors = extensionSet.nodeVisitors;

                if (options?.autoEscapingStrategy) {
                    const strategy = options.autoEscapingStrategy;

                    visitors.unshift({
                        enterNode: (node) => {
                            return node;
                        },
                        leaveNode: (node) => {
                            if (node.type === "template") {
                                const autoEscapeNode = createAutoEscapeNode(strategy, node.children.body.children.content, node.line, node.column, 'foo');

                                node.children.body.children.content = autoEscapeNode;
                            }

                            return node;
                        }
                    })
                }

                parser = createParser(
                    extensionSet.unaryOperators,
                    extensionSet.binaryOperators,
                    extensionSet.tagHandlers,
                    extensionSet.nodeVisitors,
                    extensionSet.filters,
                    extensionSet.functions,
                    extensionSet.tests,
                    parserOptions || options?.parserOptions || {
                        strict: true,
                        level: 3
                    }
                );
            }

            try {
                return parser.parse(stream);
            } catch (error: any) {
                const source = stream.source;

                if (!(error as TwingParsingError).source) {
                    (error as TwingParsingError).source = source.name;
                }

                throw error;
            }
        },
        render: (name, context) => {
            return environment.loadTemplate(name)
                .then((template) => {
                    return template.render(context, {
                        sandboxed: isSandboxed
                    });
                });
        },
        renderWithSourceMap: (name, context) => {
            const sourceMapRuntime = createSourceMapRuntime();

            return environment.loadTemplate(name)
                .then((template) => {
                    return template.render(context, {
                        sandboxed: isSandboxed,
                        sourceMapRuntime
                    });
                })
                .then((data) => {
                    const {sourceMap} = sourceMapRuntime;

                    return {
                        data,
                        sourceMap
                    };
                });
        },
        tokenize: (source: TwingSource): TwingTokenStream => {
            const level = options?.parserOptions?.level || 3;

            if (!lexer) {
                lexer = createLexer(
                    level,
                    extensionSet.binaryOperators,
                    extensionSet.unaryOperators
                );
            }

            const stream = lexer.tokenizeSource(source);

            return createTokenStream(stream.toAst(), stream.source);
        }
    };

    return environment;
};
