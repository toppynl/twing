import {
    TwingCallableWrapperOptions,
    TwingCallableArgument,
    TwingCallable,
    TwingCallableWrapper,
    createCallableWrapper,
    TwingSynchronousCallableWrapper,
    TwingSynchronousCallable, createSynchronousCallableWrapper
} from "./callable-wrapper";

export interface TwingFunction extends TwingCallableWrapper {
    
}

export interface TwingSynchronousFunction extends TwingSynchronousCallableWrapper {

}

export const createFunction = (
    name: string, 
    callable: TwingCallable, 
    acceptedArguments: TwingCallableArgument[], 
    options: TwingCallableWrapperOptions = {}
): TwingFunction => {
    const callableWrapper = createCallableWrapper(name, callable, acceptedArguments, options);
    
    return callableWrapper;
};

export const createSynchronousFunction = (
    name: string,
    callable: TwingSynchronousCallable,
    acceptedArguments: TwingCallableArgument[],
    options: TwingCallableWrapperOptions = {}
): TwingSynchronousFunction => {
    const callableWrapper = createSynchronousCallableWrapper(name, callable, acceptedArguments, options);

    return callableWrapper;
};
