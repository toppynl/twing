import type {BaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface AndNode extends BaseBinaryNode<"and"> {
}

export const createAndNode = createBinaryNodeFactory<AndNode>("and", '&&', {
    compile: (compiler, baseNode) => {
        compiler
            .raw('!!')
        ;

        baseNode.compile(compiler);
    }
});
