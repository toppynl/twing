import type {TwingFilter} from "./filter";
import type {TwingTemplate} from "./template";
import type {TwingSource} from "./source";
import type {TwingLoader} from "./loader";
import type {TwingContext} from "./context";
import type {TwingFunction} from "./function";
import {TwingOutputBuffer} from "./output-buffer";
import {iterate, IterateCallback} from "./helpers/iterate";
import type {TwingMarkup} from "./markup";
import {TwingTest} from "./test";
import {TwingGetAttributeCallType} from "./node/expression/attribute-accessor";
import {TwingRuntimeError} from "./error/runtime";
import {compare} from "./helpers/compare";
import {constant} from "./extension/core/functions/constant";
import {iteratorToMap} from "./helpers/iterator-to-map";
import {count} from "./helpers/count";
import {cloneMap} from "./helpers/clone-map";
import {createTemplate} from "./template";
import {createMarkup, isAMarkup} from "./markup";
import {createRange} from "./helpers/create-range";
import {createSource} from "./source";
import {ensureTraversable} from "./helpers/ensure-traversable";
import {evaluate} from "./helpers/evaluate";
import {getAttribute} from "./helpers/get-attribute";
import {Settings as DateTimeSettings} from "luxon";
import {include} from "./extension/core/functions/include";
import {TwingError} from "./error";
import {isIn} from "./helpers/is-in";
import {mergeIterables} from "./helpers/merge-iterables";
import {parseRegularExpression} from "./helpers/parse-regular-expression";
import {createSandboxSecurityPolicy, TwingSandboxSecurityPolicy} from "./sandbox/security-policy";
import {createContext} from "./context";
import {basename, extname} from "path";
import {createHash} from "crypto";
import {isACompilationError} from "./error/compilation";
import {TwingParsingError} from "./error/parsing";
import {TwingModuleNode} from "./node/module";
import {createCompiler} from "./compiler";
import {TwingTokenStream, createTokenStream} from "./token-stream";
import {createParser, TwingParser, TwingParserOptions} from "./parser";
import {TwingLexer} from "./lexer";
import {isATemplateLoadingError, TwingTemplateLoadingError} from "./error/loader";
import {EventEmitter} from "events";
import {TwingCache} from "./cache";
import type {TwingExtensionSet} from "./extension-set";
import {EscapingStrategy, EscapingStrategyHandler, EscapingStrategyResolver} from "./escaping-strategy";
import {getTest} from "./helpers/get-test";
import {getFilter} from "./helpers/get-filter";
import {getFunction} from "./helpers/get-function";
import {getContextValue} from "./helpers/get-context-value";
import {createCoreExtension} from "./extension/core";
import {TwingSourceMapRuntime} from "./source-map-runtime";

export type TwingTemplateFactory = (runtime: Runtime) => TwingTemplate;
export type TwingTemplateModule = {
    0: TwingTemplateFactory;
} & Record<string, TwingTemplateFactory>;

export type NumberFormat = {
    numberOfDecimals: number;
    decimalPoint: string;
    thousandSeparator: string;
};

export interface Runtime {
    readonly charset: string;
    readonly createTemplate: typeof createTemplate;
    readonly dateFormat: string;
    readonly dateIntervalFormat: string;
    readonly Error: typeof TwingRuntimeError;
    isSandboxed: boolean;
    readonly defaultNumberFormats: NumberFormat;
    readonly isStrictVariables: boolean;
    readonly timezone: string;

    checkMethodAllowed(candidate: any, property: string): void;

    checkPropertyAllowed(candidate: any, property: string): void;

    checkSecurity(tags: string[], filters: string[], functions: string[]): void;

    cloneMap<K, V>(m: Map<K, V>): Map<K, V>;

    compare(a: any, b: any): boolean;

    /**
     * Compiles a module node.
     */
    compile(node: TwingModuleNode): string;

    /**
     * Compiles a module node.
     */
    compileSource(source: TwingSource): string;

    concatenate(object1: any, object2: any): string;

    constant(context: TwingContext<any, any>, name: string, object?: any): any;

