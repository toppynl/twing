import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface RangeNode extends BaseBinaryNode<"range"> {
}

export const createRangeNode = createBinaryNodeFactory<RangeNode>("range", null, {
    compile: (compiler, baseNode) => {
        compiler
            .raw('runtime.createRange(')
            .subCompile(baseNode.children.left)
            .raw(', ')
            .subCompile(baseNode.children.right)
            .raw(')')
        ;
    }
});
