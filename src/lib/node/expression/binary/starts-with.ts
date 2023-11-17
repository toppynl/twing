import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingStartsWithNode extends TwingBaseBinaryNode<"starts_with"> {
}

export const createStartsWithNode = createBinaryNodeFactory<TwingStartsWithNode>("starts_with", null, {
    compile: (compiler, baseNode) => {
        compiler
            .write('await (async () => {')
            .write(`let left = `)
            .subCompile(baseNode.children.left)
            .write('; ')
            .write(`let right = `)
            .subCompile(baseNode.children.right)
            .write('; ')
            .write(`return typeof left === 'string' && typeof right === 'string' && (right.length < 1 || left.startsWith(right));`)
            .write('})()')
        ;
    }
});
