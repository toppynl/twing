import {BasePrintNode, createBasePrintNode} from "./print"
import {ExpressionNode} from "./expression";

export interface SandboxedPrintNode extends BasePrintNode<"sandboxed_print"> {
}

export const createSandboxedPrintNode = (
    expression: ExpressionNode,
    line: number,
    column: number,
    tag: string | null = null
): SandboxedPrintNode => {
    const baseNode = createBasePrintNode("sandboxed_print", expression, line, column, tag);

    return {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .write('outputBuffer.echo(runtime.ensureToStringAllowed(')
                .subCompile(baseNode.children.expr)
                .raw("));\n")
            ;
        }
    }
};
