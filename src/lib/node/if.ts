import {BaseNode, createBaseNode, getChildrenCount, BaseNodeAttributes} from "../node";

type NodeIfChildren = {
    tests: BaseNode;
    else?: BaseNode;
};

export interface IfNode extends BaseNode<'if', BaseNodeAttributes, NodeIfChildren> {
}

export const createIfNode = (
    testNode: BaseNode,
    elseNode: BaseNode | null,
    line: number,
    column: number,
    tag: string | null = null
): IfNode => {
    const children: NodeIfChildren = {
        tests: testNode
    };

    if (elseNode) {
        children.else = elseNode;
    }

    const compile: IfNode["compile"] = (compiler) => {
        const count = getChildrenCount(testNode);

        for (let i = 0; i < count; i += 2) {
            if (i > 0) {
                compiler
                    .outdent()
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
                .raw(")) {\n")
                .indent()
                .subCompile(testNode.children[i + 1])
            ;
        }

        if (elseNode !== null) {
            compiler
                .outdent()
                .write("}\n")
                .write("else {\n")
                .indent()
                .subCompile(elseNode)
            ;
        }

        compiler
            .outdent()
            .write("}\n");
    };

    const baseNode = createBaseNode('if', {}, children, line, column, tag);

    const node: IfNode = {
        ...baseNode,
        compile
    };

    return node;
}
