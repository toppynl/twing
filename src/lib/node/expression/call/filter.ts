import {BaseNode} from "../../../node";
import {BaseCallNode, createBaseCallNode} from "../call";
import type {ArrayNode} from "../array";
import {TwingCompilationError} from "../../../error/compilation";

export interface FilterNode extends BaseCallNode {
}

export const createFilterNode = (
    operand: BaseNode,
    filterName: string,
    filterArguments: ArrayNode,
    line: number,
    column: number
): FilterNode => {
    const baseNode = createBaseCallNode({
        type: "filter",
        operatorName: filterName
    }, {
        operand,
        arguments: filterArguments
    }, line, column);

    const node: FilterNode = {
        ...baseNode,
        compile: (compiler) => {
            const name = node.attributes.operatorName;
            const filter = compiler.environment.getFilter(name);

            if (filter === null) {
                throw new TwingCompilationError(`Unknown filter "${name}".`, node.line);
            }
            
            baseNode.compileCallable(
                compiler,
                name,
                'filter',
                filter.nativeArguments,
                filter.acceptedArguments,
                filter.needsTemplate,
                filter.needsContext,
                filter.needsOutputBuffer,
                filter.isVariadic
            );
        }
    };

    return node;
};
