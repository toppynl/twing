import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";

export type TwingForLoopNodeAttributes = TwingBaseNodeAttributes & {
    hasAnIf: boolean;
    hasAnElse: boolean;
};

export interface TwingForLoopNode extends TwingBaseNode<"for_loop", TwingForLoopNodeAttributes> {
}

export const createForLoopNode = (
    line: number,
    column: number,
    tag: string
): TwingForLoopNode => {
    const baseNode = createBaseNode("for_loop", {
        hasAnIf: false,
        hasAnElse: false
    }, {}, line, column, tag);

    const forLoopNode: TwingForLoopNode = {
        ...baseNode,
        execute: (executionContext) => {
            const {hasAnElse, hasAnIf} = forLoopNode.attributes;

            const {context} = executionContext;

            if (hasAnElse) {
                context.set('_iterated', true);
            }

            const loop: Map<string, any> = context.get('loop');

            loop.set('index0', loop.get('index0') + 1);
            loop.set('index', loop.get('index') + 1);
            loop.set('first', false);

            if (!hasAnIf && loop.has('length')) {
                loop.set('revindex0', loop.get('revindex0') - 1);
                loop.set('revindex', loop.get('revindex') - 1);
                loop.set('last', loop.get('revindex0') === 0);
            }

            return Promise.resolve();
        }
    };

    return forLoopNode;
};
