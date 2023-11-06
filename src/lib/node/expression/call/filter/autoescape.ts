import {createFilterNode, FilterNode} from "../filter";
import {BaseNode} from "../../../../node";
import {createArrayNode} from "../../array";
import {createConstantNode} from "../../constant";

export interface AutoescapeFilterNode extends FilterNode {
}

export const createAutoescapeFilterNode = (
    operand: BaseNode,
    strategy: string | false,
    line: number,
    column: number
): AutoescapeFilterNode => {
    const baseNode = createFilterNode(operand, 'escape', createArrayNode([
        {
            key: createConstantNode('strategy', line, column),
            value: createConstantNode(strategy, line, column)
        }
    ], line, column), line, column);

    // todo: in 5.x, the argument "autoescape" was sent to true to the escape native function; is it needed?
    // @see src/lib/extension/core/filters/escape.ts
    const node: AutoescapeFilterNode = {
        ...baseNode
    };

    return node;
};
