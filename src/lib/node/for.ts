import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";
import type {ExpressionNode} from "./expression";
import type {AssignNameNode} from "./expression/assign-name";
import {createForLoopNode} from "./for-loop";
import {createIfNode} from "./if";
import {createArgumentsNode} from "./expression/arguments";

export type ForNodeAttributes = BaseNodeAttributes & {
    with_loop: boolean;
    ifexpr: boolean;
};

type ForNodeChildren = {
    key_target: AssignNameNode;
    value_target: AssignNameNode;
    seq: ExpressionNode;
    body: BaseNode<any>;
    else?: BaseNode<any>;
};

export interface ForNode extends BaseNode<"for", ForNodeAttributes, ForNodeChildren> {
}

export const createForNode = (
    keyTarget: AssignNameNode,
    valueTarget: AssignNameNode,
    sequence: ExpressionNode,
    ifExpression: ExpressionNode | null,
    body: BaseNode<any>,
    elseNode: BaseNode<any> | null,
    line: number,
    column: number,
    tag: string | null = null
): ForNode => {
    const loop = createForLoopNode(line, column, tag);
    const bodyChildren: Record<number, BaseNode<any>> = {};

    let i: number = 0;

    bodyChildren[i++] = body;
    bodyChildren[i++] = loop;

    let actualBody: BaseNode<any> = createArgumentsNode(bodyChildren, line, column);

    if (ifExpression) {
        const ifChildren: Record<number, BaseNode<any>> = {};

        let i: number = 0;

        ifChildren[i++] = ifExpression;
        ifChildren[i++] = actualBody;

        actualBody = createIfNode(createArgumentsNode(ifChildren, line, column), null, line, column);
    }

    const children: ForNodeChildren = {
        key_target: keyTarget,
        value_target: valueTarget,
        seq: sequence,
        body: actualBody,
    };

    if (elseNode) {
        children.else = elseNode;
    }

    const baseNode = createBaseNode("for", {
        with_loop: true,
        ifexpr: ifExpression !== null
    }, children, line, column, tag);

    const node: ForNode = {
        ...baseNode,
        clone: () => createForNode(keyTarget, valueTarget, sequence, ifExpression, body, elseNode, line, column, tag),
        compile: (compiler) => {
            const {seq, body, else: elseNode, value_target, key_target} = node.children;
            const {with_loop, ifexpr} = node.attributes;

            compiler
                .write("context.set('_parent', context.clone());\n\n")
                .write('await (async () => {\n')
                .indent()
                .write('let c = runtime.ensureTraversable(')
                .subCompile(seq)
                .raw(");\n\n")
                .write('if (c === context) {\n')
                .indent()
                .write("context.set('_seq', context.clone());\n")
                .outdent()
                .write("}\n")
                .write("else {\n")
                .indent()
                .write("context.set('_seq', c);\n")
                .outdent()
                .write("}\n")
                .outdent()
                .write("})();\n\n")
            ;

            if (elseNode) {
                compiler.write("context.set('_iterated', false);\n");
            }

            if (with_loop) {
                compiler
                    .write("context.set('loop', new Map([\n")
                    .write("  ['parent', context.get('_parent')],\n")
                    .write("  ['index0', 0],\n")
                    .write("  ['index', 1],\n")
                    .write("  ['first', true]\n")
                    .write("]));\n")
                ;

                if (!ifexpr) {
                    compiler
                        .write("if ((typeof context.get('_seq') === 'object') && runtime.isCountable(context.get('_seq'))) {\n")
                        .indent()
                        .write("let length = runtime.count(context.get('_seq'));\n")
                        .write("let loop = context.get('loop');\n")
                        .write("loop.set('revindex0', length - 1);\n")
                        .write("loop.set('revindex', length);\n")
                        .write("loop.set('length', length);\n")
                        .write("loop.set('last', (length === 1));\n")
                        .outdent()
                        .write("}\n")
                    ;
                }
            }

            loop.attributes.else = elseNode !== null;
            loop.attributes.with_loop = with_loop;
            loop.attributes.ifexpr = ifexpr;

            compiler
                .write("await runtime.iterate(context.get('_seq'), async (__key__, __value__) => {\n")
                .indent()
                .subCompile(key_target, false)
                .raw(' = __key__;\n')
                .subCompile(value_target, false)
                .raw(' = __value__;\n')
                .subCompile(body)
                .outdent()
                .write("});\n")
            ;

            if (elseNode) {
                compiler
                    .write("if (context.get('_iterated') === false) {\n")
                    .indent()
                    .subCompile(elseNode)
                    .outdent()
                    .write("}\n")
                ;
            }

            compiler
                .write("(() => {\n")
                .indent()
                .write(`let parent = context.get('_parent');\n`)
            ;

            // remove some "private" loop variables (needed for nested loops)
            compiler
                .write('context.delete(\'_seq\');\n')
                .write('context.delete(\'_iterated\');\n')
                .write('context.delete(\'' + key_target.attributes.name + '\');\n')
                .write('context.delete(\'' + value_target.attributes.name + '\');\n')
                .write('context.delete(\'_parent\');\n')
                .write('context.delete(\'loop\');\n')
            ;

            // keep the values set in the inner context for variables defined in the outer context
            compiler
                .write(`for (let [k, v] of parent) {\n`)
                .indent()
                .write('if (!context.has(k)) {\n')
                .indent()
                .write(`context.set(k, v);\n`)
                .outdent()
                .write('}\n')
                .outdent()
                .write('}\n')
            ;

            compiler
                .outdent()
                .write("})();\n")
            ;
        }
    };

    return node;
};
