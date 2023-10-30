import {BaseCallNode, createBaseCallNode} from "../call";
import {TwingErrorSyntax} from "../../../error/syntax";
import type {ArgumentsNode} from "../arguments";

export interface FunctionNode extends BaseCallNode {
}

export const createFunctionNode = (
    functionName: string,
    functionArguments: ArgumentsNode,
    line: number,
    column: number,
    tag: string | null = null
): FunctionNode => {
    const baseNode = createBaseCallNode({
        type: "function",
        is_defined_test: false,
        operatorName: functionName
    }, {
        arguments: functionArguments
    }, line, column, tag);

    const node: FunctionNode = {
        ...baseNode,
        compile: (compiler) => {
            let name = baseNode.attributes.operatorName;
            let twingFunction = compiler.environment.getFunction(name);

            if (twingFunction === null) {
                throw new TwingErrorSyntax(`Unknown function "${name}".`, baseNode.line);
            }

            let callable = twingFunction.getCallable();

            baseNode.compileCallable(
                compiler,
                name,
                "function",
                callable,
                twingFunction.getArguments(),
                twingFunction.getAcceptedArgments(),
                twingFunction.needsTemplate(),
                twingFunction.needsContext(),
                twingFunction.needsOutputBuffer(),
                twingFunction.isVariadic()
            );
        }
    };

    return node;
};
