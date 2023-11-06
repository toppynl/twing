import type {BaseNode, BaseNodeAttributes} from "../node";
import {createBaseNode} from "../node";
import type {ConstantNode} from "./expression/constant";
import {BaseExpressionNode} from "./expression";

export const traitNodeType = "trait";

export interface TraitNode extends BaseNode<typeof traitNodeType, BaseNodeAttributes, {
    template: ConstantNode;
    targets: BaseExpressionNode<string, {}, Record<string, ConstantNode>>;
}> {
}

export const createTraitNode = (
    template: TraitNode["children"]["template"],
    targets: TraitNode["children"]["targets"],
    line: number,
    column: number
): TraitNode => {
    return {
        ...createBaseNode(traitNodeType, {}, {
            template,
            targets
        }, line, column)
    };
};
