import {BaseCallNode, createBaseCallNode} from "../call";
import type {ArrayNode} from "../array";
import {TwingCompilationError} from "../../../error/compilation";

export interface FunctionNode extends BaseCallNode {
}

export const createFunctionNode = (
    functionName: string,
    functionArguments: ArrayNode,
    line: number,
    column: number
): FunctionNode => {
    const baseNode = createBaseCallNode({
        type: "function",
        operatorName: functionName
    }, {
        arguments: functionArguments
    }, line, column);

    const node: FunctionNode = {
        ...baseNode,
        compile: (compiler) => {
            let name = baseNode.attributes.operatorName;
            let twingFunction = compiler.environment.getFunction(name);

            if (twingFunction === null) {
                throw new TwingCompilationError(`Unknown function "${name}".`, baseNode.line);
            }
            
            baseNode.compileCallable(
                compiler,
                name,
                "function",
                twingFunction.nativeArguments,
                twingFunction.acceptedArguments,
                twingFunction.needsTemplate,
                twingFunction.needsContext,
                twingFunction.needsOutputBuffer,
                twingFunction.isVariadic
            );
        }
    };

    return node;
};
