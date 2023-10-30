import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface EqualNode extends BaseBinaryNode<"equals"> {
}

export const createEqualNode = createBinaryNodeFactory<EqualNode>("equals", null, {
    compile: (compiler, baseNode) => {
        compiler
            .raw('runtime.compare(')
            .subCompile(baseNode.children.left)
            .raw(', ')
            .subCompile(baseNode.children.right)
            .raw(')')
        ;
    }
});
