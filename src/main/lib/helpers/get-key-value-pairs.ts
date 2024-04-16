import type {TwingBaseArrayNode} from "../node/expression/array";
import {TwingConstantNode} from "../node/expression/constant";
import {TwingBaseExpressionNode} from "../node/expression";

const array_chunk = require('locutus/php/array/array_chunk');

export const getKeyValuePairs = (
    node: TwingBaseArrayNode<any>
): Array<{
    key: TwingConstantNode,
    value: TwingBaseExpressionNode
}> => {
    const chunks: Array<[key: TwingConstantNode, value: TwingBaseExpressionNode]> = array_chunk(Object.values(node.children), 2);

    return chunks.map(([key, value]) => {
        return {key, value};
    });
};
