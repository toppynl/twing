import type {BaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface ConcatNode extends BaseBinaryNode<"concat"> {
}

export const createConcatNode = createBinaryNodeFactory<ConcatNode>("concat", null, {
    compile: (compiler, baseNode) => {
        compiler
            .raw('(runtime.concatenate(')
            .subCompile(baseNode.children.left)
            .raw(', ')
            .subCompile(baseNode.children.right)
            .raw('))')
        ;
    }
});
