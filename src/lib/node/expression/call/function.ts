import {TwingBaseCallNode, createBaseCallNode} from "../call";
import type {TwingArrayNode} from "../array";
import {TwingCompilationError} from "../../../error/compilation";

export const functionNodeType = "function";

export interface TwingFunctionNode extends TwingBaseCallNode<typeof functionNodeType> {
}

export const createFunctionNode = (
    functionName: string,
    functionArguments: TwingArrayNode,
    line: number,
    column: number
): TwingFunctionNode => {
    const baseNode = createBaseCallNode(functionNodeType, {
        type: "function",
        operatorName: functionName
    }, {
        arguments: functionArguments
    }, line, column);

    const node: TwingFunctionNode = {
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
                twingFunction
            );
        }
    };

    return node;
};
