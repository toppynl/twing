import {TwingTagHandler} from "./tag-handler";
import {TwingNodeVisitor} from "./node-visitor";
import {createExtensionSet} from "./extension-set";
import {TwingFilter} from "./filter";
import {createParser, TwingParser, TwingParserOptions} from "./parser";
import {TwingLoader} from "./loader";
import {TwingTest} from "./test";
import {TwingFunction} from "./function";
import {TwingOperator} from "./operator";
import {EscapingStrategy, EscapingStrategyHandler} from "./escaping-strategy";
import {createHtmlEscapingStrategyHandler} from "./escaping-stragegy/html";
import {createCssEscapingStrategyHandler} from "./escaping-stragegy/css";
import {createJsEscapingStrategyHandler} from "./escaping-stragegy/js";
import {createUrlEscapingStrategyHandler} from "./escaping-stragegy/url";
import {createHtmlAttributeEscapingStrategyHandler} from "./escaping-stragegy/html-attribute";
import {createSource, TwingSource} from "./source";
import {createTokenStream, TwingTokenStream} from "./token-stream";
import {TwingExtension} from "./extension";
import {TwingModuleNode} from "./node/module";
import {RawSourceMap} from "source-map";
import {createSourceMapRuntime} from "./source-map-runtime";
import {createSandboxSecurityPolicy, TwingSandboxSecurityPolicy} from "./sandbox/security-policy";
import {isAMarkup, TwingMarkup} from "./markup";
import {createTemplate, TwingTemplate} from "./template";
import {createRuntimeError} from "./error/runtime";
import {Settings as DateTimeSettings} from "luxon";
import {EventEmitter} from "events";
import {createTemplateLoadingError} from "./error/loader";
import {TwingParsingError} from "./error/parsing";
import {createLexer, TwingLexer} from "./lexer";
import {TwingCache} from "./cache";
import * as createHash from "create-hash";
import {createCoreExtension} from "./extension/core";

export type TwingNumberFormat = {
    numberOfDecimals: number;
    decimalPoint: string;
    thousandSeparator: string;
};

