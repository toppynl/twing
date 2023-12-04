import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";
import {parseRegularExpression} from "../../../helpers/parse-regular-expression";

export interface TwingMatchesNode extends TwingBaseBinaryNode<"matches"> {
}

export const createMatchesNode = createBinaryNodeFactory<TwingMatchesNode>("matches", {
    execute: async (left, right, executionContext) => {
        return parseRegularExpression(
            await right.execute(executionContext)
        ).test(
            await left.execute(executionContext)
        );
    }
});
