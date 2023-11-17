import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingPowerNode extends TwingBaseBinaryNode<"power"> {
}

export const createPowerNode = createBinaryNodeFactory<TwingPowerNode>("power", null, {
    compile: (compiler, baseNode) => {
        compiler
            .write('Math.pow(')
            .subCompile(baseNode.children.left)
            .write(', ')
            .subCompile(baseNode.children.right)
            .write(')')
        ;
    }
});
