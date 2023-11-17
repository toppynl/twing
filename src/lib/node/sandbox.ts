import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode, TwingNode} from "../node";

export interface TwingSandboxNode extends TwingBaseNode<"sandbox", TwingBaseNodeAttributes, {
    body: TwingNode;
}> {
}

export const createSandboxNode = (
    body: TwingNode,
    line: number,
    column: number,
    tag: string
): TwingSandboxNode => {
    const baseNode = createBaseNode("sandbox", {}, {
        body
    }, line, column, tag);

    return {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .write('await (async () => {\n')
                .write('let alreadySandboxed = runtime.isSandboxed;\n')
                .write("if (!alreadySandboxed) {\n")
                .write("runtime.isSandboxed = true;\n")
                .write("}\n")
                .subCompile(baseNode.children.body)
                .write("if (!alreadySandboxed) {\n")
                .write("runtime.isSandboxed = false;\n")
                .write("}\n")
                .write("})();\n")
            ;
        }
    };
};
