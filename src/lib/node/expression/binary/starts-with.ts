import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface StartsWithNode extends BaseBinaryNode<"starts_with"> {
}

export const createStartsWithNode = createBinaryNodeFactory<StartsWithNode>("starts_with", null, {
    compile: (compiler, baseNode) => {
        compiler
            .raw('await (async () => {')
            .raw(`let left = `)
            .subCompile(baseNode.children.left)
            .raw('; ')
            .raw(`let right = `)
            .subCompile(baseNode.children.right)
            .raw('; ')
            .raw(`return typeof left === 'string' && typeof right === 'string' && (right.length < 1 || left.startsWith(right));`)
            .raw('})()')
        ;
    }
});
