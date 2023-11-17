import {
    TwingCallableWrapperOptions,
    TwingCallableArgument,
    TwingCallable, TwingCallableWrapper, createCallableWrapper
} from "./callable-wrapper";

export interface TwingFunction extends TwingCallableWrapper<TwingCallable> {
    
}

export const createFunction = <Callable extends TwingCallable>(
    name: string, 
    callable: Callable, 
    acceptedArguments: TwingCallableArgument[], 
    options: TwingCallableWrapperOptions = {}
): TwingFunction => {
    const callableWrapper = createCallableWrapper(name, callable, acceptedArguments, options);
    
    return callableWrapper;
};
