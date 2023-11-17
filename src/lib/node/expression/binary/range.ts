import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingRangeNode extends TwingBaseBinaryNode<"range"> {
}

export const createRangeNode = createBinaryNodeFactory<TwingRangeNode>("range", null, {
    compile: (compiler, baseNode) => {
        compiler
            .write('runtime.createRange(')
            .subCompile(baseNode.children.left)
            .write(', ')
            .subCompile(baseNode.children.right)
            .write(')')
        ;
    }
});
