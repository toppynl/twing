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
    }, (compiler) => {
        compiler.write("outputBuffer.getAndClean().replace(/>\\s+</g, '><').trim()")
    }, line, column, tag);

    const spacelessNode: TwingSpacelessNode = {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .addSourceMapEnter(spacelessNode)
                .write("outputBuffer.start();\n")
                .subCompile(baseNode.children.body)
            ;
            
            baseNode
                .compile(compiler);
            
            compiler
                .write(';\n')
                .addSourceMapLeave()
            ;
        }
    };

    return spacelessNode;
};
