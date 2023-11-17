import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export const andNodeType = "and";

export interface TwingAndNode extends TwingBaseBinaryNode<typeof andNodeType> {
}

export const createAndNode = createBinaryNodeFactory<TwingAndNode>(andNodeType, '&&', {
    compile: (compiler, baseNode) => {
        compiler
            .write('!!')
        ;

        baseNode.compile(compiler);
    }
});
