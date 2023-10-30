import {TwingTokenParserInterface} from "./token-parser-interface";
import {TwingNodeVisitorInterface} from "./node-visitor-interface";
import {TwingExtensionSet} from "./extension-set";
import {TwingExtensionCore} from "./extension/core";
import {TwingExtensionInterface} from "./extension-interface";
import {TwingFilter} from "./filter";
import {TwingLexer} from "./lexer";
import {TwingParser, TwingParserOptions} from "./parser";
import {TwingTokenStream} from "./token-stream";
import {TwingSource} from "./source";
import {TwingLoaderInterface} from "./loader-interface";
import {TwingErrorLoader} from "./error/loader";
import {TwingTest} from "./test";
import {TwingFunction} from "./function";
import {TwingErrorSyntax} from "./error/syntax";
import {createBaseTemplate, Template, TwingTemplate} from "./template";
import {TwingError} from "./error";
import {TwingCacheInterface} from "./cache-interface";
import {createCompiler} from "./compiler";
import {ModuleNode} from "./node/module";
import {TwingCacheNull} from "./cache/null";
import {EventEmitter} from 'events';
import {TwingOutputBuffer} from "./output-buffer";
import {TwingSourceMapNode} from "./source-map/node";
import {TwingOperator} from "./operator";
import {TwingSandboxSecurityPolicy} from "./sandbox/security-policy";
import {TwingSandboxSecurityPolicyInterface} from "./sandbox/security-policy-interface";
import {TwingSourceMapNodeFactory} from "./source-map/node-factory";
import type {Runtime} from "./runtime";
import {Settings as DateTimeSettings} from "luxon";
import {TwingContext} from "./context";
import {merge} from "./helpers/merge";
import {basename, extname} from "path";
import {include} from "./extension/core/functions/include";
import {ensureTraversable} from "./helpers/ensure-traversable";
import {isCountable, count} from "./helpers/count";
import {iterate} from "./helpers/iterate";
import {evaluate} from "./helpers/evaluate";
import {constant} from "./extension/core/functions/constant";
import {createMarkup} from "./markup";
import {compare} from "./helpers/compare";
import {isNullOrUndefined} from "util";
import {getAttribute} from "./helpers/get-attribute";
import {createRuntimeError} from "./error/runtime";
import {cloneMap} from "./helpers/clone-map";
import * as path from "path";
import {isMap} from "./helpers/is-map";
import {isPlainObject} from "./helpers/is-plain-object";
import {get} from "./helpers/get";
import {parseRegularExpression} from "./helpers/parse-regular-expression";
import {createRange} from "./helpers/create-range";
import {iteratorToMap} from "./helpers/iterator-to-map";
import {isIn} from "./helpers/is-in";

const sha256 = require('crypto-js/sha256');
const hex = require('crypto-js/enc-hex');

type PrimitiveEscapingStrategy = "name" | "html" | "css" | "js" | string | false;

export type TwingTemplateFactory = (runtime: Runtime) => Template;
export type TwingTemplatesModule = Map<number, TwingTemplateFactory>;
export type PrimitiveEscapingStrategyResolver = (name: string) => PrimitiveEscapingStrategy;

export const VERSION: string = '__VERSION__';

export type EscapingStrategy = PrimitiveEscapingStrategy | PrimitiveEscapingStrategyResolver;

export type TwingEnvironmentOptions = {
    debug?: boolean;
    charset?: string;
    cache?: TwingCacheInterface | false;
    dateFormat?: string;
    dateIntervalFormat?: string;
    numberFormat?: {
        numberOfDecimals: number;
        decimalPoint: string;
        thousandSeparator: string;
    };
    auto_reload?: boolean;
    strict_variables?: boolean;
    escapingStrategy?: PrimitiveEscapingStrategy | PrimitiveEscapingStrategyResolver;
    source_map?: boolean;
    sandbox_policy?: TwingSandboxSecurityPolicyInterface;
    sandboxed?: boolean;
    timezone?: string;
};

export interface TwingEnvironment {
    /**
     * @param extension
     * @param name A name the extension will be registered as
     */
    addExtension(extension: TwingExtensionInterface, name: string): void;

    addFilter(filter: TwingFilter): void;

    addFunction(aFunction: TwingFunction): void;

    /**
     * Registers a Global.
     *
     * New globals can be added before compiling or rendering a template, but after, you can only update existing globals.
     *
     * @param {string} name The global name
     * @param {*} value The global value
     */
    setGlobal(name: string, value: any): void;

    addNodeVisitor(visitor: TwingNodeVisitorInterface): void;

    addTest(test: TwingTest): void;

    addTokenParser(parser: TwingTokenParserInterface): void;

    /**
     * Displays a template.
     *
     * @param name The template name
     * @param context An array of parameters to pass to the template
     *
     * @throws TwingErrorLoader  When the template cannot be found
     * @throws TwingErrorSyntax  When an error occurred during compilation
     * @throws TwingErrorRuntime When an error occurred during rendering
     */
    display(name: string, context?: Record<string, any>): Promise<void>;

    /**
     * Register the passed listener...
     */
    on(eventName: "template", listener: (name: string, from: TwingSource | null) => void): void;

    /**
     * Get a filter by its name.
     *
     * @param name
     *
     * @return {TwingFilter | null} A Filter instance or null if the filter does not exist
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

    getGlobal(name: string): any | null;

    /**
     * Gets a test by name.
     *
     * @param {string} name The test name
     * @return {TwingTest} A TwingTest instance or null if the test does not exist
     */
    getTest(name: string): TwingTest | null;

    isSandboxed(): boolean;

    isSourceMap(): boolean;

    /**
     * Checks if the strict_variables option is enabled.
     *
     * @return {boolean} true if strict_variables is enabled, false otherwise
     */
    isStrictVariables(): boolean;

