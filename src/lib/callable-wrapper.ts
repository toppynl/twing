import type {TwingExecutionContext} from "./execution-context";

export type TwingCallable<A extends Array<any> = any, R = any> = (executionContext: TwingExecutionContext, ...args: A) => Promise<R>;

export type TwingCallableArgument = {
    name: string;
    defaultValue?: any;
};

export type TwingCallableWrapperOptions = {
    is_variadic?: boolean;
    deprecated?: boolean | string;
    alternative?: string;
}

export interface TwingCallableWrapper {
    readonly acceptedArguments: Array<TwingCallableArgument>;
    readonly alternative: string | undefined;
    readonly callable: TwingCallable;
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
}

export const createCallableWrapper = (
    name: string,
    callable: TwingCallable,
    acceptedArguments: Array<TwingCallableArgument>,
    options: TwingCallableWrapperOptions
): TwingCallableWrapper => {
    let nativeArguments: Array<string> = [];

    const callableWrapper: TwingCallableWrapper = {
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
        }
    };

    return callableWrapper;
};
