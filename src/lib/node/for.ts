import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import type {TwingAssignmentNode} from "./expression/assignment";
import {createForLoopNode} from "./for-loop";
import {createIfNode} from "./if";
import type {TwingBaseExpressionNode} from "./expression";

export type TwingForNodeAttributes = TwingBaseNodeAttributes & {
    hasAnIf: boolean;
};

type TwingForNodeChildren = {
    keyTarget: TwingAssignmentNode;
    valueTarget: TwingAssignmentNode;
    sequence: TwingBaseExpressionNode;
    body: TwingBaseNode;
    else?: TwingBaseNode;
};

export interface TwingForNode extends TwingBaseNode<"for", TwingForNodeAttributes, TwingForNodeChildren> {
}

export const createForNode = (
    keyTarget: TwingAssignmentNode,
    valueTarget: TwingAssignmentNode,
    sequence: TwingBaseExpressionNode,
    ifExpression: TwingBaseExpressionNode | null,
    body: TwingBaseNode,
    elseNode: TwingBaseNode | null,
    line: number,
    column: number,
    tag: string
): TwingForNode => {
    const loop = createForLoopNode(line, column, tag);
    const bodyChildren: Record<number, TwingBaseNode> = {};

    let i: number = 0;

    bodyChildren[i++] = body;
    bodyChildren[i++] = loop;
    
    let actualBody: TwingBaseNode = createBaseNode(null, {}, bodyChildren, line, column);

    if (ifExpression) {
        const ifChildren: Record<number, TwingBaseNode> = {};

        let i: number = 0;

        ifChildren[i++] = ifExpression;
        ifChildren[i++] = actualBody;

        actualBody = createIfNode(createBaseNode(null, {}, ifChildren, line, column), null, line, column);
        
        loop.attributes.hasAnIf = true;
    }

    const children: TwingForNodeChildren = {
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

    const node: TwingForNode = {
        ...baseNode,
        compile: (compiler) => {
            const {sequence, body, else: elseNode, valueTarget, keyTarget} = node.children;
            const {hasAnIf} = node.attributes;

            compiler
                .write("context.set('_parent', context.clone());\n\n")
                .write('await (async () => {\n')
                .write('let sequence = runtime.ensureTraversable(')
                .subCompile(sequence)
                .write(");\n\n")
                .write('if (sequence === context) {\n')
                .write("context.set('_seq', context.clone());\n")
                .write("}\n")
                .write("else {\n")
                .write("context.set('_seq', sequence);\n")
                .write("}\n")
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
                    .write("if (typeof context.get('_seq') === 'object') {\n")
                    .write("let length = runtime.count(context.get('_seq'));\n")
                    .write("let loop = context.get('loop');\n")
                    .write("loop.set('revindex0', length - 1);\n")
                    .write("loop.set('revindex', length);\n")
                    .write("loop.set('length', length);\n")
                    .write("loop.set('last', (length === 1));\n")
                    .write("}\n")
                ;
            }

            compiler
                .write("await runtime.iterate(context.get('_seq'), async (__key__, __value__) => {\n")
                .subCompile(keyTarget) //, false
                .write(' = __key__;\n')
                .subCompile(valueTarget) //, false
                .write(' = __value__;\n')
                .subCompile(body)
                .write("});\n")
            ;

            if (elseNode) {
                compiler
                    .write("if (context.get('_iterated') === false) {\n")
                    .subCompile(elseNode)
                    .write("}\n")
                ;
            }

            compiler
                .write("(() => {\n")
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
                .write('if (!context.has(k)) {\n')
                .write(`context.set(k, v);\n`)
                .write('}\n')
                .write('}\n')
            ;

            compiler
                .write("})();\n")
            ;
        }
    };

    return node;
};
