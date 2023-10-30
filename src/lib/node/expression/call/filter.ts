import {BaseNode} from "../../../node";
import {BaseCallNode, createBaseCallNode} from "../call";
import {TwingErrorSyntax} from "../../../error/syntax";
import type {ArgumentsNode} from "../arguments";

export interface FilterNode extends BaseCallNode<BaseNode<any>> {
}

export const createFilterNode = (
    operand: BaseNode<any>,
    filterName: string,
    filterArguments: ArgumentsNode,
    line: number,
    column: number,
    tag: string = null
): FilterNode => {
    const baseNode = createBaseCallNode({
        type: "filter",
        is_defined_test: false,
        operatorName: filterName
    }, {
        operand,
        arguments: filterArguments
    }, line, column, tag);

    const node: FilterNode = {
        ...baseNode,
        compile: (compiler) => {
            let name = baseNode.attributes.operatorName;
            let filter = compiler.environment.getFilter(name);

            if (filter === null) {
                throw new TwingErrorSyntax(`Unknown filter "${name}".`, baseNode.line);
            }

            let callable = filter.getCallable();

            baseNode.compileCallable(
                compiler,
                name,
                'filter',
                callable,
                filter.getArguments(),
                filter.getAcceptedArgments(),
                filter.needsTemplate(),
                filter.needsContext(),
                filter.needsOutputBuffer(),
                filter.isVariadic()
            );
        }
    };

    return node;
};
