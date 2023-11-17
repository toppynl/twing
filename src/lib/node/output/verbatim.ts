import {BaseTextNode, createBaseTextNode} from "./text";

export const verbatimNodeType = "verbatim";

/**
 * Represents a verbatim node.
 */
export interface TwingVerbatimNode extends BaseTextNode<typeof verbatimNodeType> {
}

export const createVerbatimNode = (
    data: string,
    line: number,
    column: number,
    tag: string
): TwingVerbatimNode => createBaseTextNode(verbatimNodeType, data, line, column, tag);
