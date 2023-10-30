import type {TwingFilter} from "./filter";
import type {Template} from "./template";
import type {TwingSource} from "./source";
import type {TwingLoaderInterface} from "./loader-interface";
import type {TwingContext} from "./context";
import {TwingFunction} from "./function";
import {TwingOutputBuffer} from "./output-buffer";
import {IterateCallback} from "./helpers/iterate";
import type {Markup} from "./markup";
import {TwingTest} from "./test";
import {GetAttributeCallType} from "./node/expression/get-attribute";
import {TwingErrorRuntime} from "./error/runtime";

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
        source: TwingSource,
        blockHandlers: any, // todo
        macroHandlers: any // todo
    ): Template;

    createContext<K, V>(container?: Map<K, V>): TwingContext<K, V>;

    createMarkup(content: Buffer, charset: string): Markup;

    createRange(low: any, high: any, step: number): Map<number, any>;

    createRuntimeError(message: string, line?: number, source?: TwingSource, previous?: Error): TwingErrorRuntime;

    createSource(name: string, code: string, resolvedName?: string): TwingSource;

    createTemplate(content: string, name: string | null): Promise<Template | null>;

    count(a: any): number;

    disableSandbox(): void;

    enableSandbox(): void;

    ensureToStringAllowed<T>(candidate: T): T;

    ensureTraversable<T>(candidate: T[]): T[] | [];

    evaluate(value: any): boolean;

    get(object: any, property: any): any;

    getAttribute(runtime: Runtime, object: any, item: any, _arguments: Map<any, any>, type: GetAttributeCallType, isDefinedTest: boolean, ignoreStrictCheck: boolean, sandboxed: boolean): any;

    getCharset(): string;

    getDateFormats(): [string, string];

    getEscapers(): Map<string, (runtime: Runtime, value: string, charset: string) => string>;

    getNumberFormat(): [number, string, string];

    getTimezone(): string;

    getFilter(name: string): TwingFilter | null;

    getFunction(name: string): TwingFunction | null;

    getLoader(): TwingLoaderInterface;

    getTest(name: string): TwingTest | null;

    include(
        template: Template,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        templates: string | Map<number, string | Template> | Template,
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

    loadTemplate(name: string, index: number, from: TwingSource): Promise<Template | null>;

    merge<V>(iterable1: Map<any, V>, iterable2: Map<any, V>): Map<any, V>;

    mergeGlobals(context: Map<any, any>): Map<any, any>;

    parseRegularExpression(input: string): RegExp;

    resolveTemplate(names: string | Template | Array<string | Template> | null, from: TwingSource): Promise<Template | null>;
}

// @ts-ignore
export const createRuntime = (): Runtime => { // todo: let's make Environment extend Runtime!

}