    /**
     * Loads a template by its name.
     *
     * @param name The template name
     *
     * @throws {TwingErrorLoader}  When the template cannot be found
     * @throws {TwingErrorRuntime} When a previously generated cache is corrupted
     * @throws {TwingErrorSyntax}  When an error occurred during compilation
     *
     * @return
     */
    loadTemplate(name: string | Template): Promise<Template | null>;

    render(name: string, context?: Record<string, any>): Promise<string>;

    registerTemplate(template: Template, name: string): void;

    /**
     * Compiles a module node.
     */
    compile(node: ModuleNode): string;

    /**
     * Compiles a module node.
     */
    compileSource(source: TwingSource): string;

    /**
     * Converts a token list to a template.
     *
     * @param {TwingTokenStream} stream
     * @param {TwingParserOptions} options
     * *
     * @throws {TwingErrorSyntax} When the token stream is syntactically or semantically wrong
     */
    parse(stream: TwingTokenStream, options?: TwingParserOptions): ModuleNode;

    /**
     * Tokenizes a source code.
     *
     * @param {TwingSource} source The source to tokenize
     * @return {TwingTokenStream}
     *
     * @throws {TwingErrorSyntax} When the code is syntactically wrong
     */
    tokenize(source: TwingSource): TwingTokenStream;

    /**
     * Returns true if the given extension is registered.
     *
     * @param name
     */
    hasExtension(name: string): boolean;

    getOperatorNames(): Array<string>;

    getOperator(name: string): TwingOperator | null;

    getEscapingStrategy(name: string): string | false;
}

