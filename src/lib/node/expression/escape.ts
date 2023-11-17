import {TwingBaseNode} from "../../node";
import {TwingBaseExpressionNode, createBaseExpressionNode} from "../expression";

export interface TwingEscapeNode extends TwingBaseExpressionNode<"escape", {}, {
    body: TwingBaseNode;
}> {
}

export const createEscapeNode = (
    body: TwingBaseNode,
    strategy: string | true,
    line: number,
    column: number
): TwingEscapeNode => {
    const baseNode = createBaseExpressionNode("escape", {}, {
        body
    }, line, column);
    
    const node: TwingEscapeNode = {
        ...baseNode,
        compile: (compiler) => {
            const {body} = node.children;
            
            compiler
                .write(`await template.getTraceableMethod(runtime.escape, ${line}, template.source)(`)
                .write('\n')
                .write('template,\n')
                .subCompile(body)
                .write(',\n')
                .render(strategy)
                .write(',\n')
                .render(null)
                .write(',\n')
                .render(true)
                .write('\n')
                .write(')')
            ;
        }
    };

    return node;
};
