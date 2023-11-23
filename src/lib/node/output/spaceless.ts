import {TwingBaseNode, TwingBaseNodeAttributes} from "../../node";
import {TwingBaseOutputNode, createBaseOutputNode} from "../output";

export const spacelessNodeType = "spaceless";

export interface TwingSpacelessNode extends TwingBaseOutputNode<typeof spacelessNodeType, TwingBaseNodeAttributes, {
    body: TwingBaseNode;
}> {
}

export const createSpacelessNode = (
    body: TwingBaseNode,
    line: number,
    column: number,
    tag: string
): TwingSpacelessNode => {
    const baseNode = createBaseOutputNode(spacelessNodeType, {}, {
        body
    }, line, column, tag);

    const spacelessNode: TwingSpacelessNode = {
        ...baseNode,
        execute: (...args) => {
            const [, , outputBuffer] = args;

            outputBuffer.start();

            return spacelessNode.children.body.execute(...args)
                .then(() => {
                    const content = outputBuffer.getAndClean().replace(/>\s+</g, '><').trim();

                    outputBuffer.echo(content);
                });
        }
    };

    return spacelessNode;
};
