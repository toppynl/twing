import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface PowerNode extends BaseBinaryNode<"power"> {
}

export const createPowerNode = createBinaryNodeFactory<PowerNode>("power", null, {
    compile: (compiler, baseNode) => {
        compiler
            .raw('Math.pow(')
            .subCompile(baseNode.children.left)
            .raw(', ')
            .subCompile(baseNode.children.right)
            .raw(')')
        ;
    }
});
