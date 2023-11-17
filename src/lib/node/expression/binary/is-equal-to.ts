import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsEqualToNode extends TwingBaseBinaryNode<"equals"> {
}

export const createIsEqualNode = createBinaryNodeFactory<TwingIsEqualToNode>("equals", null, {
    compile: (compiler, baseNode) => {
        compiler
            .write('runtime.compare(')
            .subCompile(baseNode.children.left)
            .write(', ')
            .subCompile(baseNode.children.right)
            .write(')')
        ;
    }
});