export const createEnvironment = (
    loader: TwingLoaderInterface,
    options: TwingEnvironmentOptions | null = null
): TwingEnvironment => {
    const emitsSourceMap = options?.source_map || false;
    const expectsStrictVariables = options?.strict_variables || false;
    const extensionSet = new TwingExtensionSet();
    const loadedTemplates: Map<string, Template> = new Map();
    const originalCache: TwingEnvironmentOptions["cache"] = options?.cache || false;
    const globals: Map<string, any> = new Map();

    let cache: TwingCacheInterface;
    let isSandboxed = options?.sandboxed ? true : false;

    const coreExtension = new TwingExtensionCore();

    if (options?.dateFormat) {
        coreExtension.setDateFormat(options.dateFormat);
    }

    if (options?.dateIntervalFormat) {
        coreExtension.setDateIntervalFormat(options.dateIntervalFormat);
    }

    if (options?.numberFormat) {
        const {numberOfDecimals, decimalPoint, thousandSeparator} = options.numberFormat;

        coreExtension.setNumberFormat(numberOfDecimals, decimalPoint, thousandSeparator);
    }

    extensionSet.addExtension(new TwingExtensionCore(), 'core');

    if (originalCache === false) {
        cache = new TwingCacheNull();
    } else {
        cache = originalCache;
    }

    const sandboxPolicy = options?.sandbox_policy || new TwingSandboxSecurityPolicy([], [], new Map(), new Map(), []);

    let lexer: TwingLexer;
    let parser: TwingParser;
    let optionsHash: string = '';

    const eventEmitter = new EventEmitter();

    const registerTemplatesModule = (templates: TwingTemplatesModule, name: string): void => {
        for (const [index, templateFactory] of templates) {
            const template = templateFactory(createRuntime());

            registerTemplate(template, name + (index !== 0 ? '_' + index : ''));
        }
    };

    const createTemplate = (template: string, name: string | null = null): Promise<Template | null> => {
        let hash: string = hex.stringify(sha256(template));

        if (name !== null) {
            name = `${name} (string template ${hash})`;
        } else {
            name = `__string_template__${hash}`;
        }

        const templatesModule = getTemplatesModule(compileSource(new TwingSource(template, name)));

        registerTemplatesModule(templatesModule, name);

        return loadTemplate(name);
    };

    const createRuntime = (): Runtime => {
        const {getFilter, getFunction, getTest} = environment;

        const runtime: Runtime = {
            compare,
            concatenate: (object1, object2) => {
                if (isNullOrUndefined(object1)) {
                    object1 = '';
                }

                if (isNullOrUndefined(object2)) {
                    object2 = '';
                }

                return String(object1) + String(object2);
            },
            constant,
            convertToMap: iteratorToMap,
            count,
            checkMethodAllowed: (candidate: any, method: string) => {
                if (runtime.isSandboxed()) {
                    sandboxPolicy.checkMethodAllowed(candidate, method);
                }
            },
            checkPropertyAllowed: (candidate: any, property: string) => {
                if (runtime.isSandboxed()) {
                    sandboxPolicy.checkPropertyAllowed(candidate, property);
                }
            },
            checkSecurity: (tags, filters, functions) => {
                if (runtime.isSandboxed()) {
                    sandboxPolicy.checkSecurity(tags, filters, functions);
                }
            },
            cloneMap,
            createBaseTemplate,
            createContext: (container) => new TwingContext(container),
            createMarkup,
            createRange,
            createRuntimeError,
            createSource: (name, code, resolvedName?) => new TwingSource(code, name, resolvedName),
            createTemplate,
            disableSandbox: () => {
                isSandboxed = false;
            },
            enableSandbox: () => {
                isSandboxed = true;
            },
            ensureToStringAllowed: (candidate) => {
                if (runtime.isSandboxed() && typeof candidate === 'object') {
                    sandboxPolicy.checkMethodAllowed(candidate, 'toString');
                }

                return candidate;
            },
            ensureTraversable,
            evaluate,
            get: (object, property) => {
                if (isMap(object) || isPlainObject(object)) {
                    return get(object, property);
                }
            },
            getCharset: () => 'UTF-8',
            getDateFormats: () => coreExtension.getDateFormats(),
            getAttribute,
            getEscapers: () => new Map(),
            getLoader: () => loader,
            getNumberFormat: () => coreExtension.getNumberFormat(),
            getTest,
            getTimezone: () => options?.timezone || DateTimeSettings.defaultZoneName,
            getFilter,
            getFunction,
            include: (template, context, outputBuffer, templates, variables, withContext, ignoreMissing, line) => {
                return include(template, context, outputBuffer, templates, variables, withContext, ignoreMissing)
                    .catch((e: TwingError) => {
                        if (e.getTemplateLine() === -1) {
                            e.setTemplateLine(line);
                        }

                        throw e;
                    });
            },
            isCountable,
            isIn,
            isSandboxed: () => isSandboxed,
            get isStrictVariables() {
                return options?.strict_variables ? true : false;
            },
            iterate,
            loadTemplate,
            merge,
            mergeGlobals: (context) => {
                for (let [key, value] of globals) {
                    if (!context.has(key)) {
                        context.set(key, value);
                    }
                }

                return context;
            },
            parseRegularExpression: parseRegularExpression,
            resolveTemplate
        };

        return runtime;
    };

    const updateOptionsHash = () => {
        optionsHash = [
            extensionSet.getSignature(),
            VERSION,
            expectsStrictVariables,
            emitsSourceMap,
            typeof escapingStrategy === 'function' ? 'function' : escapingStrategy
        ].join(':');
    };

    const getTemplatesModule = (content: string): TwingTemplatesModule => {
        let resolver = new Function(`let module = {
    exports: undefined
};

${content}

return module.exports;

`);

        return resolver();
    };

    const getTemplateHash = (name: string, index: number = 0, from: TwingSource | null = null): Promise<string> => {
        return loader.getCacheKey(name, from).then((key) => {
            key += optionsHash;

            return hex.stringify(sha256(key)) + (index === 0 ? '' : '_' + index);
        });
    };

    const registerTemplate = (template: Template, name: string): void => {
        loadedTemplates.set(name, template);
    };

    const compile = (node: ModuleNode): string => {
        const compiler = createCompiler({
            getFunction: environment.getFunction,
            getTest: environment.getTest,
            getFilter: environment.getFilter,
            isSandboxed: () => isSandboxed
        }, {
            sourceMap: emitsSourceMap,
            strictVariables: options?.strict_variables ? true : false
        });

        return compiler.compile(node).source;
    };

    const parse = (stream: TwingTokenStream, options?: TwingParserOptions): ModuleNode => {
        if (!parser) {
            parser = new TwingParser(
                environment,
                extensionSet.getUnaryOperators(),
                extensionSet.getBinaryOperators(),
                extensionSet.getTokenParsers(),
                extensionSet.getNodeVisitors(),
                [...extensionSet.getFilters().keys()],
                [...extensionSet.getFunctions().keys()],
                [...extensionSet.getTests().keys()],
                options
            );
        }

        return parser.parse(stream);
    };

    const tokenize = (source: TwingSource): TwingTokenStream => {
        if (!lexer) {
            lexer = new TwingLexer(extensionSet.getBinaryOperators(), extensionSet.getUnaryOperators());
        }

        let stream = lexer.tokenizeSource(source);

        return new TwingTokenStream(stream.toAst(), stream.getSourceContext());
    };

    const compileSource = (source: TwingSource): string => {
        try {
            return compile(parse(tokenize(source)));
        } catch (e: any) {
            if (e instanceof TwingError) {
                if (!e.getSourceContext()) {
                    e.setSourceContext(source);
                }

                throw e;
            } else {
                throw new TwingErrorSyntax(`An exception has been thrown during the compilation of a template ("${e.message}").`, -1, source);
            }
        }
    };

    /**
     *
     * @param names
     * @param from
     */
    const resolveTemplate = (names: string | Template | Array<string | Template>, from: TwingSource): Promise<Template | null> => {
        let namesArray: Array<string | Template>;

        if (!Array.isArray(names)) {
            namesArray = [names];
        } else {
            namesArray = names;
        }

        let error: TwingErrorLoader | null = null;

        let loadTemplateAtIndex = (index: number): Promise<Template | null> => {
            if (index < namesArray.length) {
                let name = namesArray[index];

                if ((name !== null) && (typeof name !== "string")) {
                    return Promise.resolve(name);
                } else {
                    return loadTemplate(name as string /* todo; remove typing when strict */, 0, from).catch((e) => {
                        if (e instanceof TwingErrorLoader) {
                            error = e;

                            return loadTemplateAtIndex(index + 1);
                        } else {
                            throw e;
                        }
                    });
                }
            } else {
                if (namesArray.length === 1) {
                    throw error;
                } else {
                    throw new TwingErrorLoader(`Unable to find one of the following templates: "${namesArray.join(', ')}".`, -1, from);
                }
            }
        };

        return loadTemplateAtIndex(0);
    }

    const loadTemplate = (name: string, index: number = 0, from: TwingSource | null = null): Promise<Template | null> => {
        eventEmitter.emit('template', name, from);

        let cacheKey: string = name + (index !== 0 ? '_' + index : '');

        if (loadedTemplates.has(cacheKey)) {
            return Promise.resolve(loadedTemplates.get(cacheKey) || null);
        }

        let hashesPromises: Array<Promise<string>> = [
            getTemplateHash(name, 0, from),
            getTemplateHash(name, index, from)
        ];

        return Promise.all(hashesPromises).then(([mainTemplateHash, templateHash]) => {
            if (loadedTemplates.has(templateHash)) {
                return Promise.resolve(loadedTemplates.get(templateHash) || null);
            } else {
                return cache.generateKey(name, mainTemplateHash).then((cacheKey) => {
                    return cache.getTimestamp(cacheKey).then((timestamp) => {
                        let resolveTemplateConstructorsFromCache = (): Promise<Map<number, TwingTemplateFactory>> => {
                            let loadFromCache = () => cache.load(cacheKey);

                            if (!options?.auto_reload) {
                                return loadFromCache();
                            } else {
                                return loader.isFresh(name, timestamp, from).then((fresh) => {
                                    if (fresh) {
                                        return loadFromCache();
                                    } else {
                                        return Promise.resolve(new Map());
                                    }
                                });
                            }
                        };

                        let resolveMainTemplateFromTemplateConstructors = (templates: Map<number, TwingTemplateFactory>): Promise<Template> => {
                            let mainTemplate: Template;

                            let promises: Array<Promise<void>> = [];

                            for (let [index, templateFactory] of templates) {
                                let template = templateFactory(createRuntime());

                                if (index === 0) {
                                    mainTemplate = template;
                                }

                                promises.push(getTemplateHash(name, index, from).then((hash) => {
                                    registerTemplate(template, hash);
                                }));
                            }

                            return Promise.all(promises).then(() => Promise.resolve(mainTemplate));
                        };

                        return resolveTemplateConstructorsFromCache().then((templates) => {
                            if (!templates.has(index)) {
                                return loader.getSourceContext(name, from).then((source) => {
                                    let content = compileSource(source);

                                    return cache.write(cacheKey, content).then(() => {
                                        return cache.load(cacheKey).then((templates) => {
                                            if (!templates.has(index)) {
                                                templates = getTemplatesModule(content);
                                            }

                                            return resolveMainTemplateFromTemplateConstructors(templates);
                                        });
                                    });
                                });
                            } else {
                                return resolveMainTemplateFromTemplateConstructors(templates);
                            }
                        })
                    });
                });
            }
        });
    }

    let escapingStrategy: EscapingStrategy;

    if (options?.escapingStrategy === 'name') {
        escapingStrategy = (name: string) => {
            let extension = extname(name);

            if (extension === '.twig') {
                name = basename(name, extension);

                extension = extname(name);
            }

            switch (extension) {
                case '.js':
                    return 'js';

                case '.css':
                    return 'css';

                case '.txt':
                    return false;

                default:
                    return 'html';
            }
        };
    } else {
        escapingStrategy = options?.escapingStrategy || false;
    }

    const environment: TwingEnvironment = {
        getOperatorNames() {
            return [
                ...extensionSet.getUnaryOperators().keys(),
                ...extensionSet.getBinaryOperators().keys()
            ];
        },
        getOperator(name) {
            return extensionSet.getBinaryOperators().get(name) || extensionSet.getUnaryOperators().get(name) || null;
        },
        hasExtension(name) {
            return extensionSet.hasExtension(name);
        },
        compile,
        compileSource,
        parse,
        tokenize,
        addExtension: (extension, name) => {
            extensionSet.addExtension(extension, name);

            updateOptionsHash();
        },
        addFilter: (filter) => {
            extensionSet.addFilter(filter);
        },
        addFunction: (aFunction) => {
            extensionSet.addFunction(aFunction);
        },
        setGlobal: (name, value) => {
            globals.set(name, value);
        },
        addNodeVisitor: (visitor) => {
            extensionSet.addNodeVisitor(visitor);
        },
        addTest: (test) => {
            extensionSet.addTest(test);
        },
        addTokenParser: (parser) => {
            extensionSet.addTokenParser(parser);
        },
        on: (eventName, listener) => {
            eventEmitter.on(eventName, listener);
        },
        getFilter: (name) => {
            return extensionSet.getFilter(name);
        },
        getFunction: (name) => {
            return extensionSet.getFunction(name);
        },
        getTest: (name) => {
            return extensionSet.getTest(name);
        },
        getGlobal: (name) => globals.get(name) || null,
        isSandboxed: () => {
            return isSandboxed;
        },
        isSourceMap: () => {
            return emitsSourceMap;
        },
        isStrictVariables: () => {
            return expectsStrictVariables;
        },
        loadTemplate: (name) => {
            if (typeof name === "string") {
                return loadTemplate(name);
            }

            return Promise.resolve(name);
        },
        display: (name, context = {}) => {
            return loadTemplate(name)
                .then((template) => {
                    return template?.display(context);
                });
        },
        render: (name, context = {}) => {
            return loadTemplate(name)
                .then((template) => {
                    return template?.render(context) || ''
                });
        },
        registerTemplate,
        getEscapingStrategy: (name: string) => {
            if (typeof escapingStrategy === "function") {
                return escapingStrategy(name);
            }

            return escapingStrategy;
        }
    };

    return environment;
};

