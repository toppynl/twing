import {ExpressionNode} from "./node/expression";
import {
    TwingCallable,
    TwingCallableArgument,
    TwingCallableWrapper,
    TwingCallableWrapperOptions
} from "./callable-wrapper";
import {createTestNode, TestNode} from "./node/expression/call/test";
import type {ArgumentsNode} from "./node/expression/arguments";

type Factory = (node: ExpressionNode, name: string, argumentsNode: ArgumentsNode, line: number, column: number) => TestNode;

export class TwingTest extends TwingCallableWrapper<boolean, Factory> {
    readonly options: TwingCallableWrapperOptions<Factory>;

    /**
     * Creates a template test.
     *
     * @param {string} name Name of this test
     * @param {TwingCallable<boolean>} callable A callable implementing the test. If null, you need to overwrite the "node_class" option to customize compilation.
     * @param {TwingCallableArgument[]} acceptedArguments
     * @param {TwingCallableWrapperOptions} options Options
     */
    constructor(name: string, callable: TwingCallable<boolean>, acceptedArguments: TwingCallableArgument[], options: TwingCallableWrapperOptions<Factory> = {}) {
        super(name, callable, acceptedArguments);

        this.options.expression_factory = (node, name, argumentsNode, line, column) => {
            return createTestNode(node, name, argumentsNode, line, column);
        };

        this.options = Object.assign({}, this.options, options);
    }
}
