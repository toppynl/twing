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
        execute: (...args) => {
            const [template] = args;
            const {environment} = template;
            const {body} = baseNode.children;

            const alreadySandboxed = environment.isSandboxed;
            
            if (!alreadySandboxed) {
                environment.isSandboxed = true;
            }
            
            return body.execute(...args)
                .finally(() => {
                    if (!alreadySandboxed) {
                        environment.isSandboxed = false;
                    }
                });
        }
    };
};
