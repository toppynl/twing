import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface OrNode extends BaseBinaryNode<"or"> {
}

export const createOrNode = createBinaryNodeFactory<OrNode>("or", '||', {
    compile: (compiler, baseNode) => {
        compiler
            .raw('!!')
        ;

        baseNode.compile(compiler);
    }
});
