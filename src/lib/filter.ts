import {
    TwingCallableWrapperOptions,
    TwingCallableArgument,
    TwingCallable, TwingCallableWrapper, createCallableWrapper
} from "./callable-wrapper";

export type TwingFilterOptions = TwingCallableWrapperOptions;

export interface TwingFilter extends TwingCallableWrapper<TwingCallable> {
    
}

export const createFilter = <Callable extends TwingCallable>(
    name: string,
    callable: Callable,
    acceptedArguments: TwingCallableArgument[],
    options: TwingFilterOptions = {}
): TwingFilter => {
    const callableWrapper = createCallableWrapper(name, callable, acceptedArguments, options);

    const filter: TwingFilter = {
        ...callableWrapper
    };

    return filter;
};
