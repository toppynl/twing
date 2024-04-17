import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode, createNode} from "../node";
import type {TwingAssignmentNode} from "./expression/assignment";
import {createForLoopNode} from "./for-loop";
import {createIfNode} from "./if";
import type {TwingBaseExpressionNode} from "./expression";

export type TwingForNodeAttributes = TwingBaseNodeAttributes & {
    hasAnIf: boolean;
};

export type TwingForNodeChildren = {
    keyTarget: TwingAssignmentNode;
    valueTarget: TwingAssignmentNode;
    sequence: TwingBaseExpressionNode;
    body: TwingBaseNode;
    else?: TwingBaseNode;
};

export interface TwingForNode extends TwingBaseNode<"for", TwingForNodeAttributes, TwingForNodeChildren> {
}

export const createForNode = (
    keyTarget: TwingAssignmentNode,
    valueTarget: TwingAssignmentNode,
    sequence: TwingBaseExpressionNode,
    ifExpression: TwingBaseExpressionNode | null,
    body: TwingBaseNode,
    elseNode: TwingBaseNode | null,
    line: number,
    column: number,
    tag: string
): TwingForNode => {
    const loop = createForLoopNode(line, column, tag);
    const bodyChildren: Record<number, TwingBaseNode> = {};

    let i: number = 0;

    bodyChildren[i++] = body;
    bodyChildren[i++] = loop;

    let actualBody: TwingBaseNode = createNode(bodyChildren, line, column);

    if (ifExpression) {
        const ifChildren: Record<number, TwingBaseNode> = {};

        let i: number = 0;

        ifChildren[i++] = ifExpression;
        ifChildren[i++] = actualBody;

        actualBody = createIfNode(createNode(ifChildren, line, column), null, line, column);

        loop.attributes.hasAnIf = true;
    }

    const children: TwingForNodeChildren = {
        keyTarget: keyTarget,
        valueTarget: valueTarget,
        sequence: sequence,
        body: actualBody
    };

    if (elseNode) {
        children.else = elseNode;

        loop.attributes.hasAnElse = true;
    }

    return createBaseNode("for", {
        hasAnIf: ifExpression !== null
    }, children, line, column, tag);
};
