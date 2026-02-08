import type {TwingBaseExpressionNodeAttributes} from "../expression";
import {createBaseNode, TwingBaseNode} from "../../node";

export type TwingNameNodeAttributes = TwingBaseExpressionNodeAttributes & {
    name: string;
    isAlwaysDefined: boolean;
    shouldIgnoreStrictCheck: boolean;
    shouldTestExistence: boolean;
};

export interface TwingNameNode extends TwingBaseNode<"name", TwingNameNodeAttributes> {
}

export const createNameNode = (
    name: string,
    line: number,
    column: number
): TwingNameNode => {
    const attributes: TwingNameNode["attributes"] = {
        name,
        isAlwaysDefined: false,
        shouldIgnoreStrictCheck: false,
        shouldTestExistence: false
    };

    return createBaseNode("name", attributes, {}, line, column);
};

export const cloneNameNode = (
    nameNode: TwingNameNode
): TwingNameNode => {
    return createNameNode(
        nameNode.attributes.name,
        nameNode.line,
        nameNode.column
    );
};
