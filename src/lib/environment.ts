import {TwingTagHandler} from "./tag-handler";
import {TwingNodeVisitor} from "./node-visitor";
import {TwingExtensionSet} from "./extension-set";
import {TwingExtensionCore} from "./extension/core";
import {TwingExtensionInterface} from "./extension-interface";
import {TwingFilter} from "./filter";
import {TwingLexer} from "./lexer";
import {createParser, TwingParser, TwingParserOptions} from "./parser";
import {TwingTokenStream} from "./token-stream";
import {createSource, Source} from "./source";
import {TwingLoader} from "./loader";
import {isATemplateLoadingError, TwingTemplateLoadingError} from "./error/loader";
import {TwingTest} from "./test";
import {TwingFunction} from "./function";
import {TwingParsingError, isAParsingError} from "./error/parsing";
import {createBaseTemplate, TwingTemplate} from "./template";
import {isATwingError, TwingError} from "./error";
import {TwingCache} from "./cache";
import {createCompiler} from "./compiler";
import {ModuleNode} from "./node/module";
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
import {TwingRuntimeError} from "./error/runtime";
import {cloneMap} from "./helpers/clone-map";
import * as path from "path";
import {isMap} from "./helpers/is-map";
import {isPlainObject} from "./helpers/is-plain-object";
import {get} from "./helpers/get";
import {parseRegularExpression} from "./helpers/parse-regular-expression";
import {createRange} from "./helpers/create-range";
import {iteratorToMap} from "./helpers/iterator-to-map";
import {isIn} from "./helpers/is-in";
import {isACompilationError} from "./error/compilation";
import {createHash} from "crypto";

type PrimitiveEscapingStrategy = "name" | "html" | "css" | "js" | string | false;

export type TwingTemplateFactory = (runtime: Runtime) => TwingTemplate;
export type TwingTemplateModule = {
    0: TwingTemplateFactory;
} & Record<string, TwingTemplateFactory>;
export type PrimitiveEscapingStrategyResolver = (name: string) => PrimitiveEscapingStrategy;

export const VERSION: string = '__VERSION__';

export type EscapingStrategy = PrimitiveEscapingStrategy | PrimitiveEscapingStrategyResolver;

export type TwingEnvironmentOptions = {
    debug?: boolean;
    charset?: string;
    cache?: TwingCache | false;
    dateFormat?: string;
    dateIntervalFormat?: string;
    numberFormat?: {
        numberOfDecimals: number;
        decimalPoint: string;
        thousandSeparator: string;
    };
    auto_reload?: boolean;
    strictVariables?: boolean;
    escapingStrategy?: PrimitiveEscapingStrategy | PrimitiveEscapingStrategyResolver;
    source_map?: boolean;
    sandboxPolicy?: TwingSandboxSecurityPolicyInterface;
    sandboxed?: boolean;
    timezone?: string;
    parserOptions?: TwingParserOptions;
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

    addNodeVisitor(visitor: TwingNodeVisitor): void;

    addTest(test: TwingTest): void;

    addTokenParser(parser: TwingTagHandler): void;

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
    on(eventName: "template", listener: (name: string, from: Source | null) => void): void;

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
     * @return {TwingTest} A MyTest instance or null if the test does not exist
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
     * @throws {TwingTemplateLoadingError}  When the template cannot be found
     * @throws {TwingRuntimeError} ...
     * @throws {TwingParsingError} When an error occurred during compilation
     * @throws {TwingCompilationError}  When an error occurred during compilation
     *
     * @return
     */
    loadTemplate(name: string | TwingTemplate): Promise<TwingTemplate | null>;

    render(name: string, context?: Record<string, any>): Promise<string>;

    registerTemplate(template: TwingTemplate, name: string): void;

    /**
     * Compiles a module node.
     */
    compile(node: ModuleNode): string;

    /**
     * Compiles a module node.
     */
    compileSource(source: Source): string;

    /**
     * Converts a token list to a template.
     *
     * @param {TwingTokenStream} stream
     * @param {TwingParserOptions} options
     * *
     * @throws {TwingParsingError} When the token stream is syntactically or semantically wrong
     */
    parse(stream: TwingTokenStream, options?: TwingParserOptions): ModuleNode;

    /**
     * Tokenizes a source code.
     *
     * @param {Source} source The source to tokenize
     * @return {TwingTokenStream}
     */
    tokenize(source: Source): TwingTokenStream;

    /**
     * Returns true if the given extension is registered.
     *
     * @param name
     */
    hasExtension(name: string): boolean;

    getOperatorNames(): Array<string>;

    getOperator(name: string): TwingOperator | null;

    getEscapingStrategy(name: string): string | false;

    getSourceMap(): string | null;
}

