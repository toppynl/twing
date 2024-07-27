import {
    TwingCallableWrapperOptions,
    TwingCallableArgument,
    TwingCallable,
    TwingCallableWrapper,
    createCallableWrapper,
    TwingSynchronousCallableWrapper,
    createSynchronousCallableWrapper, TwingSynchronousCallable
} from "./callable-wrapper";

export type TwingFilterOptions = TwingCallableWrapperOptions;

export interface TwingFilter extends TwingCallableWrapper {
    
}

export interface TwingSynchronousFilter extends TwingSynchronousCallableWrapper {

}

export const createFilter = (
    name: string,
    callable: TwingCallable,
    acceptedArguments: TwingCallableArgument[],
    options: TwingFilterOptions = {}
): TwingFilter => {
    const callableWrapper = createCallableWrapper(name, callable, acceptedArguments, options);

    const filter: TwingFilter = {
        ...callableWrapper
    };

    return filter;
};

export const createSynchronousFilter = (
    name: string,
    callable: TwingSynchronousCallable,
    acceptedArguments: TwingCallableArgument[],
    options: TwingFilterOptions = {}
): TwingSynchronousFilter => {
    const callableWrapper = createSynchronousCallableWrapper(name, callable, acceptedArguments, options);

    const filter: TwingSynchronousFilter = {
        ...callableWrapper
    };

    return filter;
};
