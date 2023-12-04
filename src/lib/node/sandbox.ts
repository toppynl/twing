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
    const baseNode = createBaseNode("sandbox", {}, {
        body
    }, line, column, tag);

    return {
        ...baseNode,
        execute: (executionContext) => {
            const {body} = baseNode.children;

            return body.execute({
                ...executionContext,
                sandboxed: true
            });
        }
    };
};
