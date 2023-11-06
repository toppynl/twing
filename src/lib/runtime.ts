import type {TwingFilter} from "./filter";
import type {TwingTemplate} from "./template";
import type {Source} from "./source";
import type {TwingLoader} from "./loader";
import type {TwingContext} from "./context";
import type {TwingFunction} from "./function";
import {TwingOutputBuffer} from "./output-buffer";
import {IterateCallback} from "./helpers/iterate";
import type {TwingMarkup} from "./markup";
import {TwingTest} from "./test";
import {GetAttributeCallType} from "./node/expression/get-attribute";
import type {TwingRuntimeError} from "./error/runtime";

export interface Runtime {
    checkMethodAllowed(candidate: any, property: string): void;

    checkPropertyAllowed(candidate: any, property: string): void;

    checkSecurity(tags: string[], filters: string[], functions: string[]): void;

    cloneMap<K, V>(m: Map<K, V>): Map<K, V>;

    compare(a: any, b: any): boolean;

    concatenate(object1: any, object2: any): string;

    constant(context: TwingContext<any, any>, name: string, object?: any): any;

    convertToMap(iterable: any): Map<any, any>;

    createBaseTemplate(
        runtime: Runtime,
        source: Source,
        blockHandlers: any, // todo
        macroHandlers: any // todo
    ): TwingTemplate;

    createContext<K, V>(container?: Map<K, V>): TwingContext<K, V>;

    createMarkup(content: Buffer, charset: string): TwingMarkup;

    createRange(low: any, high: any, step: number): Map<number, any>;
    
    createSource(name: string, code: string, resolvedName?: string): Source;

    createTemplate(content: string, name: string | null): Promise<TwingTemplate | null>;

    count(a: any): number;

    disableSandbox(): void;

    enableSandbox(): void;

    ensureToStringAllowed<T>(candidate: T): T;

    ensureTraversable<T>(candidate: T[]): T[] | [];

    /**
     * @param {number} line 0-based
     * @param {number} column 1-based
     * @param {string} nodeType
     * @param {Source} source
     * @param {TwingOutputBuffer} outputBuffer
     */
    enterSourceMapBlock(line: number, column: number, nodeType: string, source: Source, outputBuffer: TwingOutputBuffer): void;

    evaluate(value: any): boolean;

    get(object: any, property: any): any;

    getAttribute(runtime: Runtime, object: any, item: any, _arguments: Map<any, any>, type: GetAttributeCallType, isDefinedTest: boolean, ignoreStrictCheck: boolean, sandboxed: boolean): any;

    getCharset(): string;

    getDateFormats(): [string, string];

    getEscapers(): Map<string, (runtime: Runtime, value: string, charset: string) => string>;

    getNumberFormat(): [number, string, string];
    
    getSourceMap(): string | null;
    
    getTimezone(): string;

    getFilter(name: string): TwingFilter | null;

    getFunction(name: string): TwingFunction | null;

    getLoader(): TwingLoader;

    getTest(name: string): TwingTest | null;

    include(
        template: TwingTemplate,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        templates: string | Map<number, string | TwingTemplate> | TwingTemplate,
        variables: Map<string, any>,
        withContext: boolean,
        ignoreMissing: boolean,
        line: number
    ): Promise<string>;

    isCountable(candidate: any): boolean;

    isIn(a: any, b: any): boolean;
    
    isSandboxed(): boolean;

    readonly isStrictVariables: boolean;

    iterate(iterator: any, cb: IterateCallback): Promise<void>;
    
    leaveSourceMapBlock(outputBuffer: TwingOutputBuffer): void;
    
    loadTemplate(name: string, index: number, from: Source): Promise<TwingTemplate | null>;

    merge<V>(iterable1: Map<any, V>, iterable2: Map<any, V>): Map<any, V>;

    mergeGlobals(context: Map<any, any>): Map<any, any>;

    parseRegularExpression(input: string): RegExp;

    resolveTemplate(names: string | TwingTemplate | Array<string | TwingTemplate | null> | null, from: Source): Promise<TwingTemplate | null>;
    
    readonly Error: typeof TwingRuntimeError;
}

// @ts-ignore
export const createRuntime = (): Runtime => { // todo: let's make Environment extend Runtime!

}
