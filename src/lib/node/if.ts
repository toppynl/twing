import {BaseNode, createBaseNode, getChildrenCount, BaseNodeAttributes} from "../node";

type NodeIfChildren = {
    tests: BaseNode<any>;
    else?: BaseNode<any>;
};

export interface IfNode extends BaseNode<'if', BaseNodeAttributes, NodeIfChildren> {
}

export const createIfNode = (
    testNode: BaseNode<any>,
    elseNode: BaseNode<any> | null,
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
        clone: () => createIfNode(testNode, elseNode, line, column, tag),
        compile
    };

    return node;
}
