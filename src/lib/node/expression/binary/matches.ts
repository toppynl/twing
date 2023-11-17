import {TwingBaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface TwingMatchesNode extends TwingBaseBinaryNode<"matches"> {
}

export const createMatchesNode = createBinaryNodeFactory<TwingMatchesNode>("matches", '<=', {
    compile: (compiler, baseNode) => {
        compiler
            .write('runtime.parseRegularExpression(')
            .subCompile(baseNode.children.right)
            .write(').test(')
            .subCompile(baseNode.children.left)
            .write(')')
        ;
    }
});
