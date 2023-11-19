import type {TwingSource} from "./source";
import type {TwingRuntimeError} from "./error/runtime";
import type {TwingArrayNode} from "./node/expression/array";
import {Safe} from "./node-visitor/escaper";

export type TwingCallable<R = any> = (...args: any[]) => Promise<R>;

export type TwingCallableArgument = {
    name: string;
    defaultValue?: any;
};

export type TwingCallableWrapperOptions = {
    needs_template?: boolean;
    needs_context?: boolean;
    needs_output_buffer?: boolean;
    needs_source_map_runtime?: boolean;
    is_variadic?: boolean;
    is_safe?: Array<any>;
    is_safe_callback?: (argumentsNode: TwingArrayNode) => Safe;
    deprecated?: boolean | string;
    alternative?: string;
}

export interface TwingCallableWrapper<Callable extends TwingCallable> {
    readonly acceptedArguments: Array<TwingCallableArgument>;
    readonly alternative: string | undefined;
    readonly callable: Callable;
    readonly deprecatedVersion: string | boolean | undefined;
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
    readonly needsSourceMapRuntime: boolean;
    readonly needsTemplate: boolean;

    getSafe(argumentsNode: TwingArrayNode): Safe;

    getTraceableCallable(line: number, source: TwingSource): Callable;
}

export const createCallableWrapper = <Callable extends TwingCallable>(
    name: string,
    callable: Callable,
    acceptedArguments: Array<TwingCallableArgument>,
    options: TwingCallableWrapperOptions
): TwingCallableWrapper<Callable> => {
    let nativeArguments: Array<string> = [];

    const callableWrapper: TwingCallableWrapper<Callable> = {
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
        get needsSourceMapRuntime() {
            return options.needs_source_map_runtime || false;
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
            return ((...args) => {
                return callable(...args)
                    .catch((error: TwingRuntimeError) => {
                        if (error.line === undefined) {
                            error.line = line;
                        }

                        if (!error.source) {
                            error.source = source;
                        }

                        throw error;
                    });
            }) as typeof callable;
        }
    };

    return callableWrapper;
};
