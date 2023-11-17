import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingEndsWithNode extends TwingBaseBinaryNode<"ends_with"> {

}

export const createEndsWithNode = createBinaryNodeFactory<TwingEndsWithNode>(
    'ends_with',
    null,
    {
        compile: (compiler, baseNode) => {
            compiler
                .write('await (async () => {')
                .write(`let left = `)
                .subCompile(baseNode.children.left)
                .write('; ')
                .write(`let right = `)
                .subCompile(baseNode.children.right)
                .write('; ')
                .write(`return typeof left === 'string' && typeof right === 'string' && (right.length < 1 || left.endsWith(right));`)
                .write('})()')
            ;
        }
    }
);