    convertToMap(iterable: any): Map<any, any>;

    count(data: any): number;

    createContext<K, V>(container?: Map<K, V>): TwingContext<K, V>;

    createMarkup(content: string, charset: string): TwingMarkup;

    createRange(low: any, high: any, step: number): Map<number, any>;

    createSource(name: string, code: string, resolvedName?: string): TwingSource;

    createTemplateFromCompiledSource(compiledSource: string, name: string): Promise<TwingTemplate>;

    createTemplateFromString(content: string, name: string | null): Promise<TwingTemplate>;

    ensureToStringAllowed<T>(candidate: T): T;

    ensureTraversable<T>(candidate: T[]): T[] | [];
    
    escape(template: TwingTemplate, value: string | boolean | TwingMarkup | null | undefined, strategy: EscapingStrategy, charset: string | null, autoEscape?: boolean): Promise<string | boolean>;

    evaluate(value: any): boolean;

    getAttribute(runtime: Runtime, target: any, attribute: any, methodArguments: Map<any, any>, type: TwingGetAttributeCallType, shouldTestExistence: boolean, shouldIgnoreStrictCheck: boolean): any;

    getContextValue(template: TwingTemplate, context: TwingContext<any, any>, name: string, isAlwaysDefined: boolean, shouldIgnoreStrictCheck: boolean, shouldTestExistence: boolean): Promise<any>;

    /**
     * Get a filter by its name.
     *
     * @param {string} name
     *
     * @return {TwingFilter | null} A TwingFilter instance or null if the filter does not exist
     */
    getFilter(name: string): TwingFilter | null;

    /**
     * Get a function by name.
     *
     * Subclasses may override this method and load functions differently;
     * so no list of functions is available.
     *
     * @param {string} name function name
     *
     * @return {TwingFunction} A TwingFunction instance or null if the function does not exist
     */
    getFunction(name: string): TwingFunction | null;

    getLoader(): TwingLoader;

    /**
     * Get a test by its name.
     *
     * @param {string} name
     *
     * @return {TwingTest | null} A TwingTest instance or null if the filter does not exist
     */
    getTest(name: string): TwingTest | null;

    include(
        template: TwingTemplate,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        sourceMapRunTime: TwingSourceMapRuntime,
        templates: string | Map<number, string | TwingTemplate> | TwingTemplate,
        variables: Map<string, any>,
        withContext: boolean,
        ignoreMissing: boolean,
        sandboxed: boolean,
        line: number
    ): Promise<TwingMarkup>;

    isIn(a: any, b: any): boolean;

    iterate(iterator: any, cb: IterateCallback): Promise<void>;
    
    loadTemplate(name: string, index?: number, from?: TwingSource | null): Promise<TwingTemplate>;

    merge<V>(iterable1: Map<any, V>, iterable2: Map<any, V>): Map<any, V>;

    mergeGlobals(context: Map<any, any>): Map<any, any>;

