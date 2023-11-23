import {createBaseNode, TwingBaseNode} from "../../node";
import {TwingBaseExpressionNodeAttributes} from "../expression";

export const assignmentNodeType = "assign_name";

export type TwingAssignmentNodeAttributes = TwingBaseExpressionNodeAttributes & {
    name: string;
};

export interface TwingAssignmentNode extends TwingBaseNode<typeof assignmentNodeType, TwingAssignmentNodeAttributes> {
}

export const createAssignmentNode = (
    name: string,
    line: number,
    column: number
): TwingAssignmentNode => {
    const baseNode = createBaseNode(assignmentNodeType, {
        name
    }, {}, line, column);
    
    const node: TwingAssignmentNode = {
        ...baseNode,
        execute: () => {
            return Promise.resolve(node.attributes.name);
        }
    };
    
    return node;
};
