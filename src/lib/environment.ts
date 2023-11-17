import {TwingTagHandler} from "./tag-handler";
import {TwingNodeVisitor} from "./node-visitor";
import {createExtensionSet} from "./extension-set";
import {TwingFilter} from "./filter";
import {TwingParserOptions} from "./parser";
import {TwingLoader} from "./loader";
import {TwingTest} from "./test";
import {TwingFunction} from "./function";
import {TwingTemplate} from "./template";
import {TwingCache} from "./cache";
import {TwingOperator} from "./operator";
import type {CreateRuntimeOptions, NumberFormat} from "./runtime";
import {createRuntime} from "./runtime";
import {EscapingStrategyHandler} from "./escaping-strategy";
import {createHtmlEscapingStrategyHandler} from "./escaping-stragegy/html";
import {createCssEscapingStrategyHandler} from "./escaping-stragegy/css";
import {createJsEscapingStrategyHandler} from "./escaping-stragegy/js";
import {createUrlEscapingStrategyHandler} from "./escaping-stragegy/url";
import {createHtmlAttributeEscapingStrategyHandler} from "./escaping-stragegy/html-attribute";
import {TwingSource} from "./source";
import {TwingTokenStream} from "./token-stream";
import {TwingExtension} from "./extension";
import {TwingSandboxSecurityPolicy} from "./sandbox/security-policy";
import {TwingModuleNode} from "./node/module";

export type TwingEnvironmentOptions = {
    autoEscapingStrategy?: "css" | "html" | "js" | "name" | string | null;
    autoReload?: boolean;
    cache?: TwingCache | false;
    charset?: string;
    dateFormat?: string;
    dateIntervalFormat?: string;
    emitsSourceMap?: boolean;
    numberFormat?: NumberFormat;
    parserOptions?: TwingParserOptions;
    strictVariables?: boolean;
    sandboxPolicy?: TwingSandboxSecurityPolicy;
    sandboxed?: boolean;
    timezone?: string;
};

export interface TwingEnvironment {
    readonly sourceMap: string | null;

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
     * Compiles a module node.
     */
    compile(node: TwingModuleNode): string;

    createTemplateFromCompiledSource(content: string, name: string): Promise<TwingTemplate>;
    
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
    loadTemplate(name: string): Promise<TwingTemplate | null>;

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

    /**
     * Convenient method...
     * @param name
     * @param context
     */
    render(name: string, context?: Record<string, any>): Promise<string>;

    registerEscapingStrategy(handler: EscapingStrategyHandler, name: string): void;

    /**
     * Registers a template [...]
     *
     * @param template
     * @param name
     */
    registerTemplate(template: TwingTemplate, name: string): void;

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

export const createEnvironment = (
    loader: TwingLoader,
    options?: TwingEnvironmentOptions
): TwingEnvironment => {
    const cssEscapingStrategy = createCssEscapingStrategyHandler();
    const htmlEscapingStrategy = createHtmlEscapingStrategyHandler();
    const htmlAttributeEscapingStrategy = createHtmlAttributeEscapingStrategyHandler();
    const jsEscapingStrategy = createJsEscapingStrategyHandler();
    const urlEscapingStrategy = createUrlEscapingStrategyHandler();

    const escapingStrategyHandlers: Record<string, EscapingStrategyHandler> = {
        css: cssEscapingStrategy,
        html: htmlEscapingStrategy,
        html_attr: htmlAttributeEscapingStrategy,
        js: jsEscapingStrategy,
        url: urlEscapingStrategy
    };
    const extensionSet = createExtensionSet();

    const createRuntimeOptions: CreateRuntimeOptions = {
        autoEscapingStrategy: options?.autoEscapingStrategy,
        autoReload: options?.autoReload,
        cache: options?.cache,
        charset: options?.charset,
        dateFormat: options?.dateFormat,
        dateIntervalFormat: options?.dateIntervalFormat,
        numberFormats: options?.numberFormat,
        parserOptions: options?.parserOptions,
        sandboxed: options?.sandboxed,
        sandboxPolicy: options?.sandboxPolicy,
        source_map: options?.emitsSourceMap,
        strictVariables: options?.strictVariables
    };

    const runtime = createRuntime(
        loader,
        escapingStrategyHandlers,
        extensionSet,
        createRuntimeOptions
    );

    const environment: TwingEnvironment = {
        get sourceMap() {
            return runtime.getSourceMap();
        },
        addExtension: extensionSet.addExtension,
        addFilter: extensionSet.addFilter,
        addFunction: extensionSet.addFunction,
        addNodeVisitor: extensionSet.addNodeVisitor,
        addOperator: extensionSet.addOperator,
        addTagHandler: extensionSet.addTagHandler,
        addTest: extensionSet.addTest,
        compile: runtime.compile,
        createTemplateFromCompiledSource: runtime.createTemplateFromCompiledSource,
        loadTemplate: runtime.loadTemplate,
        on: runtime.on,
        registerEscapingStrategy: (handler, name) => {
            escapingStrategyHandlers[name] = handler;
        },
        parse: runtime.parse,
        registerTemplate: runtime.registerTemplate,
        render: (name, context = {}) => {
            return runtime.loadTemplate(name)
                .then((template) => {
                    return template.render(context);
                });
        },
        setGlobal: runtime.setGlobal,
        tokenize: runtime.tokenize
    };

    return environment;
};
