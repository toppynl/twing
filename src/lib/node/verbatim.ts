import {BaseTextNode, createBaseTextNode} from "./text";

/**
 * Represents a verbatim node.
 */
export interface VerbatimNode extends BaseTextNode<"verbatim"> {
}

export const createVerbatimNode = (
    data: string,
    line: number,
    column: number,
    tag: string = null
): VerbatimNode => createBaseTextNode("verbatim", data, line, column, tag);
