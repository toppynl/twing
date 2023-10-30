import {BaseCallNode, createBaseCallNode} from "../call";
import type {BaseNode} from "../../../node";
import {TwingErrorSyntax} from "../../../error/syntax";
import type {ArgumentsNode} from "../arguments";

export interface TestNode extends BaseCallNode<BaseNode<any>> {
}

export const createTestNode = (
    operand: BaseNode<any>,
    testName: string,
    testArguments: ArgumentsNode,
    line: number,
    column: number,
    tag: string | null = null
): TestNode => {
    const callType = 'test';

    const baseNode = createBaseCallNode({
        type: callType,
        is_defined_test: false,
        operatorName: testName,
    }, {
        operand,
        arguments: testArguments
    }, line, column, tag);

    const node: TestNode = {
        ...baseNode,
        compile: (compiler) => {
            const name = node.attributes.operatorName;
            const twingTest = compiler.environment.getTest(name);

            if (twingTest === null) {
                throw new TwingErrorSyntax(`Unknown test "${name}".`, node.line);
            }

            let callable = twingTest.getCallable();

            baseNode.compileCallable(
                compiler,
                name,
                callType,
                callable,
                twingTest.getArguments(),
                twingTest.getAcceptedArgments(),
                twingTest.needsTemplate(),
                twingTest.needsContext(),
                twingTest.needsOutputBuffer(),
                twingTest.isVariadic()
            );
        }
    };

    return node;
};
