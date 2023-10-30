import type {BaseExpressionNode, BaseExpressionNodeAttributes, ExpressionNode} from "../expression";
import type {BaseNode} from "../../node";
import type {AssignNameNode} from "./assign-name";
import {createBaseExpressionNode} from "../expression";

export interface ArrowFunctionNode extends BaseExpressionNode<"arrow_function", BaseExpressionNodeAttributes, {
    expr: ExpressionNode;
    names: BaseNode<any, any, Record<string, AssignNameNode>>;
}> {

}

export const createArrowFunctionNode = (
    expr: ExpressionNode,
    names: BaseNode<any, any, Record<any, AssignNameNode>>,
    line: number,
    column: number
): ArrowFunctionNode => {
    const baseNode = createBaseExpressionNode("arrow_function", {}, {
        expr,
        names
    }, line, column);

    return {
        ...baseNode,
        compile: (compiler) => {
            compiler.raw('async (');

            let i: number = 0;

            const nameNodes = Object.values(baseNode.children.names.children);

            for (const nameNode of nameNodes) {
                if (i > 0) {
                    compiler.raw(', ');
                }

                compiler
                    .raw('$__')
                    .raw(nameNode.attributes.name)
                    .raw('__');

                i++;
            }

            compiler
                .raw(') => {')
            ;

            for (const nameNode of nameNodes) {
                compiler
                    .raw('context.proxy[\'')
                    .raw(nameNode.attributes.name)
                    .raw('\'] = $__')
                    .raw(nameNode.attributes.name)
                    .raw('__; ');
            }

            compiler
                .raw('return ')
                .subCompile(baseNode.children.expr)
                .raw(';}');
        }
    };
};
