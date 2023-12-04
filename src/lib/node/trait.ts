import type {TwingBaseNode, TwingBaseNodeAttributes} from "../node";
import {createBaseNode} from "../node";
import type {TwingConstantNode} from "./expression/constant";
import {TwingBaseExpressionNode} from "./expression";

export const traitNodeType = "trait";

export interface TwingTraitNode extends TwingBaseNode<typeof traitNodeType, TwingBaseNodeAttributes, {
    template: TwingConstantNode;
    targets: TwingBaseExpressionNode<string, {}, Record<string, TwingConstantNode<string>>>;
}> {
}

export const createTraitNode = (
    template: TwingTraitNode["children"]["template"],
    targets: TwingTraitNode["children"]["targets"],
    line: number,
    column: number
): TwingTraitNode => {
    return {
        ...createBaseNode(traitNodeType, {}, {
            template,
            targets
        }, line, column)
    };
};
