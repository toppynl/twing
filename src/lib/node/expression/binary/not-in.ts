import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface NotInNode extends BaseBinaryNode<"not_in"> {
}

export const createNotInNode = createBinaryNodeFactory<NotInNode>("not_in", null, {
    compile: (compiler, baseNode) => {
        compiler
            .raw('!runtime.isIn(')
            .subCompile(baseNode.children.left)
            .raw(', ')
            .subCompile(baseNode.children.right)
            .raw(')')
        ;
    }
});
