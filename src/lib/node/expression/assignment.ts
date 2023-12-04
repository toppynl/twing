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
    const baseNode = createBaseNode("assignment", {
        name
    }, {}, line, column);
    
    const assignmentNode: TwingAssignmentNode = {
        ...baseNode,
        execute: () => {
            return Promise.resolve(assignmentNode.attributes.name);
        }
    };
    
    return assignmentNode;
};
