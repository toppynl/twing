import {BaseNode, createBaseNode} from "../node";

export interface FlushNode extends BaseNode<"flush"> {
}

export const createFlushNode = (
    line: number,
    column: number,
    tag?: string
): FlushNode => {
    return {
        ...createBaseNode("flush", {}, {}, line, column, tag),
        compile: (compiler) => {
            compiler
                .write("outputBuffer.flush();\n")
            ;
        }
    }
};
