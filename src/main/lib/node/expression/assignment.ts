import {createBaseNode, TwingBaseNode} from "../../node";
import {TwingBaseExpressionNodeAttributes} from "../expression";

export type TwingAssignmentNodeAttributes = TwingBaseExpressionNodeAttributes & {
    name: string;
};

export interface TwingAssignmentNode extends TwingBaseNode<"assignment", TwingAssignmentNodeAttributes> {
}

// todo: probably a useless node
export const createAssignmentNode = (
    name: string,
    line: number,
    column: number
): TwingAssignmentNode => {
    return createBaseNode("assignment", {
        name
    }, {}, line, column);
};
