import {createFilterNode, FilterNode} from "./node/expression/call/filter";
import type {Node} from "./node";
import {
    TwingCallableWrapperOptions,
    TwingCallableWrapper,
    TwingCallableArgument,
    TwingCallable
} from "./callable-wrapper";
import type {ArgumentsNode} from "./node/expression/arguments";

type Factory = (node: Node, filterName: string, argumentsNode: ArgumentsNode, line: number, column: number, tag?: string | null) => FilterNode;

export type TwingFilterOptions = TwingCallableWrapperOptions<Factory> & {
    pre_escape?: string,
    preserves_safety?: Array<string>
}

export class TwingFilter extends TwingCallableWrapper<any, Factory> {
    readonly options: TwingFilterOptions;

    constructor(name: string, callable: TwingCallable<any>, acceptedArguments: TwingCallableArgument[], options: TwingFilterOptions = {}) {
        super(name, callable, acceptedArguments);

        this.options.pre_escape = null;
        this.options.preserves_safety = null;
        this.options.expression_factory = (node, filterName, argumentsNode, line, column, tag = null) => {
            return createFilterNode(node, filterName, argumentsNode , line, column, tag);
        };

        this.options = Object.assign({}, this.options, options);
    }

    getPreservesSafety() {
        return this.options.preserves_safety;
    }

    getPreEscape() {
        return this.options.pre_escape;
    }
}
