import {TwingTagHandler} from "./tag-handler";
import {TwingNodeVisitor} from "./node-visitor";
import {createExtensionSet} from "./extension-set";
import {TwingFilter, TwingSynchronousFilter} from "./filter";
import {createParser, TwingParser, TwingParserOptions} from "./parser";
import {TwingLoader, TwingSynchronousLoader} from "./loader";
import {TwingSynchronousTest, TwingTest} from "./test";
import {TwingFunction, TwingSynchronousFunction} from "./function";
import {TwingOperator} from "./operator";
import {TwingEscapingStrategy, TwingEscapingStrategyHandler} from "./escaping-strategy";
import {createHtmlEscapingStrategyHandler} from "./escaping-stragegy/html";
import {createCssEscapingStrategyHandler} from "./escaping-stragegy/css";
import {createJsEscapingStrategyHandler} from "./escaping-stragegy/js";
import {createUrlEscapingStrategyHandler} from "./escaping-stragegy/url";
import {createHtmlAttributeEscapingStrategyHandler} from "./escaping-stragegy/html-attribute";
import {TwingSource} from "./source";
import {createTokenStream, TwingTokenStream} from "./token-stream";
import {TwingExtension, TwingSynchronousExtension} from "./extension";
import {TwingTemplateNode} from "./node/template";
import {RawSourceMap} from "source-map";
import {createSourceMapRuntime} from "./source-map-runtime";
import {createSandboxSecurityPolicy, TwingSandboxSecurityPolicy} from "./sandbox/security-policy";
import {renderSynchronousTemplate, TwingSynchronousTemplate, TwingTemplate} from "./template";
import {Settings as DateTimeSettings} from "luxon";
import {createLexer, type TwingLexer} from "./lexer";
import {TwingCache, TwingSynchronousCache} from "./cache";
import {createCoreExtension, createSynchronousCoreExtension} from "./extension/core";
import {createAutoEscapeNode, createTemplateLoadingError, type TwingContext} from "../lib";
import {createSynchronousTemplateLoader, createTemplateLoader} from "./template-loader";
import {createContext} from "./context";
import {iterableToMap} from "./helpers/iterator-to-map";

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
     * The persistent cache instance.
     */
    cache?: TwingCache;

    /**
     * The default charset. Defaults to "UTF-8".
     */
    charset?: string;
    dateFormat?: string;
    dateIntervalFormat?: string;
    globals?: Record<string, any>;
    numberFormat?: TwingNumberFormat;
    parserOptions?: TwingParserOptions;
    sandboxPolicy?: TwingSandboxSecurityPolicy;
    timezone?: string;
};

export type TwingSynchronousEnvironmentOptions = Omit<TwingEnvironmentOptions, "cache"> & {
    /**
     * The persistent cache instance.
     */
    cache?: TwingSynchronousCache;
};

export interface TwingEnvironment {
    readonly cache: TwingCache | null;
    readonly charset: string;
    readonly dateFormat: string;
    readonly dateIntervalFormat: string;
    readonly escapingStrategyHandlers: Record<TwingEscapingStrategy, TwingEscapingStrategyHandler>;
    readonly numberFormat: TwingNumberFormat;
    readonly filters: Map<string, TwingFilter>;
    readonly functions: Map<string, TwingFunction>;
    readonly globals: TwingContext<string, any>;
    readonly loader: TwingLoader | TwingSynchronousLoader;
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
     * @throws {Error}  When the template cannot be found
     * @throws {TwingParsingError} When an error occurred during the parsing of the source
     *
     * @return
     */
    loadTemplate(name: string, from?: string | null): Promise<TwingTemplate>;

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
    render(name: string, context: Record<string, any>, options?: {
        sandboxed?: boolean;
        strict?: boolean;
    }): Promise<string>;

