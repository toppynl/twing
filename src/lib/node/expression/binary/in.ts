import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface InNode extends BaseBinaryNode<"in"> {
}

export const createInNode = createBinaryNodeFactory<InNode>("in", null, {
    compile: (compiler, baseNode) => {
        compiler
            .raw('runtime.isIn(')
            .subCompile(baseNode.children.left)
            .raw(', ')
            .subCompile(baseNode.children.right)
            .raw(')')
        ;
    }
});
