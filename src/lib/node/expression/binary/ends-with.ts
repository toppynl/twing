import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface EndsWithNode extends BaseBinaryNode<"ends_with"> {

}

export const createEndsWithNode = createBinaryNodeFactory<EndsWithNode>(
    'ends_with',
    null,
    {
        compile: (compiler, baseNode) => {
            compiler
                .raw('await (async () => {')
                .raw(`let left = `)
                .subCompile(baseNode.children.left)
                .raw('; ')
                .raw(`let right = `)
                .subCompile(baseNode.children.right)
                .raw('; ')
                .raw(`return typeof left === 'string' && typeof right === 'string' && (right.length < 1 || left.endsWith(right));`)
                .raw('})()')
            ;
        }
    }
);
