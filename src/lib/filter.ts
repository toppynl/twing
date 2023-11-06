import {createFilterNode, FilterNode} from "./node/expression/call/filter";
import type {Node} from "./node";
import {
    TwingCallableWrapperOptions,
    TwingCallableArgument,
    TwingCallable, TwingCallableWrapper, createCallableWrapper
} from "./callable-wrapper";
import type {ArrayNode} from "./node/expression/array";

type Factory = (node: Node, filterName: string, argumentsNode: ArrayNode, line: number, column: number, tag?: string | null) => FilterNode;

export type TwingFilterOptions = TwingCallableWrapperOptions & {
    pre_escape?: string | null;
    preserves_safety?: Array<string> | null;
    expression_factory?: Factory;
};

export interface TwingFilter extends TwingCallableWrapper<any, Factory> {
    readonly preEscape: string | null;
    readonly preservesSafety: Array<string>;
}

export const createFilter = (
    name: string,
    callable: TwingCallable<any>,
    acceptedArguments: TwingCallableArgument[],
    options: TwingFilterOptions = {}
): TwingFilter => {
    const expressionFactory = options.expression_factory || ((node, filterName, argumentsNode, line, column) => {
        return createFilterNode(node, filterName, argumentsNode, line, column);
    });

    const callableWrapper = createCallableWrapper(name, callable, acceptedArguments, expressionFactory, options);

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
