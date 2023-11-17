import {TwingBaseNode, createBaseNode, getChildrenCount, TwingBaseNodeAttributes} from "../node";

type TwingIfNodeChildren = {
    tests: TwingBaseNode;
    else?: TwingBaseNode;
};

export interface TwingIfNode extends TwingBaseNode<'if', TwingBaseNodeAttributes, TwingIfNodeChildren> {
}

export const createIfNode = (
    testNode: TwingBaseNode,
    elseNode: TwingBaseNode | null,
    line: number,
    column: number,
    tag: string | null = null
): TwingIfNode => {
    const children: TwingIfNodeChildren = {
        tests: testNode
    };

    if (elseNode) {
        children.else = elseNode;
    }

    const compile: TwingIfNode["compile"] = (compiler) => {
        const count = getChildrenCount(testNode);

        for (let i = 0; i < count; i += 2) {
            if (i > 0) {
                compiler
                    .write('}\n')
                    .write('else if (runtime.evaluate(')
                ;
            } else {
                compiler
                    .write('if (runtime.evaluate(')
                ;
            }

            compiler
                .subCompile(testNode.children[i])
                .write(")) {\n")
                .subCompile(testNode.children[i + 1])
            ;
        }

        if (elseNode !== null) {
            compiler
                .write("}\n")
                .write("else {\n")
                .subCompile(elseNode)
            ;
        }

        compiler
            .write("}\n");
    };

    const baseNode = createBaseNode('if', {}, children, line, column, tag);

    const node: TwingIfNode = {
        ...baseNode,
        compile
    };

    return node;
}
