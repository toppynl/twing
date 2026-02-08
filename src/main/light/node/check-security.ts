import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode, TwingNode} from "../node";

export type TwingCheckSecurityNodeAttributes = TwingBaseNodeAttributes & {
    usedFilters: Map<string, TwingNode>;
    usedTags: Map<string, TwingNode>;
    usedFunctions: Map<string, TwingNode>;
};

export interface TwingCheckSecurityNode extends TwingBaseNode<"check_security", TwingCheckSecurityNodeAttributes> {
}

export const createCheckSecurityNode = (
    usedFilters: Map<string, TwingNode>,
    usedTags: Map<string, TwingNode>,
    usedFunctions: Map<string, TwingNode>,
    line: number,
    column: number
): TwingCheckSecurityNode => {
    return createBaseNode("check_security", {
        usedFilters,
        usedTags,
        usedFunctions
    }, {}, line, column);
};
