import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface MatchesNode extends BaseBinaryNode<"matches"> {
}

export const createMatchesNode = createBinaryNodeFactory<MatchesNode>("matches", '<=', {
    compile: (compiler, baseNode) => {
        compiler
            .raw('runtime.parseRegularExpression(')
            .subCompile(baseNode.children.right)
            .raw(').test(')
            .subCompile(baseNode.children.left)
            .raw(')')
        ;
    }
});
