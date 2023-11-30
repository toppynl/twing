import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode, TwingNode} from "../node";

export const sandboxNodeType = "sandbox";

export interface TwingSandboxNode extends TwingBaseNode<typeof sandboxNodeType, TwingBaseNodeAttributes, {
    body: TwingNode;
}> {
}

export const createSandboxNode = (
    body: TwingNode,
    line: number,
    column: number,
    tag: string
): TwingSandboxNode => {
    const baseNode = createBaseNode(sandboxNodeType, {}, {
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
