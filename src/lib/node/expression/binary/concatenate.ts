import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export const concatenateNodeTYpe = "concat";

export interface TwingConcatenateNode extends TwingBaseBinaryNode<typeof concatenateNodeTYpe> {
}

export const createConcatenateNode = createBinaryNodeFactory<TwingConcatenateNode>(concatenateNodeTYpe, null, {
    compile: (compiler, baseNode) => {
        compiler
            .write('(runtime.concatenate(').write('\n')
            .subCompile(baseNode.children.left).write(', ').write('\n')
            .subCompile(baseNode.children.right).write('\n')
            .write('))')
        ;
    }
});
