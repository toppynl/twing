import {TwingBaseNode} from "../../../node";
import {TwingBaseCallNode, createBaseCallNode} from "../call";
import type {TwingArrayNode} from "../array";
import {TwingCompilationError} from "../../../error/compilation";

export const filterNodeType = "filter";

export interface TwingFilterNode extends TwingBaseCallNode<typeof filterNodeType> {
}

export const createFilterNode = (
    operand: TwingBaseNode,
    filterName: string,
    filterArguments: TwingArrayNode,
    line: number,
    column: number
): TwingFilterNode => {
    const baseNode = createBaseCallNode(filterNodeType, {
        type: "filter",
        operatorName: filterName
    }, {
        operand,
        arguments: filterArguments
    }, line, column);

    const node: TwingFilterNode = {
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
                filter
            );
        }
    };

    return node;
};