/**
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export abstract class AnEnvironment extends EventEmitter {
    private charset: string | undefined;
    // @ts-ignore
    private loader: TwingLoaderInterface;
    private debug: boolean | undefined;
    private autoReload: boolean;
    // @ts-ignore
    private cache: TwingCacheInterface;
    // @ts-ignore
    private lexer: TwingLexer;
    // @ts-ignore
    private parser: TwingParser;
    private globals: Map<any, any> = new Map();
    private loadedTemplates: Map<string, TwingTemplate> = new Map();
    private strictVariables: boolean;
    private originalCache: TwingCacheInterface | string | false = false;
    private extensionSet: TwingExtensionSet;
    private optionsHash: string = '';
    // @ts-ignore
    private sourceMapNode: TwingSourceMapNode;
    private sourceMap: boolean = false;
    private autoescape: string | false | PrimitiveEscapingStrategyResolver;
    // @ts-ignore
    private coreExtension: TwingExtensionCore;
    private sandboxed: boolean;
    private sandboxPolicy: TwingSandboxSecurityPolicyInterface;

    /**
     * Constructor.
     *
     * @param {TwingLoaderInterface} loader
     * @param {TwingEnvironmentOptions} options
     */
    constructor(loader: TwingLoaderInterface, options: TwingEnvironmentOptions | null = null) {
        super();

        this.setLoader(loader);

        options = Object.assign({}, {
            debug: false,
            charset: 'UTF-8',
            strict_variables: false,
            escapingStrategy: 'html',
            cache: false,
            auto_reload: null,
            source_map: false,
            sandbox_policy: new TwingSandboxSecurityPolicy([], [], new Map(), new Map(), []),
            sandboxed: false
        }, options);

        this.debug = options?.debug;
        this.setCharset(options?.charset);
        this.autoReload = options?.auto_reload === null ? this.debug! : options?.auto_reload!;
        this.strictVariables = options?.strict_variables!;
        this.setCache(options?.cache!);
        this.extensionSet = new TwingExtensionSet();
        this.sourceMap = options?.source_map || false;
        this.autoescape = options?.escapingStrategy || false;
        this.sandboxed = options?.sandboxed || false;
        this.sandboxPolicy = options?.sandbox_policy!;

        this.setCoreExtension(new TwingExtensionCore(options?.escapingStrategy));
    }

    getCoreExtension(): TwingExtensionCore {
        return this.coreExtension;
    }

    setCoreExtension(extension: TwingExtensionCore) {
        this.addExtension(extension as any, 'TwingExtensionCore');

        this.coreExtension = extension;
    }

    /**
     * Enables debugging mode.
     */
    enableDebug() {
        this.debug = true;
        this.updateOptionsHash();
    }

    /**
     * Disables debugging mode.
     */
    disableDebug() {
        this.debug = false;
        this.updateOptionsHash();
    }

    /**
     * Checks if debug mode is enabled.
     *
     * @return {boolean} true if debug mode is enabled, false otherwise
     */
    isDebug() {
        return this.debug;
    }

    /**
     * Enables the auto_reload option.
     */
    enableAutoReload() {
        this.autoReload = true;
    }

    /**
     * Disables the auto_reload option.
     */
    disableAutoReload() {
        this.autoReload = false;
    }

    /**
     * Checks if the auto_reload option is enabled.
     *
     * @return {boolean} true if auto_reload is enabled, false otherwise
     */
    isAutoReload() {
        return this.autoReload;
    }

    /**
     * Enables the strict_variables option.
     */
    enableStrictVariables() {
        this.strictVariables = true;
        this.updateOptionsHash();
    }

    /**
     * Disables the strict_variables option.
     */
    disableStrictVariables() {
        this.strictVariables = false;
        this.updateOptionsHash();
    }

    /**
     * Checks if the strict_variables option is enabled.
     *
     * @return {boolean} true if strict_variables is enabled, false otherwise
     */
    isStrictVariables() {
        return this.strictVariables;
    }

    getGlobal(): boolean {
        return false;
    }

    /**
     * Gets the active cache implementation.
     *
     * @param {boolean} original Whether to return the original cache option or the real cache instance
     *
     * @return {TwingCacheInterface|string|false} A TwingCacheInterface implementation, an absolute path to the compiled templates or false to disable cache
     */
    getCache(original: boolean = true): TwingCacheInterface | string | false {
        return original ? this.originalCache : this.cache;
    }

    /**
     * Sets the active cache implementation.
     *
     * @param {TwingCacheInterface|string|false} cache A TwingCacheInterface implementation, a string or false to disable cache
     */
    setCache(cache: TwingCacheInterface | string | false) {
        if (typeof cache === 'string') {
            this.originalCache = cache;
            this.cache = this.cacheFromString(cache);
        } else if (cache === false) {
            this.originalCache = cache;
            this.cache = new TwingCacheNull();
        } else {
            this.originalCache = this.cache = cache;
        }
    }

    protected abstract cacheFromString(cache: string): TwingCacheInterface;

    protected get templateConstructor(): typeof TwingTemplate {
        return TwingTemplate;
    }

    /**
     * Gets the template class associated with the given string.
     *
     * The generated template class is based on the following parameters:
     *
     *  * The cache key for the given template;
     *  * The currently enabled extensions;
     *  * Twing version;
     *  * Options with what environment was created.
     *
     * @param {string} name The name for which to calculate the template class name
     * @param {number} index The index of the template
     * @param {TwingSource} from The source that initiated the template loading
     *
     * @return {Promise<string>} The template hash
     */
    getTemplateHash(name: string, index: number = 0, from: TwingSource | null = null): Promise<string> {
        return this.getLoader().getCacheKey(name, from).then((key) => {
            key += this.optionsHash;

            return hex.stringify(sha256(key)) + (index === 0 ? '' : '_' + index);
        });
    }

    /**
     * Checks if the source_map option is enabled.
     *
     * @return {boolean} true if source_map is enabled, false otherwise
     */
    isSourceMap() {
        return this.sourceMap;
    }

    /**
     * Renders a template.
     *
     * @param {string} name The template name
     * @param {{}} context An array of parameters to pass to the template
     * @return {Promise<string>}
     */
    render(name: string, context: any = {}): Promise<string> {
        return this.loadTemplate(name).then((template) => template?.render(context) || '');
    }

    /**
     * Displays a template.
     *
     * @param {string} name The template name
     * @param {{}} context An array of parameters to pass to the template
     * @return {Promise<void>}
     *
     * @throws TwingErrorLoader  When the template cannot be found
     * @throws TwingErrorSyntax  When an error occurred during compilation
     * @throws TwingErrorRuntime When an error occurred during rendering
     */
    display(name: string, context: any = {}): Promise<void> {
        return this.loadTemplate(name).then((template) => template?.display(context));
    }

    /**
     * Loads a template.
     *
     * @param {string | TwingTemplate} name The template name
     *
     * @throws {TwingErrorLoader}  When the template cannot be found
     * @throws {TwingErrorRuntime} When a previously generated cache is corrupted
     * @throws {TwingErrorSyntax}  When an error occurred during compilation
     *
     * @return {Promise<TwingTemplate>}
     */
    load(name: string | TwingTemplate): Promise<TwingTemplate | null> {
        if (typeof name === "string") {
            return this.loadTemplate(name);
        }

        return Promise.resolve(name);
    }

    /**
     * Register a template under an arbitrary name.
     *
     * @param {TwingTemplate} template The template to register
     * @param {string} name The name of the template
     */
    registerTemplate(template: TwingTemplate, name: string): void {
        this.loadedTemplates.set(name, template);
    }

    /**
     * Register a templates module under an arbitrary name.
     *
     * @param {TwingTemplatesModule} module
     * @param {string} name
     */
    registerTemplatesModule(templates: TwingTemplatesModule, name: string) {
        for (let [index, templateFactory] of templates) {
            let template = templateFactory(this as any);
            // @ts-ignore
            this.registerTemplate(template, name + (index !== 0 ? '_' + index : ''));
        }
    }

    /**
     * Loads a template internal representation.
     *
     * @param {string} name The template name
     * @param {number} index The index of the template
     * @param {TwingSource} from The source that initiated the template loading
     *
     * @return {Promise<TwingTemplate>} A template instance representing the given template name
     *
     * @throws {TwingErrorLoader}  When the template cannot be found
     * @throws {TwingErrorRuntime} When a previously generated cache is corrupted
     * @throws {TwingErrorSyntax}  When an error occurred during compilation
     */
    loadTemplate(name: string, index: number = 0, from: TwingSource | null = null): Promise<TwingTemplate | null> {
        this.emit('template', name, from);

        let cacheKey: string = name + (index !== 0 ? '_' + index : '');

        if (this.loadedTemplates.has(cacheKey)) {
            return Promise.resolve(this.loadedTemplates.get(cacheKey) || null);
        }

        let hashesPromises: Array<Promise<string>> = [
            this.getTemplateHash(name, 0, from),
            this.getTemplateHash(name, index, from)
        ];

        return Promise.all(hashesPromises).then(([mainTemplateHash, templateHash]) => {
            if (this.loadedTemplates.has(templateHash)) {
                return Promise.resolve(this.loadedTemplates.get(templateHash) || null);
            } else {
                let cache = this.cache;

                return cache.generateKey(name, mainTemplateHash).then((cacheKey) => {
                    return cache.getTimestamp(cacheKey).then((timestamp) => {
                        let resolveTemplateConstructorsFromCache = (): Promise<Map<number, TwingTemplateFactory>> => {
                            let loadFromCache = () => cache.load(cacheKey);

                            if (!this.isAutoReload()) {
                                return loadFromCache();
                            } else {
                                return this.getLoader().isFresh(name, timestamp, from).then((fresh) => {
                                    if (fresh) {
                                        return loadFromCache();
                                    } else {
                                        return Promise.resolve(new Map());
                                    }
                                });
                            }
                        };

                        let resolveMainTemplateFromTemplateConstructors = (templates: Map<number, TwingTemplateFactory>): Promise<TwingTemplate> => {
                            let mainTemplate: TwingTemplate;

                            let promises: Array<Promise<void>> = [];

                            for (let [index, factory] of templates) {
                                let template = factory(this as any);

                                if (index === 0) {
                                    // @ts-ignore
                                    mainTemplate = template;
                                }

                                promises.push(this.getTemplateHash(name, index, from).then((hash) => {
                                    // @ts-ignore
                                    this.registerTemplate(template, hash);
                                }));
                            }

                            return Promise.all(promises).then(() => Promise.resolve(mainTemplate));
                        };

                        return resolveTemplateConstructorsFromCache().then((templates) => {
                            if (!templates.has(index)) {
                                return this.getLoader().getSourceContext(name, from).then((source) => {
                                    let content = this.compileSource(source);

                                    return cache.write(cacheKey, content).then(() => {
                                        return cache.load(cacheKey).then((templates) => {
                                            if (!templates.has(index)) {
                                                templates = this.getTemplatesModule(content);
                                            }

                                            return resolveMainTemplateFromTemplateConstructors(templates);
                                        });
                                    });
                                });
                            } else {
                                return resolveMainTemplateFromTemplateConstructors(templates);
                            }
                        })
                    });
                });
            }
        });
    }

    /**
     * Creates a template from source.
     *
     * This method should not be used as a generic way to load templates.
     *
     * @param {string} template The template name
     * @param {string} name An optional name for the template to be used in error messages
     *
     * @return {Promise<TwingTemplate>} A template instance representing the given template name
     *
     * @throws TwingErrorLoader When the template cannot be found
     * @throws TwingErrorSyntax When an error occurred during compilation
     */
    createTemplate(template: string, name: string | null = null): Promise<TwingTemplate | null> {
        let hash: string = hex.stringify(sha256(template));

        if (name !== null) {
            name = `${name} (string template ${hash})`;
        } else {
            name = `__string_template__${hash}`;
        }

        let templatesModule = this.getTemplatesModule(this.compileSource(new TwingSource(template, name)));

        this.registerTemplatesModule(templatesModule, name);

        return this.loadTemplate(name);
    }

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
     * @throws {TwingErrorLoader} When none of the templates can be found
     * @throws {TwingErrorSyntax} When an error occurred during compilation
     */
    resolveTemplate(names: string | TwingTemplate | Array<string | TwingTemplate> | null, from: TwingSource): Promise<TwingTemplate | null> {
        let namesArray: Array<string | TwingTemplate | null>;

        if (!Array.isArray(names)) {
            namesArray = [names];
        } else {
            namesArray = names;
        }

        let error: TwingErrorLoader | null = null;

        let loadTemplateAtIndex = (index: number): Promise<TwingTemplate | null> => {
            if (index < namesArray.length) {
                let name = namesArray[index];

                if ((name !== null) && (typeof name !== "string")) {
                    return Promise.resolve(name);
                } else {
                    return this.loadTemplate(name as string, 0, from).catch((e) => {
                        if (e instanceof TwingErrorLoader) {
                            error = e;

                            return loadTemplateAtIndex(index + 1);
                        } else {
                            throw e;
                        }
                    });
                }
            } else {
                if (namesArray.length === 1) {
                    throw error;
                } else {
                    throw new TwingErrorLoader(`Unable to find one of the following templates: "${namesArray.join(', ')}".`, -1, from);
                }
            }
        };

        return loadTemplateAtIndex(0);
    }

    setLexer(lexer: TwingLexer) {
        this.lexer = lexer;
    }

    /**
     * Tokenizes a source code.
     *
     * @param {TwingSource} source The source to tokenize
     * @return {TwingTokenStream}
     *
     * @throws {TwingErrorSyntax} When the code is syntactically wrong
     */
    tokenize(source: TwingSource): TwingTokenStream {
        if (!this.lexer) {
            this.lexer = new TwingLexer(this.getBinaryOperators(), this.getUnaryOperators());
        }

        let stream = this.lexer.tokenizeSource(source);

        return new TwingTokenStream(stream.toAst(), stream.getSourceContext());
    }

    setParser(parser: TwingParser) {
        this.parser = parser;
    }

    /**
     * Converts a token list to a template.
     *
     * @param {TwingTokenStream} stream
     * @param {TwingParserOptions} options
     * *
     * @throws {TwingErrorSyntax} When the token stream is syntactically or semantically wrong
     */
    parse(stream: TwingTokenStream, options?: TwingParserOptions): ModuleNode {
        if (!this.parser) {
            // @ts-ignore
            this.parser = new TwingParser(this, options);
        }

        return this.parser.parse(stream);
    }

    /**
     * Compiles a module node.
     */
    compile(node: ModuleNode) {
        let compiler = createCompiler(this as any);

        return compiler.compile(node).source;
    }

    /**
     * @param {TwingSource} source
     *
     * @return {Map<number, TwingTemplate> }
     */
    compileSource(source: TwingSource): string {

        try {
            return this.compile(this.parse(this.tokenize(source)));
        } catch (e: any) {
            if (e instanceof TwingError) {
                if (!e.getSourceContext()) {
                    e.setSourceContext(source);
                }

                throw e;
            } else {
                throw new TwingErrorSyntax(`An exception has been thrown during the compilation of a template ("${e.message}").`, -1, source);
            }
        }
    }

    /**
     * @return {TwingTemplatesModule}
     */
    private getTemplatesModule(content: string): TwingTemplatesModule {
        let resolver = new Function(`let module = {
    exports: undefined
};

${content}

return module.exports;

`);

        return resolver();
    }

    setLoader(loader: TwingLoaderInterface) {
        this.loader = loader;
    }

    /**
     * Gets the Loader instance.
     *
     * @return TwingLoaderInterface
     */
    getLoader() {
        return this.loader;
    }

    /**
     * Sets the default template charset.
     *
     * @param {string} charset The default charset
     */
    setCharset(charset: string | undefined) {
        this.charset = charset;
    }

    /**
     * Gets the default template charset.
     *
     * @return {string} The default charset
     */
    getCharset() {
        return this.charset;
    }

    /**
     * Returns true if the given extension is registered.
     *
     * @param {string} name
     * @return {boolean}
     */
    hasExtension(name: string) {
        return this.extensionSet.hasExtension(name);
    }

    /**
     * Gets an extension by name.
     *
     * @param {string} name
     * @return {TwingExtensionInterface}
     */
    getExtension(name: string) {
        return this.extensionSet.getExtension(name);
    }

    /**
     *
     * @param {TwingExtensionInterface} extension
     * @param {string} name A name the extension will be registered as
     */
    addExtension(extension: TwingExtensionInterface, name: string) {
        this.extensionSet.addExtension(extension, name);
        this.updateOptionsHash();
    }

    /**
     * Registers some extensions.
     *
     * @param {Map<string, TwingExtensionInterface>} extensions
     */
    addExtensions(extensions: Map<string, TwingExtensionInterface>) {
        this.extensionSet.addExtensions(extensions);
        this.updateOptionsHash();
    }

    /**
     * Returns all registered extensions.
     *
     * @return Map<string, TwingExtensionInterface>
     */
    getExtensions() {
        return this.extensionSet.getExtensions();
    }

    addTokenParser(parser: TwingTokenParserInterface) {
        this.extensionSet.addTokenParser(parser);
    }

    /**
     * Gets the registered Token Parsers.
     *
     * @return {Array<TwingTokenParserInterface>}
     *
     * @internal
     */
    getTokenParsers() {
        return this.extensionSet.getTokenParsers();
    }

    /**
     * Gets registered tags.
     *
     * @return Map<string, TwingTokenParserInterface>
     *
     * @internal
     */
    getTags(): Map<string, TwingTokenParserInterface> {
        let tags = new Map();

        this.getTokenParsers().forEach(function (parser) {
            tags.set(parser.getTag(), parser);
        });

        return tags;
    }

    addNodeVisitor(visitor: TwingNodeVisitorInterface) {
        this.extensionSet.addNodeVisitor(visitor);
    }

    /**
     * Gets the registered Node Visitors.
     *
     * @return {Array<TwingNodeVisitorInterface>}
     *
     * @internal
     */
    getNodeVisitors() {
        return this.extensionSet.getNodeVisitors();
    }

    addFilter(filter: TwingFilter) {
        this.extensionSet.addFilter(filter);
    }

    /**
     * Get a filter by name.
     *
     * @param {string} name
     *
     * @return Twig_Filter|false A Twig_Filter instance or null if the filter does not exist
     */
    getFilter(name: string): TwingFilter | null {
        return this.extensionSet.getFilter(name);
    }

    /**
     * Gets the registered Filters.
     *
     * Be warned that this method cannot return filters defined with registerUndefinedFilterCallback.
     *
     * @return Twig_Filter[]
     *
     * @see registerUndefinedFilterCallback
     *
     * @internal
     */
    getFilters(): Map<string, TwingFilter> {
        return this.extensionSet.getFilters();
    }

    /**
     * Registers a Test.
     *
     * @param {TwingTest} test
     */
    addTest(test: TwingTest) {
        this.extensionSet.addTest(test);
    }

    /**
     * Gets the registered Tests.
     *
     * @return {Map<string, TwingTest>}
     */
    getTests() {
        return this.extensionSet.getTests();
    }

    /**
     * Gets a test by name.
     *
     * @param {string} name The test name
     * @return {TwingTest} A TwingTest instance or null if the test does not exist
     */
    getTest(name: string): TwingTest {
        return this.extensionSet.getTest(name);
    }

    addFunction(aFunction: TwingFunction) {
        this.extensionSet.addFunction(aFunction);
    }

    /**
     * Get a function by name.
     *
     * Subclasses may override this method and load functions differently;
     * so no list of functions is available.
     *
     * @param {string} name function name
     *
     * @return {TwingFunction} A TwingFunction instance or null if the function does not exist
     *
     * @internal
     */
    getFunction(name: string) {
        return this.extensionSet.getFunction(name);
    }

    /**
     * Gets registered functions.
     *
     * Be warned that this method cannot return functions defined with registerUndefinedFunctionCallback.
     *
     * @return Twig_Function[]
     *
     * @see registerUndefinedFunctionCallback
     *
     * @internal
     */
    getFunctions() {
        return this.extensionSet.getFunctions();
    }

    /**
     * @param nodeType
     *
     * @return TwingSourceMapNodeFactory
     */
    getSourceMapNodeFactory(nodeType: string) {
        return this.extensionSet.getSourceMapNodeFactory(nodeType);
    }

    /**
     * @return Map<string, TwingSourceMapNodeFactory>
     */
    getSourceMapNodeFactories(): Map<string, TwingSourceMapNodeFactory> {
        return this.extensionSet.getSourceMapNodeFactories();
    }

    /**
     * Registers a Global.
     *
     * New globals can be added before compiling or rendering a template, but after, you can only update existing globals.
     *
     * @param {string} name The global name
     * @param {*} value The global value
     */
    setGlobal(name: string, value: any) {
        this.globals.set(name, value);
    }

    /**
     * Gets the registered Globals.
     *
     * @return Map<any, any> A map of globals
     */
    getGlobals(): Map<any, any> {
        return this.globals;
    }

    /**
     * Merges a context with the defined globals.
     *
     * @param {Map<*, *>} context
     * @return {Map<*, *>}
     */
    mergeGlobals(context: Map<any, any>) {
        for (let [key, value] of this.getGlobals()) {
            if (!context.has(key)) {
                context.set(key, value);
            }
        }

        return context;
    }

    /**
     * Gets the registered unary Operators.
     *
     * @return Map<string, TwingOperator> A map of unary operators
     *
     * @internal
     */
    getUnaryOperators(): Map<string, TwingOperator> {
        return this.extensionSet.getUnaryOperators();
    }

    /**
     * Gets the registered binary Operators.
     *
     * @return Map<string, TwingOperator> An array of binary operators
     *
     * @internal
     */
    getBinaryOperators(): Map<string, TwingOperator> {
        return this.extensionSet.getBinaryOperators();
    }

    updateOptionsHash() {
        this.optionsHash = [
            this.extensionSet.getSignature(),
            VERSION,
            this.debug,
            this.strictVariables,
            this.sourceMap,
            typeof this.autoescape === 'function' ? 'function' : this.autoescape
        ].join(':');
    }

    /**
     * @param {number} line 0-based
     * @param {number} column 1-based
     * @param {string} nodeType
     * @param {TwingSource} source
     * @param {TwingOutputBuffer} outputBuffer
     */
    enterSourceMapBlock(line: number, column: number, nodeType: string, source: TwingSource, outputBuffer: TwingOutputBuffer) {
        outputBuffer.start();

        let sourceName = source.getResolvedName();

        if (path.isAbsolute(sourceName)) {
            sourceName = path.relative('.', sourceName);
        }

        source = new TwingSource(source.getCode(), sourceName);

        let factory = this.getSourceMapNodeFactory(nodeType);

        if (!factory) {
            factory = new TwingSourceMapNodeFactory(nodeType);
        }

        let node = factory.create(line, column - 1, source);

        if (this.sourceMapNode) {
            this.sourceMapNode.addChild(node);
        }

        this.sourceMapNode = node;
    }

    /**
     * @param {TwingOutputBuffer} outputBuffer
     */
    leaveSourceMapBlock(outputBuffer: TwingOutputBuffer) {
        this.sourceMapNode.content = outputBuffer.getAndFlush() as string;

        let parent = this.sourceMapNode.parent;

        if (parent) {
            this.sourceMapNode = parent;
        }
    }

    getSourceMap(): string | null {
        let sourceMap: string | null = null;

        if (this.isSourceMap() && this.sourceMapNode) {
            let sourceNode = this.sourceMapNode.toSourceNode();
            let codeAndMap = sourceNode.toStringWithSourceMap();

            sourceMap = codeAndMap.map.toString();
        }

        return sourceMap;
    }

    enableSandbox() {
        this.sandboxed = true;
    }

    disableSandbox() {
        this.sandboxed = false;
    }

    isSandboxed() {
        return this.sandboxed;
    }

    checkSecurity(tags: string[], filters: string[], functions: string[]) {
        if (this.isSandboxed()) {
            this.sandboxPolicy.checkSecurity(tags, filters, functions);
        }
    }

    checkMethodAllowed(obj: any, method: string) {
        if (this.isSandboxed()) {
            this.sandboxPolicy.checkMethodAllowed(obj, method);
        }
    }

    checkPropertyAllowed(obj: any, property: string) {
        if (this.isSandboxed()) {
            this.sandboxPolicy.checkPropertyAllowed(obj, property);
        }
    }

    ensureToStringAllowed(obj: any) {
        if (this.isSandboxed() && typeof obj === 'object') {
            this.sandboxPolicy.checkMethodAllowed(obj, 'toString');
        }

        return obj;
    }
}
