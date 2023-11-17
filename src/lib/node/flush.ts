import {TwingBaseNode, createBaseNode} from "../node";

export interface TwingFlushNode extends TwingBaseNode<"flush"> {
}

export const createFlushNode = (
    line: number,
    column: number,
    tag?: string
): TwingFlushNode => {
    return {
        ...createBaseNode("flush", {}, {}, line, column, tag),
        compile: (compiler) => {
            compiler
                .write("outputBuffer.flush();\n")
            ;
        }
    }
};
