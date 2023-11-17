import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsInNode extends TwingBaseBinaryNode<"in"> {
}

export const createIsInNode = createBinaryNodeFactory<TwingIsInNode>("in", null, {
    compile: (compiler, baseNode) => {
        compiler
            .write('runtime.isIn(')
            .subCompile(baseNode.children.left)
            .write(', ')
            .subCompile(baseNode.children.right)
            .write(')')
        ;
    }
});
