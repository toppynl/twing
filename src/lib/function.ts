import {createFunctionNode, FunctionNode} from "./node/expression/call/function";
import {
    TwingCallableWrapperOptions,
    TwingCallableWrapper,
    TwingCallableArgument,
    TwingCallable
} from "./callable-wrapper";
import type {ArgumentsNode} from "./node/expression/arguments";

type Factory = (name: string, argumentsNode: ArgumentsNode, line: number, column: number) => FunctionNode;

export class TwingFunction extends TwingCallableWrapper<any, Factory> {
    readonly options: TwingCallableWrapperOptions<Factory>;

    /**
     * Creates a template function.
     *
     * @param {string} name Name of this function
     * @param {TwingCallable<any>} callable A callable implementing the function. If null, you need to overwrite the "expression_factory" option to customize compilation.
     * @param {TwingCallableArgument[]} acceptedArguments
     * @param {TwingCallableWrapperOptions} options Options
     */
    constructor(name: string, callable: TwingCallable<any>, acceptedArguments: TwingCallableArgument[], options: TwingCallableWrapperOptions<Factory> = {}) {
        super (name, callable, acceptedArguments);

        this.options.expression_factory = (name, argumentsNode, line, column) => {
            return createFunctionNode(name, argumentsNode, line, column);
        };

        this.options = Object.assign({}, this.options, options);
    }
}
