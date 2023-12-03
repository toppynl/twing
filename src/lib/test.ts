import {
    TwingCallableWrapper, createCallableWrapper,
    TwingCallable,
    TwingCallableArgument,
    TwingCallableWrapperOptions
} from "./callable-wrapper";

export interface TwingTest extends TwingCallableWrapper {

}

/**
 * Creates a template test.
 *
 * @param {string} name Name of the test
 * @param {TwingCallable<boolean>} callable A callable implementing the test. If null, you need to overwrite the "node_class" option to customize compilation.
 * @param {TwingCallableArgument[]} acceptedArguments
 * @param {TwingCallableWrapperOptions} options Options
 */
export const createTest = <Callable extends TwingCallable<any, boolean>>(
    name: string,
    callable: Callable,
    acceptedArguments: TwingCallableArgument[],
    options: TwingCallableWrapperOptions = {}
): TwingTest => {
    return createCallableWrapper(name, callable, acceptedArguments, options);
};