export type TwingEnvironmentOptions = {
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
    readonly numberFormat: TwingNumberFormat;
    readonly filters: Map<string, TwingFilter>;
    readonly functions: Map<string, TwingFunction>;
    isSandboxed: boolean;
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

    createTemplateFromString(content: string, name: string | null): Promise<TwingTemplate>;

    escape(template: TwingTemplate, value: string | boolean | TwingMarkup | null | undefined, strategy: EscapingStrategy | string, charset: string | null, autoEscape?: boolean): Promise<string | boolean | TwingMarkup>;

    /**
     * Loads a template by its name.
     *
     * @param name The template name
     *
     * @throws {TwingTemplateLoadingError}  When the template cannot be found
     * @throws {TwingRuntimeError} ...
     * @throws {TwingParsingError} When an error occurred during compilation
     * @throws {TwingCompilationError}  When an error occurred during compilation
     *
     * @return
     */
    loadTemplate(name: string, from?: string | null): Promise<TwingTemplate>;

    mergeGlobals(context: Map<any, any>): Map<any, any>;

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
    parse(stream: TwingTokenStream, options?: TwingParserOptions): TwingModuleNode;

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

    registerEscapingStrategy(handler: EscapingStrategyHandler, name: string): void;

    /**
     * Registers a template [...]
     *
     * @param template
     * @param name
     */
    registerTemplate(template: TwingTemplate, name: string): void;

    /**
     * Tries to load templates consecutively from an array.
     *
     * Similar to loadTemplate() but it also accepts instances of TwingTemplate and an array of templates where each is tried to be loaded.
     *
     * @param {string|TwingTemplate|Array<string|TwingTemplate>} names A template or an array of templates to try consecutively
     * @param {TwingSource} from The source of the template that initiated the resolving.
     *
     * @return {Promise<TwingTemplate>}
     *
     */
    resolveTemplate(names: Array<string | TwingTemplate | null>, from: string): Promise<TwingTemplate>;

    /**
     * Registers a Global.
     *
     * @param {string} name The global name
     * @param {*} value The global value
     */
    setGlobal(name: string, value: any): void;

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
export function createEnvironment(
    loader: TwingLoader,
    options?: TwingEnvironmentOptions
): TwingEnvironment {
    const cssEscapingStrategy = createCssEscapingStrategyHandler();
    const htmlEscapingStrategy = createHtmlEscapingStrategyHandler();
    const htmlAttributeEscapingStrategy = createHtmlAttributeEscapingStrategyHandler();
    const jsEscapingStrategy = createJsEscapingStrategyHandler();
    const urlEscapingStrategy = createUrlEscapingStrategyHandler();

    const escapingStrategyHandlers: Record<EscapingStrategy, EscapingStrategyHandler> = {
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
    const globals: Map<string, any> = new Map();
    const sandboxPolicy = options?.sandboxPolicy || createSandboxSecurityPolicy();

    let isSandboxed = options?.sandboxed ? true : false;
    let lexer: TwingLexer;
    let parser: TwingParser;

    const loadedTemplates: Map<string, TwingTemplate> = new Map();

    const getTemplateHash = async (name: string, from: string | null): Promise<string | null> => {
        let key = await loader.getCacheKey(name, from);

        if (key === null) {
            return null;
        }

        return createHash("sha256").update(key).digest('hex');
    };

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
        get numberFormat() {
            return numberFormat;
        },
        get filters() {
            return extensionSet.filters;
        },
        get functions() {
            return extensionSet.functions;
        },
        get isSandboxed() {
            return isSandboxed;
        },
        set isSandboxed(value) {
            isSandboxed = value;
        },
        get isStrictVariables() {
            return options?.strictVariables ? true : false;
        },
        get loader() {
            return loader;
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
        createTemplateFromString: (code, name) => {
            const hash: string = createHash("sha256").update(code).digest("hex").toString();

            if (name !== null) {
                name = `${name} (string template ${hash})`;
            } else {
                name = `__string_template__${hash}`;
            }

            const ast = environment.parse(environment.tokenize(createSource(name, code)));
            const template = createTemplate(environment, ast);

            environment.registerTemplate(template, name);

            return Promise.resolve(template);
        },
        escape: (template, value, strategy, charset) => {
            if (typeof value === "boolean") {
                return Promise.resolve(value);
            }
            
            if (isAMarkup(value)) {
                return Promise.resolve(value);
            }

            let result: string;

            if ((value === null) || (value === undefined)) {
                result = '';
            } else {
                const strategyHandler = escapingStrategyHandlers[strategy];
                
                if (strategyHandler === undefined) {
                    return Promise.reject(createRuntimeError(`Invalid escaping strategy "${strategy}" (valid ones: ${Object.keys(escapingStrategyHandlers).sort().join(', ')}).`));
                }

                result = strategyHandler(value.toString(), charset || environment.charset, template.templateName);
            }

            return Promise.resolve(result);
        },
        loadTemplate: async (name, from = null) => {
            eventEmitter.emit('load', name, from);

            let loadedTemplate: TwingTemplate | undefined;

            const templateHash = await getTemplateHash(name, from);

            if (templateHash) {
                loadedTemplate = loadedTemplates.get(templateHash);
            }

            if (loadedTemplate) {
                return Promise.resolve(loadedTemplate);
            } else {
                const cacheKey = cache && templateHash ? await cache.generateKey(templateHash) : null;
                const timestamp = cache && cacheKey ? await cache.getTimestamp(cacheKey) : 0;

                const getAstFromCache = async (): Promise<TwingModuleNode | null> => {
                    if (cache === null || cacheKey === null) {
                        return Promise.resolve(null);
                    }

                    let content: TwingModuleNode | null;

                    /**
                     * When auto-reload is disabled, we always challenge the cache
                     * When auto-reload is enabled, we challenge the cache only if the template is considered as fresh by the loader
                     */
                    if (shouldAutoReload) {
                        const isFresh = await loader.isFresh(name, timestamp, from);

                        if (isFresh) {
                            content = await cache.load(cacheKey);
                        } else {
                            content = null;
                        }
                    } else {
                        content = await cache.load(cacheKey);
                    }

                    return content;
                };

                const getAstFromLoader = async (): Promise<TwingModuleNode | null> => {
                    const source = await loader.getSourceContext(name, from);

                    if (source === null) {
                        return null;
                    }

                    const ast = environment.parse(environment.tokenize(source));

                    if (cache !== null && cacheKey !== null) {
                        await cache.write(cacheKey, ast);
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

                environment.registerTemplate(template, templateHash!); // todo: can't we do better?

                return template;
            }
        },
        mergeGlobals: (context) => {
            for (let [key, value] of globals) {
                if (!context.has(key)) {
                    context.set(key, value);
                }
            }

            return context;
        },
        on: (eventName, listener) => {
            eventEmitter.on(eventName, listener);
        },
        registerEscapingStrategy: (handler, name) => {
            escapingStrategyHandlers[name] = handler;
        },
        parse: (stream, parserOptions) => {
            if (!parser) {
                parser = createParser(
                    extensionSet.unaryOperators,
                    extensionSet.binaryOperators,
                    extensionSet.tagHandlers,
                    extensionSet.nodeVisitors,
                    extensionSet.filters,
                    extensionSet.functions,
                    extensionSet.tests,
                    parserOptions || options?.parserOptions || {
                        strict: true
                    }
                );
            }

            try {
                return parser.parse(stream);
            } catch (error: any) {
                const source = stream.source;

                if (!(error as TwingParsingError).source) {
                    (error as TwingParsingError).source = source.resolvedName;
                }

                throw error;
            }
        },
        registerTemplate: (template: TwingTemplate, name: string): void => {
            loadedTemplates.set(name, template);
        },
        render: (name, context) => {
            return environment.loadTemplate(name)
                .then((template) => {
                    return template.render(context);
                });
        },
        renderWithSourceMap: (name, context) => {
            const sourceMapRuntime = createSourceMapRuntime();

            return environment.loadTemplate(name)
                .then((template) => {
                    return template.render(context, undefined, sourceMapRuntime);
                })
                .then((data) => {
                    const {sourceMap} = sourceMapRuntime;
                    
                    return {
                        data,
                        sourceMap
                    };
                });
        },
        resolveTemplate: (names, from) => {
            const loadTemplateAtIndex = (index: number): Promise<TwingTemplate> => {
                if (index < names.length) {
                    const name = names[index];
                    
                    if (name === null) {
                        return loadTemplateAtIndex(index + 1);
                    } else if (typeof name !== "string") {
                        return Promise.resolve(name);
                    } else {
                        return environment.loadTemplate(name, from)
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
                    }), undefined, from));
                }
            };

            return loadTemplateAtIndex(0);
        },
        setGlobal: (name, value) => {
            globals.set(name, value);
        },
        tokenize: (source: TwingSource): TwingTokenStream => {
            if (!lexer) {
                lexer = createLexer(extensionSet.binaryOperators, extensionSet.unaryOperators);
            }

            const stream = lexer.tokenizeSource(source);

            return createTokenStream(stream.toAst(), stream.source);
        }
    };

    return environment;
};
