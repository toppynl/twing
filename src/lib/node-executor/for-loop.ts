import {TwingNodeExecutor} from "../node-executor";
import {TwingForLoopNode} from "../node/for-loop";

export const executeForLoopNode: TwingNodeExecutor<TwingForLoopNode> = (node, executionContext) => {
    const {hasAnElse, hasAnIf} = node.attributes;

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
};