export const createEnvironment = (
    loader: TwingLoader,
    options: TwingEnvironmentOptions | null = null
): TwingEnvironment => {
    const emitsSourceMap = options?.source_map || false;
    const expectsStrictVariables = options?.strictVariables || false;
    const extensionSet = new TwingExtensionSet();
    const loadedTemplates: Map<string, TwingTemplate> = new Map();
    const originalCache: TwingEnvironmentOptions["cache"] = options?.cache || false;
    const globals: Map<string, any> = new Map();

    let cache: TwingCache | null = null;
    let isSandboxed = options?.sandboxed ? true : false;
    let sourceMapNode: TwingSourceMapNode | null = null;

    if (originalCache !== false) {
        cache = originalCache;
    }

    const sandboxPolicy = options?.sandboxPolicy || new TwingSandboxSecurityPolicy([], [], new Map(), new Map(), []);

    let lexer: TwingLexer;
    let parser: TwingParser;
    let optionsHash: string = '';

    const eventEmitter = new EventEmitter();

    const registerTemplatesModule = (templateModule: TwingTemplateModule, name: string): void => {
        const runtime = createRuntime();
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

    const createTemplate = (template: string, name: string | null = null): Promise<TwingTemplate | null> => {
        const hash: string = createHash("sha256").update(template).digest("hex").toString();

        if (name !== null) {
            name = `${name} (string template ${hash})`;
        } else {
            name = `__string_template__${hash}`;
        }

        const templatesModule = getTemplateModule(compileSource(createSource(template, name)));

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
            createSource: (name, code, resolvedName?) => createSource(code, name, resolvedName),
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
            enterSourceMapBlock: (line, column, nodeType, source, outputBuffer) => {
                outputBuffer.start();

                let sourceName = source.resolvedName;

                if (path.isAbsolute(sourceName)) {
                    sourceName = path.relative('.', sourceName);
                }

                source = createSource(source.code, sourceName);

                let factory = extensionSet.getSourceMapNodeFactory(nodeType);

                if (!factory) {
                    factory = new TwingSourceMapNodeFactory(nodeType);
                }

                const node = factory.create(line, column - 1, source);

                if (sourceMapNode) {
                    sourceMapNode.addChild(node);
                }

                sourceMapNode = node;
            },
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
            getSourceMap: environment.getSourceMap,
            getTest,
            getTimezone: () => options?.timezone || DateTimeSettings.defaultZoneName,
            getFilter,
            getFunction,
            include: (template, context, outputBuffer, templates, variables, withContext, ignoreMissing, line) => {
                return include(template, context, outputBuffer, templates, variables, withContext, ignoreMissing)
                    .catch((error: TwingError) => {
                        if (error.line === undefined) {
                            error.line = line;
                        }

                        throw error;
                    });
            },
            isCountable,
            isIn,
            isSandboxed: () => isSandboxed,
            get isStrictVariables() {
                return options?.strictVariables ? true : false;
            },
            iterate,
            leaveSourceMapBlock: (outputBuffer: TwingOutputBuffer) => {
                if (sourceMapNode !== null) {
                    sourceMapNode.content = outputBuffer.getAndFlush() as string;

                    const parent = sourceMapNode.parent;

                    if (parent) {
                        sourceMapNode = parent;
                    }
                }
            },
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
            resolveTemplate,
            get Error() {
                return TwingRuntimeError;
            }
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

    const getTemplateModule = (content: string): TwingTemplateModule => {
        let resolver = new Function(`let module = {
    exports: undefined
};

${content}

return module.exports;

`);

        return resolver();
    };

    const getTemplateHash = async (name: string, index: number = 0, from: Source | null = null): Promise<string | null> => {
        let key = await loader.getCacheKey(name, from);

        if (key === null) {
            return null;
        }

        key += optionsHash;

        return createHash("sha256").update(key).digest('hex') + (index === 0 ? '' : '_' + index);
    };

    const registerTemplate = (template: TwingTemplate, name: string): void => {
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
            strictVariables: options?.strictVariables ? true : false
        });

        return compiler.compile(node).source;
    };

    const parse = (stream: TwingTokenStream, options?: TwingParserOptions): ModuleNode => {
        if (!parser) {
            parser = createParser(
                extensionSet.getUnaryOperators(),
                extensionSet.getBinaryOperators(),
                extensionSet.getTokenParsers(),
                extensionSet.getNodeVisitors(),
                extensionSet.getFilters(),
                extensionSet.getFunctions(),
                extensionSet.getTests(),
                options || {
                    strict: true
                }
            );
        }

        try {
            return parser.parse(stream);
        } catch (error: any) {
            const source = stream.getSourceContext();

            if (isAParsingError(error)) {
                if (!error.source) {
                    error.source = source;
                }
            } else {
                error = new TwingParsingError(`An exception has been thrown during the parsing of a template ("${(error as Error).message}").`, undefined, source);
            }

            throw error;
        }
    };

    const tokenize = (source: Source): TwingTokenStream => {
        if (!lexer) {
            lexer = new TwingLexer(extensionSet.getBinaryOperators(), extensionSet.getUnaryOperators());
        }

        let stream = lexer.tokenizeSource(source);

        return new TwingTokenStream(stream.toAst(), stream.getSourceContext());
    };

    const compileSource = (source: Source): string => {
        try {
            return compile(parse(tokenize(source), options?.parserOptions || {
                strict: true
            }));
        } catch (error: any) {
            if (isACompilationError(error)) {
                if (!error.source) {
                    error.source = source;
                }

                throw error;
            } else if (!isATwingError(error)) {
                throw new TwingParsingError(`An exception has been thrown during the compilation of a template ("${error.message}").`, undefined, source);
            }

            throw error;
        }
    };

    const resolveTemplate = (names: (string | TwingTemplate | null) | Array<string | TwingTemplate | null>, from: Source): Promise<TwingTemplate | null> => {
        const namesArray: Array<string | TwingTemplate | null> = !Array.isArray(names) ? [names] : names;

        let caughtError: TwingTemplateLoadingError | null = null;

        let loadTemplateAtIndex = (index: number): Promise<TwingTemplate | null> => {
            if (index < namesArray.length) {
                const name = namesArray[index];

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
                if (namesArray.length === 1) {
                    throw caughtError;
                } else {
                    throw new TwingTemplateLoadingError(`Unable to find one of the following templates: "${namesArray.join(', ')}".`, undefined, from);
                }
            }
        };

        return loadTemplateAtIndex(0);
    }

    const loadTemplate = async (name: string, index: number = 0, from: Source | null = null): Promise<TwingTemplate | null> => {
        eventEmitter.emit('template', name, from);

        const cacheKey: string = name + (index !== 0 ? '_' + index : '');

        if (loadedTemplates.has(cacheKey)) {
            return Promise.resolve(loadedTemplates.get(cacheKey) || null);
        }

        const templateHash = await getTemplateHash(name, index, from);

        let loadedTemplate: TwingTemplate | undefined;

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

                if (!options?.auto_reload) {
                    content = await cache.load(cacheKey);
                } else {
                    const isFresh = await loader.isFresh(name, timestamp, from);

                    if (isFresh) {
                        content = await cache.load(cacheKey);
                    } else {
                        content = null;
                    }
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
                const runtime = createRuntime();
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
                throw new TwingTemplateLoadingError(`Template "${name}" is not defined.`);
            }

            const templateModule = getTemplateModule(content);

            return resolveMainTemplateFromTemplateModule(templateModule);
        }
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
        getSourceMap: () => {
            let sourceMap: string | null = null;

            if (sourceMapNode) {
                const sourceNode = sourceMapNode.toSourceNode();
                const codeAndMap = sourceNode.toStringWithSourceMap();

                sourceMap = codeAndMap.map.toString();
            }

            return sourceMap;
        },
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
            extensionSet.addTagHandler(parser);
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

    const coreExtension = new TwingExtensionCore(environment);

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

    extensionSet.addExtension(coreExtension, 'core');

    return environment;
};
