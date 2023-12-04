import {TwingBaseTextNode, createBaseTextNode} from "./text";

/**
 * Represents a verbatim node.
 */
export interface TwingVerbatimNode extends TwingBaseTextNode<"verbatim"> {
}

export const createVerbatimNode = (
    data: string,
    line: number,
    column: number,
    tag: string
): TwingVerbatimNode => createBaseTextNode("verbatim", data, line, column, tag);
