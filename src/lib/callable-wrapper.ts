import type {Source} from "./source";
import {Node} from "./node";
import type {TwingRuntimeError} from "./error/runtime";
import {Safe} from "./node-visitor/safe-analysis";

export type TwingCallable<T> = (...args: any[]) => Promise<T>;

export type TwingCallableArgument = {
    name: string,
    defaultValue?: any
};

export type TwingCallableWrapperOptions = {
    needs_template?: boolean;
    needs_context?: boolean;
    needs_output_buffer?: boolean;
    is_variadic?: boolean;
    is_safe?: Array<any>;
    is_safe_callback?: Function;
    deprecated?: boolean | string;
    alternative?: string;
}

export interface TwingCallableWrapper<T, Factory extends Function> {
    readonly acceptedArguments: TwingCallableArgument[];
    readonly alternative: string | undefined;
    readonly callable: TwingCallable<T> | null;
    readonly deprecatedVersion: string | boolean | undefined;
    readonly expressionFactory: Factory;
    readonly isDeprecated: boolean;
    readonly isVariadic: boolean;
    readonly name: string;
    /**
     * native arguments are the arguments implicitly passed to the call, deduced from the operator name
     * typically, a Callable Wrapper registered under the name "foo-*-*"
     * would generate native arguments ["bar","oof"] when the operator name is "foo-bar-oof"
     */
    nativeArguments: Array<string>;
    readonly needsContext: boolean;
    readonly needsOutputBuffer: boolean;
    readonly needsTemplate: boolean;

    getSafe(functionArguments: Node): Safe;

    getTraceableCallable(line: number, source: Source): TwingCallable<T>
}

export const createCallableWrapper = <T, Factory extends Function>(
    name: string,
    callable: TwingCallable<T> | null,
    acceptedArguments: TwingCallableArgument[],
    expressionFactory: Factory,
    options: TwingCallableWrapperOptions
): TwingCallableWrapper<T, Factory> => {
    let nativeArguments: Array<string> = [];

    const callableWrapper: TwingCallableWrapper<T, Factory> = {
        get callable() {
            return callable;
        },
        get name() {
            return name;
        },
        get acceptedArguments() {
            return acceptedArguments;
        },
        get alternative() {
            return options.alternative;
        },
        get deprecatedVersion() {
            return options.deprecated;
        },
        get expressionFactory() {
            return expressionFactory;
        },
        get isDeprecated() {
            return options.deprecated ? true : false;
        },
        get isVariadic() {
            return options.is_variadic || false;
        },
        get nativeArguments() {
            return nativeArguments;
        },
        set nativeArguments(values) {
            nativeArguments = values;
        },
        get needsContext() {
            return options.needs_context || false;
        },
        get needsOutputBuffer() {
            return options.needs_output_buffer || false;
        },
        get needsTemplate() {
            return options.needs_template || false;
        },
        getSafe: (functionArgs) => {
            if (options.is_safe) {
                return options.is_safe;
            }

            if (options.is_safe_callback) {
                return options.is_safe_callback(functionArgs);
            }

            return [];
        },
        getTraceableCallable: (line, source) => {
            return (...args) => {
                return (callable!.apply(null, args) as Promise<T>) // todo: find a way to improve this
                    .catch((error: TwingRuntimeError) => {
                        if (error.line === undefined) {
                            error.line = line;
                        }

                        if (!error.source) {
                            error.source = source;
                        }

                        throw error;
                    });
            }
        }
    };

    return callableWrapper;
};