    /**
     * Convenient method that renders a template from its name and returns both the render result and its belonging source map.
     */
    renderWithSourceMap(name: string, context: Record<string, any>, options?: {
        sandboxed?: boolean;
        strict?: boolean;
    }): Promise<{
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

export interface TwingSynchronousEnvironment {
    readonly cache: TwingSynchronousCache | null;
    readonly charset: string;
    readonly dateFormat: string;
    readonly dateIntervalFormat: string;
    readonly escapingStrategyHandlers: Record<TwingEscapingStrategy, TwingEscapingStrategyHandler>;
    readonly numberFormat: TwingNumberFormat;
    readonly filters: Map<string, TwingSynchronousFilter>;
    readonly functions: Map<string, TwingSynchronousFunction>;
    readonly globals: Map<string, any>;
    readonly loader: TwingSynchronousLoader;
    readonly sandboxPolicy: TwingSandboxSecurityPolicy;
    readonly tests: Map<string, TwingSynchronousTest>;
    readonly timezone: string;

    /**
     * Convenient method...
     *
     * @param extension
     */
    addExtension(extension: TwingSynchronousExtension): void;

    addFilter(filter: TwingSynchronousFilter): void;

    addFunction(aFunction: TwingSynchronousFunction): void;

    addNodeVisitor(visitor: TwingNodeVisitor): void;

    addOperator(operator: TwingOperator): void;

    addTagHandler(parser: TwingTagHandler): void;

    addTest(test: TwingSynchronousTest): void;

    /**
     * Loads a template by its name.
     *
     * @param name The name of the template to load
     * @param from The name of the template that requested the load
     *
     * @throws {Error}  When the template cannot be found
     * @throws {TwingParsingError} When an error occurred during the parsing of the source
     *
     * @return
     */
    loadTemplate(name: string, from?: string | null): TwingSynchronousTemplate;

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
    render(name: string, context: Record<string, any>, options?: {
        sandboxed?: boolean;
        strict?: boolean;
    }): string;

    /**
     * Convenient method that renders a template from its name and returns both the render result and its belonging source map.
     */
    renderWithSourceMap(name: string, context: Record<string, any>, options?: {
        sandboxed?: boolean;
        strict?: boolean;
    }): {
        data: string;
        sourceMap: RawSourceMap;
    };

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
    loader: TwingLoader | TwingSynchronousLoader,
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
    const extensionSet = createExtensionSet<TwingExtension>();

    extensionSet.addExtension(createCoreExtension());

    const cache: TwingCache | null = options?.cache || null;
    const charset = options?.charset || 'UTF-8';
    const dateFormat = options?.dateFormat || 'F j, Y H:i';
    const dateIntervalFormat = options?.dateIntervalFormat || '%d days';
    const numberFormat: TwingNumberFormat = options?.numberFormat || {
        decimalPoint: '.',
        numberOfDecimals: 0,
        thousandSeparator: ','
    };
    const sandboxPolicy = options?.sandboxPolicy || createSandboxSecurityPolicy();
    const globals = createContext(iterableToMap(options?.globals || {}));

    let lexer: TwingLexer;
    let parser: TwingParser;

    const environment: TwingEnvironment = {
        get cache() {
            return cache;
        },
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
        get globals() {
            return globals;
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
            const templateLoader = createTemplateLoader(environment);

            return templateLoader(name, from)
                .then((template) => {
                    if (template === null) {
                        throw createTemplateLoadingError([name]);
                    }

                    return template;
                });
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
                                node.children.body = createAutoEscapeNode(strategy, node.children.body, node.line, node.column);
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

            return parser.parse(stream);
        },
        render: (name, context, options) => {
            return environment.loadTemplate(name)
                .then((template) => {
                    return template.render(environment, context, options);
                });
        },
        renderWithSourceMap: (name, context, options) => {
            const sourceMapRuntime = createSourceMapRuntime();

            return environment.loadTemplate(name)
                .then((template) => {
                    return template.render(environment, context, {
                        ...options,
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

export const createSynchronousEnvironment = (
    loader: TwingSynchronousLoader,
    options?: TwingSynchronousEnvironmentOptions
): TwingSynchronousEnvironment => {
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
    const extensionSet = createExtensionSet<TwingSynchronousExtension>();

    extensionSet.addExtension(createSynchronousCoreExtension());

    const cache: TwingSynchronousCache | null = options?.cache || null;
    const charset = options?.charset || 'UTF-8';
    const dateFormat = options?.dateFormat || 'F j, Y H:i';
    const dateIntervalFormat = options?.dateIntervalFormat || '%d days';
    const numberFormat: TwingNumberFormat = options?.numberFormat || {
        decimalPoint: '.',
        numberOfDecimals: 0,
        thousandSeparator: ','
    };
    const sandboxPolicy = options?.sandboxPolicy || createSandboxSecurityPolicy();
    const globals = new Map(Object.entries(options?.globals || {}));

    let lexer: TwingLexer;
    let parser: TwingParser;

    const environment: TwingSynchronousEnvironment = {
        get cache() {
            return cache;
        },
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
        get globals() {
            return globals;
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
        loadTemplate: (name, from = null) => {
            const templateLoader = createSynchronousTemplateLoader(environment);

            const template = templateLoader(name, from);

            if (template === null) {
                throw createTemplateLoadingError([name]);
            }

            return template;
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
                                node.children.body = createAutoEscapeNode(strategy, node.children.body, node.line, node.column);
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

            return parser.parse(stream);
        },
        render: (name, data, options) => {
            const template = environment.loadTemplate(name);
            const context: Map<string, any> = new Map(Object.entries(data));

            return renderSynchronousTemplate(template, environment, context, options);
        },
        renderWithSourceMap: (name, data, options) => {
            const sourceMapRuntime = createSourceMapRuntime();

            const context: Map<string, any> = new Map(Object.entries(data));
            const template = environment.loadTemplate(name);
            const output = renderSynchronousTemplate(template, environment, context, {
                ...options,
                sourceMapRuntime
            });

            const {sourceMap} = sourceMapRuntime;

            return {
                data: output,
                sourceMap
            };
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
