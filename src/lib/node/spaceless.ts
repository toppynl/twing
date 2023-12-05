import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";

export interface TwingSpacelessNode extends TwingBaseNode<"spaceless", TwingBaseNodeAttributes, {
    body: TwingBaseNode;
}> {
}

export const createSpacelessNode = (
    body: TwingBaseNode,
    line: number,
    column: number,
    tag: string
): TwingSpacelessNode => {
    const baseNode = createBaseNode("spaceless", {}, {
        body
    }, line, column, tag);

    const spacelessNode: TwingSpacelessNode = {
        ...baseNode,
        execute: (executionContext) => {
            const {outputBuffer} = executionContext;

            outputBuffer.start();

            return spacelessNode.children.body.execute(executionContext)
                .then(() => {
                    const content = outputBuffer.getAndClean().replace(/>\s+</g, '><').trim();

                    outputBuffer.echo(content);
                });
        }
    };

    return spacelessNode;
};
