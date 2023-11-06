import {BaseCallNode, createBaseCallNode} from "../call";
import type {BaseNode} from "../../../node";
import type {ArrayNode} from "../array";
import {TwingCompilationError} from "../../../error/compilation";

export interface TestNode extends BaseCallNode {
}

export const createTestNode = (
    operand: BaseNode,
    testName: string,
    testArguments: ArrayNode,
    line: number,
    column: number
): TestNode => {
    const callType = 'test';

    const baseNode = createBaseCallNode({
        type: callType,
        operatorName: testName,
    }, {
        operand,
        arguments: testArguments
    }, line, column);

    const node: TestNode = {
        ...baseNode,
        compile: (compiler) => {
            const name = node.attributes.operatorName;
            const test = compiler.environment.getTest(name);
            
            if (test === null) {
                throw new TwingCompilationError(`Unknown test "${name}".`, node.line);
            }
            
            baseNode.compileCallable(
                compiler,
                name,
                callType,
                test.nativeArguments,
                test.acceptedArguments,
                test.needsTemplate,
                test.needsContext,
                test.needsOutputBuffer,
                test.isVariadic
            );
        }
    };

    return node;
};