    /**
     * Register the passed listener...
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
    parse(stream: TwingTokenStream, options: TwingParserOptions): TwingModuleNode;

    parseRegularExpression(input: string): RegExp;

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
    resolveTemplate(names: Array<string | TwingTemplate | null>, from: TwingSource): Promise<TwingTemplate | null>;

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

export type CreateRuntimeOptions = {
    autoReload?: boolean;
    autoEscapingStrategy?: string | null;
    cache?: TwingCache | false;
    charset?: string;
    dateFormat?: string;
    dateIntervalFormat?: string;
    numberFormats?: NumberFormat;
    parserOptions?: TwingParserOptions;
    sandboxed?: boolean;
    sandboxPolicy?: TwingSandboxSecurityPolicy;
    strictVariables?: boolean;
    timezone?: string;
};

export const createRuntime = (
    loader: TwingLoader,
    escapingStrategyHandlers: Record<string, EscapingStrategyHandler>,
    extensionSet: TwingExtensionSet,
    options: CreateRuntimeOptions
): Runtime => {
    extensionSet.addExtension(createCoreExtension());

    // auto-escaping strategy
    const guessEscapingStrategyName = (templateName: string): string | null => {
        let extension = extname(templateName);

        if (extension === '.twig') {
            templateName = basename(templateName, extension);

            extension = extname(templateName);
        }

        switch (extension) {
            case '.js':
                return 'js';

            case '.css':
                return 'css';

            case '.txt':
                return null;

            default:
                return 'html';
        }
    };

    const defaultEscapingStrategyResolver: EscapingStrategyResolver =
        options.autoEscapingStrategy === "name" ?
            guessEscapingStrategyName
            :
            () => {
                if (options.autoEscapingStrategy === undefined) {
                    return 'html';
                }

                return options.autoEscapingStrategy;
            };

    const cache: TwingCache | null = options.cache || null;
    const eventEmitter = new EventEmitter();
    const globals: Map<string, any> = new Map();
    const loadedTemplates: Map<string, TwingTemplate> = new Map();
    const sandboxPolicy = options.sandboxPolicy || createSandboxSecurityPolicy();

    const charset = options.charset || 'UTF-8';
    const dateFormat = options.dateFormat || 'F j, Y H:i';
    const dateIntervalFormat = options.dateIntervalFormat || '%d days';
    const defaultNumberFormats: NumberFormat = options.numberFormats || {
        decimalPoint: '.',
        numberOfDecimals: 0,
        thousandSeparator: ','
    };

    let isSandboxed = options.sandboxed ? true : false;
    let lexer: TwingLexer;
    let parser: TwingParser;
    
    const compile = (node: TwingModuleNode): string => {
        const compiler = createCompiler({
            getFunction: runtime.getFunction,
            getTest: runtime.getTest,
            getFilter: runtime.getFilter
        });

        return compiler.compile(node).source;
    };

    const compileSource = (source: TwingSource): string => {
        try {
            return compile(parse(tokenize(source), options.parserOptions || {
                strict: true
            }));
        } catch (error: any) {
            if (isACompilationError(error)) {
                error.source = source;

                throw error;
            }

            throw error;
        }
    };

    const createTemplateFromCompiledSource: Runtime["createTemplateFromCompiledSource"] = (compiledSource, name) => {
        const templatesModule = getTemplateModule(compiledSource);

        registerTemplatesModule(templatesModule, name);

        return loadTemplate(name);
    };

    const createTemplateFromString: Runtime["createTemplateFromString"] = (template, name) => {
        const hash: string = createHash("sha256").update(template).digest("hex").toString();

        if (name !== null) {
            name = `${name} (string template ${hash})`;
        } else {
            name = `__string_template__${hash}`;
        }

        return createTemplateFromCompiledSource(compileSource(createSource(template, name)), name);
    };

    const getTemplateHash = async (name: string, index: number, from: TwingSource | null): Promise<string | null> => {
        let key = await loader.getCacheKey(name, from);

        if (key === null) {
            return null;
        }

        return createHash("sha256").update(key).digest('hex') + (index === 0 ? '' : '_' + index);
    };

    const getTemplateModule = (content: string): TwingTemplateModule => {
        let resolver = new Function(`let module = {
    exports: undefined
};

${content}

return module.exports;

`);

        return resolver();
    };

    const loadTemplate: Runtime["loadTemplate"] = async (name, index = 0, from = null) => {
        eventEmitter.emit('load', name, from);

        const cacheKey: string = name + (index !== 0 ? '_' + index : '');

        let loadedTemplate = loadedTemplates.get(cacheKey);

        if (loadedTemplate) {
            return Promise.resolve(loadedTemplate);
        }

        const templateHash = await getTemplateHash(name, index, from);

        if (templateHash) {
            loadedTemplate = loadedTemplates.get(templateHash);
        }

        if (loadedTemplate) {
            return Promise.resolve(loadedTemplate);
        } else {
            const mainTemplateHash = await getTemplateHash(name, 0, from);
            const cacheKey = cache && mainTemplateHash ? await cache.generateKey(mainTemplateHash) : null;
            const timestamp = cache && cacheKey ? await cache.getTimestamp(cacheKey) : 0;

            const getContentFromCache = async (): Promise<string | null> => {
                if (cache === null || cacheKey === null) {
                    return Promise.resolve(null);
                }

                let content: string | null;

                /**
                 * When auto-reload is disabled, we always challenge the cache
                 * When auto-reload is enabled, we challenge the cache only if the template is considered as fresh by the loader
                 */
                if (options.autoReload) {
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

            const getContentFromLoader = async (): Promise<string | null> => {
                const source = await loader.getSourceContext(name, from);

                if (source === null) {
                    return null;
                }

                const content = compileSource(source);

                if (cache !== null && cacheKey !== null) {
                    await cache.write(cacheKey, content);
                }

                return content;
            };

            const resolveMainTemplateFromTemplateModule = async (
                templateModule: TwingTemplateModule
            ): Promise<TwingTemplate> => {
                const mainTemplateFactory = templateModule["0"]
                const mainTemplate = mainTemplateFactory(runtime);
                const mainTemplateHash = await getTemplateHash(name, 0, from);

                registerTemplate(mainTemplate, mainTemplateHash!); // todo: can we do better?

                for (const [index, templateFactory] of Object.entries(templateModule)) {
                    if (index !== "0") {
                        const template = templateFactory(runtime);

                        const templateHash = await getTemplateHash(name, Number(index), from);

                        registerTemplate(template, templateHash!); // todo: can we do better?
                    }
                }

                return Promise.resolve(mainTemplate);
            };

            let content = await getContentFromCache();

            if (content === null) {
                content = await getContentFromLoader();
            }

            if (content === null) {
                throw new TwingTemplateLoadingError(name);
            }

            const templateModule = getTemplateModule(content);

            return resolveMainTemplateFromTemplateModule(templateModule);
        }
    }

    const parse: Runtime["parse"] = (stream, options) => {
        if (!parser) {
            parser = createParser(
                extensionSet.unaryOperators,
                extensionSet.binaryOperators,
                extensionSet.tagHandlers,
                extensionSet.nodeVisitors,
                extensionSet.filters,
                extensionSet.functions,
                extensionSet.tests,
                options
            );
        }

        try {
            return parser.parse(stream);
        } catch (error: any) {
            const source = stream.source;

            if (!(error as TwingParsingError).source) {
                (error as TwingParsingError).source = source;
            }

            throw error;
        }
    };

    const registerTemplate = (template: TwingTemplate, name: string): void => {
        loadedTemplates.set(name, template);
    };

    const registerTemplatesModule = (templateModule: TwingTemplateModule, name: string): void => {
        const mainTemplateFactory = templateModule["0"];
        const template = mainTemplateFactory(runtime);

        registerTemplate(template, name)

        for (const [index, templateFactory] of Object.entries(templateModule)) {
            if (index !== "0") {
                const template = templateFactory(runtime);

                registerTemplate(template, name + '_' + index);
            }
        }
    };

    const tokenize = (source: TwingSource): TwingTokenStream => {
        if (!lexer) {
            lexer = new TwingLexer(extensionSet.binaryOperators, extensionSet.unaryOperators);
        }

        let stream = lexer.tokenizeSource(source);

        return createTokenStream(stream.toAst(), stream.source);
    };
    
    const runtime: Runtime = {
        get charset() {
            return charset;
        },
        get dateFormat() {
            return dateFormat;
        },
        get dateIntervalFormat() {
            return dateIntervalFormat;
        },
        get Error() {
            return TwingRuntimeError;
        },
        get defaultNumberFormats() {
            return defaultNumberFormats;
        },
        get isSandboxed() {
            return isSandboxed;
        },
        set isSandboxed(flag) {
            isSandboxed = flag;
        },
        get isStrictVariables() {
            return options.strictVariables ? true : false;
        },
        get timezone() {
            return options.timezone || DateTimeSettings.defaultZoneName
        },
        compare,
        compile,
        compileSource,
        concatenate: (object1, object2) => {
            if ((object1 === null) || (object1 === undefined)) {
                object1 = '';
            }

            if ((object2 === null) || (object2 === undefined)) {
                object2 = '';
            }

            return String(object1) + String(object2);
        },
        constant,
        convertToMap: iteratorToMap,
        count,
        checkMethodAllowed: sandboxPolicy.checkMethodAllowed,
        checkPropertyAllowed: sandboxPolicy.checkPropertyAllowed,
        checkSecurity: sandboxPolicy.checkSecurity,
        cloneMap,
        createTemplate: createTemplate,
        createContext: (container) => createContext(container),
        createMarkup,
        createRange,
        createSource: (name, code, resolvedName?) => createSource(code, name, resolvedName),
        createTemplateFromCompiledSource,
        createTemplateFromString,
        ensureToStringAllowed: (candidate) => {
            if (runtime.isSandboxed && typeof candidate === 'object') {
                sandboxPolicy.checkMethodAllowed(candidate, 'toString');
            }

            return candidate;
        },
        ensureTraversable,
        escape: (template, value, strategy, charset, autoEscape) => {
            if (typeof value === "boolean") {
                return Promise.resolve(value);
            }

            let result: string;

            if ((value === null) || (value === undefined)) {
                result = '';
            } else if (autoEscape && isAMarkup(value)) {
                result = value.toString();
            } else {
                let strategyHandler: EscapingStrategyHandler | undefined;

                if (strategy === true) { // todo: replace with undefined, true makes no syntactic sense
                    strategy = defaultEscapingStrategyResolver(template.templateName);
                }

                if (strategy === null) {
                    strategyHandler = (value) => value;
                } else {
                    strategyHandler = escapingStrategyHandlers[strategy];

                    if (strategyHandler === undefined) {
                        return Promise.reject(new TwingRuntimeError(`Invalid escaping strategy "${strategy}" (valid ones: ${Object.keys(escapingStrategyHandlers).sort().join(', ')}).`));
                    }
                }

                result = strategyHandler(value.toString(), charset || runtime.charset, template.templateName);
            }

            return Promise.resolve(result);
        },
        evaluate,
        getAttribute,
        getContextValue,
        getFilter: (name) => {
            return getFilter(extensionSet.filters, name);
        },
        getLoader: () => loader,
        getTest: (name) => {
            return getTest(extensionSet.tests, name);
        },
        getFunction: (name) => {
            return getFunction(extensionSet.functions, name);
        },
        include: (template, context, outputBuffer, sourceMapRunTime, templates, variables, withContext, ignoreMissing, sandboxed, line) => {
            return include(template, context, outputBuffer, sourceMapRunTime, templates, variables, withContext, ignoreMissing, sandboxed)
                .catch((error: TwingError) => {
                    if (error.line === undefined) {
                        error.line = line;
                    }

                    throw error;
                });
        },
        isIn,
        iterate,
        loadTemplate,
        merge: mergeIterables,
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
        parse,
        parseRegularExpression: parseRegularExpression,
        registerTemplate,
        resolveTemplate: (names, from) => {
            let caughtError: TwingTemplateLoadingError | null = null;

            let loadTemplateAtIndex = (index: number): Promise<TwingTemplate | null> => {
                if (index < names.length) {
                    const name = names[index];

                    if (name === null) {
                        return loadTemplateAtIndex(index + 1);
                    } else if (typeof name !== "string") {
                        return Promise.resolve(name);
                    } else {
                        return loadTemplate(name, 0, from).catch((error) => {
                            if (isATemplateLoadingError(error)) {
                                caughtError = error;

                                return loadTemplateAtIndex(index + 1);
                            } else {
                                throw error;
                            }
                        });
                    }
                } else {
                    if (names.length === 1) {
                        throw caughtError;
                    } else {
                        throw new TwingTemplateLoadingError((names as Array<string | null>).map((name) => {
                            if (name === null) {
                                return '';
                            }

                            return name;
                        }), undefined, from);
                    }
                }
            };

            return loadTemplateAtIndex(0);
        },
        setGlobal: (name, value) => {
            globals.set(name, value);
        },
        tokenize
    };

    return runtime;
}
