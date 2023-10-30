import {BaseNode, BaseNodeAttributes, createBaseNode, Node} from "../node";

export interface SandboxNode extends BaseNode<"sandbox", BaseNodeAttributes, {
    body: Node;
}> {
}

export const createSandboxNode = (
    body: Node,
    line: number,
    column: number,
    tag: string | null = null
): SandboxNode => {
    const baseNode = createBaseNode("sandbox", {}, {
        body
    }, line, column, tag);

    return {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .write('await (async () => {\n')
                .indent()
                .write('let alreadySandboxed = runtime.isSandboxed();\n')
                .write("if (!alreadySandboxed) {\n")
                .indent()
                .write("runtime.enableSandbox();\n")
                .outdent()
                .write("}\n")
                .subCompile(baseNode.children.body)
                .write("if (!alreadySandboxed) {\n")
                .indent()
                .write("runtime.disableSandbox();\n")
                .outdent()
                .write("}\n")
                .outdent()
                .write("})();\n")
            ;
        }
    };
};
