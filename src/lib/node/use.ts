import {createBaseNode, type TwingBaseNode} from "../node";
import type {TwingConstantNode} from "./expression/constant";

export interface TwingUseNode extends TwingBaseNode<"use", {}, {
    template: TwingConstantNode;
    targets: TwingBaseNode<null, {}, Record<string, TwingBaseNode<null, {
        alias: string | null;
    }, {
        block: TwingBaseNode
    }>>>;
}> {

}

export const createUseNode = (
    template: TwingUseNode["children"]["template"],
    targets: TwingUseNode["children"]["targets"],
    line: number,
    column: number,
    tag: string
) => {
    return createBaseNode("use", {}, {
        template,
        targets
    }, line, column, tag);
};
