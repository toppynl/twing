import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingIsNotEqualToNode extends TwingBaseBinaryNode<"not_equal"> {
}

export const createIsNotEqualToNode = createBinaryNodeFactory<TwingIsNotEqualToNode>("not_equal", null, {
    compile: (compiler, baseNode) => {
        compiler
            .write('!runtime.compare(')
            .subCompile(baseNode.children.left)
            .write(', ')
            .subCompile(baseNode.children.right)
            .write(')')
        ;
    }
});
