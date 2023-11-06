import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";
import type {AssignNameNode} from "./expression/assign-name";
import {createForLoopNode} from "./for-loop";
import {createIfNode} from "./if";
import type {BaseExpressionNode} from "./expression";

export type ForNodeAttributes = BaseNodeAttributes & {
    hasAnIf: boolean;
};

type ForNodeChildren = {
    keyTarget: AssignNameNode;
    valueTarget: AssignNameNode;
    sequence: BaseExpressionNode;
    body: BaseNode;
    else?: BaseNode;
};

export interface ForNode extends BaseNode<"for", ForNodeAttributes, ForNodeChildren> {
}

export const createForNode = (
    keyTarget: AssignNameNode,
    valueTarget: AssignNameNode,
    sequence: BaseExpressionNode,
    ifExpression: BaseExpressionNode | null,
    body: BaseNode,
    elseNode: BaseNode | null,
    line: number,
    column: number,
    tag: string
): ForNode => {
    const loop = createForLoopNode(line, column, tag);
    const bodyChildren: Record<number, BaseNode> = {};

    let i: number = 0;

    bodyChildren[i++] = body;
    bodyChildren[i++] = loop;
    
    let actualBody: BaseNode = createBaseNode(null, {}, bodyChildren, line, column);

    if (ifExpression) {
        const ifChildren: Record<number, BaseNode> = {};

        let i: number = 0;

        ifChildren[i++] = ifExpression;
        ifChildren[i++] = actualBody;

        actualBody = createIfNode(createBaseNode(null, {}, ifChildren, line, column), null, line, column);
        
        loop.attributes.hasAnIf = true;
    }

    const children: ForNodeChildren = {
        keyTarget: keyTarget,
        valueTarget: valueTarget,
        sequence: sequence,
        body: actualBody,
    };

    if (elseNode) {
        children.else = elseNode;
        
        loop.attributes.hasAnElse = true;
    }

    const baseNode = createBaseNode("for", {
        hasAnIf: ifExpression !== null
    }, children, line, column, tag);

    const node: ForNode = {
        ...baseNode,
        compile: (compiler) => {
            const {sequence, body, else: elseNode, valueTarget, keyTarget} = node.children;
            const {hasAnIf} = node.attributes;

            compiler
                .write("context.set('_parent', context.clone());\n\n")
                .write('await (async () => {\n')
                .indent()
                .write('let c = runtime.ensureTraversable(')
                .subCompile(sequence)
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

            compiler
                .write("context.set('loop', new Map([\n")
                .write("  ['parent', context.get('_parent')],\n")
                .write("  ['index0', 0],\n")
                .write("  ['index', 1],\n")
                .write("  ['first', true]\n")
                .write("]));\n")
            ;

            if (!hasAnIf) {
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

            compiler
                .write("await runtime.iterate(context.get('_seq'), async (__key__, __value__) => {\n")
                .indent()
                .subCompile(keyTarget) //, false
                .raw(' = __key__;\n')
                .subCompile(valueTarget) //, false
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
                .write('context.delete(\'' + keyTarget.attributes.name + '\');\n')
                .write('context.delete(\'' + valueTarget.attributes.name + '\');\n')
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
