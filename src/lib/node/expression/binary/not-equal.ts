import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface NotEqualToNode extends BaseBinaryNode<"not_equal"> {
}

export const createNotEqualToNode = createBinaryNodeFactory<NotEqualToNode>("not_equal", null, {
    compile: (compiler, baseNode) => {
        compiler
            .raw('!runtime.compare(')
            .subCompile(baseNode.children.left)
            .raw(', ')
            .subCompile(baseNode.children.right)
            .raw(')')
        ;
    }
});
