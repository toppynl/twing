import {
    TwingCallableWrapperOptions,
    TwingCallableArgument,
    TwingCallable, TwingCallableWrapper, createCallableWrapper
} from "./callable-wrapper";

export type TwingFilterOptions = TwingCallableWrapperOptions & {
    pre_escape?: string | null;
    preserves_safety?: Array<string> | null;
};

export interface TwingFilter extends TwingCallableWrapper<TwingCallable> {
    readonly preEscape: string | null;
    readonly preservesSafety: Array<string>;
}

export const createFilter = <Callable extends TwingCallable>(
    name: string,
    callable: Callable,
    acceptedArguments: TwingCallableArgument[],
    options: TwingFilterOptions = {}
): TwingFilter => {
    const callableWrapper = createCallableWrapper(name, callable, acceptedArguments, options);

    const filter: TwingFilter = {
        ...callableWrapper,
        get preservesSafety() {
            return options.preserves_safety || [];
        },
        get preEscape() {
            return options.pre_escape || null;
        }
    };

    return filter;
};
