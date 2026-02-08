import type {TwingBaseNode, TwingBaseNodeAttributes} from "../node";
import {createBaseNode} from "../node";
import type {TwingConstantNode} from "./expression/constant";

export interface TwingTraitNode extends TwingBaseNode<"trait", TwingBaseNodeAttributes, {
    template: TwingConstantNode;
    targets: TwingBaseNode;
}> {
}

export const createTraitNode = (
    template: TwingTraitNode["children"]["template"],
    targets: TwingTraitNode["children"]["targets"],
    line: number,
    column: number
): TwingTraitNode => {
    return {
        ...createBaseNode("trait", {}, {
            template,
            targets
        }, line, column)
    };
};
