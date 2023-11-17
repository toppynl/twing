import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsNotInNode extends TwingBaseBinaryNode<"not_in"> {
}

export const createIsNotInNode = createBinaryNodeFactory<TwingIsNotInNode>("not_in", null, {
    compile: (compiler, baseNode) => {
        compiler
            .write('!runtime.isIn(')
            .subCompile(baseNode.children.left)
            .write(', ')
            .subCompile(baseNode.children.right)
            .write(')')
        ;
    }
});
