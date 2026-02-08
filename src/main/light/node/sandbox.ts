import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";

export interface TwingSandboxNode extends TwingBaseNode<"sandbox", TwingBaseNodeAttributes, {
    body: TwingBaseNode;
}> {
}

export const createSandboxNode = (
    body: TwingBaseNode,
    line: number,
    column: number,
    tag: string
): TwingSandboxNode => {
    return createBaseNode("sandbox", {}, {
        body
    }, line, column, tag);
};
