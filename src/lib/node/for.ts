import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import type {TwingAssignmentNode} from "./expression/assignment";
import {createForLoopNode} from "./for-loop";
import {createIfNode} from "./if";
import type {TwingBaseExpressionNode} from "./expression";
import {TwingContext} from "../context";
import {ensureTraversable} from "../helpers/ensure-traversable";
import {count} from "../helpers/count";
import {iterate} from "../helpers/iterate";

export type TwingForNodeAttributes = TwingBaseNodeAttributes & {
    hasAnIf: boolean;
};

export type TwingForNodeChildren = {
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

    const forNode: TwingForNode = {
        ...baseNode,
        execute: async (executionContext) => {
            const {context} = executionContext;
            const {sequence: sequenceNode, body, else: elseNode, valueTarget: targetValueNode, keyTarget: targetKeyNode} = forNode.children;
            const {hasAnIf} = forNode.attributes;

            context.set('_parent', context.clone());

            const executedSequence: TwingContext<any, any> | any = await sequenceNode.execute(executionContext);

            let sequence = ensureTraversable(executedSequence);

            context.set('_seq', sequence);

            if (elseNode) {
                context.set('_iterated', false);
            }

            context.set('loop', new Map([
                ['parent', context.get('_parent')],
                ['index0', 0],
                ['index', 1],
                ['first', true],
            ]));

            if (!hasAnIf) {
                const length = count(context.get('_seq'));

                const loop: Map<string, any> = context.get('loop');

                loop.set('revindex0', length - 1);
                loop.set('revindex', length);
                loop.set('length', length);
                loop.set('last', (length === 1));
            }

            const targetKey = await targetKeyNode.execute(executionContext);
            const targetValue = await targetValueNode.execute(executionContext);

            await iterate(context.get('_seq'), async (key, value) => {
                context.set(targetKey, key);
                context.set(targetValue, value);

                await body.execute(executionContext);
            });

            if (elseNode) {
                if (context.get('_iterated') === false) {
                    await elseNode.execute(executionContext);
                }
            }

            const parent = context.get('_parent');

            context.delete('_seq');
            context.delete('_iterated');
            context.delete(keyTarget.attributes.name);
            context.delete(valueTarget.attributes.name);
            context.delete('_parent');
            context.delete('loop');

            for (const [key, value] of parent) {
                if (!context.has(key)) {
                    context.set(key, value);
                }
            }
        }
    };

    return forNode;
};
