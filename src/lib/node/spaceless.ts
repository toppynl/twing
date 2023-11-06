import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";

export const spacelessNodeType = "spaceless";

export interface SpacelessNode extends BaseNode<typeof spacelessNodeType, BaseNodeAttributes, {
    body: BaseNode;
}> {
}

export const createSpacelessNode = (
    body: BaseNode,
    line: number,
    column: number,
    tag: string
): SpacelessNode => {
    const baseNode = createBaseNode(spacelessNodeType, {}, {
        body
    }, line, column, tag);

    const spacelessNode: SpacelessNode = {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .addSourceMapEnter(spacelessNode)
                .write("outputBuffer.start();\n")
                .subCompile(baseNode.children.body)
                .write("outputBuffer.echo(outputBuffer.getAndClean().replace(/>\\s+</g, '><').trim());\n")
                .addSourceMapLeave()
            ;
        },
        isAnOutputNode: true
    };

    return spacelessNode;
};
