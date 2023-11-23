import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {parseRegularExpression} from "../../../helpers/parse-regular-expression";

export interface TwingMatchesNode extends TwingBaseBinaryNode<"matches"> {
}

export const createMatchesNode = createBinaryNodeFactory<TwingMatchesNode>("matches", {
    execute: async (node, ...args) => {
        return parseRegularExpression(
            await node.children.right.execute(...args)
        ).test(
            await node.children.left.execute(...args)
        );
    }
});
